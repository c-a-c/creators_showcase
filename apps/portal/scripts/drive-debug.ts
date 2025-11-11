import { getDriveClient, getAccessToken, listFilesRecursively } from "../lib/googleDrive";

interface Options {
    fileId?: string;
    folderId?: string;
    verbose: boolean;
}

function parseArgs(argv: string[]): Options | null {
    const options: Options = { verbose: false };

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];

        if (arg === "--help" || arg === "-h") {
            return null;
        }

        if (arg === "--verbose" || arg === "-v") {
            options.verbose = true;
            continue;
        }

        if (arg.startsWith("--file=")) {
            options.fileId = arg.slice("--file=".length);
            continue;
        }

        if (arg === "--file" && argv[i + 1]) {
            options.fileId = argv[i + 1];
            i += 1;
            continue;
        }

        if (arg.startsWith("--folder=")) {
            options.folderId = arg.slice("--folder=".length);
            continue;
        }

        if (arg === "--folder" && argv[i + 1]) {
            options.folderId = argv[i + 1];
            i += 1;
            continue;
        }

        console.error(`Unknown argument: ${arg}`);
        return null;
    }

    if (!options.fileId && !options.folderId) {
        return null;
    }

    return options;
}

function printUsage(): void {
    console.log(`Drive access debug tool

Usage:
  npm run drive:debug -- --file <FILE_ID>
  npm run drive:debug -- --folder <FOLDER_ID>

Options:
  --file <FILE_ID>    Inspect metadata and access for a single file
  --folder <FOLDER_ID> List the contents the service account can see in the folder
  --verbose, -v        Print additional diagnostic details
  --help, -h           Show this help
`);
}

function buildPublicDownloadUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

async function inspectFile(fileId: string, verbose: boolean) {
    console.log(`\n[File] Inspecting ${fileId}`);
    const drive = await getDriveClient();

    try {
        const response = await drive.files.get({
            fileId,
            supportsAllDrives: true,
            fields: [
                "id",
                "name",
                "mimeType",
                "parents",
                "driveId",
                "trashed",
                "shared",
                "owners",
                "permissions",
                "capabilities",
                "webViewLink",
                "webContentLink",
                "iconLink",
                "thumbnailLink",
            ].join(","),
        });

        const data = response.data;
        console.log(`Name: ${data.name ?? "(unknown)"}`);
        console.log(`MIME: ${data.mimeType ?? "(unknown)"}`);
        console.log(`Trashed: ${Boolean(data.trashed)}`);
        console.log(`Shared: ${Boolean(data.shared)}`);

        if (data.driveId) {
            console.log(`Drive ID: ${data.driveId}`);
        }

        if (data.parents?.length) {
            console.log(`Parents: ${data.parents.join(", ")}`);
        }

        if (data.owners?.length) {
            console.log("Owners:");
            data.owners.forEach((owner) => {
                console.log(`  - ${owner.displayName ?? owner.emailAddress ?? "(unknown)"}`);
            });
        }

        if (data.permissions?.length) {
            console.log("Permissions:");
            data.permissions.forEach((permission) => {
                const parts = [
                    permission.type,
                    permission.role,
                    permission.allowFileDiscovery ? "discoverable" : null,
                    permission.domain,
                    permission.emailAddress,
                ].filter(Boolean);
                console.log(`  - ${parts.join(" | ")}`);
            });
        } else {
            console.log("Permissions: (not returned by API, likely due to scope)");
        }

        if (data.capabilities) {
            console.log("Capabilities:");
            Object.entries(data.capabilities).forEach(([key, value]) => {
                console.log(`  - ${key}: ${value}`);
            });
        }

        if (data.webViewLink) {
            console.log(`Web View: ${data.webViewLink}`);
        }
        if (data.webContentLink) {
            console.log(`Web Content: ${data.webContentLink}`);
        }
        if (data.thumbnailLink) {
            console.log(`Thumbnail: ${data.thumbnailLink}`);
        }

        if (verbose && data.webViewLink) {
            const anonymousResp = await fetch(data.webViewLink, { method: "GET", redirect: "manual" });
            const location = anonymousResp.headers.get("location") ?? "(none)";
            console.log(`Anonymous webViewLink status: ${anonymousResp.status} (Location: ${location})`);
        }

        const token = await getAccessToken();
        const downloadEndpoint = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const apiDownload = await fetch(downloadEndpoint, {
            headers: { Authorization: `Bearer ${token}` },
            redirect: "manual",
        });
        console.log(`API download (service account) status: ${apiDownload.status}`);

        const publicDownload = await fetch(buildPublicDownloadUrl(fileId), { method: "GET", redirect: "manual" });
        const publicLocation = publicDownload.headers.get("location") ?? "(none)";
        console.log(`Public download status: ${publicDownload.status} (Location: ${publicLocation})`);
    } catch (error) {
        console.error("Failed to inspect file:");
        console.error(error);
    }
}

async function inspectFolder(folderId: string, verbose: boolean) {
    console.log(`\n[Folder] Inspecting ${folderId}`);
    const drive = await getDriveClient();

    try {
        const metadata = await drive.files.get({
            fileId: folderId,
            supportsAllDrives: true,
            fields: [
                "id",
                "name",
                "driveId",
                "shared",
                "trashed",
                "owners",
                "permissions",
                "capabilities",
            ].join(","),
        });

        console.log(`Name: ${metadata.data.name ?? "(unknown)"}`);
        console.log(`Shared: ${Boolean(metadata.data.shared)}`);
        console.log(`Trashed: ${Boolean(metadata.data.trashed)}`);
        if (metadata.data.driveId) {
            console.log(`Drive ID: ${metadata.data.driveId}`);
        }

        const files = await listFilesRecursively(folderId);
        if (files.length === 0) {
            console.log("The service account cannot see any files in this folder.");
        } else {
            console.log(`Files visible to service account (${files.length}):`);
            files.slice(0, verbose ? files.length : 50).forEach((file) => {
                console.log(`  - ${file.path} [${file.mimeType}]`);
            });
            if (!verbose && files.length > 50) {
                console.log(`  ...and ${files.length - 50} more (re-run with --verbose to list all)`);
            }
        }
    } catch (error) {
        console.error("Failed to inspect folder:");
        console.error(error);
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2));

    if (!args) {
        printUsage();
        process.exitCode = 1;
        return;
    }

    if (args.fileId) {
        await inspectFile(args.fileId, args.verbose);
    }

    if (args.folderId) {
        await inspectFolder(args.folderId, args.verbose);
    }
}

main().catch((error) => {
    console.error("Unexpected error while running drive debug tool:");
    console.error(error);
    process.exitCode = 1;
});
