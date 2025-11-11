import { findProjectSummaryByDriveFolderId, getProjectDetail } from "@/lib/data/data";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { ProjectListItem } from "@/types";
import Image from "next/image";

export const dynamic = "force-dynamic";

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="bg-gray-50 dark:bg-gray-800 dark:border-gray-700 border rounded-lg p-4">
        {children}
      </div>
    </section>
  );
}

function renderMarkdownOrPlaceholder(value: string | null | undefined, placeholder: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return <p className="text-gray-500 dark:text-gray-400">{placeholder}</p>;
  }
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{trimmed}</ReactMarkdown>;
}

function MissingProjectDetail({ project }: { project: ProjectListItem }) {
  const thumbnailSrc = project.thumbnailUrl;

  return (
    <div className="max-w-3xl mx-auto text-center space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-3">{project.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Drive上の詳細データを取得できませんでした。作品の情報が整い次第、順次公開予定です。
        </p>
      </div>
      {thumbnailSrc && (
        <div className="mx-auto max-w-md relative h-64">
          <Image
            src={thumbnailSrc}
            alt={`${project.title} のサムネイル`}
            fill
            className="rounded-lg shadow-md object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
      {project.description && (
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-left">{project.description}</p>
      )}
      <div className="flex justify-center gap-4">
        {project.websiteUrl && (
          <a
            href={project.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            作品サイトを開く
          </a>
        )}
        <Link href="/projects" className="px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30">
          一覧に戻る
        </Link>
      </div>
    </div>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ driveFolderId: string }>;
}) {
  const { driveFolderId } = await params;
  const detail = await getProjectDetail(driveFolderId);

  if (!detail) {
    const summary = await findProjectSummaryByDriveFolderId(driveFolderId);
    if (!summary) {
      notFound();
    }
    return <MissingProjectDetail project={summary} />;
  }

  const resolvedDetail = detail;

  const { meta, primaryPdf, primaryVideo, primaryThumb, assets } = resolvedDetail;
  const websiteUrl = meta.websiteUrl?.trim() ?? null;

  const listedAssets = assets.filter(
    (asset: (typeof assets)[number]) =>
      asset.id !== primaryPdf?.id && asset.id !== primaryVideo?.id,
  );

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-3">{meta.title}</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>作者:</strong> {meta.author?.trim() || "未登録"}</p>
          {meta.team?.trim() && <p><strong>チーム:</strong> {meta.team}</p>}
          {meta.category?.trim() && <p><strong>カテゴリ:</strong> {meta.category}</p>}
        </div>

        {meta.techStack && meta.techStack.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {meta.techStack.map((tech: string) => (
              <span key={tech} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {tech}
              </span>
            ))}
          </div>
        ) : null}

        {websiteUrl && (
          <div className="mt-6">
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              作品サイトを開く
            </a>
          </div>
        )}
      </header>

      {primaryThumb || meta.thumb ? (
        <div className="mb-8 relative w-full h-80">
          <Image
            src={primaryThumb?.downloadUrl ?? primaryThumb?.thumbnailUrl ?? meta.thumb ?? ""}
            alt={`${meta.title} のサムネイル`}
            fill
            className="rounded-lg shadow-md object-cover"
            sizes="100vw"
          />
        </div>
      ) : null}

      <DetailSection title="作品概要">
        {renderMarkdownOrPlaceholder(meta.description, "作品概要は登録されていません。")}
      </DetailSection>

      <DetailSection title="取り組みポイント">
        {renderMarkdownOrPlaceholder(meta.efforts, "取り組みポイントは登録されていません。")}
      </DetailSection>

      <DetailSection title="工夫した点">
        {renderMarkdownOrPlaceholder(meta.ingenuity, "工夫した点は登録されていません。")}
      </DetailSection>

      <DetailSection title="関連リンク">
        {(() => {
          const links: ReactNode[] = [];
          if (meta.repoUrl?.trim()) {
            links.push(
              <li key="repo">
                <a href={meta.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  GitHub: {meta.repoUrl}
                </a>
              </li>,
            );
          }
          if (websiteUrl) {
            links.push(
              <li key="website">
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  作品サイト: {websiteUrl}
                </a>
              </li>,
            );
          }
          if (meta.artifactUrl?.trim()) {
            links.push(
              <li key="artifact">
                <a href={meta.artifactUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Artifact: {meta.artifactUrl}
                </a>
              </li>,
            );
          }
          if (primaryPdf) {
            links.push(
              <li key="pdf">
                <a
                  href={primaryPdf.previewUrl ?? primaryPdf.webViewUrl ?? primaryPdf.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  PDFを見る
                </a>
              </li>,
            );
          }

          if (links.length === 0) {
            return <p className="text-gray-500 dark:text-gray-400">関連リンクは登録されていません。</p>;
          }

          return <ul className="space-y-2 text-blue-500">{links}</ul>;
        })()}
      </DetailSection>

      <DetailSection title="動画">
        {primaryVideo ? (
          <div className="relative w-full h-[480px]">
            <iframe
              src={primaryVideo?.previewUrl ?? primaryVideo?.webViewUrl ?? primaryVideo?.downloadUrl ?? ""}
              title="作品動画"
              className="w-full h-full rounded-lg shadow-md border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        ) : meta.videoUrl?.trim() ? (
          <p>指定された動画ファイル ({meta.videoUrl}) を見つけられませんでした。</p>
        ) : (
          <p>動画は登録されていません。</p>
        )}
      </DetailSection>

      <DetailSection title="資料">
        {primaryPdf ? (
          <iframe
            src={primaryPdf?.previewUrl ?? primaryPdf?.webViewUrl ?? primaryPdf?.downloadUrl ?? ""}
            title="作品資料"
            className="w-full h-[640px] border-0 rounded-lg shadow-md"
          />
        ) : meta.pdfUrl?.trim() ? (
          <p>指定されたPDFファイル ({meta.pdfUrl}) を見つけられませんでした。</p>
        ) : (
          <p>PDF資料は登録されていません。</p>
        )}
      </DetailSection>

      <DetailSection title="添付ファイル一覧">
        {listedAssets.length ? (
          <ul className="space-y-2">
            {listedAssets.map((asset) => (
              <li key={asset.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium">{asset.path}</p>
                  <p className="text-xs text-gray-500">{asset.mimeType}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={asset.webViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    表示
                  </a>
                  <a
                    href={asset.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    ダウンロード
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>追加ファイルは登録されていません。</p>
        )}
      </DetailSection>

      {meta.licenseNotes?.trim() && (
        <DetailSection title="ライセンス・使用素材の注意">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{meta.licenseNotes}</ReactMarkdown>
        </DetailSection>
      )}

      <div className="mt-12 text-center">
        <Link href="/projects" className="text-blue-500 hover:underline">
          &larr; 作品一覧に戻る
        </Link>
      </div>
    </div>
  );
}