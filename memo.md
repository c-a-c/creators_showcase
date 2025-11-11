プログラミングコンテスト作品展示サイト 新アーキテクチャ仕様書 (v6 - 最終版)

1. 目的

現行の「creators_showcase」リポジトリが抱える以下のボトルネックを解消し、スケーラビリティと管理性を向上させる。

Git LFS問題: Unityビルドファイル（.data等）の管理によるリポジトリの肥大化と、GitHub PagesのLFS非対応制約。

デプロイの煩雑さ: JSONやPDFなど、軽微なメタデータの修正でもNext.jsの再デプロイが必要な点。

作品ホスティングの属人化: Next.js/HTML/Unity作品のホスティングが部員各自に委ねられている点を一元化・効率化する。

2. 新アーキテクチャ概要 (ハイブリッド・ヘッドレス構成)

Gitリポジトリは「コード」のみを管理し、「メタデータ（情報）」と「特殊な静的ビルド（実行環境）」を完全に分離する。

コード (Vercel Monorepo): Next.js製コード（ポータル, 作品）、静的HTML/CSS製コード。

メタデータ (Google Drive): JSON, PDF, 動画, サムネイル画像。

特殊ビルド (外部ホスティング): Unityroom, Scratch など。

3.【最優先検証事項】Vercelプランとコスト（¥0運用）のテスト

本仕様は、**「GitHub Organization (c-a-c) が所有するPublicリポジトリ (creators_showcase) は、個人のVercel Hobbyプラン（無料）でGit連携・モノリポ運用が可能である」**という仮説に基づいている。

この仮説が正しければ、GitHub ActionsからのAPIデプロイ（複雑なCI/CD）は不要となり、Vercelの強力なGit連携（自動デプロイ、プレビューデプロイ）を無料で活用できる。

検証ステップ

代表者1名（あなた）が、個人のVercelアカウント（Hobbyプラン）にログインする。

Vercelダッシュボードから「New Project」を選択する。

GitHubリポジトリの選択画面で、「Add GitHub Account or Organization」をクリックし、c-a-c Organizationを連携する。

c-a-c Organizationのリポジトリ一覧が表示されたら、creators_showcase（Public）を選択（Import）する。

[確認ポイント] この時点で、Vercelが「Teamプラン（有料）への移行」を強制してこないか（Upgrade to Teamのような警告が出ないか）を確認する。

強制されなければ、Root Directory を nextjs-project（移行前のテストとして）に設定し、テストデプロイを実行する。

Hobbyプランのままデプロイが完了すれば、仮説は正しい。

補足: Vercelの課金は「Vercel Team」を作成し、そこにメンバーを招待した場合に発生する。GitHub OrganizationのCollaboratorが複数人いても、Vercelのデプロイ管理を代表者1名のHobbyアカウントで行う限り、無料であると想定される。

4. 各コンポーネントの詳細仕様（検証後）

4-1. コード: Vercelモノリポ (GitHub)

Vercelプランの検証後、リポジトリをVercelモノリポ構成に移行する。apps/ ディレクトリ以下に、ポータルサイトと、Next.js製および静的HTML製の全作品を年度別に格納する。

ディレクトリ構成:

/apps/
├── portal/            (ポータルサイト本体 - Next.js)
│   ├── app/
│   │   ├── page.tsx                     <-- (一覧ページ)
│   │   └── projects/[driveFolderId]/
│   │       └── page.tsx                 <-- (★動的詳細ページ)
│   │
│   └── (旧 nextjs-project の中身をここに移動)
│
└── contest/           (作品格納 親フォルダ)
    ├── 2025/
    │   ├── contest-nextjs-1/  <-- (Next.js プロジェクト)
    │   │   └── package.json
    │   │
    │   └── contest-html-2/    <-- (静的HTML/CSS/JS 作品)
    │       ├── index.html
    │       ├── style.css
    │       └── app.js
    │
    └── 2026/
        └── ...


デプロイ (Vercel):
代表者1名のVercelアカウントで、apps/ 以下の各プロジェクトを個別のVercelプロジェクトとして設定する。

Vercel Project "Portal"

Root Directory: apps/portal

Framework: Next.js (自動検出)

