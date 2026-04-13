import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// API base — in production, same origin; in dev, proxy or localhost
const API = "/api/storage";

if (!window.storage) {
  window.storage = {
    async getItem(key, _opts) {
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
      try {
        await fetch(`${API}/${encodeURIComponent(key)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        });
      } catch (e) {
        console.error("storage.setItem failed:", e);
      }
    },
    async removeItem(key, _opts) {
      try {
        await fetch(`${API}/${encodeURIComponent(key)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: null }),
        });
      } catch (e) {
        console.error("storage.removeItem failed:", e);
      }
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
