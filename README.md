# 🐦 torilog

## 概要

野鳥の観察記録を管理できるWebアプリ。

## 機能

### Must (必須)

- [x] 写真投稿 (画像ファイルアップロード)
- [x] 投稿一覧表示 (画像の表示)

### Should (重要)

- [ ] 場所の記録 (EXIFデータの利用)
- [x] 鳥の名前の記録 (テキスト入力)
- [ ] 検索・並び替え (種別、場所、日付)

### Could (時間があれば)

- [ ] 投稿削除
- [ ] タグ付け
- [ ] 場所の地図表示
- [ ] 録音・再生機能
- [ ] 翻訳・読み上げ機能

## 画面構成

![](torilog.excalidraw.svg)

## データ構造

[types.ts](./api/src/types.ts)に定義。

## APIエンドポイント

```
GET /api/posts
POST /api/posts
```

## 技術選定

- フレームワーク: Hono + React
- スタイリング: Tailwind CSS
- データベース: SQLite-backed Durable Object Storage

## 備考

- EXIF周りの処理のライブラリ候補
  - exifreader … 小ささを売りにしている、採用予定
  - sharp … 依存関係が少ないらしい、画像処理全般
  - exif-reader … 簡単らしい、TS対応
  - exiftool-vendored … 有名なexiftoolのラッパー、過剰かも
