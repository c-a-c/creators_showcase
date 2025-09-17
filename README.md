# プログラミングコンテスト作品展示サイト Repository

ようこそ！このリポジトリは、「プログラミングコンテスト作品展示サイト」プロジェクトの全てを管理するモノリポです。
このプロジェクトは、作品を紹介する**フロントエンドサイト（Next.js）**と、ブラウザで遊べるゲームなどの**静的コンテンツ（Unity WebGLなど）**の2つの主要な要素で構成されています。

-   **フロントエンドデプロイ先 (Vercel):** [https://creatorsshowcase.vercel.app/](https://creatorsshowcase.vercel.app/)
-   **静的コンテンツデプロイ先 (GitHub Pages):** [https://sunshine-724.github.io/creators_showcase/](https://sunshine-724.github.io/creators_showcase/)

---

## リポジトリ構成

このリポジトリは、以下の2つの主要なディレクトリで構成されています。
<pre>
.
├── nextjs-project/ (作品紹介サイト本体)
└── pages/ (GitHub Pagesでホスティングする静的コンテンツ)
</pre>

[### 📁 `nextjs-project/`](./nextjs-project/README.md)
作品情報を一覧表示したり、詳細を説明したりするためのポータルサイトです。Next.js (App Router) で構築されており、Vercelにデプロイされます。
詳細は [`nextjs-project/README.md`](./nextjs-project/README.md) をご覧ください。

[### 📁 `pages/`](./pages/README.md)
UnityのWebGLビルドなど、静的なウェブコンテンツを配置するためのディレクトリです。このディレクトリの内容は、GitHub Actionsによって自動的にGitHub Pagesにデプロイされます。
詳細は [`pages/README.md`](./pages/README.md) をご覧ください。

---

## プロジェクトの追加・更新ワークフロー

新しい作品を追加する際の基本的な流れは以下の通りです。

1.  **静的コンテンツの配置 (必要な場合):**
    -   Unityビルドなどの静的コンテンツがある場合は、[`pages/`](./pages/)ディレクトリ内にルールに従ったフォルダを作成して配置します。
    -   変更をPushすると、GitHub Actionsが自動でGitHub Pagesにデプロイします。デプロイされたURLを控えておきます。

2.  **フロントエンドの情報更新:**
    -   [`nextjs-project/data/projects.json`](./nextjs-project/data/projects.json) に新しい作品情報を追記します。この際、ステップ1で取得したURLを[`description`](./nextjs-project/README.md#b-作品を追加編集する方法-dataprojectsjson)などに含めます。
    -   必要であれば、[`nextjs-project/public/thumbnails/`](./nextjs-project/public/thumbnails/) にサムネイル画像を追加します。
    -   変更をPushすると、Vercelが自動でサイトを更新します。

---

## デプロイ環境について

このリポジトリでは、コンテンツの種類に応じてデプロイ先を分けています。

### 静的サイトのデプロイ
Unity WebGLビルドやプレーンなHTML/CSS/JSで構成される静的サイトは、原則として[`pages`](./pages/)ディレクトリに配置してください。GitHub Actionsが自動でビルドとGitHub Pagesへのデプロイを行います。

### 動的サイト・その他プラットフォーム
サーバーサイドの処理を必要とする動的サイトや、Vercel/GitHub Pages以外のプラットフォーム（Heroku, Netlify, etc.）でホスティングしたいプロジェクトについては、**原則としてコントリビューター各自もしくはP班チーフがデプロイ環境を準備してください。**
準備したURLを、[`nextjs-project/data/projects.json`](./nextjs-project/data/projects.json)の[`websiteUrl`](./nextjs-project/README.md#b-作品を追加編集する方法-dataprojectsjson)や[`description`](./nextjs-project/README.md#b-作品を追加編集する方法-dataprojectsjson)に記述することで、ショーケースサイトからリンクさせることができます。

---

## 大規模ファイルの管理 (Git LFS)
[`pages/`](./pages/)ディレクトリでは、Unityのビルドファイルなど、ギガバイト級の巨大なバイナリファイルを扱う可能性があります。これらのファイルは、Git LFS (Large File Storage) を使って管理することを推奨します。
詳細は [`pages/README.md`](./pages/README.md) を参照してください。