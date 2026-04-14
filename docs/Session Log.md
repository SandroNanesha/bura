# Session Log — 2026-04-14

## What Was Done This Session

### 1. Card Animations (Enhanced)
- **Deal from stock**: Cards fly from left sidebar with arc, rotation, brightness shifts, bounce-settle. Only newly dealt cards animate; existing cards stay put.
- **Play to table**: `trick-enter` (my cards slide up) and `trick-enter-opp` (opponent cards slide down) with staggered delays.
- **Collect animation**: When trick is won, 700ms sweep animation toward winner's pile before cards disappear.
- **Pile pulse**: Score pile bounces when receiving cards.
- Fixed missing CSS classes (`animate-slide-deal`, `animate-trick-enter`, etc.) that were referenced in JSX but never defined.

### 2. In-Game Chat
- Floating green chat bubble (bottom-right corner)
- Messages synced via `gameState.chat[]` through WebSocket
- Toast notifications for incoming messages when chat is closed
- Unread count badge with bounce animation
- Input: Enter to send, 200 char limit
- i18n: English + Georgian labels
- Chat resets per match

### 3. Card Visibility Rules (Georgian Bura Rules)
- Response cards are **always face-down** — opponent never sees what you played when they win
- Only revealed during **showdown** (responder beats leader) for **3 seconds**
- Collect animation also respects this — response cards stay face-down during sweep
- Tracked via `hideMyResponse` / `hideOpResponse` flags

### 4. Pre-Game Deal Animation
- Full-screen dealing overlay when both players press Start
- Cards fly out one at a time, alternating between players (350ms apart)
- Trump card reveals with flip animation
- **Local-only** — server state goes straight to `"playing"`, animation is purely cosmetic
- Fixed bug where server-synced `"dealing"` phase would block card interaction indefinitely

### 5. Header Consolidation
- Merged two header bars into single clean bar
- Left: game title + score box (large numbers, You vs Opp /target)
- Center: stake badge + turn indicator
- Right: online status, Claim 31, language toggle

### 6. Bug Fixes
- Fixed card selection not working: `"dealing"` handPhase on server made `isPlaying = false`, blocking all interaction. Changed to local-only animation overlay.
- Fixed missing animation keyframes that were referenced but never defined.

## Attempted But Reverted
- Cyberpunk-style (CodePen) button animation for დავი modal — user asked to restore original style.

## Key Decisions
- Deal animation is **local-only** (not server state) to avoid WebSocket race conditions
- Response card visibility follows traditional Bura rules (hidden unless showdown)
- Showdown duration: 3 seconds (was 4)
- Chat resets per match (not per hand)
