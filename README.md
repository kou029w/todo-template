# 🐦 torilog

## 概要

野鳥の観察記録を管理できるWebアプリ。

## 機能

### Must (必須)

- [ ] 写真投稿 (画像ファイルアップロード)
- [ ] 投稿一覧表示 (画像の表示)

### Should (重要)

- [ ] 場所の記録 (EXIFデータの利用)
- [ ] 鳥の名前の記録 (テキスト入力・タグ付け)
- [ ] 検索・並び替え (種別、場所、日付)

### Could (時間があれば)

- [ ] 投稿削除
- [ ] 場所の地図表示

## 画面構成

![](torilog.excalidraw.svg)

## データ構造

```ts
type Post = {
  id: string;
  // 画像URL
  image: string;
  // 鳥の名前
  birdName: string;
  // 撮影場所
  location?: {
    latitude: number;
    longitude: number;
  };
  // 撮影日時 (ISO 8601形式)
  takenAt?: string;
  // 投稿日時 (ISO 8601形式)
  createdAt: string;
};
```

## APIエンドポイント

```
GET /api/posts
POST /api/posts
```

## 技術選定

- フレームワーク: Hono + React
- スタイリング: Tailwind CSS
- データベース: SQLite-backed Durable Object Storage
