# Bura (Thirty-One) - Game Rules

## Overview
- 2-player trick-taking card game
- 36-card deck (6, 7, 8, 9, 10, J, Q, K, A)
- Trump suit determined by bottom card of stock

## Card Points
| Card | Points |
|------|--------|
| A | 11 |
| 10 | 10 |
| K | 4 |
| Q | 3 |
| J | 2 |
| 6-9 | 0 |

Total deck points: 120 (30 per suit)

## Gameplay
1. Each player gets 3 cards
2. Leader plays 1-3 cards (same suit if multiple)
3. Responder plays same number of cards
4. Higher card wins (trump beats non-trump)
5. Winner takes trick, becomes next leader
6. Hands replenished from stock (winner draws first)
7. Continue until stock empty and hands empty

## Card Visibility
- **Response cards are always face-down** — opponent cannot see what you played
- **Only during showdown** (when responder beats leader) are all cards revealed for 3 seconds
- This applies during collect animation too — response stays hidden

## Winning
- Compare pile points when all cards played
- Higher pile wins the hand
- "Claim 31": if you have 31+ points in pile, claim it to win immediately (wrong claim = you lose)
- "Bura": three trump cards in hand = instant win

## Showdown
- When responder beats lead cards, a 3-second showdown display occurs
- Winner badge shown, cards glow
- When leader's cards win, trick resolves with collect animation (no reveal)

## Stake Doubling (დავი)
- Active player can propose raising stakes
- Levels: დავი (2pt) → სე (3pt) → ჩარი (4pt) → ფანჯი (5pt) → შაში (6pt)
- Opponent can accept (stakes increase) or decline (lose hand at current stakes)
- After accepting, acceptor gets next doubling rights

## Match
- Play to configurable point target (default 11)
- First to reach target wins match
