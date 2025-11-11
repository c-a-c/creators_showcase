# プログラミングコンテスト作品展示モノレポ# creators_showcase Monorepo# プログラミングコンテスト作品展示サイト Repository



このリポジトリは、C.A.C プログラミングコンテスト作品展示サイトを運営するためのモノレポ構成です。アプリケーションコードは `apps/` に集約し、作品メタデータや大容量アセットは Google Drive や外部ホスティングに委譲します。



## 全体構成Contest showcase codebase managed as a monorepo. Application code lives under `apps/`, while rich media lives outside git (Google Drive, external hosting).ようこそ！このリポジトリは、「プログラミングコンテスト作品展示サイト」プロジェクトの全てを管理するモノリポです。



- **Portal (`apps/portal`)**: Next.js(App Router) 製のポータルサイト。本番用/試作用の Google Drive フォルダから JSON を取得し、作品一覧・詳細を表示します。このプロジェクトは、作品を紹介する**フロントエンドサイト（Next.js）**と、ブラウザで遊べるゲームなどの**静的コンテンツ（Unity WebGLなど）**の2つの主要な要素で構成されています。

- **Contest (`apps/contest`)**: 年度・作品単位の個別アプリケーション(Next.js / 静的サイト等)。各ディレクトリを個別の Vercel プロジェクトとしてデプロイします。

- **外部ホスティング**: Unityroom や Scratch、Google Drive などで配信する大容量ビルドや動画を管理します。ポータルからは外部リンクとして紐付けます。## High-Level Architecture



## ディレクトリ構造- **Portal (`apps/portal`)** – Next.js App Router site that reads metadata from Google Drive and routes to each work.-   **フロントエンドデプロイ先 (Vercel):** [https://creatorsshowcase.vercel.app/](https://creatorsshowcase.vercel.app/)



```- **Contest apps (`apps/contest`)** – Year/entry specific projects (Next.js or static) deployed as independent Vercel projects.-   **静的コンテンツデプロイ先 (GitHub Pages):** [https://sunshine-724.github.io/creators_showcase/](https://sunshine-724.github.io/creators_showcase/)

.

├── apps/- **External assets** – Unity, Scratch, large binaries hosted on platforms such as Unityroom or the club Google Drive.

│   ├── portal/                 # ポータルサイト本体

│   └── contest/                # 作品ごとの個別アプリ (年度/作品ID 単位)---

│       ├── 2025/

│       │   ├── contest-nextjs-sample/## Repository Layout

│       │   └── contest-static-sample/

│       └── 2026/```## リポジトリ構成

│           └── .gitkeep

├── pages/                      # 旧 GitHub Pages 用ビルド資産 (段階的に廃止予定).

├── memo.md                     # 新アーキテクチャ仕様メモ

└── README.md├── apps/このリポジトリは、以下の2つの主要なディレクトリで構成されています。

