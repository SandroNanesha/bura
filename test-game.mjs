// Standalone test: simulate 2 AI players playing Bura to completion
// Extracts pure game logic from App.jsx and runs it without React/DOM

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "10", "K", "Q", "J", "9", "8", "7", "6"];
const RANK_ORDER = { A: 8, "10": 7, K: 6, Q: 5, J: 4, "9": 3, "8": 2, "7": 1, "6": 0 };
const POINT_VALUES = { A: 11, "10": 10, K: 4, Q: 3, J: 2, "9": 0, "8": 0, "7": 0, "6": 0 };

function cardRank(c) { return c.slice(0, -1); }
function cardSuit(c) { return c.slice(-1); }
function cardPoints(c) { return POINT_VALUES[cardRank(c)] || 0; }
function cardStrength(c) { return RANK_ORDER[cardRank(c)]; }
function pilePoints(pile) { return pile.reduce((s, c) => s + cardPoints(c), 0); }

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleDeck(seed) {
  const deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push(`${r}${s}`);
  const rng = mulberry32(seed);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function detectSpecial(hand, trumpSuit) {
  if (hand.length !== 3) return null;
  const suits = hand.map(cardSuit);
  const ranks = hand.map(cardRank);
  if (suits.every(s => s === trumpSuit)) return "bura";
  if (ranks.every(r => r === "A")) return "threeAces";
  if (suits[0] === suits[1] && suits[1] === suits[2]) return "molodka";
  return null;
}

function doesCardBeat(attack, defense, trumpSuit) {
  const aSuit = cardSuit(attack);
  const dSuit = cardSuit(defense);
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
  const winnerIdx = state.turn;
  const loserIdx = 1 - winnerIdx;
  const order = [winnerIdx, loserIdx];
  const needed0 = Math.max(0, 3 - hands[order[0]].length);
  const needed1 = Math.max(0, 3 - hands[order[1]].length);
  const totalNeeded = needed0 + needed1;
  if (stock.length < totalNeeded) return;
  const draws = [0, 0];
  const targets = [needed0, needed1];
  while (draws[0] < targets[0] || draws[1] < targets[1]) {
    for (let i = 0; i < 2; i++) {
      if (draws[i] < targets[i] && stock.length > 0) {
        hands[order[i]].push(stock.shift());
        draws[i]++;
      }
    }
  }
}

function initGameState(seed) {
  const deck = shuffleDeck(seed);
  return {
    seed,
    hands: [[deck[0], deck[1], deck[2]], [deck[3], deck[4], deck[5]]],
    trumpCard: deck[6],
    trumpSuit: cardSuit(deck[6]),
    stock: deck.slice(7),
    scorePiles: [[], []],
    currentTrick: { lead: [], response: [], leaderIdx: null },
    turn: 0,
    phase: "playing",
    leadPhase: true,
    winner: null,
    winReason: "",
    lastTrick: null,
    moveCount: 0,
    declared: [null, null],
  };
}

const SPECIAL_PRIORITY = { bura: 3, threeAces: 2, molodka: 1 };

function checkSpecials(state) {
  for (let i = 0; i < 2; i++) {
    const special = detectSpecial(state.hands[i], state.trumpSuit);
    if (special) state.declared[i] = special;
  }
  const d0 = state.declared[0], d1 = state.declared[1];
  if (d0 === "bura") { state.phase = "gameover"; state.winner = 0; state.winReason = "Бура! P0"; return true; }
  if (d1 === "bura") { state.phase = "gameover"; state.winner = 1; state.winReason = "Бура! P1"; return true; }
  if (d0 && d1) {
    state.turn = (SPECIAL_PRIORITY[d0] || 0) >= (SPECIAL_PRIORITY[d1] || 0) ? 0 : 1;
  } else if (d0) { state.turn = 0; } else if (d1) { state.turn = 1; }
  state.declared = [null, null];
  return false;
}

// ─── AI Strategy ─────────────────────────────────────────────────────────────
function aiChooseLead(hand, trumpSuit, opponentHandSize) {
  // Simple: play 1 card. Prefer non-trump, lowest value first.
  // Can't play more cards than opponent has
  const maxCards = Math.min(hand.length, opponentHandSize || 1);
  const nonTrump = hand.filter(c => cardSuit(c) !== trumpSuit);
  const pool = nonTrump.length > 0 ? nonTrump : hand;
  pool.sort((a, b) => cardPoints(a) - cardPoints(b) || cardStrength(a) - cardStrength(b));
  return [pool[0]];
}

function aiChooseResponse(hand, leadCards, trumpSuit) {
  const count = leadCards.length;
  if (hand.length < count) {
    // Not enough cards — play lowest cards
    const sorted = [...hand].sort((a, b) => cardStrength(a) - cardStrength(b));
    return sorted.slice(0, count);
  }

  // Try to beat all lead cards
  // For single card: find cheapest card that beats it
  if (count === 1) {
    const attack = leadCards[0];
    const beaters = hand.filter(c => doesCardBeat(attack, c, trumpSuit));
    if (beaters.length > 0) {
      beaters.sort((a, b) => cardPoints(a) - cardPoints(b) || cardStrength(a) - cardStrength(b));
      return [beaters[0]];
    }
    // Can't beat — play lowest value card
    const sorted = [...hand].sort((a, b) => cardPoints(a) - cardPoints(b) || cardStrength(a) - cardStrength(b));
    return [sorted[0]];
  }

  // Multi-card: just play lowest cards (simplified)
  const sorted = [...hand].sort((a, b) => cardPoints(a) - cardPoints(b) || cardStrength(a) - cardStrength(b));
  return sorted.slice(0, count);
}

// ─── Simulate Games ──────────────────────────────────────────────────────────
const bugs = [];
const results = { p0wins: 0, p1wins: 0, draws: 0, bura: 0, claim31: 0, errors: 0, stalemates: 0 };
const NUM_GAMES = 500;

for (let g = 0; g < NUM_GAMES; g++) {
  const seed = g * 7919 + 42;
  const state = initGameState(seed);
  let trickCount = 0;
  const MAX_TRICKS = 100;

  // Check initial specials
  const initialGameOver = checkSpecials(state);
  if (initialGameOver) {
    if (state.winReason.includes("Бура")) results.bura++;
    if (state.winner === 0) results.p0wins++;
    else results.p1wins++;
    continue;
  }

  let error = null;

  while (state.phase === "playing" && trickCount < MAX_TRICKS) {
    const currentPlayer = state.turn;

    // Validate state
    if (state.hands[0].length === 0 && state.hands[1].length === 0) {
      bugs.push({ game: g, seed, msg: "BUG: All cards gone but phase still playing!" });
      error = true;
      break;
    }

    if (state.hands[currentPlayer].length === 0) {
      bugs.push({ game: g, seed, msg: `BUG: Player ${currentPlayer}'s turn but hand is empty! Other hand: ${state.hands[1 - currentPlayer].length}, stock: ${state.stock.length}` });
      error = true;
      break;
    }

    if (state.leadPhase) {
      // Lead
      const opponentHandSize = state.hands[1 - currentPlayer].length;
      const leadCards = aiChooseLead(state.hands[currentPlayer], state.trumpSuit, opponentHandSize);

      // Validate lead cards are in hand
      for (const c of leadCards) {
        if (!state.hands[currentPlayer].includes(c)) {
          bugs.push({ game: g, seed, msg: `BUG: Lead card ${c} not in hand ${JSON.stringify(state.hands[currentPlayer])}` });
          error = true;
          break;
        }
      }
      if (error) break;

      // Validate same suit
      const leadSuit = cardSuit(leadCards[0]);
      if (!leadCards.every(c => cardSuit(c) === leadSuit)) {
        bugs.push({ game: g, seed, msg: `BUG: Lead cards not same suit: ${leadCards}` });
        error = true;
        break;
      }

      state.currentTrick = { lead: [...leadCards], response: [], leaderIdx: currentPlayer, requiredCount: leadCards.length };
      state.hands[currentPlayer] = state.hands[currentPlayer].filter(c => !leadCards.includes(c));
      state.turn = 1 - currentPlayer;
      state.leadPhase = false;
      state.moveCount++;
    } else {
      // Respond
      const responder = state.turn;
      const requiredCount = state.currentTrick.requiredCount || state.currentTrick.lead.length;

      if (state.hands[responder].length < requiredCount) {
        bugs.push({ game: g, seed, msg: `BUG: Responder P${responder} has ${state.hands[responder].length} cards but needs ${requiredCount}. Leader played ${requiredCount} cards. Hands: ${JSON.stringify(state.hands)}, stock: ${state.stock.length}` });
        error = true;
        break;
      }

      const responseCards = aiChooseResponse(state.hands[responder], state.currentTrick.lead, state.trumpSuit);

      if (responseCards.length !== requiredCount) {
        bugs.push({ game: g, seed, msg: `BUG: AI chose ${responseCards.length} response cards but need ${requiredCount}` });
        error = true;
        break;
      }

      // Validate response cards in hand
      for (const c of responseCards) {
        if (!state.hands[responder].includes(c)) {
          bugs.push({ game: g, seed, msg: `BUG: Response card ${c} not in hand` });
          error = true;
          break;
        }
      }
      if (error) break;

      state.currentTrick.response = [...responseCards];
      state.hands[responder] = state.hands[responder].filter(c => !responseCards.includes(c));

      // Resolve trick
      const leaderIdx = state.currentTrick.leaderIdx;
      const responderIdx = 1 - leaderIdx;
      const trickResult = resolveTrick(state.currentTrick.lead, state.currentTrick.response, state.trumpSuit);
      const trickWinner = trickResult === 0 ? leaderIdx : responderIdx;
      const allTrickCards = [...state.currentTrick.lead, ...state.currentTrick.response];

      // Validate no duplicate cards
      const allCardsSet = new Set(allTrickCards);
      if (allCardsSet.size !== allTrickCards.length) {
        bugs.push({ game: g, seed, msg: `BUG: Duplicate cards in trick: ${allTrickCards}` });
        error = true;
        break;
      }

      state.scorePiles[trickWinner] = [...state.scorePiles[trickWinner], ...allTrickCards];
      state.lastTrick = { lead: state.currentTrick.lead, response: state.currentTrick.response, leaderIdx, winner: trickWinner };

      state.turn = trickWinner;

      // Track cards before replenish
      const handsBefore = [state.hands[0].length, state.hands[1].length];
      const stockBefore = state.stock.length;
      replenishHands(state);
      const handsAfter = [state.hands[0].length, state.hands[1].length];
      const stockAfter = state.stock.length;

      // Check specials
      const gameOver = checkSpecials(state);
      if (gameOver) {
        if (state.winReason.includes("Бура")) results.bura++;
        break;
      }

      // Check if game should end
      if (state.hands[0].length === 0 && state.hands[1].length === 0) {
        state.phase = "gameover";
        const p0 = pilePoints(state.scorePiles[0]);
        const p1 = pilePoints(state.scorePiles[1]);
        if (p0 > p1) { state.winner = 0; state.winReason = `P0 wins ${p0} vs ${p1}`; }
        else if (p1 > p0) { state.winner = 1; state.winReason = `P1 wins ${p1} vs ${p0}`; }
        else { state.winner = -1; state.winReason = `Tie ${p0}`; }
      } else {
        state.leadPhase = true;
        state.currentTrick = { lead: [], response: [], leaderIdx: null };

        // Validate: if hands are unequal and stock is empty, that could be a problem
        if (state.hands[0].length !== state.hands[1].length && state.stock.length === 0) {
          // This can happen legitimately if multi-card leads used different amounts
          // but let's track it
        }

        // The current player (trick winner) must have cards to lead
        if (state.hands[state.turn].length === 0 && state.hands[1 - state.turn].length === 0) {
          // Should have been caught by the game-over check above
          bugs.push({ game: g, seed, msg: `BUG: Both hands empty but game didn't end` });
          error = true;
          break;
        }
      }

      state.moveCount++;
      trickCount++;
    }
  }

  if (error) {
    results.errors++;
    continue;
  }

  if (trickCount >= MAX_TRICKS) {
    bugs.push({ game: g, seed, msg: `BUG: Game exceeded ${MAX_TRICKS} tricks (infinite loop?)` });
    results.stalemates++;
    continue;
  }

  // Validate final state
  if (state.phase === "gameover") {
    const totalCards = state.scorePiles[0].length + state.scorePiles[1].length +
                       state.hands[0].length + state.hands[1].length + state.stock.length + 1; // +1 for trump card
    // Trump card is NOT in the stock after init, it's separate
    // Actually the trump card is separate, and cards in currentTrick...
    // Let's just check points
    const p0 = pilePoints(state.scorePiles[0]);
    const p1 = pilePoints(state.scorePiles[1]);
    const totalPoints = p0 + p1;

    if (state.winner === 0) results.p0wins++;
    else if (state.winner === 1) results.p1wins++;
    else results.draws++;

    // Check for claim-31 test: if either player has >= 31 points mid-game
    // (we don't test this in AI since AI never claims)

    // Verify all cards accounted for (when game ended normally with all cards played)
    if (state.hands[0].length === 0 && state.hands[1].length === 0 && state.stock.length === 0) {
      const pileTotal = state.scorePiles[0].length + state.scorePiles[1].length;
      // 36 cards total: 3+3 dealt + 1 trump + 29 stock = 36
      // Trump card is set aside but never enters play normally...
      // Actually let's check: trump card is deck[6], stock is deck.slice(7)
      // So 3+3+1(trump)+29(stock) = 36. Trump card stays on table as indicator.
      // Cards that should be in piles: 6 (initial deal) + stock cards drawn
      // This is complex. Let's just verify total points if all piles collected = 120
      if (pileTotal === 35) {
        // 35 cards in piles (36 - 1 trump card on table)
        const trumpPoints = cardPoints(state.trumpCard);
        if (totalPoints + trumpPoints !== 120) {
          bugs.push({ game: g, seed, msg: `BUG: Point mismatch! Piles=${totalPoints}, trump=${trumpPoints}, sum=${totalPoints + trumpPoints} (expected 120)` });
        }
      }
    }
  }
}

// ─── Report ──────────────────────────────────────────────────────────────────
console.log(`\n═══ BURA TEST RESULTS (${NUM_GAMES} games) ═══\n`);
console.log(`P0 wins:    ${results.p0wins}`);
console.log(`P1 wins:    ${results.p1wins}`);
console.log(`Draws/Ties: ${results.draws}`);
console.log(`Bura wins:  ${results.bura}`);
console.log(`Errors:     ${results.errors}`);
console.log(`Stalemates: ${results.stalemates}`);
console.log(`Total:      ${results.p0wins + results.p1wins + results.draws + results.errors + results.stalemates}`);

if (bugs.length > 0) {
  console.log(`\n═══ BUGS FOUND (${bugs.length}) ═══\n`);
  for (const b of bugs) {
    console.log(`Game #${b.game} (seed=${b.seed}): ${b.msg}`);
  }
} else {
  console.log(`\n✅ No bugs found!`);
}

// ─── Additional edge case tests ──────────────────────────────────────────────
console.log(`\n═══ EDGE CASE TESTS ═══\n`);

// Test 1: Card parsing
console.log("Test: cardRank/cardSuit parsing...");
const testCards = ["A♠", "10♥", "K♦", "Q♣", "6♠"];
for (const c of testCards) {
  const r = cardRank(c);
  const s = cardSuit(c);
  if (r + s !== c) {
    console.log(`  FAIL: ${c} parsed as rank=${r} suit=${s}, reconstructed=${r + s}`);
  }
}
console.log("  OK");

// Test 2: doesCardBeat
console.log("Test: doesCardBeat...");
const trump = "♠";
// Same suit, higher beats
console.assert(doesCardBeat("6♥", "10♥", trump) === true, "10♥ should beat 6♥");
console.assert(doesCardBeat("K♥", "A♥", trump) === true, "A♥ should beat K♥");
console.assert(doesCardBeat("A♥", "K♥", trump) === false, "K♥ should not beat A♥");
// Trump beats non-trump
console.assert(doesCardBeat("A♥", "6♠", trump) === true, "6♠ (trump) should beat A♥");
// Non-trump doesn't beat different non-trump
console.assert(doesCardBeat("6♥", "A♦", trump) === false, "A♦ should not beat 6♥ (different suit, non-trump)");
// Trump vs trump: higher wins
console.assert(doesCardBeat("6♠", "A♠", trump) === true, "A♠ should beat 6♠");
console.assert(doesCardBeat("A♠", "6♠", trump) === false, "6♠ should not beat A♠");
console.log("  OK");

// Test 3: resolveTrick
console.log("Test: resolveTrick...");
console.assert(resolveTrick(["A♥"], ["K♥"], trump) === 0, "K♥ doesn't beat A♥, leader wins");
console.assert(resolveTrick(["K♥"], ["A♥"], trump) === 1, "A♥ beats K♥, responder wins");
console.assert(resolveTrick(["A♥"], ["6♠"], trump) === 1, "6♠ trump beats A♥, responder wins");
console.assert(resolveTrick(["6♥", "7♥"], ["A♥", "10♥"], trump) === 1, "Both beaten, responder wins");
console.assert(resolveTrick(["A♥", "6♥"], ["K♥", "10♥"], trump) === 0, "Can't beat A♥, leader wins");
console.log("  OK");

// Test 4: detectSpecial
console.log("Test: detectSpecial...");
console.assert(detectSpecial(["A♠", "10♠", "K♠"], "♠") === "bura", "Three trump = bura");
console.assert(detectSpecial(["A♠", "A♥", "A♦"], "♣") === "threeAces", "Three aces");
console.assert(detectSpecial(["6♥", "7♥", "8♥"], "♠") === "molodka", "Three same non-trump suit");
console.assert(detectSpecial(["6♥", "7♥", "8♥"], "♥") === "bura", "Three same trump suit = bura not molodka");
console.assert(detectSpecial(["6♥", "7♠", "8♥"], "♣") === null, "Mixed suits = nothing");
console.assert(detectSpecial(["A♥", "A♠"], "♣") === null, "Only 2 cards = nothing");
console.log("  OK");

// Test 5: pilePoints
console.log("Test: pilePoints...");
console.assert(pilePoints(["A♥", "10♥", "K♥"]) === 25, "A(11)+10(10)+K(4)=25");
console.assert(pilePoints(["6♥", "7♥", "8♥"]) === 0, "All zero-point cards");
console.assert(pilePoints([]) === 0, "Empty pile");
console.log("  OK");

// Test 6: replenishHands - stock too small
console.log("Test: replenishHands edge cases...");
{
  const s = {
    hands: [["A♥"], ["K♥"]],
    stock: ["6♠", "7♠", "8♠"],
    turn: 0,
  };
  replenishHands(s);
  // needs 2+2=4, stock has 3, so no one draws
  console.assert(s.hands[0].length === 1, `Expected 1, got ${s.hands[0].length} (stock too small, no draw)`);
  console.assert(s.hands[1].length === 1, `Expected 1, got ${s.hands[1].length}`);
  console.assert(s.stock.length === 3, `Expected 3, got ${s.stock.length}`);
}
{
  const s = {
    hands: [["A♥"], ["K♥"]],
    stock: ["6♠", "7♠", "8♠", "9♠"],
    turn: 0,
  };
  replenishHands(s);
  // needs 2+2=4, stock has 4, draw succeeds
  console.assert(s.hands[0].length === 3, `Expected 3, got ${s.hands[0].length}`);
  console.assert(s.hands[1].length === 3, `Expected 3, got ${s.hands[1].length}`);
  console.assert(s.stock.length === 0, `Expected 0, got ${s.stock.length}`);
  // Winner draws first: P0 gets 6♠, then P1 gets 7♠, then P0 gets 8♠, then P1 gets 9♠
  console.assert(s.hands[0].includes("6♠"), "Winner should draw first");
  console.assert(s.hands[0].includes("8♠"), "Winner draws 1st and 3rd");
  console.assert(s.hands[1].includes("7♠"), "Loser draws 2nd");
  console.assert(s.hands[1].includes("9♠"), "Loser draws 4th");
}
console.log("  OK");

// Test 7: Multi-card lead where responder has fewer cards than lead
console.log("Test: Multi-card lead with insufficient responder hand...");
{
  // This scenario: leader plays 2 cards, but responder only has 1 card
  // The game should not allow this — leader can only play up to min(own hand, opp hand) cards
  // BUT the current code doesn't validate this!
  const s = initGameState(12345);
  s.stock = []; // empty stock
  s.hands = [["A♥", "K♥"], ["6♠"]]; // P0 has 2, P1 has 1
  s.turn = 0;
  s.leadPhase = true;

  // If P0 leads 2 cards, P1 can't respond with 2
  // This is a potential bug — the UI allows selecting up to 3 same-suit cards
  // but doesn't check if opponent has enough cards
  console.log("  P0 hand: 2 cards, P1 hand: 1 card");
  console.log("  If P0 leads 2 cards, P1 cannot respond — POTENTIAL BUG: no validation in playCards");
}
console.log("  (manual inspection needed)");

// Test 8: Total deck points = 120
console.log("Test: Total deck points...");
{
  const deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push(`${r}${s}`);
  const total = deck.reduce((sum, c) => sum + cardPoints(c), 0);
  console.assert(total === 120, `Expected 120, got ${total}`);
}
console.log("  OK");

console.log("\n═══ ALL TESTS COMPLETE ═══\n");
