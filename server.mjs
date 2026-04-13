import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// In-memory store
const store = new Map();

// Auto-cleanup: remove games older than 2 hours
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    try {
      const parsed = JSON.parse(val);
      const lastActive = Math.max(...(parsed.lastActivity || [0]));
      if (now - lastActive > 2 * 60 * 60 * 1000) store.delete(key);
    } catch {}
  }
}, 10 * 60 * 1000);

// API routes
app.get("/api/storage/:key", (req, res) => {
  const val = store.get(req.params.key);
  res.json({ value: val ?? null });
});

app.put("/api/storage/:key", (req, res) => {
  store.set(req.params.key, req.body.value);
  res.json({ ok: true });
});

// Serve built frontend
app.use(express.static(join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Bura server running on port ${PORT}`);
});
