import { google } from "googleapis";
import { cache } from "react";
import path from "path";
import { promises as fs } from "fs";

const DRIVE_READ_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const FOLDER_MIME = "application/vnd.google-apps.folder";

function resolveServiceAccountPath(): string {
    const explicitPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
    if (explicitPath) {
        return path.isAbsolute(explicitPath)
            ? explicitPath
            : path.join(process.cwd(), explicitPath);
    }
    return path.join(process.cwd(), "service-account.json");
}

async function readServiceAccountCredentials() {
    const keyPath = resolveServiceAccountPath();
    const jsonRaw = await fs.readFile(keyPath, "utf-8");
    return JSON.parse(jsonRaw);
}

const getAuth = cache(async () => {
    const credentials = await readServiceAccountCredentials();
    return new google.auth.GoogleAuth({
        credentials,
        scopes: [DRIVE_READ_SCOPE],
    });
});

export const getDriveClient = cache(async () => {
    const auth = await getAuth();
    return google.drive({ version: "v3", auth });
});

export async function getAccessToken(): Promise<string> {
    const auth = await getAuth();
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;
    if (!token) {
        throw new Error("Failed to obtain Google Drive access token");
    }
    return token;
}

function buildDownloadUrl(fileId: string, resourceKey?: string | null): string {
    const url = new URL("https://drive.google.com/uc");
    url.searchParams.set("export", "download");
    url.searchParams.set("id", fileId);
    if (resourceKey) {
        url.searchParams.set("resourcekey", resourceKey);
    }
    return url.toString();
}

function buildViewUrl(fileId: string, resourceKey?: string | null): string {
    const url = new URL(`https://drive.google.com/file/d/${fileId}/view`);
    if (resourceKey) {
        url.searchParams.set("resourcekey", resourceKey);
    }
    return url.toString();
}

function buildPreviewUrl(fileId: string, resourceKey?: string | null): string {
    const url = new URL(`https://drive.google.com/file/d/${fileId}/preview`);
    if (resourceKey) {
        url.searchParams.set("resourcekey", resourceKey);
    }
    return url.toString();
}

function appendResourceKey(url: string | null | undefined, resourceKey?: string | null): string | null {
    if (!url) {
        return null;
    }

    if (!resourceKey) {
        return url;
    }

    try {
        const parsed = new URL(url);
        if (!parsed.searchParams.get("resourcekey")) {
            parsed.searchParams.set("resourcekey", resourceKey);
        }
        return parsed.toString();
    } catch {
        return url;
    }
}

export async function fetchFileByName(folderId: string, fileName: string) {
    const drive = await getDriveClient();
    const response = await drive.files.list({
        q: `'${folderId}' in parents and name = '${fileName}' and trashed = false`,
        fields: "files(id, name)",
        pageSize: 1,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        corpora: "allDrives",
    });

    const file = response.data.files?.[0];
    if (!file?.id) {
        return null;
    }
    return file;
}

export async function downloadJsonFile<T>(folderId: string, fileName: string): Promise<T> {
    const file = await fetchFileByName(folderId, fileName);
    if (!file?.id) {
        throw new Error(`File ${fileName} not found in folder ${folderId}`);
    }

    const token = await getAccessToken();
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to download ${fileName} (${response.status})`);
    }

    return (await response.json()) as T;
}

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    path: string;
    webViewUrl: string;
    downloadUrl: string;
    previewUrl: string;
    thumbnailUrl: string | null;
    resourceKey?: string | null;
}

interface FolderQueueItem {
    id: string;
    path: string;
}

export async function listFilesRecursively(folderId: string): Promise<DriveFile[]> {
    const drive = await getDriveClient();
    const result: DriveFile[] = [];
    const queue: FolderQueueItem[] = [{ id: folderId, path: "" }];

    while (queue.length > 0) {
        const current = queue.pop() as FolderQueueItem;
        let pageToken: string | undefined;

        do {
            const response = await drive.files.list({
                q: `'${current.id}' in parents and trashed = false`,
                fields:
                    "nextPageToken, files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, resourceKey)",
                pageSize: 1000,
                pageToken,
                supportsAllDrives: true,
                includeItemsFromAllDrives: true,
                corpora: "allDrives",
            });

            const files = response.data.files ?? [];
            for (const file of files) {
                if (!file.id || !file.name) {
                    continue;
                }

                const currentPath = current.path ? `${current.path}/${file.name}` : file.name;

                if (file.mimeType === FOLDER_MIME) {
                    queue.push({ id: file.id, path: currentPath });
                    continue;
                }

                const downloadUrl = appendResourceKey(file.webContentLink, file.resourceKey)
                    ?? buildDownloadUrl(file.id, file.resourceKey);
                const webViewUrl = appendResourceKey(file.webViewLink, file.resourceKey)
                    ?? buildViewUrl(file.id, file.resourceKey);
                const previewCandidate = file.webViewLink
                    ? file.webViewLink.replace("/view", "/preview")
                    : null;
                const previewUrl = appendResourceKey(previewCandidate, file.resourceKey)
                    ?? buildPreviewUrl(file.id, file.resourceKey);

                result.push({
                    id: file.id,
                    name: file.name,
                    mimeType: file.mimeType ?? "application/octet-stream",
                    path: currentPath,
                    webViewUrl,
                    downloadUrl,
                    previewUrl,
                    thumbnailUrl: file.thumbnailLink ?? null,
                    resourceKey: file.resourceKey ?? null,
                });
            }

            pageToken = response.data.nextPageToken ?? undefined;
        } while (pageToken);
    }

    return result;
}

export async function getThumbnailUrl(fileId: string): Promise<string | null> {
    if (!fileId) {
        return null;
    }

    try {
        const drive = await getDriveClient();
        const response = await drive.files.get({
            fileId,
            fields: "thumbnailLink, webViewLink, resourceKey",
            supportsAllDrives: true,
        });

        const { thumbnailLink, webViewLink, resourceKey } = response.data;

        const resolvedThumb = appendResourceKey(thumbnailLink ?? webViewLink, resourceKey);
        if (resolvedThumb) {
            return resolvedThumb;
        }

        return buildViewUrl(fileId, resourceKey);
    } catch (error) {
        console.warn(`Failed to resolve thumbnail for file ${fileId}.`, error);
        return null;
    }
}