export interface Config {
  contestName: string;
  eventDate: string;
  description: string;
  googleFormUrl?: string | null;
  driveDownloadUrl?: string | null;
}

export interface ProjectSummary {
  id: string;
  title: string;
  description: string;
  thumbnailFileId: string | null;
  driveFolderId: string | null;
  websiteUrl: string | null;
}

export interface ProjectListItem extends ProjectSummary {
  thumbnailUrl: string | null;
}

export interface ProjectDetailMeta {
  title: string;
  author?: string | null;
  team?: string | null;
  category?: string | null;
  repoUrl?: string | null;
  websiteUrl?: string | null;
  artifactUrl?: string | null;
  thumb?: string | null;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  description?: string | null;
  efforts?: string | null;
  ingenuity?: string | null;
  techStack?: string[] | null;
  licenseNotes?: string | null;
}

export interface DriveAsset {
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

export interface ProjectDetail {
  meta: ProjectDetailMeta;
  assets: DriveAsset[];
  primaryVideo?: DriveAsset;
  primaryPdf?: DriveAsset;
  primaryThumb?: DriveAsset;
}