# プログラミングコンテスト作品展示サイト (Portal)# Portal Application# プログラミングコンテスト作品展示サイト - Next.js Frontend



`apps/portal` は C.A.C プログラミングコンテスト作品を紹介する Next.js(App Router) 製ポータルサイトです。作品メタデータや添付ファイルは Google Drive 上に保管し、アプリケーションから API 経由で取得します。



## 必要環境Next.js 15 (App Router) portal that surfaces contest works. Metadata and assets live in Google Drive, while this repository only stores code. Deploy each app under `apps/` as individual Vercel projects.このディレクトリは、作品情報を紹介するための「プログラミングコンテスト作品展示サイト」のフロントエンド部分のソースコードを管理しています。



- Node.js 20 以上Next.js (App Router) で構築され、Vercelにデプロイされます。サイトのコンテンツ更新を行う**運営者の方**と、システムの改修を行う**開発者の方**へ向けた情報を記載しています。

- npm 10 以上

- コンテスト用 Google Drive を閲覧できるサービスアカウント## Prerequisites



## クイックスタート- Node.js 20+**デプロイ先 (Vercel):** [https://creatorsshowcase.vercel.app/](https://creatorsshowcase.vercel.app/)



1. 共有されたサービスアカウント JSON を `apps/portal/service-account.json` に配置します (git では無視されます)。- npm 10+

2. `.env.example` を `.env.local` にコピーし、以下を設定します。

   - `DRIVE_FOLDER_ID_MASTER`- Google Cloud service account authorised to read the contest Drive folders

   - `DRIVE_FOLDER_ID_PROTOTYPE`

   - 必要に応じて `DRIVE_DATA_STAGE` (`master` / `prototype`)## TOC (Table of Contents)

