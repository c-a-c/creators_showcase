import { cache } from "react";
import {
  Config,
  ProjectDetail,
  ProjectDetailMeta,
  ProjectListItem,
} from "@/types";
import {
  downloadJsonFile,
  listFilesRecursively,
  listFolderChildren,
  FOLDER_MIME,
  type DriveFile,
  type DriveChildItem,
} from "../googleDrive";

const CONFIG_FILE_NAME = "config.json";
const PROJECT_DETAIL_FILE_NAME = "project.json";
const ARTIFACT_FILE_NAME = "artifact.zip";

const DRIVE_STAGE_MASTER = "master";
const DRIVE_STAGE_PROTOTYPE = "prototype";

function normaliseRelativePath(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  return value
    .trim()
    .replace(/^\.\//, "")
    .replace(/^\.\\/, "")
    .replace(/\\/g, "/");
}

function resolveRootFolderId(): string {
  const stageFromEnv = process.env.DRIVE_DATA_STAGE?.toLowerCase();
  const nodeEnv = process.env.NODE_ENV ?? "development";

  const stage = stageFromEnv
    ? stageFromEnv
    : nodeEnv === "production"
      ? DRIVE_STAGE_MASTER
      : DRIVE_STAGE_PROTOTYPE;

  if (stage === DRIVE_STAGE_PROTOTYPE) {
    const prototypeId = process.env.DRIVE_FOLDER_ID_PROTOTYPE;
    if (prototypeId) {
      return prototypeId;
    }
  }

  const masterId = process.env.DRIVE_FOLDER_ID_MASTER;
  if (masterId) {
    return masterId;
  }

  const fallbackPrototype = process.env.DRIVE_FOLDER_ID_PROTOTYPE;
  if (fallbackPrototype) {
    return fallbackPrototype;
  }

  throw new Error("Google Drive folder ID is not configured. Set DRIVE_FOLDER_ID_MASTER or DRIVE_FOLDER_ID_PROTOTYPE.");
}

const getRootFolderId = cache(async () => resolveRootFolderId());

export const getConfig = cache(async (): Promise<Config> => {
  const rootFolderId = await getRootFolderId();
  return downloadJsonFile<Config>(rootFolderId, CONFIG_FILE_NAME);
});

function safeTrim(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function filterOutMetadataFiles(asset: DriveFile): boolean {
  return asset.path !== PROJECT_DETAIL_FILE_NAME;
}

function pickPrimaryThumbnail(detail: ProjectDetailMeta | null, files: DriveFile[]): DriveFile | undefined {
  const normalizedThumbPath = normaliseRelativePath(detail?.thumb);
  if (normalizedThumbPath) {
    const matched = files.find((file) => file.path === normalizedThumbPath);
    if (matched) {
      return matched;
    }
  }

  return files.find((file) => file.mimeType.startsWith("image/"));
}

async function buildProjectListItem(folder: DriveChildItem): Promise<ProjectListItem> {
  const detail = await downloadJsonFile<ProjectDetailMeta>(folder.id, PROJECT_DETAIL_FILE_NAME).catch(() => null);

  const files = (await listFilesRecursively(folder.id))
    .filter(filterOutMetadataFiles)
    .sort((a, b) => a.path.localeCompare(b.path));

  const primaryThumb = pickPrimaryThumbnail(detail, files);

  const title = safeTrim(detail?.title) ?? safeTrim(folder.name) ?? "無題の作品";
  const description = safeTrim(detail?.description);
  const websiteUrl = safeTrim(detail?.websiteUrl);

  return {
    driveFolderId: folder.id,
    title,
    description,
    websiteUrl,
    thumbnailUrl: primaryThumb ? primaryThumb.thumbnailUrl ?? primaryThumb.downloadUrl : null,
  };
}

function filterProjectFolders(items: DriveChildItem[]): DriveChildItem[] {
  return items.filter((item) => item.mimeType === FOLDER_MIME);
}

export const getProjectList = cache(async (): Promise<ProjectListItem[]> => {
  const rootFolderId = await getRootFolderId();
  const children = await listFolderChildren(rootFolderId);
  const projectFolders = filterProjectFolders(children);

  if (projectFolders.length === 0) {
    return [];
  }

  return Promise.all(projectFolders.map(buildProjectListItem));
});

export async function findProjectSummaryByDriveFolderId(driveFolderId: string): Promise<ProjectListItem | null> {
  if (!driveFolderId) {
    return null;
  }

  const projects = await getProjectList();
  return projects.find((project) => project.driveFolderId === driveFolderId) ?? null;
}

export async function getProjectDetail(driveFolderId: string): Promise<ProjectDetail | null> {
  if (!driveFolderId) {
    return null;
  }

  const detail = await downloadJsonFile<ProjectDetailMeta>(driveFolderId, PROJECT_DETAIL_FILE_NAME).catch(() => null);
  if (!detail) {
    return null;
  }

  const files = (await listFilesRecursively(driveFolderId))
    .filter(filterOutMetadataFiles)
    .sort((a, b) => a.path.localeCompare(b.path));

  const normalizedVideoPath = normaliseRelativePath(detail.videoUrl);
  const normalizedPdfPath = normaliseRelativePath(detail.pdfUrl);

  const findAssetByPath = (targetPath: string | null | undefined) => {
    if (!targetPath) {
      return undefined;
    }
    return files.find((file) => file.path === targetPath) ?? undefined;
  };

  const primaryVideo = findAssetByPath(normalizedVideoPath);
  const primaryPdf = findAssetByPath(normalizedPdfPath);
  const primaryThumb = pickPrimaryThumbnail(detail, files);
  const primaryArtifact = files.find((file) => {
    if (file.path === ARTIFACT_FILE_NAME) {
      return true;
    }
    return file.path.endsWith(`/${ARTIFACT_FILE_NAME}`);
  });

  const fallbackThumbUrl = typeof detail.thumb === "string" ? safeTrim(detail.thumb) : null;
  const resolvedThumb = primaryThumb
    ? primaryThumb.thumbnailUrl ?? primaryThumb.downloadUrl
    : fallbackThumbUrl;

  const enrichedMeta: ProjectDetailMeta = {
    ...detail,
    thumb: resolvedThumb ?? undefined,
  };

  return {
    meta: enrichedMeta,
    assets: files,
    primaryVideo,
    primaryPdf,
    primaryThumb,
    primaryArtifact,
  };
}
