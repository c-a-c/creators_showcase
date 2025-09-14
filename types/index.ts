export interface Config {
  contestName: string;
  eventDate: string;
  description: string;
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
}