3. 依存関係をインストールし、開発サーバーを起動します。

   ```bash## Quick Start- [プログラミングコンテスト作品展示サイト - Next.js Frontend](#プログラミングコンテスト作品展示サイト---nextjs-frontend)

   cd apps/portal

   npm install1. Copy the service account JSON provided by the club into `apps/portal/service-account.json`.  - [TOC (Table of Contents)](#toc-table-of-contents)

   npm run dev

   ```2. Duplicate `.env.example` to `.env.local` and adjust values as needed.  - [1. サイト運営者様向けガイド](#1-サイト運営者様向けガイド)

4. `http://localhost:3000` にアクセスして動作を確認します。

3. Install dependencies and launch the dev server:    - [A. コンテンツ更新の基本フロー](#a-コンテンツ更新の基本フロー)

## 環境変数

   ```bash    - [B. 作品を追加・編集する方法 (`projects.json`)](#b-作品を追加編集する方法-projectsjson)

| 変数名 | 必須 | 説明 |

| --- | --- | --- |   cd apps/portal    - [C. サムネイル画像を追加する方法](#c-サムネイル画像を追加する方法)

| `DRIVE_FOLDER_ID_MASTER` | 必須 | 本番データを格納する Google Drive フォルダ ID |

| `DRIVE_FOLDER_ID_PROTOTYPE` | 任意 | 試作用データセットのフォルダ ID |   npm install    - [D. PDF資料を追加する方法（2つの方法）](#d-pdf資料を追加する方法2つの方法)

| `DRIVE_DATA_STAGE` | 任意 | `master` / `prototype`。未設定時は `development=prototype`、`production=master` |

| `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` | 任意 | サービスアカウント JSON のパス。未設定時は `service-account.json` を使用 |   npm run dev      - [**方法1：「関連リンク」に専用のボタンとして表示する**](#方法1関連リンクに専用のボタンとして表示する)



## Google Drive データ構造   ```      - [**方法2：説明文の中に自由にリンクを埋め込む**](#方法2説明文の中に自由にリンクを埋め込む)



```    - [E. サイト全体の設定を変更する方法 (`config.json`)](#e-サイト全体の設定を変更する方法-configjson)

DRIVE_ROOT/

├── config.json        # サイト全体設定## Environment Variables  - [2. 開発者向けガイド](#2-開発者向けガイド)

├── projects.json      # 作品一覧 (driveFolderId または websiteUrl)

├── <driveFolderId>/   # 各作品フォルダ| Name | Required | Description |    - [技術スタック](#技術スタック)

│   ├── project.json   # 個別作品の詳細 (Markdown 説明、添付ファイルパス等)

│   ├── docs/...| --- | --- | --- |    - [セットアップとローカル開発](#セットアップとローカル開発)

│   └── video/...

└── ...| `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` | optional | Relative/absolute path to the service account JSON. Defaults to `service-account.json` beside this README. |    - [ディレクトリ構成](#ディレクトリ構成)

```

| `DRIVE_FOLDER_ID_MASTER` | yes | Root folder that holds `config.json`, `projects.json`, and project sub-folders for the master dataset. |    - [アーキテクチャ概要](#アーキテクチャ概要)

- `project.json` 内では `./docs/overview.pdf` のように相対パスで添付ファイルを記述します。

- フォルダに含まれるファイルは自動的に列挙され、詳細ページで表示/ダウンロードできます。| `DRIVE_FOLDER_ID_PROTOTYPE` | optional | Alternative dataset used for prototypes or previews. |    - [デプロイ](#デプロイ)



## ディレクトリ構成| `DRIVE_DATA_STAGE` | optional | `master` or `prototype`. Defaults to `prototype` in development, `master` in production. |



```---

apps/portal/

├── app/## Google Drive Layout

│   ├── page.tsx

│   └── projects/[id]/page.tsx```## 1. サイト運営者様向けガイド

├── components/

├── lib/DRIVE_ROOT/

│   ├── data/data.ts

│   └── googleDrive.ts├── config.jsonこのサイトは、いくつかのテキストファイル（JSONファイル）を編集し、ファイルを所定の場所に配置するだけで、表示される作品や情報を簡単に追加・更新できるように作られています。

├── public/

│   └── thumbnails/├── projects.json

├── templates/

├── types/├── project-a/ (driveFolderId = "abc123")### A. コンテンツ更新の基本フロー

├── .env.example

├── service-account.template.json│   ├── project.json

└── README.md

```│   ├── docs/1.  **JSONファイルを編集する**: 作品情報 (`projects.json`) やサイト設定 (`config.json`) をテキストエディタで編集します。



## 実装上のポイント│   │   └── overview.pdf2.  **ファイルを追加する**: 必要に応じて、サムネイル画像やPDF資料を `/public` フォルダ内の指定の場所に配置します。



- サーバーコンポーネントで Drive からデータを取得し、クライアントコンポーネントへ props として渡します。│   └── video/3.  **変更をGitHubにPushする**: 編集したファイルや追加したファイルをGitHubにPush（プッシュ）します。

- `export const dynamic = "force-dynamic"` を設定し、Drive 側の更新が即座に反映されるようにしています。

- サムネイルは Drive の `thumbnailLink` を優先し、存在しない場合は `/public/thumbnails` を参照します。│       └── demo.mp44.  **自動でサイトが更新される**: Pushをきっかけに自動でデプロイが実行され、数分後に公開されているWebサイトが更新されます。

- 取得失敗時もページが落ちないようフェイルセーフの UI を用意しています。

└── project-b/ (driveFolderId = "xyz789")

## デプロイ

    └── ...### B. 作品を追加・編集する方法 (`projects.json`)

- ルートディレクトリ `apps/portal` を指定した Vercel プロジェクトを作成します。

- 上記環境変数とサービスアカウント JSON(Vercel Secret) を設定し、`npm run build` / `npm run start` でデプロイします。```

- 本番では `DRIVE_DATA_STAGE=master` を指定し、Drive の公開権限も確認してください。

すべての作品情報は、`/data/projects.json` というファイルで管理しています。

## 運営向けメモ

### `projects.json`このファイルを編集することで、作品の追加、修正、削除が可能です。

- Drive 上で作品フォルダをコピーし、`project.json` と添付ファイルを更新するだけで新作を追加できます。

- 外部ホスティング作品は `projects.json` の `websiteUrl` に URL を記入すると、ポータルから外部リンクとして表示されます。Array of project summaries. Exactly one of `driveFolderId` or `websiteUrl` must be present.

- 表示順を変更したい場合は `projects.json` の配列順序を編集してください。

```json**ファイル場所:**

[```

  {/data/projects.json

    "id": "project-a",```

    "title": "PDFと動画の作品",

    "description": "これはPDFと動画で構成される作品です。",**編集方法:**

    "thumbnailFileId": "<drive file id>",`[` と `]` の間に、 `{ ... }` で囲まれた作品情報をカンマ `,` で区切って追加・編集します。

    "driveFolderId": "abc123",

    "websiteUrl": null```json:data/projects.json

  }[

]  {

```    "id": "project-1",

    "title": "作品Aのタイトル",

### `project.json`    "author": "作者名",

Detail metadata stored in each project folder. File paths such as `videoUrl` and `pdfUrl` are relative to the project folder.    "team": "チーム名",

```json    "technologies": ["Next.js", "TypeScript"],

{    "description": "## 概要\nここに作品の説明を書きます。**Markdown記法**が使えます。",

  "title": "Sample Game",    "youtubeId": "dQw4w9WgXcQ",

  "author": "学籍番号1234567",    "websiteUrl": "https://example.com",

  "team": "チーム名",    "githubUrl": "https://github.com/example/repo",

  "category": "game",    "pdfPath": "contest2025/spec-a.pdf"

  "repoUrl": "https://github.com/your-org/your-repo",  },

  "websiteUrl": "https://example.com",  {

  "artifactUrl": null,    "id": "project-2",

  "thumb": "https://drive.google.com/thumbnail/...",    "title": "作品Bのタイトル",

  "videoUrl": "./video/sample.mp4",    // ...

  "pdfUrl": "./docs/overview.pdf",    "youtubeId": null,

  "description": "作品の狙い...",    "pdfPath": null

  "efforts": "特に時間をかけた点...",  }

  "ingenuity": "工夫した点...",]

  "techStack": ["Unity", "Next.js"],```

  "licenseNotes": null

}**各項目の説明:**

```

| キー | 説明 | 必須/任意 | 注意事項 |

## Local Development Notes|:---|:---|:---|:---|

- `export const dynamic = "force-dynamic"` is used so Drive updates appear without redeploying.| `id` | 作品の固有ID | **必須** | **他の作品と絶対に重複しない**英数字とハイフン `-` で設定してください。サムネイル画像ファイル名と連動します。 |

- Service account JSON is ignored by git (`service-account.json`). A template lives at `service-account.template.json` for reference.| `title` | 作品名 | **必須** | |

- Thumbnails are resolved via the Drive `thumbnailLink`; make sure the service account can access the files.| `author` | 作者名 | **必須** | |

| `team` | チーム名 | **必須** | `["技術A", "技術B"]` のように、`[]`の中にカンマ区切りで記述します。 |

## Directory Layout| `description` | 作品説明文 | **必須** | GitHub Flavored Markdown (GFM) 記法が使えます（見出し、太字、リスト、テーブル、打消し線など）。改行は `\n` を入力します。 |

```| `youtubeId` | YouTube動画ID | 任意 | 動画のURL `https://www.youtube.com/watch?v=dQw4w9WgXcQ` の `v=` の後の11文字の文字列です。動画がない場合は `null` としてください。 |

apps/portal/| `websiteUrl` | 作品サイトURL | 任意 | リンクがない場合は `null` としてください。 |

├── app/| `githubUrl` | GitHubリポジトリURL | 任意 | リンクがない場合は `null` としてください。 |

│   ├── page.tsx| `pdfPath` | 資料PDFへのパス | 任意 | `/public`からの相対パス。例: `"contest2025/spec.pdf"`。PDFがない場合は`null`。 |

│   └── projects/

│       ├── page.tsx### C. サムネイル画像を追加する方法

│       └── [driveFolderId]/page.tsx

├── components/作品一覧ページに表示するサムネイルは、以下のルールで自動的に表示されます。

├── lib/

│   ├── data/1.  `youtubeId` が設定されている場合 → **YouTubeのサムネイル**を自動表示

│   │   └── data.ts2.  `youtubeId` が `null` の場合 → `/public/thumbnails/` にある**画像ファイル**を表示

│   └── googleDrive.ts

├── public/YouTube動画がない作品のサムネイルは、手動でフォルダにアップロードしてください。

├── types/

├── .env.example**アップロード場所:**

├── service-account.template.json```

└── README.md/public/thumbnails/

``````



## Deployment**ファイル名のルール:**

Provision a Vercel project with root directory `apps/portal`. Add the environment variables above and upload the service account JSON as a Vercel secret (`GOOGLE_SERVICE_ACCOUNT_KEY_PATH` can then reference `/var/task/service-account.json` or similar).ファイル名は、対応する作品の `id` と同じにする必要があります。

-   作品IDが `"project-2"` なら、ファイル名は `project-2.png` や `project-2.jpg` としてください。（`.png`, `.jpg`, `.jpeg`, `.webp`に対応）
-   対応する画像がない場合、黒い画像が表示されます。

### D. PDF資料を追加する方法（2つの方法）

作品にPDFの資料（企画書、仕様書など）を紐付けることができます。運用しやすい方を選択してください。

#### **方法1：「関連リンク」に専用のボタンとして表示する**
作品詳細ページの下部にある「関連リンク」セクションに、「資料PDFを見る」というリンクを自動で追加する方法です。

**1. PDFファイルを配置する**
`/public`フォルダの中に、コンテスト用のフォルダを作成します（例: `/public/contest2025/`）。そのフォルダの中に、各作品のPDFファイルを配置してください。
```
/public/
└── /contest2025/
    ├── spec-a.pdf
    └── spec-b.pdf
```

**2. JSONファイルにパスを記述する**
`/data/projects.json` を開き、該当する作品に `pdfPath` を追加し、`/public` からのパスを記述します。
```json
{
  "id": "project-1",
  // ...
  "pdfPath": "contest2025/spec-a.pdf"
}
```

#### **方法2：説明文の中に自由にリンクを埋め込む**
作品の `description` の中に、Markdownのリンク形式で直接PDFへのリンクを記述する方法です。

**1. PDFファイルを配置する**
方法1と同様に、`/public` フォルダ内にPDFファイルを配置します。

**2. 説明文の中にリンクを記述する**
`/data/projects.json` の `description` を編集します。
```json
"description": "作品の説明文です。\n\n詳しい仕様は [こちらのPDF](/contest2025/spec-a.pdf) をご覧ください。"
```
-   `[ ]` の中に表示したいテキスト、`( )` の中に `/` から始まるPDFファイルへのパスを記述します。
-   `/public/` の部分は含めずに記述してください。

### E. サイト全体の設定を変更する方法 (`config.json`)

トップページに表示されるコンテスト名や説明文は `/data/config.json` ファイルで管理します。この説明文もMarkdown記法に対応しています。

**ファイル場所:**
```
/data/config.json
```

**設定項目:**
-   `contestName`: コンテストの正式名称。
-   `eventDate`: 開催日など。
-   `description`: トップページに表示される説明文（Markdown対応）。
-   `googleFormUrl`: トップページに表示される「評価フォームへ」ボタンのリンク先URL。不要な場合は`null`または空文字`""`にするとボタンが非表示になります。
-   `driveDownloadUrl`: 「ローカル動作用ファイル」ボタンのリンク先となるGoogleドライブなどのURL。不要な場合は`null`または空文字`""`にするとボタンが非表示になります。

**記述例:**
```json:data/config.json
{
  "contestName": "プログラミングコンテスト 2025",
  "eventDate": "2025年10月26日",
  "description": "## 開催概要\n年に一度の**プログラミングコンテスト**の作品展示サイトです。\n素晴らしい作品の数々をご覧ください。",
  "googleFormUrl": "https://forms.gle/your-form-url-here"
  "driveDownloadUrl": "https://drive.google.com/drive/folders/your-folder-id-here"
}
```

---

## 2. 開発者向けガイド

### 技術スタック
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (+ Typography, Aspect-Ratio plugins)
- **Markdown Rendering**: `react-markdown` + `remark-gfm`
- **Theme Switching**: `next-themes`
- **Deployment**: Vercel

### セットアップとローカル開発

1.  **リポジトリのクローン**: `git clone ...`
2.  **依存関係のインストール**: `npm install`
3.  **開発サーバーの起動**: `npm run dev`

### ディレクトリ構成
```
.
├── /app/             # 各ページ (サーバーコンポーネントのシェル)
├── /components/      # 共通UIコンポーネント (主にクライアントコンポーネント)
├── /data/            # ★ サイトコンテンツのJSONデータ
├── /lib/             # データ取得ロジック
├── /public/          # ★ 静的ファイル (画像, PDFなど)
│   ├── /thumbnails/  # ★ 作品のサムネイル画像
│   └── /contest2025/ # ★ PDF資料の配置例
├── /@types/          # TypeScriptの型定義
└── tailwind.config.ts # Tailwind CSSの設定
```

### アーキテクチャ概要
本サイトは、Next.js App Routerの思想に基づき、サーバーコンポーネントとクライアントコンポーネントの役割を明確に分離しています。

-   **サーバーコンポーネント (`/app/.../page.tsx`)**:
    -   `params`や`searchParams`といった動的な値には直接アクセスしない。
    -   役割は、`lib/data.ts` を使って**全てのデータ**を取得し、それをクライアントコンポーネントにpropsとして渡すことのみに専念する「シェル」として機能する。
    -   これにより、データ取得はサーバーサイドで行われ、静的生成のメリットを最大限に活かす。
-   **クライアントコンポーネント (`/components/*.tsx`)**:
    -   `"use client"` を宣言。
    -   `useParams`や`useSearchParams`フックを使い、URLの動的な値を安全に読み取る。
    -   親から渡された全データの中から、動的な値に基づいて表示に必要なデータをフィルタリングし、レンダリングする。
    -   ページネーションやテーマ切り替えなど、インタラクティブなUIを担当する。
-   **Suspense**:
    -   `useSearchParams`を使用するクライアントコンポーネントは、ビルド時の静的生成ができない。そのため、親のサーバーコンポーネント側で`<Suspense>`で囲み、フォールバックUI（ローディング表示）を指定することで、ビルドエラーを回避しつつ、スムーズなページ表示を実現している。

### デプロイ
GitHubリポジトリをVercelに連携させることで、`main` ブランチへのPush時に自動でデプロイが実行されます。
- **ビルドコマンド**: `npm run build`
- **環境変数**: 特になし