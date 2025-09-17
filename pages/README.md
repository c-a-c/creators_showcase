# `pages` Directory - for GitHub Pages

このディレクトリは、静的なウェブコンテンツをホスティングするためのデプロイソースです。
ここに配置されたコンテンツは、GitHub Actionsによって自動的に**GitHub Pages**にデプロイされます。

-   **デプロイ先:** [https://sunshine-724.github.io/creators_showcase/](https://sunshine-724.github.io/creators_showcase/)

---

## このディレクトリの目的
UnityのWebGLビルドや、プレーンなHTML/CSS/JSで構成されるポートフォリオサイトなど、サーバーサイドの処理を必要としない**静的サイトのビルドファイル**を配置することを目的としています。

**注意:** このディレクトリはNext.jsの`pages` Routerとは**一切関係ありません**。

## 自動デプロイの仕組み
リポジトリの`main`ブランチにPushが行われると、GitHub Actionsのワークフロー（`.github/workflows/`内）が自動的に起動し、この`pages`ディレクトリの内容を設定されたデプロイ用のブランチに反映し、GitHub Pagesに公開します。

## 新しいコンテンツを追加する方法

### フォルダ構造のルール
コンテンツは、以下のフォルダ構造ルールに従って配置してください。

`./pages/年号-テーマ名/各作品名/`

-   **年号-テーマ名**: コンテストの開催年とテーマをハイフンでつなぎます。（例: `2025-siki`, `2025-food`）
-   **各作品名**: そのテーマ内の各作品のディレクトリです。（例: `project1`）

**配置例:**
<pre>
/pages/  
└── /2025-siki/  
├── /project1/  
│ ├── index.html  
│ └── ...  
└── /project2/  
├── index.html  
└── ...  
└── /2025-food/  
└── /awesome-game/  
├── index.html  
└── ...  
</pre>

### ビルドファイルの配置
作成した各作品のディレクトリの中に、`index.html`をルートとするビルドファイル一式を配置します。

**（例）Unity WebGL形式のビルドファイルを配置する場合:**
<pre>
/pages/2025-siki/project1/
├── index.html
├── Build/
└── TemplateData/
</pre>

### URLの確認
デプロイが完了すると、以下の形式のURLでコンテンツにアクセスできるようになります。
`https://<ユーザー名>.github.io/<リポジトリ名>/<年号-テーマ名>/<各作品名>/`
    
**例:**
`https://sunshine-724.github.io/creators_showcase/2025-siki/project1/`

---

## 大規模ファイルの管理 (Git LFS)

Unityのビルドに含まれる`.data`ファイルなどは、数百MB〜数GBに達することがあります。Gitはこのような巨大なバイナリファイルの管理を苦手とするため、このディレクトリでは**Git LFS (Large File Storage)**の利用を**推奨**します。

### 設定方法
1.  **Git LFSをインストール**します（未導入の場合）。
    [https://git-lfs.github.com/](https://git-lfs.github.com/)

2.  **追跡するファイルの種類を指定**します。
    Unityのデータファイルなどを追跡対象に設定するコマンドの例です。
    ```bash
    git lfs track "*.data"
    ```

3.  `.gitattributes`ファイルをコミットします。
    上記のコマンドを実行すると`.gitattributes`ファイルが自動で作成・更新されるので、忘れずに`git add`してコミットを行ってください。

これにより、巨大なファイルはリポジトリ本体ではなく、専用のストレージで管理されるようになります。