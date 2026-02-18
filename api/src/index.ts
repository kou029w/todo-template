import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { DatabaseSync } from "node:sqlite";
import type { Post } from "./types.ts";

const db = new DatabaseSync("data.db");

db.exec(`
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

const sql = db.createTagStore();

async function getPosts(): Promise<Post[]> {
  const data = sql.all`
    SELECT id, image, birdName, latitude, longitude, takenAt, createdAt
      FROM posts
  `;

  return data.map((row) => ({
    id: row.id,
    image: row.image,
    birdName: row.birdName,
    location:
      row.latitude !== null && row.longitude !== null
        ? { latitude: row.latitude, longitude: row.longitude }
        : undefined,
    takenAt: row.takenAt ?? undefined,
    createdAt: row.createdAt,
  })) as Post[];
}

async function uploadPost(post: Omit<Post, "id" | "createdAt">): Promise<void> {
  sql.run`
    INSERT INTO posts (image, birdName, latitude, longitude, takenAt)
      VALUES (
        ${post.image},
        ${post.birdName},
        ${post.location?.latitude ?? null},
        ${post.location?.longitude ?? null},
        ${post.takenAt ?? null})
  `;
}

const app = new Hono();

app.use("*", serveStatic({ root: "../web/dist" }));
app.use("/api/*", cors());

app.get("/api/posts", async (c) => {
  const posts = await getPosts();
  return c.json(posts);
});

app.post("/api/posts", async (c) => {
  const post = await c.req.json<Omit<Post, "id" | "createdAt">>();
  await uploadPost(post);
  return c.json({ message: "Post uploaded successfully" }, 201);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
