# プログラミングコンテスト作品展示サイト 新アーキテクチャ仕様書 (v8 - 最終版)

## 目次

1. 目的  
2. 新アーキテクチャ概要 (ハイブリッド・ヘッドレス構成)  
3. 【最優先検証事項】Vercelプランとコスト（¥0運用）のテスト  
　3-1. 検証ステップ  
4. 各コンポーネントの詳細仕様（検証後）  
　4-1. コード: Vercelモノリポ (GitHub)  
　4-2. メタデータ: Google Drive (ヘッドレスCMS)  
　4-3. apps/portal (ポータルサイト) の動的ロジック  
　4-4. 特殊な静的ビルド: 外部ホスティング  
5. 移行による影響（不要になるファイル）  
6. v8 と v7 の主な違い  

---

## 1. 目的

現行の「creators_showcase」リポジトリが抱える以下のボトルネックを解消し、スケーラビリティと管理性を向上させる。

- **Git LFS問題**: Unityビルドファイル（.data等）の管理によるリポジトリ肥大化と、GitHub PagesのLFS非対応制約。  
- **デプロイの煩雑さ**: JSONやPDFなど、軽微なメタデータの修正でもNext.jsの再デプロイが必要な点。  
- **作品ホスティングの属人化**: Next.js/HTML/Unity作品のホスティングが部員各自に委ねられている点を一元化・効率化する。  

---

## 2. 新アーキテクチャ概要 (ハイブリッド・ヘッドレス構成)

Gitリポジトリは「コード」のみを管理し、「メタデータ（情報）」と「特殊な静的ビルド（実行環境）」を完全に分離する。

### コード (Vercel Monorepo)
Next.js製コード（ポータル, 作品）および静的HTML/CSS製コードを格納。

### メタデータ (Google Drive)
Driveのフォルダ構造をデータソースとし、各作品フォルダ内に`project.json`（詳細用）や`thumb.png`、動画、PDF、`artifact.zip`などを配置する。

### 特殊ビルド (外部ホスティング)
Unityroom, Scratchなど、外部サイト上に配置されたビルドをリンクで統合表示する。

---

## 3. 【最優先検証事項】Vercelプランとコスト（¥0運用）のテスト

**仮説:**  
「GitHub Organization (c-a-c) が所有するPublicリポジトリ (creators_showcase) は、個人のVercel Hobbyプラン（無料）でGit連携・モノリポ運用が可能である」。

この仮説が正しければ、GitHub ActionsによるAPIデプロイは不要で、Vercelの自動デプロイ機能を無料で活用できる。

### 3-1. 検証ステップ

1. 代表者がVercel Hobbyアカウントにログイン。  
2. 「New Project」→「Add GitHub Account or Organization」から`c-a-c` Organizationを連携。  
3. `creators_showcase`リポジトリを選択してImport。  
4. 「Upgrade to Team」などの警告が出ないことを確認。  
5. Root Directory を `apps/portal` に設定してテストデプロイ。  
6. Hobbyプランのままデプロイ成功すれば仮説は成立。  

> **補足:** Vercelの課金は「Teamプラン作成時」にのみ発生。代表者1名が管理する限り無料運用が可能。  

---

## 4. 各コンポーネントの詳細仕様（検証後）

### 4-1. コード: Vercelモノリポ (GitHub)

#### ディレクトリ構成
```
/apps/
├── portal/            (ポータルサイト - Next.js)
│   ├── app/
│   │   ├── page.tsx                     <-- 一覧ページ（動的化）
│   │   └── projects/[folderId]/page.tsx <-- 動的詳細ページ
│   └── (旧 nextjs-project の中身を移行)
│
└── contest/           (作品格納)
		├── 2025/
		│   ├── contest-nextjs-1/
		│   └── contest-html-2/
		└── ...
```

#### デプロイ設定
| Vercel Project | Root Directory                     | Framework |
| -------------- | ---------------------------------- | --------- |
| Portal         | apps/portal                        | Next.js   |
| Next.js Game 1 | apps/contest/2025/contest-nextjs-1 | Next.js   |
| HTML Site 2    | apps/contest/2025/contest-html-2   | Other     |

---

### 4-2. メタデータ: Google Drive (ヘッドレスCMS)

Driveのフォルダ構造を**真のデータソース**とする。

#### 構成例
```
/部活Drive/コンテストデータ/
├── config.json
├── project-A/
│   ├── project.json
│   ├── thumb.png
│   ├── artifact.zip
│   ├── docs/overview.pdf
│   └── video/sample.mp4
└── project-B-Unity/
		├── project.json
		└── thumb.jpg
```

#### `project.json` テンプレート
```json
{
	"title": "作品名",
	"team": "チーム名または個人",
	"category": "game | webapp | mobile | other",
	"repoUrl": "https://github.com/c-a-c/your-repo",
	"websiteUrl": null,
	"thumb": "./thumb.png",
	"videoUrl": "./video/introduction.mp4",
	"pdfUrl": "./docs/overview.pdf",
	"description": "作品概要...",
	"efforts": "時間をかけた点...",
	"ingenuity": "工夫した点...",
	"techStack": ["Unity", "C#", "Next.js", "TypeScript"],
	"licenseNotes": "使用素材やライセンスに関する注意点"
}
```

---

### 4-3. apps/portal (ポータルサイト) の動的ロジック

#### 1. 一覧ページ (`app/page.tsx`)

- Drive API (`files.list`) を叩き、全フォルダを列挙。  
- 各フォルダの`project.json`と`thumb.png`を並列取得。  
- `title`, `description`, `websiteUrl`, `thumb`を一覧としてレンダリング。  
- `websiteUrl`が存在する場合は外部リンク、それ以外は`/projects/[folderId]`への内部リンク。

#### 2. 詳細ページ (`app/projects/[folderId]/page.tsx`)

- `folderId`を元にDrive APIでフォルダ内容を取得。  
- `project.json`を解析し、`docs/overview.pdf`や`video/sample.mp4`を取得。  
- MIMEタイプを判定し、表示可能ファイルは「表示」、すべてに「ダウンロード」ボタンを付与。  
- `artifact.zip`が存在すれば「ダウンロード用成果物」ボタンを表示。  

---

### 4-4. 特殊な静的ビルド: 外部ホスティング

対象: Unity WebGL, Scratchなど。

ホスティング先例: Unityroom, Scratch公式サイト。

`project.json`の`websiteUrl`に外部URLを記述し、一覧に統合表示する。

---

## 5. 移行による影響（不要になるファイル）

以下のファイル・ディレクトリは削除対象となる：

- `pages/` (Unityビルド群)  
- `.github/workflows/pages_deploy.yml`  
- `.gitattributes` (Git LFS設定)  
- `nextjs-project/data/` (旧JSON)  
- `nextjs-project/public/` (旧アセット全般)  

---

## 6. v8 と v7 の主な違い

| 項目               | v7                             | v8                                   |
| ------------------ | ------------------------------ | ------------------------------------ |
| 成果物リンク       | `artifactUrl` フィールドで指定 | 固定ファイル名 `artifact.zip` を運用 |
| ダウンロードボタン | 静的記述                       | Drive APIで存在確認して動的表示      |
| メタデータ構造     | projects.json（一覧用）存在    | Drive構造がデータソースに            |
| JSON構成           | `artifactUrl` あり             | `artifactUrl` 削除                   |

---

