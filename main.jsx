import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// ─── WebSocket-backed storage with instant push updates ──────────────────────
const API = "/api/storage";

function createWsStorage() {
  let ws = null;
  let connected = false;
  let reconnectTimer = null;
  const listeners = new Map(); // key → Set<callback>
  const pendingSubscribes = new Set();

  function getWsUrl() {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}/ws`;
  }

  function connect() {
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) return;
    try {
      ws = new WebSocket(getWsUrl());
    } catch { return; }

    ws.onopen = () => {
      connected = true;
      // Re-subscribe all keys
      for (const key of listeners.keys()) {
        ws.send(JSON.stringify({ type: "subscribe", key }));
      }
      for (const key of pendingSubscribes) {
        ws.send(JSON.stringify({ type: "subscribe", key }));
        pendingSubscribes.delete(key);
      }
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "update" && msg.key) {
          const cbs = listeners.get(msg.key);
          if (cbs) {
            for (const cb of cbs) cb(msg.value);
          }
        }
      } catch {}
    };

    ws.onclose = () => {
      connected = false;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 1500);
    };

    ws.onerror = () => { ws.close(); };
  }

  connect();

  return {
    // Subscribe to live updates for a key
    subscribe(key, callback) {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(callback);
      if (connected && ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "subscribe", key }));
      } else {
        pendingSubscribes.add(key);
      }
      return () => {
        const cbs = listeners.get(key);
        if (cbs) { cbs.delete(callback); if (cbs.size === 0) listeners.delete(key); }
      };
    },

    async getItem(key, _opts) {
      // HTTP fallback for initial load
      try {
        const res = await fetch(`${API}/${encodeURIComponent(key)}`);
        const data = await res.json();
        return data.value;
      } catch (e) {
        console.error("storage.getItem failed:", e);
        return null;
      }
    },

    async setItem(key, value, _opts) {
      // Try WS first (instant), fall back to HTTP
      if (connected && ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "set", key, value }));
      } else {
        try {
          await fetch(`${API}/${encodeURIComponent(key)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value }),
          });
        } catch (e) {
          console.error("storage.setItem failed:", e);
        }
      }
    },

    async removeItem(key, _opts) {
      this.setItem(key, null, _opts);
    },
  };
}

if (!window.storage) {
  window.storage = createWsStorage();
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
