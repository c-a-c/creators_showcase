# プログラミングコンテスト作品展示サイト (Portal)

## 概要
`apps/portal` は **C.A.C プログラミングコンテスト作品**を紹介するための Next.js (App Router) 製ポータルサイトです。作品メタデータおよび添付ファイルは **Google Drive** 上に保管され、アプリケーションは API 経由で情報を取得します。

このリポジトリにはアプリケーションコードのみを含み、メタデータとファイルは Google Drive に管理されます。

---

## 必要環境
| ソフトウェア                    | バージョン      | 備考                       |
| ------------------------------- | --------------- | -------------------------- |
| Node.js                         | 20 以上         | 開発・ビルドに使用         |
| npm                             | 10 以上         | パッケージ管理             |
| Next.js                         | App Router 使用 | Vercel へデプロイ          |
| Google Drive サービスアカウント | 必須            | コンテンツデータ取得に利用 |

---

## クイックスタート

1. クラブ共有の **サービスアカウント JSON** を以下に配置:
```
apps/portal/service-account.json
```

2. `.env.example` を `.env.local` にコピーし、必要値を設定:
```env
DRIVE_FOLDER_ID_MASTER="本番データ用フォルダID"
DRIVE_FOLDER_ID_PROTOTYPE="試作データ用フォルダID (任意)"
DRIVE_DATA_STAGE="master または prototype"
```

3. 依存関係インストールと開発サーバー起動:
```bash
cd apps/portal
npm install
npm run dev
```

4. ブラウザで確認:
```
http://localhost:3000
```

---

## Google Drive データ構造
```
DRIVE_ROOT/
├── config.json        # サイト全体設定
├── <project-folder>/  # 作品フォルダ
│   ├── project.json   # 個別作品メタデータ
│   ├── thumb.png      # ヒーロー画像 (推奨: 1280x720 / 16:9)
│   ├── docs/...
│   └── media/...
└── ...
```

- `config.json` と各作品フォルダは **Google Drive 上で管理**します。リポジトリにはテンプレートのみを保持します。
- 作品フォルダ内に格納したファイル（PDF, 画像, 動画など）は、自動的に詳細ページへ一覧表示されます。
- `project.json` の `videoUrl` / `pdfUrl` などのパスは、作品フォルダ内に対する相対パス（例: "./docs/overview.pdf"）で記述します。
- 作品一覧は Drive 直下のフォルダを走査して生成されるため、`project.json` を配置したフォルダを追加するだけで新しい作品が表示対象になります。

## Google Drive テンプレート

初期データを作成する際は、リポジトリ内のテンプレートを利用できます。

```
apps/portal/templates/drive/
├── config.json    # サイト設定の雛形
└── project.json   # 個別作品詳細の雛形
```

テンプレートを Drive にコピーし、`prototype` 用 / `master` 用のフォルダへ配置した上で値を編集してください。作品一覧はフォルダ構成から自動生成されるため、専用のサマリ JSON は不要です。

---

## ディレクトリ構成
```
apps/portal/
├── app/                     # ページ (Server Components)
│   └── projects/[id]/page.tsx
├── components/              # UI コンポーネント
├── lib/
│   ├── data/data.ts         # コンテンツ取得
│   └── googleDrive.ts       # Google Drive API
├── public/
│   └── thumbnails/          # サムネイル画像
├── types/
├── .env.example
└── README.md
```

---

## サイト運営者向けガイド
ポータルは Google Drive を “ヘッドレス CMS” として利用します。JSON を編集し、作品フォルダへファイルを追加するだけで更新が反映されます。

### A. 更新フロー（推奨）
1. Drive の `prototype` データセットで `config.json` および各作品フォルダ内の `project.json` を編集し、内容をレビューします。
2. 必要な PDF や動画、スクリーンショットを作品フォルダにアップロードします。
3. 変更内容が確認できたら `master` データセットへコピーまたは反映します。
4. Vercel 側の `DRIVE_DATA_STAGE` が `master` に設定されていれば、数分で本番サイトへ反映されます。

