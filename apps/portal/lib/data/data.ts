import { cache } from "react";
import {
  Config,
  ProjectDetail,
  ProjectDetailMeta,
  ProjectListItem,
  ProjectSummary,
} from "@/types";
import {
  downloadJsonFile,
  getThumbnailUrl,
  listFilesRecursively,
  type DriveFile,
} from "../googleDrive";

const CONFIG_FILE_NAME = "config.json";
const PROJECTS_FILE_NAME = "projects.json";
const PROJECT_DETAIL_FILE_NAME = "project.json";

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

async function enrichProjectSummary(project: ProjectSummary): Promise<ProjectListItem> {
  const thumbnailUrl = project.thumbnailFileId
    ? await getThumbnailUrl(project.thumbnailFileId)
    : null;

  return {
    ...project,
    thumbnailUrl,
  };
}

export const getProjectList = cache(async (): Promise<ProjectListItem[]> => {
  const rootFolderId = await getRootFolderId();
  const summaries = await downloadJsonFile<ProjectSummary[]>(rootFolderId, PROJECTS_FILE_NAME);
  return Promise.all(summaries.map(enrichProjectSummary));
});

function filterOutMetadataFiles(asset: DriveFile): boolean {
  return asset.path !== PROJECT_DETAIL_FILE_NAME;
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
  const normalizedThumbPath = normaliseRelativePath(detail.thumb);

  const findAssetByPath = (targetPath: string | null | undefined) => {
    if (!targetPath) {
      return undefined;
    }
    return files.find((file) => file.path === targetPath) ?? undefined;
  };

  const primaryVideo = findAssetByPath(normalizedVideoPath);
  const primaryPdf = findAssetByPath(normalizedPdfPath);
  const primaryThumb = findAssetByPath(normalizedThumbPath);

  const resolvedThumb = primaryThumb
    ? primaryThumb.thumbnailUrl ?? primaryThumb.downloadUrl
    : detail.thumb ?? null;

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
  };
}