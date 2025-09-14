"use client";

import { useSearchParams } from 'next/navigation';
import { Project } from "@/types";
import Link from "next/link";
import Image from "next/image";

// 親コンポーネントから渡される、thumbnailSrcが追加された新しい型を定義
type ProjectWithThumbnail = Project & { thumbnailSrc: string };

const ITEMS_PER_PAGE = 25;

export default function ProjectList({ allProjects }: { allProjects: ProjectWithThumbnail[] }) {
  const totalPages = Math.ceil(allProjects.length / ITEMS_PER_PAGE);

   // ★★★ デバッグログを追加（その1） ★★★
  // このコンポーネントが再レンダリングされるたびに、親から渡された全データを出力
  // ここで project-2 の thumbnailSrc が "data:image/..." になっているかを確認
  console.log("[ProjectList] Received allProjects:", allProjects);

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  
  const paginatedProjects = allProjects.slice(
    (currentPage - 1) * 25, // ITEMS_PER_PAGE
    currentPage * 25
  );

  // ★★★ デバッグログを追加（その2） ★★★
  // 実際に画面に描画される直前のデータを出力
  // この中の project-2 の thumbnailSrc が "data:image/..." になっているかを確認
  console.log("[ProjectList] Rendering paginatedProjects:", paginatedProjects);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">作品一覧</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedProjects.map((project) => (
          <Link href={`/projects/${project.id}`} key={project.id} className="block border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="relative w-full h-48 bg-black">
              <Image
                // 親から渡された、保証済みのパスをそのまま使う
                src={project.thumbnailSrc}
                alt={`${project.title} のサムネイル`}
                fill={true}
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{project.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {project.description.substring(0, 100)}...
              </p>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-12 space-x-4">
          {currentPage > 1 && (
            <Link href={`/projects?page=${currentPage - 1}`} className="hover:underline">
              &larr; 前へ
            </Link>
          )}
          <span>{currentPage} / {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={`/projects?page=${currentPage + 1}`} className="hover:underline">
              次へ &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}