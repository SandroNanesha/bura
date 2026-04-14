# Bura - Architecture Overview

## Project Structure
- `index.html` — Entry point, all CSS (card styles, animations, keyframes)
- `App.jsx` — Single-file React app: i18n, game logic, UI, networking
- `main.jsx` — React mount + storage abstraction (localStorage + WebSocket)
- `server.mjs` — Express + WebSocket backend (in-memory store, port 3001)
- `vite.config.js` — Vite build config (proxies `/api` and `/ws` to server)
- `test-game.mjs` — Standalone game logic simulation tests
- `docs/` — Obsidian-compatible project documentation

## Tech Stack
- **React** (no router, single-page)
- **Tailwind CSS** via CDN (`cdn.tailwindcss.com`)
- **Vite** for build/dev
- **WebSocket** for real-time multiplayer sync
- **Express** backend with in-memory store
- **Space Grotesk** font

## Running Locally
1. `node server.mjs` — Start backend on port 3001
2. `npx vite --host` — Start frontend on port 5173 (proxies to 3001)
3. Open two tabs to http://localhost:5173/ to test multiplayer

## State Management
- All game state in a single `gameState` object, persisted via `window.storage.setItem/getItem`
- WebSocket subscription via `window.storage.subscribe(key, callback)`
- Heartbeat interval for opponent connectivity detection (`DISCONNECT_TIMEOUT`, `HEARTBEAT_INTERVAL`)
- `playerIdx` (0 or 1) identifies current player
- `tabIdRef` prevents same-user duplicate joins

## Game Flow
1. **Menu** → Create/Join game
2. **Lobby** → Share code/link, wait for opponent
3. **Playing** → Ready phase (both press Start) → Deal animation (local-only) → Playing phase
4. **Trick cycle**: Lead → Respond → Resolve (with optional showdown 3s) → Collect animation → Replenish → Next trick
5. **Hand over** → Next Hand or Match Over

## Key Functions (App.jsx)
| Function | Purpose |
|---|---|
| `initHandState` | Shuffle deck, deal 3 cards each |
| `initMatchState` | Initialize match scores, play-to target, chat |
| `resolveTrick` | Determine trick winner (trump logic) |
| `replenishHands` | Draw cards from stock after trick |
| `Card` | Card component (face-up/face-down) |
| `ChatWidget` | In-game chat with toasts and unread badge |
| `playCards` | Handle lead/response, resolve trick |
| `resolveTrickShowdown` | Resolve after showdown delay (3s) |
| `claim31` | Claim 31 points special |
| `proposeDouble/respondToDouble` | Stake doubling (დავი) |

## Card Encoding
- Cards are string-encoded: e.g. `"A♠"`, `"10♥"`, `"K♦"`
- `cardRank(c)`, `cardSuit(c)`, `isRed(c)` extract display info
- Deck: 36 cards (6–A in 4 suits) shuffled with seeded PRNG (`mulberry32`)

## Card Visibility Rules
- **Response cards are hidden** (face-down) unless the responder beats the leader
- **Showdown**: When responder beats, all cards revealed face-up for 3 seconds
- **Collect animation**: Response cards stay face-down during sweep-to-pile
- Tracked via `hideMyResponse` / `hideOpResponse` flags in render

## Animations (index.html)
| Animation | Trigger | Duration |
|---|---|---|
| `deal-fly-down` / `deal-fly-up` | Deal sequence before game starts | 0.5s each |
| `deal-trump-flip` | Trump card revealed during deal | 0.6s |
| `slide-deal` / `slide-deal-opp` | New cards dealt to hand mid-game | 0.7s |
| `trick-enter` / `trick-enter-opp` | Card played to table | 0.5s |
| `collect-to-pile` | Trick won, cards sweep to pile | 0.6s |
| `pile-collect` | Pile receives cards (bounce) | 0.5s |
| `showdown-glow` | During trick showdown (3s) | 1.2s infinite |
| `badge-bounce` | Winner badge appears | 0.5s |
| `chat-open` / `toast-in` | Chat panel and message toasts | 0.2–0.3s |

### Deal Animation (local-only)
- Triggered by `ready → playing` handPhase transition
- Purely client-side overlay — server state goes straight to `"playing"`
- Cards fly out one at a time, alternating players (350ms apart, 6 cards)
- Trump card reveals with flip animation after first card dealt
- Total duration ~3s, then overlay dismissed
- Cleanup function always clears overlay on interruption

## Header / Dashboard
- Single consolidated header bar with 3 sections:
  - **Left**: Game title + ID, score box (You vs Opp with /target)
  - **Center**: Stake level badge, turn indicator
  - **Right**: Online status, Claim 31 button, language toggle

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

## Doubling System (დავი)
- 6 stake levels: 1pt → დავი(2) → სე(3) → ჩარი(4) → ფანჯი(5) → შაში(6)
- Active player proposes, opponent accepts or declines
- Declining = lose hand at current stake
- After accepting, acceptor gets next doubling rights