Vercel Project "Next.js Game 1"

Root Directory: apps/contest/2025/contest-nextjs-1

Framework: Next.js (自動検出)

Vercel Project "HTML Site 2"

Root Directory: apps/contest/2025/contest-html-2

Framework: Other (静的サイトとして自動検出)

4-2. メタデータ: Google Drive (ヘッドレスCMS)

ポータルサイト（apps/portal）が表示するすべてのメタデータは、Google Driveから動的に取得する。

Google Drive フォルダ構成（例）:
(★ project.jsonのひな形に合わせて更新)

/部活Drive/コンテストデータ/
├── 📄 config.json          (サイト設定ファイル)
├── 📄 projects.json        (① 一覧用JSONファイル)
│
├── 📁 project-A/          (driveFolderId: "abc123")
│   ├── 📄 project.json      (② 作品A・詳細用JSON)
│   │
│   ├── 📁 docs/
│   │   └── 📄 overview.pdf   <-- (pdfUrl: "./docs/overview.pdf" に対応)
│   │
│   └── 📁 video/
│       └── 📄 sample.mp4     <-- (videoUrl: "./video/sample.mp4" に対応)
│
└── 📁 project-B/          (driveFolderId: "xyz789")
    ├── 📄 project.json      (② 作品B・詳細用JSON)
    └── ...


projects.json (① 一覧用) のスキーマ定義 (例):
driveFolderId と websiteUrl はどちらか一方のみを持つ（排他）。

[
  {
    "id": "project-A",
    "title": "PDFと動画の作品",
    "description": "これはPDFと動画で構成される作品です。",
    "thumbnailFileId": "...", // Drive上のサムネイル画像FileID
    "driveFolderId": "abc123", // ★ポータル内部詳細ページ用ID
    "websiteUrl": null
  },
  {
    "id": "project-B",
    "title": "Next.js製作品",
    "description": "これはVercelでホストされたNext.js作品です。",
    "thumbnailFileId": "...",
    "driveFolderId": null,
    "websiteUrl": "[https://contest-game-1.vercel.app](https://contest-game-1.vercel.app)" // ★外部サイトURL
  },
  {
    "id": "project-C",
    "title": "Unityゲーム作品",
    "description": "これはUnityroomで遊べる作品です。",
    "thumbnailFileId": "...",
    "driveFolderId": null,
    "websiteUrl": "[https://unityroom.com/games/my-game](https://unityroom.com/games/my-game)" // ★外部サイトURL
  }
]


project.json (② 詳細用) のひな形 (例):
（driveFolderIdで指定された各作品フォルダ（例: project-A/）内に配置するproject.jsonのひな形）
（★ ご指摘に基づき id フィールドを削除）

