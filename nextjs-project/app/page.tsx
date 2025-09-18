import ReactMarkdown from "react-markdown";
import { getConfig } from "../lib/data/data";
import Link from "next/link";
import remarkGfm from "remark-gfm";

export default async function Home() {
  const config = await getConfig();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">{config.contestName}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">{config.eventDate}</p>
       <article className="prose dark:prose-invert max-w-2xl mx-auto mb-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {config.description}
        </ReactMarkdown>
      </article>
      
      <div className="mt-8 flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-4 sm:space-y-0">
        {/* 作品一覧へのボタン */}
        <Link 
          href="/projects" 
          className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          作品一覧へ
        </Link>
        
        {/* Googleフォームへのボタン (URLが存在する場合のみ表示) */}
        {config.googleFormUrl && (
          <a 
            href={config.googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            評価フォームへ
          </a>
        )}

        {/* Googleドライブへのボタンをここに追加 */}
        {config.driveDownloadUrl && (
          <a 
            href={config.driveDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            ローカル動作用ファイル
          </a>
        )}
      </div>
    </div>
  );
}