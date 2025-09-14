import { getProjects } from "@/lib/data/data";
import ProjectList from "@/components/ProjectList";
import { Project } from "@/types";
import { promises as fs } from 'fs';
import path from 'path';
import { Suspense } from 'react'; // ★★★ Suspenseをインポート ★★★

async function getGuaranteedThumbnailSrc(project: Project): Promise<string> {
  if (project.youtubeId) {
    return `https://i.ytimg.com/vi/${project.youtubeId}/hqdefault.jpg`;
  }
  const extensions = ['png', 'jpg', 'jpeg', 'webp'];
  for (const ext of extensions) {
    const filePath = path.join(process.cwd(), 'public', 'thumbnails', `${project.id}.${ext}`);
    try {
      await fs.access(filePath);
      return `/thumbnails/${project.id}.${ext}`;
    } catch {}
  }
  return "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
}

// ★★★ Suspenseのフォールバックとして表示するローディングコンポーネントを定義 ★★★
function Loading() {
  return <div className="text-center py-12">読み込み中...</div>;
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  const projectsWithThumbnails = await Promise.all(
    projects.map(async (project) => ({
      ...project,
      thumbnailSrc: await getGuaranteedThumbnailSrc(project),
    }))
  );
  
  return (
    <div>
      {/* ★★★ ProjectListコンポーネントをSuspenseで囲む ★★★ */}
      <Suspense fallback={<Loading />}>
        <ProjectList allProjects={projectsWithThumbnails} />
      </Suspense>
    </div>
  );
}