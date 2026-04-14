#!/usr/bin/env node
// ─── Bura Game Logic Simulation Test ─────────────────────────────────────────

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "10", "K", "Q", "J", "9", "8", "7", "6"];
const RANK_ORDER = { A: 8, "10": 7, K: 6, Q: 5, J: 4, "9": 3, "8": 2, "7": 1, "6": 0 };
const POINT_VALUES = { A: 11, "10": 10, K: 4, Q: 3, J: 2, "9": 0, "8": 0, "7": 0, "6": 0 };

function cardRank(c) { return c.slice(0, -1); }
function cardSuit(c) { return c.slice(-1); }
function cardPoints(c) { return POINT_VALUES[cardRank(c)] || 0; }
function cardStrength(c) { return RANK_ORDER[cardRank(c)]; }
function pilePoints(pile) { return pile.reduce((s, c) => s + cardPoints(c), 0); }

function buildDeck() {
  const deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push(`${r}${s}`);
  return deck;
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleDeck(seed) {
  const deck = buildDeck();
  const rng = mulberry32(seed);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function initHandState(seed, dealer) {
  const deck = shuffleDeck(seed);
  return {
    seed, hands: [[deck[0], deck[1], deck[2]], [deck[3], deck[4], deck[5]]],
    trumpCard: deck[6], trumpSuit: cardSuit(deck[6]), stock: deck.slice(7),
    scorePiles: [[], []], currentTrick: { lead: [], response: [], leaderIdx: null },
    turn: 1 - dealer, dealer, handPhase: "playing", leadPhase: true,
    handWinner: null, handWinReason: "", lastTrick: null, moveCount: 0,
    declared: [null, null], stakeLevel: 0, doublingRights: null, doublingPhase: null,
  };
}

function detectSpecial(hand, trumpSuit) {
  if (hand.length !== 3) return null;
  const suits = hand.map(cardSuit), ranks = hand.map(cardRank);
  if (suits.every(s => s === trumpSuit)) return "bura";
  if (ranks.every(r => r === "A")) return "threeAces";
  if (suits[0] === suits[1] && suits[1] === suits[2]) return "molodka";
  return null;
}

function doesCardBeat(attack, defense, trumpSuit) {
  const aSuit = cardSuit(attack), dSuit = cardSuit(defense);
  if (aSuit === dSuit) return cardStrength(defense) > cardStrength(attack);
  if (dSuit === trumpSuit && aSuit !== trumpSuit) return true;
  return false;
}

function resolveTrick(leadCards, responseCards, trumpSuit) {
  if (leadCards.length !== responseCards.length) return 0;
  for (let i = 0; i < leadCards.length; i++) {
    if (!doesCardBeat(leadCards[i], responseCards[i], trumpSuit)) return 0;
  }
  return 1;
}

function replenishHands(state) {
  const { hands, stock } = state;
  const order = [state.turn, 1 - state.turn];
  const needed0 = Math.max(0, 3 - hands[order[0]].length);
  const needed1 = Math.max(0, 3 - hands[order[1]].length);
  if (stock.length < needed0 + needed1) return;
  const draws = [0, 0], targets = [needed0, needed1];
  while (draws[0] < targets[0] || draws[1] < targets[1]) {
    for (let i = 0; i < 2; i++) {
      if (draws[i] < targets[i] && stock.length > 0) { hands[order[i]].push(stock.shift()); draws[i]++; }
    }
  }
}

// ─── Test harness ────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) passed++; else { failed++; console.error(`  FAIL: ${msg}`); }
}

// ═══ Test 1: Deck ═══
console.log("\n=== Test 1: Deck Integrity ===");
{
  const deck = buildDeck();
  assert(deck.length === 36, `Deck: ${deck.length} cards`);
  assert(new Set(deck).size === 36, "All unique");
  const pts = deck.reduce((s, c) => s + cardPoints(c), 0);
  assert(pts === 120, `Total points: ${pts}`);
  console.log(`  OK: 36 cards, 120 points`);
}

// ═══ Test 2: Shuffle determinism ═══
console.log("\n=== Test 2: Shuffle Determinism ===");
{
  assert(JSON.stringify(shuffleDeck(42)) === JSON.stringify(shuffleDeck(42)), "Same seed → same deck");
  assert(JSON.stringify(shuffleDeck(42)) !== JSON.stringify(shuffleDeck(99)), "Diff seed → diff deck");
  console.log("  OK");
}

// ═══ Test 3: Init state ═══
console.log("\n=== Test 3: Init Hand State ===");
{
  const s = initHandState(12345, 0);
  assert(s.hands[0].length === 3, "P0 has 3 cards");
  assert(s.hands[1].length === 3, "P1 has 3 cards");
  assert(s.stock.length === 29, `Stock: ${s.stock.length}`);
  assert(s.turn === 1, "Non-dealer goes first");
  assert(s.trumpCard != null, "Trump exists");
  const all = [...s.hands[0], ...s.hands[1], s.trumpCard, ...s.stock];
  assert(all.length === 36 && new Set(all).size === 36, "36 unique cards");
  console.log(`  P0: ${s.hands[0].join(", ")}  P1: ${s.hands[1].join(", ")}  Trump: ${s.trumpCard}`);
}

// ═══ Test 4: Beating logic ═══
console.log("\n=== Test 4: Card Beating ===");
{
  const t = "♠";
  assert(doesCardBeat("6♥", "A♥", t) === true,  "A♥ > 6♥ same suit");
  assert(doesCardBeat("A♥", "6♥", t) === false, "6♥ < A♥");
  assert(doesCardBeat("K♦", "10♦", t) === true,  "10♦ > K♦");
  assert(doesCardBeat("10♦", "K♦", t) === false, "K♦ < 10♦");
  assert(doesCardBeat("A♥", "6♠", t) === true,  "Trump 6♠ > non-trump A♥");
  assert(doesCardBeat("A♠", "6♥", t) === false, "Non-trump < trump");
  assert(doesCardBeat("A♥", "A♦", t) === false, "Diff non-trump suits can't beat");
  console.log("  OK: all 7 checks");
}

// ═══ Test 5: Trick resolution ═══
console.log("\n=== Test 5: Trick Resolution ===");
{
  const t = "♠";
  assert(resolveTrick(["6♥"], ["A♥"], t) === 1, "Single beat");
  assert(resolveTrick(["A♥"], ["6♥"], t) === 0, "Single fail");
  assert(resolveTrick(["6♥", "7♦"], ["A♥", "A♦"], t) === 1, "Multi beat");
  assert(resolveTrick(["6♥", "A♦"], ["A♥", "K♦"], t) === 0, "Multi partial fail");
  assert(resolveTrick(["A♥", "A♦"], ["6♠", "7♠"], t) === 1, "Trump beats non-trump");
  assert(resolveTrick(["6♥"], ["A♥", "A♦"], t) === 0, "Mismatched count");
  console.log("  OK: all 6 checks");
}

// ═══ Test 6: Replenish ═══
console.log("\n=== Test 6: Replenish ===");
{
  const s = initHandState(555, 0);
  s.hands[0] = s.hands[0].slice(1); s.hands[1] = s.hands[1].slice(1);
  s.turn = 0;
  const before = s.stock.length;
  replenishHands(s);
  assert(s.hands[0].length === 3, "P0 replenished");
  assert(s.hands[1].length === 3, "P1 replenished");
  assert(s.stock.length === before - 2, "Stock decreased by 2");

  // Insufficient stock
  s.stock = ["A♥"]; s.hands[0] = ["6♠"]; s.hands[1] = ["7♦", "8♣"];
  replenishHands(s);
  assert(s.stock.length === 1, "Insufficient stock: no replenish");
  console.log("  OK");
}

// ═══ Test 7: Specials ═══
console.log("\n=== Test 7: Specials ===");
{
  assert(detectSpecial(["A♠", "10♠", "K♠"], "♠") === "bura", "Bura");
  assert(detectSpecial(["A♠", "A♥", "A♦"], "♠") === "threeAces", "Three aces");
  assert(detectSpecial(["6♥", "7♥", "8♥"], "♠") === "molodka", "Molodka");
  assert(detectSpecial(["6♥", "7♦", "8♥"], "♠") === null, "None");
  assert(detectSpecial(["6♥", "7♥"], "♠") === null, "< 3 cards");
  console.log("  OK");
}

// ═══ Test 8: Full hand (verbose) ═══
console.log("\n=== Test 8: Full Hand Simulation ===");
{
  const s = initHandState(42, 0);
  let tricks = 0;
  console.log(`  Trump: ${s.trumpCard} (${s.trumpSuit})`);
  console.log(`  P0: ${s.hands[0].join(", ")}  |  P1: ${s.hands[1].join(", ")}`);

  while (tricks < 50) {
    for (let i = 0; i < 2; i++) {
      if (detectSpecial(s.hands[i], s.trumpSuit) === "bura") {
        s.handPhase = "handover"; s.handWinner = i; s.handWinReason = "Bura!"; break;
      }
    }
    if (s.handPhase === "handover") break;
    if (s.hands[0].length === 0 && s.hands[1].length === 0) {
      const p0 = pilePoints(s.scorePiles[0]), p1 = pilePoints(s.scorePiles[1]);
      s.handPhase = "handover";
      s.handWinner = p0 > p1 ? 0 : p1 > p0 ? 1 : -1;
      s.handWinReason = `${p0} vs ${p1}`;
      break;
    }
    const ldr = s.turn, rsp = 1 - ldr;
    if (!s.hands[ldr].length || !s.hands[rsp].length) { console.error("  BUG: empty hand mid-game"); break; }
    const lead = [s.hands[ldr][0]], resp = [s.hands[rsp][0]];
    s.hands[ldr].splice(0, 1); s.hands[rsp].splice(0, 1);
    const r = resolveTrick(lead, resp, s.trumpSuit);
    const w = r === 0 ? ldr : rsp;
    s.scorePiles[w].push(...lead, ...resp);
    s.turn = w; s.leadPhase = true; tricks++;
    console.log(`  T${tricks}: P${ldr} ${lead[0]} vs P${rsp} ${resp[0]} → P${w} ${r?'BEAT':'held'} | hands [${s.hands[0].length},${s.hands[1].length}] stock ${s.stock.length}`);
    replenishHands(s);
  }
  assert(s.handPhase === "handover", "Game ended");
  const all = [...s.hands[0], ...s.hands[1], ...s.scorePiles[0], ...s.scorePiles[1], s.trumpCard, ...s.stock];
  assert(all.length === 36, `Cards: ${all.length}`);
  assert(new Set(all).size === 36, "No dupes");
  console.log(`  Result: P${s.handWinner} wins (${s.handWinReason}), ${tricks} tricks`);
}

// ═══ Test 9: 100 games stress test ═══
console.log("\n=== Test 9: 100 Games Stress Test ===");
{
  let wins = [0, 0, 0], errors = 0;
  for (let g = 0; g < 100; g++) {
    const s = initHandState(g * 137 + 1, g % 2);
    let tricks = 0, err = false;
    while (tricks < 50) {
      for (let i = 0; i < 2; i++) {
        if (detectSpecial(s.hands[i], s.trumpSuit) === "bura") {
          s.handPhase = "handover"; s.handWinner = i; break;
        }
      }
      if (s.handPhase === "handover") break;
      if (s.hands[0].length === 0 && s.hands[1].length === 0) {
        const p0 = pilePoints(s.scorePiles[0]), p1 = pilePoints(s.scorePiles[1]);
        s.handPhase = "handover";
        s.handWinner = p0 > p1 ? 0 : p1 > p0 ? 1 : -1;
        break;
      }
      const ldr = s.turn, rsp = 1 - ldr;
      if (!s.hands[ldr].length || !s.hands[rsp].length) { err = true; break; }
      const lead = [s.hands[ldr][0]], resp = [s.hands[rsp][0]];
      s.hands[ldr].splice(0, 1); s.hands[rsp].splice(0, 1);
      const r = resolveTrick(lead, resp, s.trumpSuit);
      const w = r === 0 ? ldr : rsp;
      s.scorePiles[w].push(...lead, ...resp);
      s.turn = w; tricks++;
      replenishHands(s);
    }
    if (err || tricks >= 50) {
      errors++;
      console.error(`  Game ${g}: STUCK after ${tricks} tricks, hands [${s.hands[0].length},${s.hands[1].length}], stock ${s.stock.length}`);
    } else {
      wins[s.handWinner === 0 ? 0 : s.handWinner === 1 ? 1 : 2]++;
    }
    const all = [...s.hands[0], ...s.hands[1], ...s.scorePiles[0], ...s.scorePiles[1], s.trumpCard, ...s.stock];
    if (all.length !== 36) { errors++; console.error(`  Game ${g}: card count ${all.length}`); }
    if (new Set(all).size !== 36) { errors++; console.error(`  Game ${g}: duplicate cards!`); }
  }
  assert(errors === 0, `${errors} errors in 100 games`);
  console.log(`  P0: ${wins[0]} wins, P1: ${wins[1]} wins, Ties: ${wins[2]}, Errors: ${errors}`);
}

// ═══ Test 10: Points ═══
console.log("\n=== Test 10: Point Values ===");
{
  assert(cardPoints("A♠") === 11, "A=11"); assert(cardPoints("10♥") === 10, "10=10");
  assert(cardPoints("K♦") === 4, "K=4"); assert(cardPoints("Q♣") === 3, "Q=3");
  assert(cardPoints("J♠") === 2, "J=2"); assert(cardPoints("9♥") === 0, "9=0");
  assert(pilePoints(["A♠", "10♥", "K♦"]) === 25, "A+10+K=25");
  console.log("  OK");
}

// ═══ Summary ═══
console.log("\n" + "=".repeat(50));
console.log(`  PASSED: ${passed}  |  FAILED: ${failed}`);
console.log("=".repeat(50) + "\n");
process.exit(failed > 0 ? 1 : 0);