```

│   ├── portal/                 # Main portal (Next.js, Drive-backed)<pre>

## ブランチ運用

│   └── contest/                # Individual works grouped by contest year.

- 作業は `release/v2.0` からトピックブランチ (例: `feature/<topic>`) を切って実施します。

- PR は `release/v2.0` 向けに作成し、レビュー後にマージします。│       ├── 2025/├── nextjs-project/ (作品紹介サイト本体)



## Portal セットアップ手順│       │   ├── contest-nextjs-sample/└── pages/ (GitHub Pagesでホスティングする静的コンテンツ)



詳細は `apps/portal/README.md` を参照してください。概要は以下の通りです。│       │   └── contest-static-sample/</pre>



1. サービスアカウント JSON を `apps/portal/service-account.json` に配置します (git では無視されます)。│       └── 2026/

2. `.env.example` を `.env.local` にコピーし、下記を設定します。

   - `DRIVE_FOLDER_ID_MASTER`│           └── .gitkeep[### 📁 `nextjs-project/`](./nextjs-project/README.md)

   - `DRIVE_FOLDER_ID_PROTOTYPE`

   - 必要に応じて `DRIVE_DATA_STAGE` (`master` / `prototype`)├── pages/                      # Legacy GitHub Pages build artefacts (to retire)作品情報を一覧表示したり、詳細を説明したりするためのポータルサイトです。Next.js (App Router) で構築されており、Vercelにデプロイされます。

3. `apps/portal` で依存関係をインストールし、`npm run dev` で開発サーバーを起動します。

├── memo.md                     # Architecture spec memo詳細は [`nextjs-project/README.md`](./nextjs-project/README.md) をご覧ください。

### Google Drive データ仕様

└── README.md

- `config.json`: サイト全体設定 (コンテスト名、説明文、フォーム URL 等)

- `projects.json`: 作品一覧データ。`driveFolderId` または `websiteUrl` を指定します。```[### 📁 `pages/`](./pages/README.md)

- `<driveFolderId>/project.json`: 個別作品の詳細データ。相対パス (`./video/demo.mp4` など) で添付ファイルを記述します。

- 上記以外のファイル (PDF, 動画等) はポータル詳細ページで一覧表示・ダウンロードリンクとして提供されます。UnityのWebGLビルドなど、静的なウェブコンテンツを配置するためのディレクトリです。このディレクトリの内容は、GitHub Actionsによって自動的にGitHub Pagesにデプロイされます。



Prototype 用と master 用のフォルダを分け、環境変数で切り替え可能です。## Branching詳細は [`pages/README.md`](./pages/README.md) をご覧ください。



## Contest アプリのガイドラインWork from feature branches created off `release/v2.0`, e.g. `feature/<topic>`. Open PRs back into `release/v2.0` for review.



- `apps/contest/<year>/<project>/` に作品のソースコードを配置します。---

- Next.js 作品は個別に `package.json` を持ち、Vercel でデプロイします。

- 静的作品は HTML/CSS/JS のみで構築し、そのまま Vercel の Static Site として公開できます。## Portal Setup Snapshot

- デプロイ URL は Drive 上の `projects.json` の `websiteUrl` に登録し、ポータルからリンクします。

Follow `apps/portal/README.md` for full details. Highlights:## プロジェクトの追加・更新ワークフロー

## デプロイ戦略

1. Place the provided service account JSON at `apps/portal/service-account.json` and keep it out of git.

- **Portal**: 代表者の Vercel Hobby プランで `apps/portal` をデプロイ。Drive 認証情報は環境変数/Secret として設定します。

- **Contest**: 各作品ディレクトリを対象に Vercel プロジェクトを作成し、個別にデプロイします。2. Copy `.env.example` to `.env.local` and populate Drive folder IDs (`DRIVE_FOLDER_ID_MASTER`, `DRIVE_FOLDER_ID_PROTOTYPE`).新しい作品を追加する際の基本的な流れは以下の通りです。

- **Legacy**: 旧 `pages/` 配下の GitHub Pages ビルドは移行期間中のみ維持し、順次外部ホスティング＋Drive 管理へ移行します。

3. Install dependencies and run `npm run dev` from `apps/portal`.

## 今後のタスク例

1.  **静的コンテンツの配置 (必要な場合):**

- 既存 JSON / アセットを Google Drive に移行し、新スキーマへ整備する。

- `pages/` 依存の旧作品を外部 URL または `apps/contest` + Vercel へ置き換える。## Google Drive Data Contract    -   Unityビルドなどの静的コンテンツがある場合は、[`pages/`](./pages/)ディレクトリ内にルールに従ったフォルダを作成して配置します。

- lint / test などの自動チェックを各アプリ単位で整備する。

Portal runtime pulls everything from Drive:    -   変更をPushすると、GitHub Actionsが自動でGitHub Pagesにデプロイします。デプロイされたURLを控えておきます。

- `config.json` – global settings (contest name, dates, hero markdown, optional forms/download links).

- `projects.json` – list of works. Each entry either references `driveFolderId` (internal detail page) or `websiteUrl` (external site).2.  **フロントエンドの情報更新:**

- `{driveFolderId}/project.json` – per-work metadata plus relative references (`./video/demo.mp4`, `./docs/overview.pdf`).    -   [`nextjs-project/data/projects.json`](./nextjs-project/data/projects.json) に新しい作品情報を追記します。この際、ステップ1で取得したURLを[`description`](./nextjs-project/README.md#b-作品を追加編集する方法-dataprojectsjson)などに含めます。

- Remaining files in the folder are exposed on the detail page with generated view/download links.    -   必要であれば、[`nextjs-project/public/thumbnails/`](./nextjs-project/public/thumbnails/) にサムネイル画像を追加します。

    -   変更をPushすると、Vercelが自動でサイトを更新します。

Prototype and master datasets live in separate Drive folders. Switch between them with `DRIVE_DATA_STAGE` or by changing the folder ID env variables.

---

## Contest Apps

Each entry under `apps/contest/<year>/<project>` is self-contained:## デプロイ環境について

- Next.js apps must include their own `package.json` and dependencies.

- Static works (HTML/CSS/JS) can be deployed as plain static Vercel projects.このリポジトリでは、コンテンツの種類に応じてデプロイ先を分けています。

- Document deployment URLs in the corresponding Drive `projects.json` (`websiteUrl`).

### 静的サイトのデプロイ

## Deployment StrategyUnity WebGLビルドやプレーンなHTML/CSS/JSで構成される静的サイトは、原則として[`pages`](./pages/)ディレクトリに配置してください。GitHub Actionsが自動でビルドとGitHub Pagesへのデプロイを行います。

- **Portal**: Hobby Vercel project, root directory `apps/portal`.

- **Contest apps**: One Vercel project per work using directories under `apps/contest`.### 動的サイト・その他プラットフォーム

- **Legacy GitHub Pages**: `pages/` kept temporarily for historical builds; scheduled for removal once the new flow is fully adopted.サーバーサイドの処理を必要とする動的サイトや、Vercel/GitHub Pages以外のプラットフォーム（Heroku, Netlify, etc.）でホスティングしたいプロジェクトについては、**原則としてコントリビューター各自もしくはP班チーフがデプロイ環境を準備してください。**

準備したURLを、[`nextjs-project/data/projects.json`](./nextjs-project/data/projects.json)の[`websiteUrl`](./nextjs-project/README.md#b-作品を追加編集する方法-dataprojectsjson)や[`description`](./nextjs-project/README.md#b-作品を追加編集する方法-dataprojectsjson)に記述することで、ショーケースサイトからリンクさせることができます。

## Next Steps

- Migrate existing JSON/data assets to Google Drive following the new schema.---

- Gradually replace legacy `pages/` hosted builds with external hosting references in `projects.json`.

- Define CI checks per app if needed (lint/test).## 大規模ファイルの管理 (Git LFS)
[`pages/`](./pages/)ディレクトリでは、Unityのビルドファイルなど、ギガバイト級の巨大なバイナリファイルを扱う可能性があります。これらのファイルは、Git LFS (Large File Storage) を使って管理することを推奨します。
詳細は [`pages/README.md`](./pages/README.md) を参照してください。