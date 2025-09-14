import { getProjects } from "@/lib/data/data";
import ProjectList from "@/components/ProjectList";
import { Project } from "@/types";
import { promises as fs } from 'fs';
import path from 'path';

/**
 * サーバーサイドでサムネイルの存在を確実にチェックし、有効なパスまたは代替データを返す関数
 */
async function getGuaranteedThumbnailSrc(project: Project): Promise<string> {
  // ① youtubeIdがある場合はここで処理が終了する
  if (project.youtubeId) {
    return `https://i.ytimg.com/vi/${project.youtubeId}/hqdefault.jpg`;
  }

  // ② youtubeIdがない場合、ここからファイルの探索が始まる
  const extensions = ['png', 'jpg', 'jpeg', 'webp'];
  for (const ext of extensions) {
    const filePath = path.join(process.cwd(), 'public', 'thumbnails', `${project.id}.${ext}`);
    try {
      // ③ Node.jsが実際にファイルの存在を確認する箇所
      await fs.access(filePath);
      return `/thumbnails/${project.id}.${ext}`; // ファイルが見つかれば、ここで処理が終了する
    } catch {
      // ④ ファイルが見つからなかった場合、何もせず次の拡張子を試す
    }
  }

  // ⑤ 全ての拡張子で見つからなかった場合、ここで代替画像データを返すはず
  return "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  const projectsWithThumbnails = await Promise.all(
    projects.map(async (project) => ({
      ...project,
      // ⑥ この呼び出しの結果がどうなっているか
      thumbnailSrc: await getGuaranteedThumbnailSrc(project),
    }))
  );
  
  return <ProjectList allProjects={projectsWithThumbnails} />;
}