# プログラミングコンテスト作品展示サイト Readme

このリポジトリは、「プログラミングコンテスト作品展示サイト」のソースコード管理用です。
サイトのコンテンツ更新を行う**運営者の方**と、システムの改修を行う**開発者の方**へ向けた情報を記載しています。

##  TOC (Table of Contents)
- [プログラミングコンテスト作品展示サイト Readme](#プログラミングコンテスト作品展示サイト-readme)
  - [TOC (Table of Contents)](#toc-table-of-contents)
  - [1. サイト運営者様向けガイド](#1-サイト運営者様向けガイド)
    - [A. 作品を追加・編集する方法 (`projects.json`)](#a-作品を追加編集する方法-projectsjson)
    - [B. サムネイル画像を追加する方法](#b-サムネイル画像を追加する方法)
    - [C. サイト全体の設定を変更する方法 (`config.json`)](#c-サイト全体の設定を変更する方法-configjson)
    - [D. 変更をサイトに反映させるには](#d-変更をサイトに反映させるには)
  - [2. 開発者向けガイド](#2-開発者向けガイド)
    - [技術スタック](#技術スタック)
    - [セットアップとローカル開発](#セットアップとローカル開発)
    - [ディレクトリ構成](#ディレクトリ構成)
    - [デプロイ](#デプロイ)

---

## 1. サイト運営者様向けガイド

このサイトは、いくつかのテキストファイル（JSONファイル）を編集するだけで、表示される作品や情報を簡単に追加・更新できるように作られています。

### A. 作品を追加・編集する方法 (`projects.json`)

すべての作品情報は、`/data/projects.json` というファイルで管理しています。
このファイルを編集することで、作品の追加、修正、削除が可能です。

**ファイル場所:**
```
/data/projects.json
```

**編集方法:**
`[` と `]` の間に、 `{ ... }` で囲まれた作品情報をカンマ `,` で区切って追加・編集します。

```json:data/projects.json
[
  {
    "id": "project-1",
    "title": "作品Aのタイトル",
    "author": "作者名",
    "team": "チーム名",
    "technologies": ["Next.js", "TypeScript"],
    "description": "## 概要\nここに作品の説明を書きます。**Markdown記法**が使えます。\n\n- 特徴1\n- 特徴2",
    "youtubeId": "dQw4w9WgXcQ",
    "websiteUrl": "https://example.com",
    "githubUrl": "https://github.com/example/repo"
  },
  {
    "id": "project-2",
    "title": "作品Bのタイトル",
    "author": "作者名B",
    "team": "チーム名B",
    "technologies": ["React"],
    "description": "動画がない作品の例です。",
    "youtubeId": null,
    "websiteUrl": null,
    "githubUrl": null
  }
]
```

**各項目の説明:**

| キー | 説明 | 必須/任意 | 注意事項 |
|:---|:---|:---|:---|
| `id` | 作品の固有ID | **必須** | **他の作品と絶対に重複しない**英数字とハイフン `-` で設定してください。サムネイル画像ファイル名と連動します。 |
| `title` | 作品名 | **必須** | |
| `author` | 作者名 | **必須** | |
| `team` | チーム名 | **必須** | |
| `technologies` | 使用技術 | **必須** | `["技術A", "技術B"]` のように、`[]`の中にカンマ区切りで記述します。 |
| `description` | 作品説明文 | **必須** | Markdown記法が使えます。見出しは`##`、太字は`**太字**`、リストは `-` など。改行は `\n` を入力します。 |
| `youtubeId` | YouTube動画ID | 任意 | YouTube動画のURL `https://www.youtube.com/watch?v=dQw4w9WgXcQ` の `v=` の後の文字列です。動画がない場合は `null` としてください。 |
| `websiteUrl` | 作品サイトURL | 任意 | リンクがない場合は `null` としてください。 |
| `githubUrl` | GitHubリポジトリURL | 任意 | リンクがない場合は `null` としてください。 |


### B. サムネイル画像を追加する方法

作品一覧ページに表示するサムネイルは、以下のルールで自動的に表示されます。

1.  `youtubeId` が設定されている場合 → **YouTubeのサムネイル**を自動表示
2.  `youtubeId` が `null` の場合 → `/public/thumbnails/` にある**画像ファイル**を表示

YouTube動画がない作品のサムネイルは、手動でフォルダにアップロードしてください。

**アップロード場所:**
```
/public/thumbnails/
```

**ファイル名のルール:**
ファイル名は、対応する作品の `id` と同じにする必要があります。
-   作品IDが `"project-2"` なら、ファイル名は `project-2.png` や `project-2.jpg` としてください。
-   対応する画像がない場合、黒い画像が表示されます。


### C. サイト全体の設定を変更する方法 (`config.json`)

トップページに表示されるコンテスト名や、投票フォームのリンク先は `/data/config.json` ファイルで管理します。

**ファイル場所:**
```
/data/config.json
```

```json:data/config.json
{
  "contestName": "プログラミングコンテスト 2025",
  "eventDate": "2025年10月26日",
  "description": "年に一度のプログラミングコンテストの作品展示サイトです。素晴らしい作品の数々をご覧ください。",
}
```

### D. 変更をサイトに反映させるには

上記 A, B, C の変更を行った後、**変更内容をGitHubにPush（プッシュ）するだけ**です。
Pushをきっかけに自動でビルドとデプロイが実行され、数分後に公開されているWebサイトが更新されます。

---

## 2. 開発者向けガイド

### 技術スタック
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Markdown Rendering**: `react-markdown`
- **Theme Switching**: `next-themes`
- **Deployment**: Vercel

### セットアップとローカル開発

1.  **リポジトリのクローン**
    ```bash
    git clone https://github.com/[your-username]/[repository-name].git
    cd [repository-name]
    ```

2.  **依存関係のインストール**
    ```bash
    npm install
    ```

3.  **開発サーバーの起動**
    ```bash
    npm run dev
    ```
    ブラウザで `http://localhost:3000` を開いてください。

### ディレクトリ構成

```
.
├── /app/
│   ├── /projects/
│   │   ├── /[id]/page.tsx   # 作品詳細ページ
│   │   └── page.tsx         # 作品一覧ページ
│   ├── layout.tsx         # 全体のレイアウト・テーマ設定
│   ├── globals.css        # グローバルCSS（Tailwind CSS設定）
│   └── page.tsx           # トップページ
│
├── /components/
│   ├── Footer.tsx         # フッター
│   ├── Header.tsx         # ヘッダー
│   └── ThemeSwitcher.tsx    # テーマ切替ボタン
│
├── /lib/
│   └── /data/ 
│       └── data.ts            # データ読み込み関数
│
├── /public/
│   └── /thumbnails/       # ここにサムネイル画像 (id.pngなど) を置く
│
├── /data/
│   ├── config.json
│   └── projects.json
│
└── types/index.ts         # データ型の定義
```

### デプロイ

このプロジェクトはVercelへのデプロイに最適化されています。
GitHubリポジトリをVercelに連携させることで、`main` ブランチへのPush時に自動でデプロイが実行されます。
環境変数の設定は特に必要ありません。