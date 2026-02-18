export type Post = {
  id: number;
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
