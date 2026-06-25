# Fender Vintage Amp Finder

Fender Vintage Amp Finderは、リセール重視で中古Fenderアンプを評価する静的PWAです。最終目標は、無駄な損失を抑えながら1969〜72年 Fender Silverface Deluxe Reverbへ到達することです。

## 機能

- 100点満点の購入判定
- 🟢 買い / 🟡 条件付き / 🔴 見送り表示
- 適正価格、想定リセール、損失見込みの表示
- 危険ポイントと追加確認写真の提示
- 中古サイトURLメモ欄
- ChatGPT判定依頼テンプレートのコピー
- localStorageによる候補個体の保存・削除
- オフライン表示用Service Worker
- GPTs Knowledge用Markdownデータ

## GitHub Pagesでの公開方法

1. このリポジトリをGitHubへpushします。
2. GitHubの`Settings`を開きます。
3. `Pages`で公開ブランチとルートを選択します。
4. 発行されたURLへアクセスします。

静的ファイルのみで構成しているため、ビルド作業やAPIキーは不要です。

## PWAとしての使い方

iPhone Safariで公開URLを開き、共有ボタンから`ホーム画面に追加`を選びます。追加後はホーム画面から単体アプリ風に起動できます。

## ファイル構成

```text
/
├── index.html
├── manifest.json
├── service-worker.js
├── assets/
│   ├── icon-192.png
│   └── icon-512.png
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── judge.js
│   ├── data.js
│   └── storage.js
├── data/
│   ├── amp_models.json
│   ├── price_rules.json
│   ├── buying_checklist.json
│   └── knowledge/
└── README.md
```

## URL自動判定の限界

GitHub Pages上の静的PWAでは、中古販売サイトを自動取得して解析する機能はCORSやログイン、サイト規約の制約を受けます。そのため現時点では、URLと情報をユーザーが貼り付け、ChatGPT判定依頼テンプレートをコピーする方式にしています。

## ChatGPT併用の方法

判定画面にURL、価格、モデル、状態、気になる点を入力し、`ChatGPT判定依頼をコピー`を押します。コピーされた文章をChatGPTへ貼り付け、写真や説明文を追加して確認します。

## 保存データについて

候補個体の保存は端末内のlocalStorageのみを使います。保存したURLやメモはGitHub Pagesや外部サーバーへ送信されません。ブラウザのサイトデータを削除すると保存内容も消えます。

## 今後の拡張予定

- モデル別の写真チェック項目の細分化
- 相場メモの手入力履歴
- 保存候補の比較表示強化
- GPTs Knowledgeとの運用整理
- 将来的な外部取得機能の検討
