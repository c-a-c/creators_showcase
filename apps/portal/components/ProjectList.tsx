"use client";

import { useSearchParams } from "next/navigation";
import { ProjectListItem } from "@/types";
import Link from "next/link";
import Image from "next/image";

const ITEMS_PER_PAGE = 25;
const FALLBACK_THUMBNAIL = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

function ProjectCard({ project }: { project: ProjectListItem }) {
  const isInternal = Boolean(project.driveFolderId);
  const href = isInternal
    ? `/projects/${project.driveFolderId}`
    : project.websiteUrl ?? "#";

  const imageSrc = project.thumbnailUrl ?? FALLBACK_THUMBNAIL;

  const summary = project.description?.substring(0, 120) ?? "";

  const cardContent = (
    <div className="block border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 dark:border-gray-700 h-full">
      <div className="relative w-full h-48 bg-black">
        <Image
          src={imageSrc}
          alt={`${project.title} のサムネイル`}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{project.title}</h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          {summary}
        </p>
      </div>
    </div>
  );

  if (isInternal) {
    return (
      <Link href={href} className="h-full">
        {cardContent}
      </Link>
    );
  }

  if (project.websiteUrl) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="h-full"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}

export default function ProjectList({ projects }: { projects: ProjectListItem[] }) {
  const totalPages = Math.max(1, Math.ceil(projects.length / ITEMS_PER_PAGE));
  const searchParams = useSearchParams();
  const requestedPage = Number(searchParams.get("page")) || 1;
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  const paginatedProjects = projects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">作品一覧</h1>
      {projects.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          Drive上に作品データが登録されていません。
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedProjects.map((project) => (
            <div key={project.id} className="h-full">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && totalPages > 1 && (
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