import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Post } from "./types.ts";
import { Storage } from "./storage.ts";

export { Storage };

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", cors());

app.get("/api/posts", async (c) => {
  const id = c.env.STORAGE.idFromName("global");
  const stub = c.env.STORAGE.get(id) as unknown as Storage;
  const posts = await stub.getPosts();
  return c.json(posts);
});

app.post("/api/posts", async (c) => {
  const post = await c.req.json<Omit<Post, "id" | "createdAt">>();
  const id = c.env.STORAGE.idFromName("global");
  const stub = c.env.STORAGE.get(id) as unknown as Storage;
  await stub.uploadPost(post);
  return c.json({ message: "Post uploaded successfully" }, 201);
});

export default app;
