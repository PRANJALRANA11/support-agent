import dotenv from "dotenv";
dotenv.config();
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { authorize_bots } from "./bots/index.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    authorize_bots();
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
