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
  author: string;
  team?: string | null;
  category?: string | null;
  repoUrl: string;
  websiteUrl?: string | null;
  artifactUrl?: string | null;
  thumb?: string | null;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  description: string;
  efforts: string;
  ingenuity: string;
  techStack?: string[];
  licenseNotes?: string | null;
}

export interface DriveAsset {
  id: string;
  name: string;
  mimeType: string;
  path: string;
  webViewUrl: string;
  downloadUrl: string;
  thumbnailUrl: string | null;
}

export interface ProjectDetail {
  meta: ProjectDetailMeta;
  assets: DriveAsset[];
  primaryVideo?: DriveAsset;
  primaryPdf?: DriveAsset;
  primaryThumb?: DriveAsset;
}