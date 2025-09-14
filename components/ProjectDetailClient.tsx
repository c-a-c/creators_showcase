"use client";

import { useParams } from 'next/navigation'; // URLパラメータを取得するためのフック
import { Project } from "@/types";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

// このコンポーネントは全プロジェクトデータをpropsとして受け取ります
export default function ProjectDetailClient({ allProjects }: { allProjects: Project[] }) {
  // useParamsフックでURLの動的な部分（[id]）を取得します
  const params = useParams();
  const id = params.id as string; // Next.jsではstring or string[]なのでキャストします

  // 受け取った全データから、idに一致するものをクライアントサイドで探します
  const project = allProjects.find(p => p.id === id);

  // プロジェクトが見つからない場合の表示
  if (!project) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">作品が見つかりません</h1>
        <div className="mt-8">
          <Link href="/projects" className="text-blue-500 hover:underline">
            &larr; 作品一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // プロジェクトが見つかった場合の表示ロジック（以前のpage.tsxから移植）
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
      <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        <p><strong>作者:</strong> {project.author}</p>
        <p><strong>チーム:</strong> {project.team}</p>
      </div>

      <article className="prose dark:prose-invert max-w-none mb-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.description}</ReactMarkdown>
      </article>

      {project.youtubeId ? (
        <div className="max-w-4xl mx-auto"> 
          <div className="relative h-0 pb-[56.25%] rounded-lg shadow-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${project.youtubeId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0"
            ></iframe>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg mb-8">
          <p>動画はありません</p>
        </div>
      )}

      <br />
      <br />

      <div className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2">使用技術</h3>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map(tech => (
            <span key={tech} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">{tech}</span>
          ))}
        </div>
      </div>

      {(project.websiteUrl || project.githubUrl) && (
        <div className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">関連リンク</h3>
          <div className="space-y-1">
            {project.websiteUrl && <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">作品サイト</a>}
            {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">GitHubリポジトリ</a>}
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href="/projects" className="text-blue-500 hover:underline">
          &larr; 作品一覧に戻る
        </Link>
      </div>
    </div>
  );
}