import { DurableObject } from "cloudflare:workers";
import type { Post } from "./types.ts";

export class Storage extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY,
        image TEXT NOT NULL,
        birdName TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        takenAt TEXT,
        createdAt TEXT NOT NULL default (datetime('now'))
      )
    `);
  }

  async getPosts(): Promise<Post[]> {
    const cursor = this.ctx.storage.sql.exec<{
      id: number;
      image: string;
      birdName: string;
      latitude: number | null;
      longitude: number | null;
      takenAt: string | null;
      createdAt: string;
    }>(
      "SELECT id, image, birdName, latitude, longitude, takenAt, createdAt FROM posts ORDER BY id DESC"
    );

    return cursor.toArray().map((row) => ({
      id: row.id,
      image: row.image,
      birdName: row.birdName,
      location:
        row.latitude !== null && row.longitude !== null
          ? { latitude: row.latitude, longitude: row.longitude }
          : undefined,
      takenAt: row.takenAt ?? undefined,
      createdAt: row.createdAt,
    }));
  }

  async uploadPost(post: Omit<Post, "id" | "createdAt">): Promise<void> {
    this.ctx.storage.sql.exec(
      "INSERT INTO posts (image, birdName, latitude, longitude, takenAt) VALUES (?, ?, ?, ?, ?)",
      post.image,
      post.birdName,
      post.location?.latitude ?? null,
      post.location?.longitude ?? null,
      post.takenAt ?? null
    );
  }
}
