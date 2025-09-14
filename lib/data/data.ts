import { promises as fs } from 'fs';
import path from 'path';
import { Config, Project } from '@/types';

// サイト設定を取得
export async function getConfig(): Promise<Config> {
  const filePath = path.join(process.cwd(), 'data', 'config.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(jsonData);
}

// 全作品データを取得
export async function getProjects(): Promise<Project[]> {
  const filePath = path.join(process.cwd(), 'data', 'projects.json');
  const jsonData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(jsonData);
}