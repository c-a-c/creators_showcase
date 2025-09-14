import { getProjects } from "@/lib/data/data";
import ProjectDetailClient from "@/components/ProjectDetailClient";

/**
 * ビルド時に静的なページを生成するためのパスをNext.jsに伝えます。
 * この関数は引き続き有効です。
 */
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({
    id: project.id,
  }));
}

/**
 * このページコンポーネントの役割は、サーバーサイドで全プロジェクトデータを取得し、
 * それをクライアントコンポーネントに渡すことだけです。
 * `params` はここでは使用しません。
 */
export default async function ProjectDetailPage() {
  const projects = await getProjects();
  
  return <ProjectDetailClient allProjects={projects} />;
}