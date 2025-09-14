import { getConfig } from "../lib/data/data";
import Link from "next/link";

export default async function Home() {
  const config = await getConfig();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">{config.contestName}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">{config.eventDate}</p>
      <p className="max-w-2xl mx-auto mb-8">{config.description}</p>
      
      {/* Googleフォームへのリンクを削除し、ボタンの上のマージンを調整 */}
      <div className="mt-8">
        <Link href="/projects" className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
          作品一覧へ
        </Link>
      </div>
    </div>
  );
}