{
  "title": "Sample Game(必須)",
  "author": "学籍番号1234567(必須)",
  "team": "チーム名 or 個人(任意)",
  "category": "game | webapp | mobile | other(任意)",
  "repoUrl": "[https://github.com/your-org/your-repo(必須](https://github.com/your-org/your-repo(必須))",
  "websiteUrl": "(任意)",
  "artifactUrl": "(任意)",
  "thumb": "[https://drive.google.com/thumbnail-id(必須](https://drive.google.com/thumbnail-id(必須))",
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

1. apps/portal/app/page.tsx (一覧ページ)

役割: 全作品のリストを表示し、リンク先を振り分ける。

動作:

サーバーコンポーネントがDrive APIを叩き、projects.json（① 一覧用）を取得する。

取得したデータをmapでループ処理する。

もしwebsiteUrlが存在すれば（例: project-B, C）、通常の<a>タグでその外部URL（Vercel, Unityroomなど）にリンクする。

もしdriveFolderIdが存在すれば（例: project-A）、Next.jsの<Link>コンポーネントで内部の動的詳細ページ（/projects/abc123）にリンクする。

2. apps/portal/app/projects/[driveFolderId]/page.tsx (動的詳細ページ)

役割: driveFolderIdで指定されたフォルダの中身（詳細JSON, PDF, 動画）を取得し、動的に表示する。

動作:

Next.jsがページのparamsからdriveFolderId（例: abc123）を取得する。

このページのサーバーコンポーネントがDrive APIを叩き、フォルダabc123の中にあるproject.json（② 詳細用）を取得・解析する。

さらにDrive APIを叩き、フォルダabc123内の全ファイル（spec.pdf, movie.mp4など）のリストを**mimeType（ファイル種別）と共に**取得する。

取得した情報（詳細な説明文、各ファイルのリスト）を使ってページをレンダリングする。

（実装例）レンダリング時、mimeTypeを判定し、ブラウザ表示可能なファイルには「表示」ボタン、すべてのファイルに「ダウンロード」ボタンを表示する。これらのボタンは、Google DriveのWebViewリンクやダウンロードリンク（drive.files.getで取得可能）を直接<a>タグに設定する、などの方法で実装する。

4-4. 特殊な静的ビルド: 外部ホスティング

Vercelモノリポ（apps/）で扱えない、または扱いにくい作品（Unity, Scratchなど）。

対象: Unity WebGLビルド（LFSやサイズ制約のため）、Scratchプロジェクト

ホスティング先 (例): Unityroom、Scratch公式サイト

連携: Google Drive上の projects.json（① 一覧用）に、websiteUrl としてUnityroomやScratchのURLを記述する。

5. 移行による影響（不要になるファイル）

この新仕様へ移行が完了すると、creators_showcaseリポジトリから以下のファイル・ディレクトリが不要となり、リポジトリが「コード」のみを管理するクリーンな状態になる。

pages/ (Unityビルドファイル群)

.github/workflows/pages_deploy.yml (GitHub Actions)

.gitattributes (Git LFS設定)

nextjs-project/data/ (旧JSON)

nextjs-project/public/ (旧アセット全般: thumbnails, PDFなど)

6. Drive データ移行計画 (2025 Q4)

1. **フェーズ0: 準備 (11月 第2週)**
  - Drive 上に `config.json` / `projects.json` / `<driveFolderId>/project.json` のテンプレートを複製し、試作用フォルダ(`prototype`)を作成。
  - サービスアカウントのアクセス権 (閲覧者→編集者) を Drive フォルダ階層全体に再確認。
  - `.env.local` を各開発端末に配布し、`DRIVE_DATA_STAGE=prototype` で動作確認。

2. **フェーズ1: JSON 移行 (11月 第3週)**
  - 旧 `nextjs-project/data/config.json` / `projects.json` を Drive テンプレートへ移植し、Drive 側で整形。
  - `projects.json` の `driveFolderId` / `websiteUrl` を暫定的にダミー値で入力し、Portal 上で一覧が表示されることを確認。
  - Drive 上で Markdown (説明文) やリンクの表示崩れが無いか確認し、校正フローを整える。

3. **フェーズ2: アセット移行 (11月 第4週)**
  - 作品ごとに Drive フォルダを作成し、`project.json` と添付ファイル(PDF, 動画, 追加画像)を配置。
  - 旧 `public/thumbnails` から必要な画像を Drive に移動し、`thumbnailFileId` を `projects.json` に追記。
  - Portal 詳細ページで添付ファイルリンクが生成されることを確認し、ミドルサイズ以上のファイルのダウンロード可否を検証。

4. **フェーズ3: 外部作品リンク精査 (12月 第1週)**
  - Unityroom / Scratch / Vercel 個別プロジェクトの URL を収集し、`projects.json` の `websiteUrl` に登録。
  - Drive 詳細ページが不要な作品は `driveFolderId=null` に統一し、Portal 側のリンク先が外部に遷移することを確認。

5. **フェーズ4: 切り替え (12月 第2週)**
  - `DRIVE_DATA_STAGE=master` の本番データセットを作成し、prototype の内容をコピー。
  - Vercel 本番環境の環境変数を更新し、Portal を再デプロイ。
  - 切り替え後 1 週間は旧 `pages/` / `nextjs-project/data` を残し、問題が無ければ削除 PR を作成。

6. **運用移管**
  - 学年末に向けて、Drive テンプレートの更新フローと権限管理のマニュアルを作成。
  - 新規作品提出時は prototype フォルダでレビュー→ master へ反映 の 2 段階承認を徹底。