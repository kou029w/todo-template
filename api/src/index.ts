import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", serveStatic({ root: "../web/dist" }));
app.use("/api/*", cors());

app.get("/api/hello", (c) => {
  return c.json({ message: "Hello from Hono!" });
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
