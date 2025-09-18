export interface Config {
  contestName: string;
  eventDate: string;
  description: string;
  googleFormUrl: string | null;
  driveDownloadUrl: string | null; 
}

export interface Project {
  id: string;
  title: string;
  author: string;
  team: string;
  technologies: string[];
  description: string;
  youtubeId: string | null;
  websiteUrl: string | null;
  githubUrl: string | null;
  pdfPath: string | null;
}