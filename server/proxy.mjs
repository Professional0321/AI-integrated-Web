import express from "express";
import fetch from "node-fetch";
import "dotenv/config";
import { Readable } from "stream";

const app = express();
app.use(express.json());

app.post("/api/openai/stream", async (req, res) => {
  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ ...req.body, stream: true }),
    });

    if (!upstream.ok || !upstream.body) {
      const txt = await upstream.text().catch(() => "");
      res.status(upstream.status).send(txt || "Upstream error");
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    Readable.fromWeb(upstream.body)
      .on("error", () => {
        try {
          res.end();
        } catch {}
      })
      .pipe(res);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`✅ Proxy on http://localhost:${port}`));
