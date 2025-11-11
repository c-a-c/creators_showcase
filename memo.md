プログラミングコンテスト作品展示サイト 新アーキテクチャ仕様書 (v7 - 最終版)

1. 目的

（変更なし。LFS問題, デプロイ煩雑さ, ホスティング属人化の解消）

2. 新アーキテクチャ概要 (ハイブリッド・ヘッドレス構成)

Gitリポジトリは「コード」のみを管理し、「メタデータ（情報）」と「特殊な静的ビルド（実行環境）」を完全に分離する。

コード (Vercel Monorepo): Next.js製コード（ポータル, 作品）、静的HTML/CSS製コード。

メタデータ (Google Drive): Driveのフォルダ構造そのものがデータソースとなる。各作品フォルダ内にproject.json（詳細用）、thumb.png、動画、PDFなどを配置する。

特殊ビルド (外部ホスティング): Unityroom, Scratch など。

3.【最優先検証事項】Vercelプランとコスト（¥0運用）のテスト

（変更なし。OrganizationのPublicリポジトリと個人のHobbyプランでのGit連携・モノリポ運用の検証を推奨）

4. 各コンポーネントの詳細仕様（検証後）

4-1. コード: Vercelモノリポ (GitHub)

（変更なし。apps/portalとapps/contest/...に分離する構成を維持）

ディレクトリ構成:

/apps/
├── portal/            (ポータルサイト本体 - Next.js)
│   ├── app/
│   │   ├── page.tsx                     <-- (★一覧ページ - 動的化)
│   │   └── projects/[folderId]/
│   │       └── page.tsx                 <-- (★動的詳細ページ)
│   │
│   └── (旧 nextjs-project の中身をここに移動)
│
└── contest/           (作品格納 親フォルダ)
    ├── 2025/
    │   ├── contest-nextjs-1/  <-- (Next.js プロジェクト)
    │   └── contest-html-2/    <-- (静的HTML/CSS/JS 作品)
    └── ...



デプロイ (Vercel):
（変更なし。apps/以下の各プロジェクトを個別のVercelプロジェクトとして設定）

4-2. メタデータ: Google Drive (ヘッドレスCMS)

ポータルサイト（apps/portal）が表示するすべてのメタデータは、Google Driveから動的に取得する。
（★ projects.json（一覧用）は廃止し、Driveのフォルダ構造を正とする）

Google Drive フォルダ構成（例）:

/部活Drive/コンテストデータ/
├── 📄 config.json          (サイト設定ファイル)
│
├── 📁 project-A/          (フォルダID: "abc123")
│   ├── 📄 project.json      (② 作品A・詳細用JSON)
│   ├── 🖼️ thumb.png        (★一覧・詳細用サムネイル)
│   ├── 📁 docs/
│   │   └── 📄 overview.pdf
│   └── 📁 video/
│       └── 📄 sample.mp4
│
├── 📁 project-B-Unity/    (フォルダID: "xyz789")
│   ├── 📄 project.json      (② 作品B・詳細用JSON)
│   ├── 🖼️ thumb.jpg        (★一覧・詳細用サムネイル)
│   └── ...
│
└── 📁 project-C-Nextjs/   (フォルダID: "qwe456")
    ├── 📄 project.json      (② 作品C・詳細用JSON)
    ├── 🖼️ thumb.png        (★一覧・詳細用サムネイル)
    └── ...



project.json (② 詳細用) のひな形 (例):
（各作品フォルダ（例: project-A/）内に配置するproject.jsonのひな形）
（★ id および thumb フィールドを削除）

