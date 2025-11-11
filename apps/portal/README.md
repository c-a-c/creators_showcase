# プログラミングコンテスト作品展示サイト (Portal)

## 概要
`apps/portal` は **C.A.C プログラミングコンテスト作品**を紹介するための Next.js (App Router) 製ポータルサイトです。作品メタデータおよび添付ファイルは **Google Drive** 上に保管され、アプリケーションは API 経由で情報を取得します。

このリポジトリにはアプリケーションコードのみを含み、メタデータとファイルは Google Drive に管理されます。

---

## 必要環境
| ソフトウェア | バージョン | 備考 |
|---|---|---|
| Node.js | 20 以上 | 開発・ビルドに使用 |
| npm | 10 以上 | パッケージ管理 |
| Next.js | App Router 使用 | Vercel へデプロイ |
| Google Drive サービスアカウント | 必須 | コンテンツデータ取得に利用 |

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
├── projects.json      # 作品一覧
├── project-a/         # 作品フォルダ
│   ├── project.json   # 個別作品データ
│   ├── docs/...
│   └── video/...
└── project-b/
```

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
このサイトは JSON ファイルと添付ファイルを更新するだけで、作品の追加・更新が可能です。

### A. 基本フロー
1. `projects.json` や `config.json` を編集
2. 必要に応じてサムネイル画像・PDF を配置
3. GitHub に Push
4. 自動デプロイでサイト反映

### B. 作品の追加・編集 (`projects.json`)
- 各作品は `id`, `title`, `description` などを持ちます
- 表示順は配列の並び順で決まります

### C. サムネイル画像
YouTube 動画がある場合 → 動画サムネイル自動取得
ない場合 → `/public/thumbnails/<id>.png` などを配置

### D. PDF 資料の追加
- `pdfPath` に `/public` からの相対パスを記述
- 説明文から Markdown リンクとして埋め込みも可能

### E. サイト設定 (`config.json`)
- トップページの名称、概要文、フォームリンク等を管理

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