### B. `project.json` の編集
各作品フォルダ直下に `project.json` を配置します。テンプレートの項目は下記の通りです。

| フィールド                   | 必須 | 説明                                                                                                                                        |
| ---------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`                      | ✅    | 作品タイトル。                                                                                                                              |
| `author`                     | ✅    | 作者名（Discord 名や学籍番号など運営が把握できる情報）。                                                                                    |
| `team`                       | 任意 | チーム名。                                                                                                                                  |
| `category`                   | 任意 | ゲーム / Web アプリ等の分類。                                                                                                               |
| `repoUrl`                    | ✅    | ソースコードリポジトリ。                                                                                                                    |
| `websiteUrl` / `artifactUrl` | 任意 | 追加リンク。                                                                                                                                |
| `thumb`                      | 任意 | サムネイル画像へのパス。例: `"thumb.png"`（作品フォルダ直下の画像を指す相対パス）。設定が無い場合はフォルダ内の最初の画像を自動採用します。 |
| `videoUrl`                   | 任意 | 作品紹介動画への相対パス (`"./video/demo.mp4"` など)。                                                                                      |
| `pdfUrl`                     | 任意 | 資料 PDF の相対パス (`"./docs/overview.pdf"` など)。                                                                                        |
| `description`                | ✅    | Markdown で書ける詳細説明。                                                                                                                 |
| `efforts` / `ingenuity`      | ✅    | 力を入れた点・工夫点。                                                                                                                      |
| `techStack`                  | 任意 | 使用技術の配列。                                                                                                                            |
| `licenseNotes`               | 任意 | 利用素材の注意書きなど。                                                                                                                    |

相対パスで指定されたファイルは、Drive 上で該当パスに存在する場合にのみ「主動画」「主PDF」として扱われます。その他のファイルは MIME Type ごとに自動でリスト化され、閲覧／ダウンロードリンクが生成されます。

### C. サムネイルと静的アセット
- 一覧ページと詳細ページのヒーロー画像は `project.json` の `thumb` を優先し、未設定の場合はフォルダ内の最初の画像ファイルを自動利用します。
- どうしても外部 URL を用いたい場合は `thumb` に絶対 URL を指定しますが、Drive 内で完結させる運用を推奨します。
- 旧 `/public/thumbnails` や `/public/contestXXXX` への配置は不要です。すべて Drive 内にまとめてください。
- Drive の共有リンク設定によっては権限エラーになるため、公開済みのファイルは「リンクを知っている全員が閲覧可」になっているか `npm run drive:debug` で確認してください。

### D. サイト全体設定 (`config.json`)
テンプレートのフィールドは以下の通りです。

| フィールド         | 必須 | 説明                                                |
| ------------------ | ---- | --------------------------------------------------- |
| `contestName`      | ✅    | サイトに表示するコンテスト名。                      |
| `eventDate`        | ✅    | 開催日など。                                        |
| `description`      | ✅    | トップページのリード文（Markdown 可）。             |
| `googleFormUrl`    | 任意 | アンケート等への導線。`null` の場合は表示しません。 |
| `driveDownloadUrl` | 任意 | 作品一括ダウンロードなど Drive フォルダへのリンク。 |

更新後は Drive 上で保存するだけで OK です。Git 側に JSON をコミットする必要はありません。

---

## 開発者向けガイド
### 技術スタック
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- react-markdown + remark-gfm
- Vercel デプロイ

### ローカル開発
```bash
git clone <repository>
npm install
npm run dev
```

### アーキテクチャ
- Server Components で Drive データを取得し、UI に渡す
- `export const dynamic = "force-dynamic"` により Drive 更新が即時反映

---

## デプロイ
1. `apps/portal` をルートとして Vercel プロジェクトを作成
2. 環境変数とサービスアカウント JSON を設定
3. 本番では `DRIVE_DATA_STAGE=master` を使用

---

以上。

