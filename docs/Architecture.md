# Bura - Architecture Overview

## Project Structure
- `index.html` — Entry point, all CSS (card styles, animations, keyframes)
- `App.jsx` — Single-file React app: i18n, game logic, UI, networking
- `main.jsx` — React mount + storage abstraction (localStorage + WebSocket)
- `vite.config.js` — Vite build config
- `server/` — Not present; storage is handled via `window.storage` abstraction

## Tech Stack
- **React** (no router, single-page)
- **Tailwind CSS** via CDN (`cdn.tailwindcss.com`)
- **Vite** for build/dev
- **WebSocket** for real-time multiplayer sync (switched from polling in commit `0c2dced`)
- **Space Grotesk** font

## State Management
- All game state in a single `gameState` object, persisted via `window.storage.setItem/getItem`
- WebSocket subscription via `window.storage.subscribe(key, callback)`
- Heartbeat interval for opponent connectivity detection (`DISCONNECT_TIMEOUT`, `HEARTBEAT_INTERVAL`)
- `playerIdx` (0 or 1) identifies current player
- `tabIdRef` prevents same-user duplicate joins

## Game Flow
1. **Menu** -> Create/Join game
2. **Lobby** -> Share code, wait for opponent
3. **Playing** -> Ready phase (both press Start) -> Playing phase
4. **Trick cycle**: Lead -> Respond -> Resolve (with optional showdown) -> Replenish -> Next trick
5. **Hand over** -> Next Hand or Match Over

## Key Functions (App.jsx)
| Function | Line | Purpose |
|---|---|---|
| `initHandState` | ~243 | Shuffle deck, deal 3 cards each |
| `initMatchState` | ~268 | Initialize match scores, play-to target |
| `resolveTrick` | ~300 | Determine trick winner (trump logic) |
| `replenishHands` | ~308 | Draw cards from stock after trick |
| `Card` | ~340 | Card component (face-up/face-down) |
| `playCards` | ~578 | Handle lead/response, resolve trick |
| `resolveTrickShowdown` | ~657 | Resolve after showdown delay |
| `claim31` | ~700 | Claim 31 points special |
| `proposeDouble/respondToDouble` | ~708/716 | Stake doubling |

## Card Encoding
- Cards are integer-encoded: `cardRank(c)`, `cardSuit(c)`, `isRed(c)` extract display info
- Deck: 36 cards (6-A in 4 suits) shuffled with seeded PRNG

## Animations (index.html)
| Animation | Trigger | Duration |
|---|---|---|
| `slide-deal` / `slide-deal-opp` | New cards dealt to hand | 0.7s |
| `trick-enter` / `trick-enter-opp` | Card played to table | 0.5s |
| `collect-to-pile` | Trick won, cards sweep to pile | 0.6s |
| `pile-collect` | Pile receives cards (bounce) | 0.5s |
| `showdown-glow` | During trick showdown | 1.2s infinite |
| `badge-bounce` | Winner badge appears | 0.5s |

## i18n
- Two languages: English (`en`) and Georgian (`ka`)
- `STRINGS` object with all UI text
- `useT()` hook returns current language strings
- Persisted in `localStorage` as `bura_lang`

## In-Game Chat
- `ChatWidget` component renders a floating chat button (bottom-right corner)
- Messages stored in `gameState.chat[]` array, synced via same WebSocket mechanism
- Incoming opponent messages show as toast banners when chat is closed
- Unread count badge on the chat icon
- Chat resets per match (`initMatchState` includes `chat: []`)