{
  "title": "Sample Game(必須)",
  "author": "学籍番号1234567(必須)",
  "team": "チーム名 or 個人(任意)",
  "category": "game | webapp | mobile | other(任意)",
  "repoUrl": "[https://github.com/your-org/your-repo(必須](https://github.com/your-org/your-repo(必須))",
  "websiteUrl": "(任意)",
  "artifactUrl": "(任意)",
  "videoUrl": "./video/sample.mp4(必須)",
  "pdfUrl": "./docs/overview.pdf(任意)",
  "description": "作品の狙い・ゲームループ・基本操作・使用技術・見どころを2〜5行で具体的に説明してください。(必須)",
  "efforts": "特に時間をかけて取り組んだ点を2〜3行で説明してください。（例: 調整や検証、難所の突破など）(必須)",
  "ingenuity": "工夫した点や独自性を2〜3行で説明してください。（例: 設計、アルゴリズム、データ構造、最適化戦略など）(必須)",
  "techStack": ["Unity", "Next.js"],
  "licenseNotes": "使用素材やライセンスに関する注意点(任意)"
}


4-3. apps/portal (ポータルサイト) の動的ロジック

ポータルサイトは、Next.js (TypeScript) のApp Routerを最大限に活用し、Google Drive API（googleapis）を呼び出す。

1. apps/portal/app/page.tsx (一覧ページ) (★ロジック大幅変更)

役割: Driveのフォルダ構成をスキャンし、全作品のリストを動的に生成・表示する。

動作:

サーバーコンポーネントがDrive APIを叩き、/コンテストデータ/直下にある全フォルダをリストアップします（files.list）。

取得した各フォルダ（例: project-A, project-B...）に対し、Promise.allなどを使用して、各フォルダ内のproject.json（詳細用）とthumb.png（またはthumb.jpg）を並列で取得します。

（N+1問題が発生しますが、Next.jsのISRキャッシュ（revalidate）でAPI負荷を軽減します）

各project.json（詳細用）からtitle、description（一覧表示用に短縮）、websiteUrlを取得します。

各フォルダから取得したthumb.pngのFileIDまたはダウンロードリンクを取得します。

取得した情報（title, description, サムネイル, websiteUrl, フォルダID）の配列を使って、一覧ページをレンダリングします。

リンクの振り分け:

もしproject.json（詳細用）にwebsiteUrlが存在すれば（例: Unityroom, Vercelモノリポ作品）、通常の<a>タグでその外部URLにリンクします。

もしwebsiteUrlが存在しなければ（nullまたは""）、Next.jsの<Link>コンポーネントで内部の動的詳細ページ（例: /projects/abc123）にリンクします。（abc123はDriveのフォルダID）

2. apps/portal/app/projects/[folderId]/page.tsx (動的詳細ページ) (★ID名を変更)

役割: folderId（DriveのフォルダID）で指定されたフォルダの中身（詳細JSON, PDF, 動画）を取得し、動的に表示する。

動作:

Next.jsがページのparamsからfolderId（例: abc123）を取得する。

このページのサーバーコンポーネントがDrive APIを叩き、フォルダabc123の中にあるproject.json（詳細用）を取得・解析する。

さらにDrive APIを叩き、フォルダabc123内の全ファイル（docs/overview.pdf, video/sample.mp4, thumb.pngなど）のリストを**mimeType（ファイル種別）と共に**取得する。

取得した情報（詳細な説明文、各ファイルのリスト）を使ってページをレンダリングする。

（実装例）レンダリング時、mimeTypeを判定し、ブラウザ表示可能なファイルには「表示」ボタン、すべてのファイルに「ダウンロード」ボタンを表示する。

4-4. 特殊な静的ビルド: 外部ホスティング

（変更なし。Vercelモノリポ（apps/）で扱えないUnity, Scratchなど）

ホスティング先 (例): Unityroom、Scratch公式サイト

連携: （一覧用JSONは廃止されたため）各作品フォルダのproject.json（詳細用）に、websiteUrl としてUnityroomやScratchのURLを記述する。

5. 移行による影響（不要になるファイル）

（変更なし。pages/, workflows/, .gitattributes, 旧data/, 旧public/ が不要になる）