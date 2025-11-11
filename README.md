# Creators Showcase Monorepo  
## C.A.C プログラミングコンテスト 作品展示サイト

このリポジトリは、C.A.C プログラミングコンテストにおける **作品展示サイト** を運営するための **モノレポ (Monorepo)** です。  
ポータルサイト、年度別作品アプリ、外部ホスティングされたアセットを統合的に管理します。

---

## 🎯 コンセプト

- アプリケーションコードは **`apps/`** に集約
- 作品データ・動画・WebGL などの大容量アセットは **Google Drive / 外部ホスティングで管理**
- ポータルサイトは **Google Drive API から作品情報 (JSON) を取得して表示**

---

## 📂 リポジトリ構成

```
.
├── apps/
│   ├── portal/               # 作品ポータルサイト (Next.js App Router)
│   └── contest/              # 年度別・作品別の個別アプリ
│       ├── 2025/
│       │   ├── contest-nextjs-sample/   # Next.js 作品例
│       │   └── contest-static-sample/   # 静的サイト作品例
│       └── 2026/
│           └── .gitkeep
│
├── pages/                    # 旧 GitHub Pages ビルド (段階的に廃止予定)
├── memo.md                   # アーキテクチャ草案メモ
└── README.md                 # 本ドキュメント
```

---

## 🌐 Portal (apps/portal)

Next.js (App Router) により構築された作品一覧・詳細ビューのポータルサイトです。  
作品のメタデータはすべて **Google Drive から動的に取得**します。

- Drive 用テンプレートは `apps/portal/templates/drive/` に配置しています（`config.json` / `projects.json` / `project.json`）。
- `projects.json` の `driveFolderId` と `websiteUrl` は片方のみ設定する排他仕様です。Drive フォルダを持つ作品は `driveFolderId`、外部ホスティング作品は `websiteUrl` を使用します。
- サムネイルは `thumbnailFileId`（Drive ファイル ID）もしくは詳細側の `thumb` フィールドで指定し、`videoUrl` / `pdfUrl` などのパスは作品フォルダ内の相対パスとして記述します。

### セットアップ

1. サービスアカウント JSON を配置  
   ```
   apps/portal/service-account.json
   ```
   ※ `.gitignore` により Git には含まれません。

2. `.env.example` を `.env.local` にコピーし、Drive フォルダ ID を設定
   ```
   DRIVE_FOLDER_ID_MASTER=
   DRIVE_FOLDER_ID_PROTOTYPE=
   DRIVE_DATA_STAGE=master   # または prototype
   ```

3. 起動
   ```
   cd apps/portal
   npm install
   npm run dev
   ```

---

## 📦 Google Drive データ構造

ポータルは Drive から以下の構成でデータを取得します。

```
(config.json)                   # サイト全体設定
(projects.json)                 # 作品一覧

<driveFolderId>/                # 各作品フォルダ
  ├─ project.json              # 作品詳細情報
  ├─ screenshot.png            # サムネイル等
  ├─ demo.mp4                  # 動画
  └─ docs.pdf                  # 資料 など
```

| ファイル名      | 内容                                                |
| --------------- | --------------------------------------------------- |
| `config.json`   | サイト名称・説明・リンク類など                      |
| `projects.json` | 作品リスト (`driveFolderId` か `websiteUrl` を指定) |
| `project.json`  | 作品タイトル・説明文・添付ファイル情報              |
| その他ファイル  | 詳細ページ上に自動的にプレビュー / ダウンロード表示 |

---

## 🕹 Contest Apps (apps/contest)

- **年度ごと** + **作品ごと** にディレクトリを分割
- 各作品は **独立した Vercel プロジェクト** としてデプロイ可能
- Next.js / HTML / Unity WebGL / Scratch など制作形式を問わない

| 種類                                  | デプロイ方法                            |
| ------------------------------------- | --------------------------------------- |
| Next.js 作品                          | Vercel でビルド                         |
| HTML / JS / Unity WebGL               | 静的サイトとして Vercel or GitHub Pages |
| 外部配信作品 (Scratch / Unityroom 等) | ポータルから外部 URL としてリンク       |

---

## 🔧 ブランチ運用ルール

```
作業ブランチ   ->  feature/<topic>
ベースブランチ ->  release/v2.0
マージ先       ->  release/v2.0 へ PR
```

---

## 🚀 デプロイ戦略

| 対象                      | デプロイ先               | 備考                                 |
| ------------------------- | ------------------------ | ------------------------------------ |
| Portal                    | Vercel (apps/portal)     | Drive 認証情報は Vercel Secrets 管理 |
| Contest Apps              | Vercel (apps/contest/**) | 作品ごとに独立デプロイ               |
| Unity 等の静的ビルド (旧) | GitHub Pages (`pages/`)  | 段階的に廃止予定                     |

---

## 📌 今後の移行プラン

- 旧 `pages/` のコンテンツを順次 `apps/contest/` または Google Drive へ移行
- `project.json` スキーマの統一と命名ルールの整理
- CI (lint / test) をアプリ単位で導入

---
