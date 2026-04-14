import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ─── In-memory store ─────────────────────────────────────────────────────────
const store = new Map();

// key → Set<ws>
const subscribers = new Map();

// Auto-cleanup: remove games older than 2 hours
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    try {
      const parsed = JSON.parse(val);
      const lastActive = Math.max(...(parsed.lastActivity || [0]));
      if (now - lastActive > 2 * 60 * 60 * 1000) {
        store.delete(key);
        subscribers.delete(key);
      }
    } catch {}
  }
}, 10 * 60 * 1000);

// ─── HTTP API (still used for initial load + fallback) ───────────────────────
app.get("/api/storage/:key", (req, res) => {
  const val = store.get(req.params.key);
  res.json({ value: val ?? null });
});

app.put("/api/storage/:key", (req, res) => {
  const key = req.params.key;
  store.set(key, req.body.value);
  // Broadcast to WS subscribers
  broadcast(key, req.body.value, null);
  res.json({ ok: true });
});

// ─── Serve built frontend ────────────────────────────────────────────────────
app.use(express.static(join(__dirname, "dist")));
app.get("/{*splat}", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

// ─── HTTP + WebSocket server ─────────────────────────────────────────────────
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

function broadcast(key, value, senderWs) {
  const subs = subscribers.get(key);
  if (!subs) return;
  const msg = JSON.stringify({ type: "update", key, value });
  for (const ws of subs) {
    if (ws !== senderWs && ws.readyState === 1) {
      ws.send(msg);
    }
  }
}

wss.on("connection", (ws) => {
  const mySubscriptions = new Set();

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw);

      if (msg.type === "subscribe") {
        // Subscribe to a key
        const key = msg.key;
        if (!subscribers.has(key)) subscribers.set(key, new Set());
        subscribers.get(key).add(ws);
        mySubscriptions.add(key);
        // Send current value immediately
        const val = store.get(key);
        ws.send(JSON.stringify({ type: "update", key, value: val ?? null }));
      }

      if (msg.type === "set") {
        // Write + broadcast
        const key = msg.key;
        store.set(key, msg.value);
        // Broadcast to all OTHER subscribers of this key
        broadcast(key, msg.value, ws);
        // Ack
        ws.send(JSON.stringify({ type: "ack", key }));
      }
    } catch {}
  });

  ws.on("close", () => {
    for (const key of mySubscriptions) {
      const subs = subscribers.get(key);
      if (subs) {
        subs.delete(ws);
        if (subs.size === 0) subscribers.delete(key);
      }
    }
  });

  // Ping to keep alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === 1) ws.ping();
  }, 25000);
  ws.on("close", () => clearInterval(pingInterval));
});

server.listen(PORT, () => {
  console.log(`Bura server running on port ${PORT} (HTTP + WebSocket)`);
});
