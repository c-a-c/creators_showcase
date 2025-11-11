import { getProjectDetail } from "@/lib/data/data";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

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

export default async function ProjectDetailPage({
  params,
}: {
  params: { driveFolderId: string };
}) {
  const detail = await getProjectDetail(params.driveFolderId);
  const resolvedDetail = detail ?? notFound();

  const { meta, primaryPdf, primaryVideo, assets } = resolvedDetail;

  const listedAssets = assets.filter(
    (asset: (typeof assets)[number]) =>
      asset.id !== primaryPdf?.id && asset.id !== primaryVideo?.id,
  );

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-3">{meta.title}</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p><strong>作者:</strong> {meta.author}</p>
          {meta.team && <p><strong>チーム:</strong> {meta.team}</p>}
          {meta.category && <p><strong>カテゴリ:</strong> {meta.category}</p>}
        </div>

        {meta.techStack?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {meta.techStack.map((tech: string) => (
              <span key={tech} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {tech}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {meta.thumb && (
        <div className="mb-8">
          <img
            src={meta.thumb}
            alt={`${meta.title} のサムネイル`}
            className="rounded-lg shadow-md max-h-80 w-full object-cover"
          />
        </div>
      )}

      <DetailSection title="作品概要">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{meta.description}</ReactMarkdown>
      </DetailSection>

      <DetailSection title="取り組みポイント">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{meta.efforts}</ReactMarkdown>
      </DetailSection>

      <DetailSection title="工夫した点">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{meta.ingenuity}</ReactMarkdown>
      </DetailSection>

      <DetailSection title="関連リンク">
        <ul className="space-y-2 text-blue-500">
          <li>
            <a href={meta.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              GitHub: {meta.repoUrl}
            </a>
          </li>
          {meta.websiteUrl && (
            <li>
              <a href={meta.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Website: {meta.websiteUrl}
              </a>
            </li>
          )}
          {meta.artifactUrl && (
            <li>
              <a href={meta.artifactUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Artifact: {meta.artifactUrl}
              </a>
            </li>
          )}
          {primaryPdf && (
            <li>
              <a href={primaryPdf.webViewUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                PDFを見る
              </a>
            </li>
          )}
        </ul>
      </DetailSection>

      <DetailSection title="動画">
        {primaryVideo ? (
          <video controls className="w-full rounded-lg shadow-md" src={primaryVideo.downloadUrl} />
        ) : meta.videoUrl ? (
          <p>指定された動画ファイル ({meta.videoUrl}) を見つけられませんでした。</p>
        ) : (
          <p>動画は登録されていません。</p>
        )}
      </DetailSection>

      <DetailSection title="資料">
        {primaryPdf ? (
          <iframe
            src={primaryPdf.webViewUrl}
            title="作品資料"
            className="w-full h-[640px] border-0 rounded-lg shadow-md"
          />
        ) : meta.pdfUrl ? (
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

      {meta.licenseNotes && (
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