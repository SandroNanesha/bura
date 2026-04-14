import React, { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from "react";

// ─── i18n ────────────────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    greeting: "Welcome Mariam, before starting the game make sure the blanket is tucked into the chikholi. Otherwise you will not be able to participate in the game.",
    title: "Bura",
    subtitle: "Thirty-One \u2022 2 Players",
    playTo: "Play to:",
    points: "points",
    pt: "pt",
    pts: "pts",
    createGame: "Create Game",
    enterCode: "Enter game code\u2026",
    join: "Join",
    waitingForOpponent: "Waiting for Opponent\u2026",
    playingTo: (n) => `Playing to ${n} points`,
    shareCode: "Share this code:",
    shareLink: "Or share this link:",
    copyLink: "Copy Link",
    waiting: "Waiting\u2026",
    online: "Online",
    offline: "Offline",
    claim31: "Claim 31!",
    stake: "Stake",
    you: "You",
    opp: "Opp",
    to: "to",
    yourTurnLead: "Your turn \u2014 Lead",
    yourTurnRespond: "Your turn \u2014 Respond",
    oppTurnLead: "Opponent\u2019s turn to lead",
    oppResponding: "Opponent responding",
    trump: "Trump",
    stock: "Stock",
    empty: "Empty",
    lastTrick: "Last trick",
    youWon: "You won",
    oppWon: "Opp won",
    pile: "Pile",
    play: "Play",
    cards: "cards",
    card: "card",
    respondWith: "Respond with",
    allLeadSameSuit: "All lead cards must be same suit!",
    oppOnlyHas: (n) => `Opponent only has ${n} card(s)!`,
    notYourTurn: "Not your turn!",
    mustPlayExactly: (n) => `You must play exactly ${n} card(s)!`,
    gameNotFound: "Game not found!",
    gameFull: "Game is full!",
    buraWin: "Bura! Three trump cards!",
    claimed31had: (p) => `Claimed 31! Had ${p} points.`,
    claimed31only: (p) => `Claimed 31 but only had ${p} points!`,
    winsWithPts: (a, b) => `Wins with ${a} vs ${b} points!`,
    tieAt: (p) => `Tie at ${p} points each!`,
    drawRedeal: "Draw \u2014 re-deal!",
    oppDeclined: (label) => `Opponent declined ${label}`,
    handWon: "Hand Won!",
    handLost: "Hand Lost!",
    draw: "Draw!",
    yourHand: "Your Hand",
    opponent: "Opponent",
    matchScore: "Match Score",
    nextHand: "Next Hand",
    matchWon: "Match Won!",
    matchLost: "Match Lost!",
    finalScore: "Final Score",
    newMatch: "New Match",
    proposeRaise: (name) => `Opponent proposes raising the stake to ${name}`,
    declineInfo: (pts) => `Decline = lose this hand at current stake (${pts} ${pts !== 1 ? "pts" : "pt"})`,
    accept: "Accept",
    decline: "Decline",
    waitingForDoubleResp: (label) => `Waiting for opponent to respond to ${label}\u2026`,
    langSwitch: "\u10E5\u10D0\u10E0",  // ქარ
    oppDisconnected: "Opponent has left the game!",
    oppDisconnectedSub: "Waiting for them to reconnect\u2026",
    newHandReady: "New Hand!",
    newMatchReady: "New Match!",
    pressStart: "Press Start when ready",
    start: "Start",
    confirmStart: "Confirm?",
    waitingForBoth: "Waiting for both players\u2026",
    yourPile: "Your Pile",
    oppPile: "Opp Pile",
    chat: "Chat",
    typeMessage: "Type a message\u2026",
    send: "Send",
    backToMenu: "Back to Menu",
  },
  ka: {
    greeting: "\u10DB\u10DD\u10D2\u10D4\u10E1\u10D0\u10DA\u10DB\u10D4\u10D1\u10D8\u10D7 \u10DB\u10D0\u10E0\u10D8\u10D0\u10DB, \u10E1\u10D0\u10DC\u10D0\u10DB \u10D7\u10D0\u10DB\u10D0\u10E8\u10E1 \u10D3\u10D0\u10D8\u10EC\u10E7\u10D4\u10D1\u10D7 \u10D3\u10D0\u10E0\u10EC\u10DB\u10E3\u10DC\u10D3\u10D8\u10D7 \u10E0\u10DD\u10DB \u10E1\u10D0\u10D1\u10D0\u10DC\u10D8 \u10E9\u10D8\u10EE\u10DD\u10DA\u10E8\u10D8\u10D0 \u10E9\u10D0\u10E1\u10DB\u10E3\u10DA\u10D8. \u10EC\u10D8\u10DC\u10D0\u10D0\u10E6\u10DB\u10D3\u10D4\u10D2 \u10E8\u10D4\u10DB\u10D7\u10EE\u10D5\u10D4\u10D5\u10D0\u10E8\u10D8 \u10D7\u10E5\u10D5\u10D4\u10DC \u10D5\u10D4\u10E0 \u10DB\u10DD\u10D0\u10EE\u10D4\u10E0\u10EE\u10D4\u10D1\u10D7 \u10D7\u10D0\u10DB\u10D0\u10E8\u10E8\u10D8 \u10DB\u10DD\u10DC\u10D0\u10EC\u10D8\u10DA\u10D4\u10DD\u10D1\u10D0\u10E1.",
    title: "\u10D1\u10E3\u10E0\u10D0",
    subtitle: "\u10DD\u10EA\u10D3\u10D0\u10D7\u10DD\u10E0\u10DB\u10D4\u10E2\u10D8 \u2022 2 \u10DB\u10DD\u10D7\u10D0\u10DB\u10D0\u10E8\u10D4",
    playTo: "\u10D7\u10D0\u10DB\u10D0\u10E8\u10D8:",
    points: "\u10E5\u10E3\u10DA\u10D0",
    pt: "\u10E5\u10E3\u10DA\u10D0",
    pts: "\u10E5\u10E3\u10DA\u10D0",
    createGame: "\u10D7\u10D0\u10DB\u10D0\u10E8\u10D8\u10E1 \u10E8\u10D4\u10E5\u10DB\u10DC\u10D0",
    enterCode: "\u10E8\u10D4\u10D8\u10E7\u10D5\u10D0\u10DC\u10D4\u10D7 \u10D9\u10DD\u10D3\u10D8\u2026",
    join: "\u10E8\u10D4\u10E1\u10D5\u10DA\u10D0",
    waitingForOpponent: "\u10DB\u10DD\u10EC\u10D8\u10DC\u10D0\u10D0\u10E6\u10DB\u10D3\u10D4\u10D2\u10D8\u10E1 \u10DB\u10DD\u10DA\u10DD\u10D3\u10D8\u10DC\u10D4\u2026",
    playingTo: (n) => `\u10D7\u10D0\u10DB\u10D0\u10E8\u10D8 ${n} \u10E5\u10E3\u10DA\u10D0\u10DB\u10D3\u10D4`,
    shareCode: "\u10D2\u10D0\u10E3\u10D6\u10D8\u10D0\u10E0\u10D4\u10D7 \u10D9\u10DD\u10D3\u10D8:",
    shareLink: "\u10D0\u10DC \u10D2\u10D0\u10E3\u10D6\u10D8\u10D0\u10E0\u10D4\u10D7 \u10D1\u10DB\u10E3\u10DA\u10D8:",
    copyLink: "\u10D1\u10DB\u10E3\u10DA\u10D8\u10E1 \u10D9\u10DD\u10DE\u10D8\u10E0\u10D4\u10D1\u10D0",
    waiting: "\u10DB\u10DD\u10DA\u10DD\u10D3\u10D8\u10DC\u10D4\u2026",
    online: "\u10DD\u10DC\u10DA\u10D0\u10D8\u10DC",
    offline: "\u10DD\u10E4\u10DA\u10D0\u10D8\u10DC",
    claim31: "31-\u10D8\u10E1 \u10D2\u10D0\u10DB\u10DD\u10EA\u10EE\u10D0\u10D3\u10D4\u10D1\u10D0!",
    stake: "\u10E4\u10D0\u10E1\u10D8",
    you: "\u10E8\u10D4\u10DC",
    opp: "\u10DB\u10DD\u10EC",
    to: "-\u10DB\u10D3\u10D4",
    yourTurnLead: "\u10E8\u10D4\u10DC\u10D8 \u10E1\u10D5\u10DA\u10D0 \u2014 \u10D2\u10D0\u10E1\u10D5\u10DA\u10D0",
    yourTurnRespond: "\u10E8\u10D4\u10DC\u10D8 \u10E1\u10D5\u10DA\u10D0 \u2014 \u10DE\u10D0\u10E1\u10E3\u10EE\u10D8",
    oppTurnLead: "\u10DB\u10DD\u10EC\u10D8\u10DC\u10D0\u10D0\u10E6\u10DB\u10D3\u10D4\u10D2\u10D4 \u10E1\u10D5\u10DA\u10D0\u10E1",
    oppResponding: "\u10DB\u10DD\u10EC\u10D8\u10DC\u10D0\u10D0\u10E6\u10DB\u10D3\u10D4\u10D2\u10D4 \u10DE\u10D0\u10E1\u10E3\u10EE\u10DD\u10D1\u10E1",
    trump: "\u10D9\u10DD\u10D6\u10D8\u10E0\u10D8",
    stock: "\u10D3\u10D0\u10E1\u10E2\u10D0",
    empty: "\u10EA\u10D0\u10E0\u10D8\u10D4\u10DA\u10D8",
    lastTrick: "\u10D1\u10DD\u10DA\u10DD",
    youWon: "\u10DB\u10DD\u10D8\u10D2\u10D4",
    oppWon: "\u10EC\u10D0\u10D0\u10D2\u10D4",
    pile: "\u10DB\u10DD\u10D2\u10D4\u10D1\u10E3\u10DA\u10D8",
    play: "\u10D2\u10D0\u10E1\u10D5\u10DA\u10D0",
    cards: "\u10D1\u10D0\u10E0\u10D0\u10D7\u10D8",
    card: "\u10D1\u10D0\u10E0\u10D0\u10D7\u10D8",
    respondWith: "\u10DE\u10D0\u10E1\u10E3\u10EE\u10D8",
    allLeadSameSuit: "\u10D2\u10D0\u10E1\u10D5\u10DA\u10D8\u10E1 \u10D1\u10D0\u10E0\u10D0\u10D7\u10D4\u10D1\u10D8 \u10D4\u10E0\u10D7\u10D8 \u10E4\u10D4\u10E0\u10D8\u10E1 \u10E3\u10DC\u10D3\u10D0 \u10D8\u10E7\u10DD\u10E1!",
    oppOnlyHas: (n) => `\u10DB\u10DD\u10EC\u10D8\u10DC\u10D0\u10D0\u10E6\u10DB\u10D3\u10D4\u10D2\u10D4\u10E1 \u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 ${n} \u10D1\u10D0\u10E0\u10D0\u10D7\u10D8 \u10D0\u10E5\u10D5\u10E1!`,
    notYourTurn: "\u10E8\u10D4\u10DC\u10D8 \u10E1\u10D5\u10DA\u10D0 \u10D0\u10E0 \u10D0\u10E0\u10D8\u10E1!",
    mustPlayExactly: (n) => `\u10E3\u10DC\u10D3\u10D0 \u10D2\u10D0\u10E1\u10D5\u10D0\u10D7 \u10D6\u10E3\u10E1\u10E2\u10D0\u10D3 ${n} \u10D1\u10D0\u10E0\u10D0\u10D7\u10D8!`,
    gameNotFound: "\u10D7\u10D0\u10DB\u10D0\u10E8\u10D8 \u10D5\u10D4\u10E0 \u10DB\u10DD\u10D8\u10EB\u10D4\u10D1\u10DC\u10D0!",
    gameFull: "\u10D7\u10D0\u10DB\u10D0\u10E8\u10D8 \u10E1\u10D0\u10D5\u10E1\u10D4\u10D0!",
    buraWin: "\u10D1\u10E3\u10E0\u10D0! \u10E1\u10D0\u10DB\u10D8 \u10D9\u10DD\u10D6\u10D8\u10E0\u10D8!",
    claimed31had: (p) => `31 \u10D2\u10D0\u10DB\u10DD\u10D0\u10EA\u10EE\u10D0\u10D3\u10D0! \u10F0\u10E5\u10DD\u10DC\u10D3\u10D0 ${p} \u10E5\u10E3\u10DA\u10D0.`,
    claimed31only: (p) => `31 \u10D2\u10D0\u10DB\u10DD\u10D0\u10EA\u10EE\u10D0\u10D3\u10D0, \u10DB\u10D0\u10D2\u10E0\u10D0\u10DB \u10DB\u10EE\u10DD\u10DA\u10DD\u10D3 ${p} \u10E5\u10E3\u10DA\u10D0 \u10F0\u10E5\u10DD\u10DC\u10D3\u10D0!`,
    winsWithPts: (a, b) => `\u10DB\u10DD\u10D8\u10D2\u10DD ${a} vs ${b} \u10E5\u10E3\u10DA\u10D0!`,
    tieAt: (p) => `\u10E4\u10E0\u10D4 ${p} \u10E5\u10E3\u10DA\u10D0!`,
    drawRedeal: "\u10E4\u10E0\u10D4 \u2014 \u10D7\u10D0\u10D5\u10D8\u10D3\u10D0\u10DC \u10D3\u10D0\u10E0\u10D8\u10D2\u10D4\u10D1\u10D0!",
    oppDeclined: (label) => `\u10DB\u10DD\u10EC\u10D8\u10DC\u10D0\u10D0\u10E6\u10DB\u10D3\u10D4\u10D2\u10D4\u10DB \u10E3\u10D0\u10E0\u10D8 \u10D7\u10E5\u10D5\u10D0 ${label}-\u10E1`,
    handWon: "\u10EE\u10D4\u10DA\u10D8 \u10DB\u10DD\u10D2\u10D4\u10D1\u10E3\u10DA\u10D8\u10D0!",
    handLost: "\u10EE\u10D4\u10DA\u10D8 \u10EC\u10D0\u10D0\u10D2\u10D4\u10D1\u10E3\u10DA\u10D8\u10D0!",
    draw: "\u10E4\u10E0\u10D4!",
    yourHand: "\u10E8\u10D4\u10DC\u10D8",
    opponent: "\u10DB\u10DD\u10EC\u10D8\u10DC\u10D0\u10D0\u10E6\u10DB\u10D3\u10D4\u10D2\u10D4",
    matchScore: "\u10DB\u10D0\u10E2\u10E9\u10D8\u10E1 \u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8",
    nextHand: "\u10E8\u10D4\u10DB\u10D3\u10D4\u10D2\u10D8 \u10EE\u10D4\u10DA\u10D8",
    matchWon: "\u10DB\u10D0\u10E2\u10E9\u10D8 \u10DB\u10DD\u10D2\u10D4\u10D1\u10E3\u10DA\u10D8\u10D0!",
    matchLost: "\u10DB\u10D0\u10E2\u10E9\u10D8 \u10EC\u10D0\u10D0\u10D2\u10D4\u10D1\u10E3\u10DA\u10D8\u10D0!",
    finalScore: "\u10E1\u10D0\u10D1\u10DD\u10DA\u10DD\u10DD \u10D0\u10DC\u10D2\u10D0\u10E0\u10D8\u10E8\u10D8",
    newMatch: "\u10D0\u10EE\u10D0\u10DA\u10D8 \u10DB\u10D0\u10E2\u10E9\u10D8",
    proposeRaise: (name) => `\u10DB\u10DD\u10EC\u10D8\u10DC\u10D0\u10D0\u10E6\u10DB\u10D3\u10D4\u10D2\u10D4 \u10E1\u10D7\u10D0\u10D5\u10D0\u10D6\u10DD\u10D1\u10E1 \u10E4\u10D0\u10E1\u10D8\u10E1 \u10D0\u10EC\u10D4\u10D5\u10D0\u10E1: ${name}`,
    declineInfo: (pts) => `\u10E3\u10D0\u10E0\u10D8 = \u10EC\u10D0\u10D0\u10D2\u10D4\u10D1 \u10D0\u10DB \u10EE\u10D4\u10DA\u10E1 \u10DB\u10D8\u10DB\u10D3\u10D8\u10DC\u10D0\u10E0\u10D4 \u10E4\u10D0\u10E1\u10D8\u10D7 (${pts} \u10E5\u10E3\u10DA\u10D0)`,
    accept: "\u10D7\u10D0\u10DC\u10EE\u10DB\u10D0",
    decline: "\u10E3\u10D0\u10E0\u10D8",
    waitingForDoubleResp: (label) => `\u10DB\u10DD\u10EC\u10D8\u10DC\u10D0\u10D0\u10E6\u10DB\u10D3\u10D4\u10D2\u10D4 \u10DE\u10D0\u10E1\u10E3\u10EE\u10DD\u10D1\u10E1 ${label}-\u10E1\u2026`,
    langSwitch: "ENG",
    oppDisconnected: "\u10DB\u10DD\u10EC\u10D8\u10DC\u10D0\u10D0\u10E6\u10DB\u10D3\u10D4\u10D2\u10D4\u10DB \u10D3\u10D0\u10E2\u10DD\u10D5\u10D0 \u10D7\u10D0\u10DB\u10D0\u10E8\u10D8!",
    oppDisconnectedSub: "\u10D5\u10D4\u10DA\u10DD\u10D3\u10D4\u10D1\u10D8\u10D7 \u10DB\u10D8\u10E1 \u10D3\u10D0\u10D1\u10E0\u10E3\u10DC\u10D4\u10D1\u10D0\u10E1\u2026",
    newHandReady: "\u10D0\u10EE\u10D0\u10DA\u10D8 \u10EE\u10D4\u10DA\u10D8!",
    newMatchReady: "\u10D0\u10EE\u10D0\u10DA\u10D8 \u10DB\u10D0\u10E2\u10E9\u10D8!",
    pressStart: "\u10D3\u10D0\u10D0\u10ED\u10D8\u10E0\u10D4\u10D7 \u10D3\u10D0\u10EC\u10E7\u10D4\u10D1\u10D0\u10E1",
    start: "\u10D3\u10D0\u10EC\u10E7\u10D4\u10D1\u10D0",
    confirmStart: "\u10D3\u10D0\u10D3\u10D0\u10E1\u10E2\u10E3\u10E0\u10D4\u10D1\u10D0?",
    waitingForBoth: "\u10DD\u10E0\u10D8\u10D5\u10D4 \u10DB\u10DD\u10D7\u10D0\u10DB\u10D0\u10E8\u10D4\u10E1 \u10D4\u10DA\u10DD\u10D3\u10D4\u10D1\u10D0\u2026",
    yourPile: "\u10E8\u10D4\u10DC\u10D8",
    oppPile: "\u10DB\u10DD\u10EC",
    chat: "\u10E9\u10D0\u10E2\u10D8",
    typeMessage: "\u10E8\u10D4\u10E2\u10E7\u10DD\u10D1\u10D8\u10DC\u10D4\u10D1\u10D0\u2026",
    send: "\u10D2\u10D0\u10D2\u10D6\u10D0\u10D5\u10DC\u10D0",
    backToMenu: "\u10DB\u10D4\u10DC\u10D8\u10E3\u10E8\u10D8",
  },
};

const LangContext = createContext("en");
function useT() {
  const lang = useContext(LangContext);
  return STRINGS[lang] || STRINGS.en;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const SUITS = ["\u2660", "\u2665", "\u2666", "\u2663"];
const RANKS = ["A", "10", "K", "Q", "J", "9", "8", "7", "6"];
const RANK_ORDER = { A: 8, "10": 7, K: 6, Q: 5, J: 4, "9": 3, "8": 2, "7": 1, "6": 0 };
const POINT_VALUES = { A: 11, "10": 10, K: 4, Q: 3, J: 2, "9": 0, "8": 0, "7": 0, "6": 0 };
const HEARTBEAT_INTERVAL = 5000;
const DISCONNECT_TIMEOUT = 12000;

// ─── Doubling System ─────────────────────────────────────────────────────────
const STAKE_LEVELS = [
  { level: 0, name: null,              label: null,             points: 1 },
  { level: 1, name: "\u10D3\u10D0\u10D5\u10D8",   label: "\u10D3\u10D0\u10D5\u10D8!",   points: 2 },
  { level: 2, name: "\u10E1\u10D4",     label: "\u10E1\u10D4!",     points: 3 },
  { level: 3, name: "\u10E9\u10D0\u10E0\u10D8",   label: "\u10E9\u10D0\u10E0\u10D8!",   points: 4 },
  { level: 4, name: "\u10E4\u10D0\u10DC\u10EF\u10D8",  label: "\u10E4\u10D0\u10DC\u10EF\u10D8!",  points: 5 },
  { level: 5, name: "\u10E8\u10D0\u10E8\u10D8",   label: "\u10E8\u10D0\u10E8\u10D8!",   points: 6 },
];

function stakePoints(level) { return STAKE_LEVELS[level]?.points || 1; }
function nextStakeLabel(level) { return STAKE_LEVELS[level + 1]?.label || null; }
function stakeDisplayName(level, t) {
  if (level === 0) return `1 ${t.pt}`;
  return `${STAKE_LEVELS[level].name} (${STAKE_LEVELS[level].points} ${t.pts})`;
}

// ─── Card Helpers ────────────────────────────────────────────────────────────
function cardRank(c) { return c.slice(0, -1); }
function cardSuit(c) { return c.slice(-1); }
function cardPoints(c) { return POINT_VALUES[cardRank(c)] || 0; }
function isRed(c) { const s = cardSuit(c); return s === "\u2665" || s === "\u2666"; }
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

function getGameIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("game");
}

function setGameIdInURL(id) {
  const url = new URL(window.location);
  url.searchParams.set("game", id);
  window.history.replaceState({}, "", url);
}

// ─── Game Logic ──────────────────────────────────────────────────────────────
function initHandState(seed, dealer) {
  const deck = shuffleDeck(seed);
  return {
    seed,
    hands: [[deck[0], deck[1], deck[2]], [deck[3], deck[4], deck[5]]],
    trumpCard: deck[6],
    trumpSuit: cardSuit(deck[6]),
    stock: deck.slice(7),
    scorePiles: [[], []],
    currentTrick: { lead: [], response: [], leaderIdx: null },
    turn: 1 - dealer,
    dealer,
    handPhase: "playing",
    leadPhase: true,
    handWinner: null,
    handWinReason: "",
    lastTrick: null,
    moveCount: 0,
    declared: [null, null],
    stakeLevel: 0,
    doublingRights: null,
    doublingPhase: null,
  };
}

function initMatchState(seed, playTo, dealer) {
  return {
    ...initHandState(seed, dealer),
    phase: "playing",
    matchScores: [0, 0],
    playTo,
    players: 2,
    lastActivity: [Date.now(), Date.now()],
    tabIds: [null, null],
    chat: [],
  };
}

function detectSpecial(hand, trumpSuit) {
  if (hand.length !== 3) return null;
  const suits = hand.map(cardSuit);
  const ranks = hand.map(cardRank);
  if (suits.every((s) => s === trumpSuit)) return "bura";
  if (ranks.every((r) => r === "A")) return "threeAces";
  if (suits[0] === suits[1] && suits[1] === suits[2]) return "molodka";
  return null;
}

const SPECIAL_PRIORITY = { bura: 3, threeAces: 2, molodka: 1 };

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

// ─── Storage ─────────────────────────────────────────────────────────────────
const storageKey = (gameId) => `bura_game_${gameId}`;

async function saveGameState(gameId, state) {
  try { await window.storage.setItem(storageKey(gameId), JSON.stringify(state), { shared: true }); }
  catch (e) { console.error("Failed to save:", e); }
}

async function loadGameState(gameId) {
  try {
    const data = await window.storage.getItem(storageKey(gameId), { shared: true });
    return data ? JSON.parse(data) : null;
  } catch (e) { console.error("Failed to load:", e); return null; }
}

// ─── Chat Component ─────────────────────────────────────────────────────────
function ChatWidget({ gameId, playerIdx, gameState, setGameState }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [readCount, setReadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const messagesEndRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const messages = gameState?.chat || [];
  const unread = Math.max(0, messages.length - readCount);

  // Auto-scroll to bottom when chat opens or new messages arrive
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages.length]);

  // Mark as read when chat is open
  useEffect(() => {
    if (open) setReadCount(messages.length);
  }, [open, messages.length]);

  // Show toast for incoming opponent messages when chat is closed
  const prevMsgCountRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      const newMsgs = messages.slice(prevMsgCountRef.current);
      const opMsgs = newMsgs.filter(m => m.from !== playerIdx);
      if (opMsgs.length > 0 && !open) {
        const toast = { id: Date.now(), text: opMsgs[opMsgs.length - 1].text };
        setToasts(prev => [...prev, toast]);
        // Auto-dismiss after 4s
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 4000);
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length, playerIdx, open]);

  const sendMessage = useCallback(async () => {
    if (!msg.trim() || !gameId || playerIdx === null) return;
    const newMsg = { from: playerIdx, text: msg.trim(), ts: Date.now() };
    const newState = {
      ...gameState,
      chat: [...(gameState.chat || []), newMsg],
    };
    setGameState(newState);
    saveGameState(gameId, newState);
    setMsg("");
  }, [msg, gameId, playerIdx, gameState, setGameState]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }, [sendMessage]);

  return (
    <>
      {/* Toast banners for incoming messages */}
      <div className="fixed bottom-16 right-2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-black/80 text-white text-sm px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm border border-green-800/40 max-w-[16rem] animate-toast-in pointer-events-auto"
            onClick={() => { setOpen(true); setToasts(prev => prev.filter(t => t.id !== toast.id)); }}>
            <span className="text-amber-300 font-bold text-xs mr-1">{t.opp}:</span>
            {toast.text}
          </div>
        ))}
      </div>

      {/* Chat toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-3 right-2 z-40 w-10 h-10 rounded-full bg-green-800 hover:bg-green-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 border border-green-600/30"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce-in">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-16 right-2 z-50 w-64 sm:w-72 bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-green-800/40 flex flex-col overflow-hidden animate-chat-open" style={{ maxHeight: "20rem" }}>
          {/* Header */}
          <div className="px-4 py-2.5 bg-black/40 border-b border-green-800/30 flex items-center justify-between">
            <span className="text-amber-200 font-bold text-sm">{t.chat}</span>
            <span className="text-green-400/60 text-xs">{messages.length} msg</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2" style={{ minHeight: "8rem", maxHeight: "16rem" }}>
            {messages.length === 0 && (
              <p className="text-center text-green-600/50 text-xs py-8">No messages yet</p>
            )}
            {messages.map((m, i) => {
              const isMe = m.from === playerIdx;
              return (
                <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-sm ${
                    isMe
                      ? "bg-green-700/80 text-white rounded-br-sm"
                      : "bg-gray-700/80 text-green-100 rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 bg-black/30 border-t border-green-800/30 flex gap-2">
            <input
              type="text"
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.typeMessage}
              maxLength={200}
              className="flex-1 bg-gray-800/80 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-green-600/50 placeholder:text-gray-500"
            />
            <button
              onClick={sendMessage}
              disabled={!msg.trim()}
              className="px-3 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {t.send}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Card Component ──────────────────────────────────────────────────────────
const CARD_BACK = "repeating-linear-gradient(45deg, #1e3a5f, #1e3a5f 4px, #1a3355 4px, #1a3355 8px)";

function Card({ card, faceDown, selected, onClick, size = "normal", disabled, style, className: extraCls = "" }) {
  const sz = size === true || size === "small" ? "small" : (size === "medium" ? "medium" : "normal");

  if (faceDown) {
    return (
      <div className={`bura-card bura-card-${sz} game-card flex-shrink-0 ${extraCls}`}
        style={{ background: CARD_BACK, ...style }}>
        <div className="card-back-inner" />
      </div>
    );
  }

  const rank = cardRank(card), suit = cardSuit(card), red = isRed(card);
  const colorCls = red ? "card-red" : "card-black";
  return (
    <div onClick={disabled ? undefined : onClick}
      className={`bura-card bura-card-${sz} game-card flex-shrink-0 bg-[#e8e4dc] ${colorCls}
        ${selected ? "card-selected" : ""}
        ${!disabled && onClick ? "card-clickable" : ""}
        ${disabled ? "card-disabled" : ""} ${extraCls}`}
      style={style}>
      <div className="card-corner">
        <span className="card-corner-rank">{rank}</span>
        <span className="card-corner-suit">{suit}</span>
      </div>
      <div className="card-center-suit">{suit}</div>
    </div>
  );
}

// ─── Language Toggle ─────────────────────────────────────────────────────────
function LangToggle({ lang, setLang }) {
  const t = useT();
  return (
    <button onClick={() => setLang(lang === "en" ? "ka" : "en")}
      className="px-2 py-0.5 rounded text-xs font-bold bg-black/30 text-amber-200 hover:bg-black/50 transition-colors border border-green-800/40">
      {t.langSwitch}
    </button>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("bura_lang") || "en"; } catch { return "en"; }
  });
  useEffect(() => { try { localStorage.setItem("bura_lang", lang); } catch {} }, [lang]);

  return (
    <LangContext.Provider value={lang}>
      <GameInner lang={lang} setLang={setLang} />
    </LangContext.Provider>
  );
}

function GameInner({ lang, setLang }) {
  const t = useT();
  const [gameId, setGameId] = useState(getGameIdFromURL);
  const [playerIdx, setPlayerIdx] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [phase, setPhase] = useState("menu");
  const [selectedCards, setSelectedCards] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [opponentEverConnected, setOpponentEverConnected] = useState(false);
  const [lobbyPlayTo, setLobbyPlayTo] = useState(11);
  const [collectingTrick, setCollectingTrick] = useState(null); // { cards, winner } during collect animation
  const prevHandRef = useRef([]);
  const prevOppHandRef = useRef([]);
  const [dealAnimKey, setDealAnimKey] = useState(0);
  const [dealingCards, setDealingCards] = useState(null); // { myCards: [], opCards: [], trumpCard, phase: 0..6, done: false }
  const playerIdxRef = useRef(playerIdx);
  const gameIdRef = useRef(gameId);
  const phaseRef = useRef(phase);
  const tabIdRef = useRef(crypto.randomUUID().slice(0, 8));

  useEffect(() => { playerIdxRef.current = playerIdx; }, [playerIdx]);
  useEffect(() => { gameIdRef.current = gameId; }, [gameId]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const unsubRef = useRef(null);
  const heartbeatRef = useRef(null);

  const handleStateUpdate = useCallback((value) => {
    if (!value) return;
    try {
      const state = typeof value === "string" ? JSON.parse(value) : value;
      const myIdx = playerIdxRef.current;
      if (myIdx !== null) {
        const opConnected = Date.now() - (state.lastActivity?.[1 - myIdx] || 0) < DISCONNECT_TIMEOUT;
        setOpponentConnected(opConnected);
        if (opConnected) setOpponentEverConnected(true);
      }
      setGameState({ ...state });
      const cur = phaseRef.current;
      if (state.phase === "playing" && cur !== "playing") setPhase("playing");
      if (state.phase === "matchover") setPhase("matchover");
      if (state.players === 2 && cur === "lobby") setPhase("playing");
    } catch {}
  }, []);

  const startSync = useCallback((gid) => {
    // Unsubscribe previous
    if (unsubRef.current) unsubRef.current();
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);

    const key = storageKey(gid);

    // Subscribe to live WS updates
    if (window.storage.subscribe) {
      unsubRef.current = window.storage.subscribe(key, handleStateUpdate);
    }

    // Heartbeat: send our lastActivity every few seconds
    heartbeatRef.current = setInterval(async () => {
      const myIdx = playerIdxRef.current;
      if (myIdx === null) return;
      const fresh = await loadGameState(gid);
      if (!fresh) return;
      const now = Date.now();
      // Check opponent
      const opConnected = now - (fresh.lastActivity?.[1 - myIdx] || 0) < DISCONNECT_TIMEOUT;
      setOpponentConnected(opConnected);
      if (opConnected) setOpponentEverConnected(true);
      // Update our heartbeat
      if (now - fresh.lastActivity[myIdx] > 3000) {
        fresh.lastActivity[myIdx] = now;
        saveGameState(gid, fresh);
      }
      // If no WS subscribe, also sync state here as fallback
      if (!window.storage.subscribe) {
        setGameState({ ...fresh });
        const cur = phaseRef.current;
        if (fresh.phase === "playing" && cur !== "playing") setPhase("playing");
        if (fresh.phase === "matchover") setPhase("matchover");
        if (fresh.players === 2 && cur === "lobby") setPhase("playing");
      }
    }, HEARTBEAT_INTERVAL);
  }, [handleStateUpdate]);

  useEffect(() => () => {
    if (unsubRef.current) unsubRef.current();
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
  }, []);

  const joinGame = useCallback(async (gid) => {
    const s = await loadGameState(gid);
    if (!s) { setStatusMsg(t.gameNotFound); setTimeout(() => setStatusMsg(""), 3000); return; }
    const myTabId = tabIdRef.current;
    const now = Date.now();

    // Helper: claim a player slot
    const claimSlot = async (idx) => {
      setPlayerIdx(idx); playerIdxRef.current = idx;
      setGameId(gid); gameIdRef.current = gid; setGameIdInURL(gid);
      s.lastActivity[idx] = now;
      if (s.tabIds) s.tabIds[idx] = myTabId;
      try { localStorage.setItem(`bura_slot_${gid}`, String(idx)); } catch {}
      await saveGameState(gid, s);
      setGameState(s); setPhase(s.phase === "lobby" ? "lobby" : s.phase);
      startSync(gid);
    };

    // 1. Check if our tab ID matches an existing slot
    if (s.tabIds?.[0] === myTabId) { await claimSlot(0); return; }
    if (s.tabIds?.[1] === myTabId) { await claimSlot(1); return; }

    // 2. Check if we previously had a slot on this device (same browser, different tab)
    try {
      const savedSlot = localStorage.getItem(`bura_slot_${gid}`);
      if (savedSlot !== null) {
        const idx = Number(savedSlot);
        if (idx === 0 || idx === 1) {
          await claimSlot(idx); return;
        }
      }
    } catch {}

    // 3. Game not full yet — join as player 1
    if (s.players < 2) {
      s.players = 2; s.phase = "playing"; s.handPhase = "ready"; s.playersReady = [false, false];
      await claimSlot(1); return;
    }

    // 4. Game is full — check if either player is disconnected, take their slot
    for (const idx of [1, 0]) {
      const lastActive = s.lastActivity?.[idx] || 0;
      if (now - lastActive > DISCONNECT_TIMEOUT) {
        await claimSlot(idx); return;
      }
    }

    // 5. Truly full with both players active
    setStatusMsg(t.gameFull); setTimeout(() => setStatusMsg(""), 3000);
  }, [startSync, t]);

  const createGame = useCallback(async () => {
    const gid = crypto.randomUUID().slice(0, 8);
    const seed = Math.floor(Math.random() * 2147483647);
    const state = {
      ...initMatchState(seed, lobbyPlayTo, 0),
      phase: "lobby", players: 1,
      lastActivity: [Date.now(), 0],
      tabIds: [tabIdRef.current, null],
    };
    setGameId(gid); setPlayerIdx(0); playerIdxRef.current = 0; gameIdRef.current = gid;
    setGameState(state); setPhase("lobby"); setGameIdInURL(gid);
    try { localStorage.setItem(`bura_slot_${gid}`, "0"); } catch {}
    await saveGameState(gid, state); startSync(gid);
  }, [startSync, lobbyPlayTo]);

  useEffect(() => {
    const urlGameId = getGameIdFromURL();
    if (urlGameId) { setGameId(urlGameId); joinGame(urlGameId); }
  }, [joinGame]);

  const [joinCode, setJoinCode] = useState("");

  const leadPhaseRef = useRef(gameState?.leadPhase);
  useEffect(() => { leadPhaseRef.current = gameState?.leadPhase; }, [gameState?.leadPhase]);

  const toggleCard = useCallback((card) => {
    setSelectedCards((prev) => {
      if (prev.includes(card)) return prev.filter((c) => c !== card);
      if (prev.length >= 3) return prev;
      if (leadPhaseRef.current && prev.length > 0 && cardSuit(card) !== cardSuit(prev[0])) return prev;
      return [...prev, card];
    });
  }, []);

  const checkSpecials = useCallback((state, t) => {
    for (let i = 0; i < 2; i++) {
      const sp = detectSpecial(state.hands[i], state.trumpSuit);
      if (sp) state.declared[i] = sp;
    }
    const d0 = state.declared[0], d1 = state.declared[1];
    if (d0 === "bura") { state.handPhase = "handover"; state.handWinner = 0; state.handWinReason = t.buraWin; return true; }
    if (d1 === "bura") { state.handPhase = "handover"; state.handWinner = 1; state.handWinReason = t.buraWin; return true; }
    if (d0 && d1) { state.turn = (SPECIAL_PRIORITY[d0] || 0) >= (SPECIAL_PRIORITY[d1] || 0) ? 0 : 1; }
    else if (d0) { state.turn = 0; } else if (d1) { state.turn = 1; }
    state.declared = [null, null];
    return false;
  }, []);

  const awardHandPoints = useCallback((state, winner) => {
    if (winner === -1) return;
    state.matchScores[winner] += stakePoints(state.stakeLevel);
    if (state.matchScores[winner] >= state.playTo) { state.phase = "matchover"; state.handPhase = "handover"; }
  }, []);

  const startNextHand = useCallback(async () => {
    if (!gameState || !gameId) return;
    const newDealer = gameState.handWinner === -1 ? gameState.dealer : gameState.handWinner;
    const hand = initHandState(Math.floor(Math.random() * 2147483647), newDealer);
    const newState = {
      ...gameState, ...hand,
      phase: "playing",
      handPhase: "ready", // waiting for both players to press start
      playersReady: [false, false],
      lastActivity: [Date.now(), Date.now()],
    };
    setGameState(newState); setSelectedCards([]); setPhase("playing");
    saveGameState(gameId, newState);
  }, [gameState, gameId]);

  const playCards = useCallback(async () => {
    if (!gameState || playerIdx === null || selectedCards.length === 0 || gameState.doublingPhase) return;
    const state = {
      ...gameState,
      hands: gameState.hands.map(h => [...h]),
      stock: [...gameState.stock],
      scorePiles: gameState.scorePiles.map(p => [...p]),
      matchScores: [...gameState.matchScores],
    };
    const myIdx = playerIdx;
    if (state.turn !== myIdx) { setStatusMsg(t.notYourTurn); setTimeout(() => setStatusMsg(""), 2000); return; }

    if (state.leadPhase) {
      const leadSuit = cardSuit(selectedCards[0]);
      if (!selectedCards.every((c) => cardSuit(c) === leadSuit)) { setStatusMsg(t.allLeadSameSuit); setTimeout(() => setStatusMsg(""), 2000); return; }
      const opH = state.hands[1 - myIdx].length;
      if (selectedCards.length > opH) { setStatusMsg(t.oppOnlyHas(opH)); setTimeout(() => setStatusMsg(""), 2000); return; }
      state.currentTrick = { lead: [...selectedCards], response: [], leaderIdx: myIdx, requiredCount: selectedCards.length };
      state.hands[myIdx] = state.hands[myIdx].filter((c) => !selectedCards.includes(c));
      state.turn = 1 - myIdx; state.leadPhase = false;
      state.moveCount++; state.lastActivity[myIdx] = Date.now();
    } else {
      const req = state.currentTrick.requiredCount || state.currentTrick.lead.length;
      if (selectedCards.length !== req) { setStatusMsg(t.mustPlayExactly(req)); setTimeout(() => setStatusMsg(""), 2000); return; }
      state.currentTrick.response = [...selectedCards];
      state.hands[myIdx] = state.hands[myIdx].filter((c) => !selectedCards.includes(c));
      const leaderIdx = state.currentTrick.leaderIdx;
      const tr = resolveTrick(state.currentTrick.lead, state.currentTrick.response, state.trumpSuit);
      const tw = tr === 0 ? leaderIdx : 1 - leaderIdx;
      const responderWon = tw !== leaderIdx; // responder beat the lead

      if (responderWon) {
        // Showdown: responder beat the cards — show for 4 seconds
        state.trickShowdown = {
          lead: state.currentTrick.lead,
          response: state.currentTrick.response,
          leaderIdx,
          winner: tw,
          resolveAt: Date.now() + 3000,
        };
      } else {
        // Leader wins (responder couldn't beat) — show collect animation, then resolve
        const trickCards = [...state.currentTrick.lead, ...state.currentTrick.response];
        setCollectingTrick({ lead: state.currentTrick.lead, response: state.currentTrick.response, leaderIdx, winner: tw });
        // Delay actual state resolution to let collect animation play
        setTimeout(() => {
          setCollectingTrick(null);
          const freshState = { ...state };
          freshState.lastTrick = { lead: state.currentTrick.lead, response: state.currentTrick.response, leaderIdx, winner: tw };
          freshState.scorePiles[tw] = [...freshState.scorePiles[tw], ...trickCards];
          freshState.turn = tw;
          freshState.currentTrick = { lead: [], response: [], leaderIdx: null };
          replenishHands(freshState);
          const go = checkSpecials(freshState, t);
          if (go) { awardHandPoints(freshState, freshState.handWinner); }
          else if (freshState.hands[0].length === 0 && freshState.hands[1].length === 0) {
            const p0 = pilePoints(freshState.scorePiles[0]), p1 = pilePoints(freshState.scorePiles[1]);
            freshState.handPhase = "handover";
            if (p0 > p1) { freshState.handWinner = 0; freshState.handWinReason = t.winsWithPts(p0, p1); }
            else if (p1 > p0) { freshState.handWinner = 1; freshState.handWinReason = t.winsWithPts(p1, p0); }
            else { freshState.handWinner = -1; freshState.handWinReason = t.drawRedeal; }
            awardHandPoints(freshState, freshState.handWinner);
          } else { freshState.leadPhase = true; }
          freshState.moveCount++;
          setGameState(freshState);
          saveGameState(gameId, freshState);
        }, 1000);
      }
      state.moveCount++; state.lastActivity[myIdx] = Date.now();
    }
    setSelectedCards([]); setGameState(state);
    saveGameState(gameId, state); // fire-and-forget — no await
  }, [gameState, playerIdx, selectedCards, gameId, checkSpecials, awardHandPoints, t]);

  // ── Resolve trick showdown after delay ──
  const resolveTrickShowdown = useCallback(async () => {
    if (!gameState || !gameId || !gameState.trickShowdown) return;
    const sd = gameState.trickShowdown;

    // Start collect animation
    setCollectingTrick({ lead: sd.lead, response: sd.response, leaderIdx: sd.leaderIdx, winner: sd.winner });

    // Clear showdown immediately so it stops rendering
    const preState = { ...gameState, trickShowdown: null };
    setGameState(preState);

    // After collect animation, resolve the trick
    setTimeout(() => {
      setCollectingTrick(null);
      const state = {
        ...preState,
        hands: preState.hands.map(h => [...h]),
        stock: [...preState.stock],
        scorePiles: preState.scorePiles.map(p => [...p]),
        matchScores: [...preState.matchScores],
      };

      state.lastTrick = { lead: sd.lead, response: sd.response, leaderIdx: sd.leaderIdx, winner: sd.winner };
      state.scorePiles[sd.winner] = [...state.scorePiles[sd.winner], ...sd.lead, ...sd.response];
      state.turn = sd.winner;
      state.currentTrick = { lead: [], response: [], leaderIdx: null };

      replenishHands(state);
      const go = checkSpecials(state, t);
      if (go) { awardHandPoints(state, state.handWinner); }
      else if (state.hands[0].length === 0 && state.hands[1].length === 0) {
        const p0 = pilePoints(state.scorePiles[0]), p1 = pilePoints(state.scorePiles[1]);
        state.handPhase = "handover";
        if (p0 > p1) { state.handWinner = 0; state.handWinReason = t.winsWithPts(p0, p1); }
        else if (p1 > p0) { state.handWinner = 1; state.handWinReason = t.winsWithPts(p1, p0); }
        else { state.handWinner = -1; state.handWinReason = t.drawRedeal; }
        awardHandPoints(state, state.handWinner);
      } else { state.leadPhase = true; }

      state.moveCount++;
      setGameState(state);
      saveGameState(gameId, state);
    }, 1000);
  }, [gameState, gameId, checkSpecials, awardHandPoints, t]);

  // Auto-resolve showdown after timer
  useEffect(() => {
    if (!gameState?.trickShowdown) return;
    const remaining = gameState.trickShowdown.resolveAt - Date.now();
    const delay = Math.max(remaining, 100);
    const timer = setTimeout(() => { resolveTrickShowdown(); }, delay);
    return () => clearTimeout(timer);
  }, [gameState?.trickShowdown?.resolveAt, resolveTrickShowdown]);

  // ── Deal animation: purely local overlay when handPhase transitions to "playing" ──
  const prevHandPhaseRef = useRef(null);
  useEffect(() => {
    const prev = prevHandPhaseRef.current;
    const cur = gameState?.handPhase;
    prevHandPhaseRef.current = cur;

    // Trigger deal animation when transitioning from ready → playing
    if (prev === "ready" && cur === "playing" && gameState && playerIdx !== null) {
      const myIdx = playerIdx;
      const opIdx = 1 - playerIdx;
      const myCards = gameState.hands[myIdx] || [];
      const opCards = gameState.hands[opIdx] || [];
      const dealerIdx = gameState.dealer;
      const firstIdx = 1 - dealerIdx;
      const sequence = [];
      for (let i = 0; i < 3; i++) {
        sequence.push({ target: firstIdx, cardIdx: i });
        sequence.push({ target: 1 - firstIdx, cardIdx: i });
      }

      setDealingCards({ myCards: [], opCards: [], trumpCard: gameState.trumpCard, done: false });

      const timers = [];
      sequence.forEach((step, i) => {
        timers.push(setTimeout(() => {
          setDealingCards(prev => {
            if (!prev) return prev;
            const next = { ...prev, myCards: [...prev.myCards], opCards: [...prev.opCards] };
            if (step.target === myIdx) next.myCards.push(myCards[step.cardIdx]);
            else next.opCards.push(opCards[step.cardIdx]);
            return next;
          });
        }, 500 + i * 500));
      });

      timers.push(setTimeout(() => {
        setDealingCards(prev => prev ? { ...prev, done: true } : prev);
      }, 500 + sequence.length * 500 + 600));

      timers.push(setTimeout(() => {
        setDealingCards(null);
      }, 500 + sequence.length * 500 + 1200));

      return () => { timers.forEach(clearTimeout); setDealingCards(null); };
    }
  }, [gameState?.handPhase, playerIdx]);

  const claim31 = useCallback(async () => {
    if (!gameState || playerIdx === null) return;
    const state = { ...gameState, matchScores: [...gameState.matchScores] };
    const pts = pilePoints(state.scorePiles[playerIdx]);
    state.handPhase = "handover";
    if (pts >= 31) { state.handWinner = playerIdx; state.handWinReason = t.claimed31had(pts); }
    else { state.handWinner = 1 - playerIdx; state.handWinReason = t.claimed31only(pts); }
    awardHandPoints(state, state.handWinner);
    state.moveCount++;
    setGameState(state); saveGameState(gameId, state);
  }, [gameState, playerIdx, gameId, awardHandPoints, t]);

  const canDouble = useMemo(() => {
    if (!gameState || playerIdx === null) return false;
    if (gameState.handPhase !== "playing" || gameState.doublingPhase) return false;
    if (gameState.turn !== playerIdx || gameState.stakeLevel >= 5) return false;
    if (gameState.doublingRights !== null && gameState.doublingRights !== playerIdx) return false;
    const sc = gameState.matchScores, tgt = gameState.playTo;
    if (sc[0] >= tgt - 1 || sc[1] >= tgt - 1) return false;
    return true;
  }, [gameState, playerIdx]);

  const proposeDouble = useCallback(async () => {
    if (!canDouble || !gameState || playerIdx === null) return;
    const state = { ...gameState, matchScores: [...gameState.matchScores] };
    state.doublingPhase = { proposer: playerIdx, proposedLevel: state.stakeLevel + 1 };
    state.moveCount++; state.lastActivity[playerIdx] = Date.now();
    setGameState(state); saveGameState(gameId, state);
  }, [canDouble, gameState, playerIdx, gameId]);

  const respondToDouble = useCallback(async (accept) => {
    if (!gameState || playerIdx === null || !gameState.doublingPhase) return;
    const { proposer, proposedLevel } = gameState.doublingPhase;
    // Only the non-proposer can respond
    if (proposer === playerIdx) return;
    // Re-read fresh state to avoid stale closure issues
    const fresh = await loadGameState(gameId);
    if (!fresh || !fresh.doublingPhase) return; // already resolved
    const state = { ...fresh, matchScores: [...fresh.matchScores] };
    if (accept) {
      state.stakeLevel = proposedLevel;
      // After accepting, the ACCEPTOR gets next doubling rights
      state.doublingRights = playerIdx;
      state.doublingPhase = null;
    } else {
      state.handPhase = "handover"; state.handWinner = proposer;
      state.handWinReason = t.oppDeclined(STAKE_LEVELS[proposedLevel].label);
      state.doublingPhase = null;
      awardHandPoints(state, proposer);
    }
    state.moveCount++; state.lastActivity[playerIdx] = Date.now();
    setGameState(state); saveGameState(gameId, state);
  }, [gameState, playerIdx, gameId, awardHandPoints, t]);

  const newMatch = useCallback(async () => {
    if (!gameId) return;
    const state = {
      ...initMatchState(Math.floor(Math.random() * 2147483647), gameState?.playTo || 11, 0),
      phase: "playing", players: 2,
      handPhase: "ready",
      playersReady: [false, false],
      isNewMatch: true,
      lastActivity: [Date.now(), Date.now()],
      tabIds: gameState?.tabIds || [null, null],
    };
    setGameState(state); setSelectedCards([]); setPhase("playing");
    saveGameState(gameId, state);
  }, [gameId, gameState]);

  const backToMenu = useCallback(() => {
    if (unsubRef.current) unsubRef.current();
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    setGameId(null); setPlayerIdx(null); setGameState(null);
    setPhase("menu"); setSelectedCards([]); setStatusMsg("");
    setOpponentConnected(false); setOpponentEverConnected(false);
    setDealingCards(null); setCollectingTrick(null);
    // Clear URL
    const url = new URL(window.location);
    url.searchParams.delete("game");
    window.history.replaceState({}, "", url);
  }, []);

  const [confirmStart, setConfirmStart] = useState(false);
  // Reset confirm when entering a new ready phase
  const readyMoveCount = gameState?.handPhase === "ready" ? gameState.moveCount : null;
  useEffect(() => { setConfirmStart(false); }, [readyMoveCount]);

  const pressReady = useCallback(async () => {
    if (!gameState || playerIdx === null || !gameId) return;
    // First click = confirm, second click = actually ready
    if (!confirmStart) { setConfirmStart(true); return; }
    setConfirmStart(false);
    const state = { ...gameState, playersReady: [...(gameState.playersReady || [false, false])] };
    state.playersReady[playerIdx] = true;
    if (state.playersReady[0] && state.playersReady[1]) {
      state.handPhase = "playing";
      state.isNewMatch = false;
    }
    state.moveCount++;
    state.lastActivity[playerIdx] = Date.now();
    setGameState(state);
    saveGameState(gameId, state); // fire-and-forget
  }, [gameState, playerIdx, gameId, confirmStart]);

  const shareURL = useMemo(() => {
    if (!gameId) return "";
    const url = new URL(window.location); url.searchParams.set("game", gameId); return url.toString();
  }, [gameId]);

  const myHand = gameState?.hands?.[playerIdx] || [];
  const opHand = gameState?.hands?.[playerIdx === null ? 0 : 1 - playerIdx] || [];
  const isMyTurn = gameState?.turn === playerIdx;
  const myScorePile = gameState?.scorePiles?.[playerIdx] || [];
  const opScorePile = gameState?.scorePiles?.[playerIdx === null ? 0 : 1 - playerIdx] || [];
  const myMatchScore = gameState?.matchScores?.[playerIdx] || 0;
  const opMatchScore = gameState?.matchScores?.[playerIdx === null ? 0 : 1 - playerIdx] || 0;

  // Detect new cards dealt to hands — bump dealAnimKey to re-trigger deal animation
  const newMyCards = useMemo(() => myHand.filter(c => !prevHandRef.current.includes(c)), [myHand]);
  const newOpCards = useMemo(() => {
    const prevLen = prevOppHandRef.current.length;
    return opHand.length > prevLen ? opHand.length - prevLen : 0;
  }, [opHand]);

  useEffect(() => {
    if (newMyCards.length > 0 || newOpCards > 0) {
      setDealAnimKey(k => k + 1);
    }
    prevHandRef.current = myHand;
    prevOppHandRef.current = opHand;
  }, [myHand, opHand, newMyCards, newOpCards]);

  const TABLE_BG = { background: "radial-gradient(ellipse at center, #1a4d2e 0%, #0d2818 70%, #091a10 100%)" };

  // ── MENU ──
  if (phase === "menu") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={TABLE_BG}>
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 sm:p-12 max-w-md w-full mx-4 border border-green-900/50 shadow-2xl">
          <div className="flex justify-end mb-2"><LangToggle lang={lang} setLang={setLang} /></div>
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-amber-100 mb-2" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{t.title}</h1>
          <p className="text-center text-green-200/70 mb-4 text-sm">{t.subtitle}</p>
          <div className="bg-amber-900/30 border border-amber-700/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-amber-200/90 text-sm text-center leading-relaxed">{t.greeting}</p>
          </div>
          <div className="mb-6">
            <p className="text-green-200/70 text-sm mb-2 text-center">{t.playTo}</p>
            <div className="flex justify-center gap-3">
              {[6, 11].map((n) => (
                <button key={n} onClick={() => setLobbyPlayTo(n)}
                  className={`px-6 py-2 rounded-xl font-semibold text-sm transition-colors ${lobbyPlayTo === n ? "bg-amber-600 text-white shadow-lg" : "bg-black/30 text-green-300 border border-green-800/50 hover:bg-black/40"}`}>
                  {n} {t.points}
                </button>
              ))}
            </div>
          </div>
          <button onClick={createGame} className="w-full py-3 px-6 bg-amber-700 hover:bg-amber-600 text-white font-semibold rounded-xl mb-4 transition-colors shadow-lg text-lg">{t.createGame}</button>
          <div className="flex gap-2">
            <input type="text" placeholder={t.enterCode} value={joinCode} onChange={(e) => setJoinCode(e.target.value.trim())}
              className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-green-800/50 text-green-100 placeholder-green-700 focus:outline-none focus:border-amber-600" />
            <button onClick={() => joinCode && joinGame(joinCode)} className="px-6 py-3 bg-green-800 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors">{t.join}</button>
          </div>
          {statusMsg && <p className="text-red-400 text-center mt-4 text-sm">{statusMsg}</p>}
        </div>
      </div>
    );
  }

  // ── LOBBY ──
  if (phase === "lobby") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={TABLE_BG}>
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 sm:p-12 max-w-md w-full mx-4 border border-green-900/50 shadow-2xl text-center">
          <div className="flex justify-end mb-2"><LangToggle lang={lang} setLang={setLang} /></div>
          <h2 className="text-2xl font-bold text-amber-100 mb-2">{t.waitingForOpponent}</h2>
          <p className="text-green-300/70 text-sm mb-6">{t.playingTo(gameState?.playTo || lobbyPlayTo)}</p>
          <div className="mb-6">
            <p className="text-green-200/70 text-sm mb-2">{t.shareCode}</p>
            <div className="bg-black/40 rounded-xl p-4 border border-green-800/50">
              <span className="text-2xl font-mono text-amber-300 tracking-widest">{gameId}</span>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-green-200/70 text-sm mb-2">{t.shareLink}</p>
            <div className="bg-black/40 rounded-xl p-3 border border-green-800/50 break-all">
              <span className="text-green-300 text-xs">{shareURL}</span>
            </div>
            <button onClick={() => navigator.clipboard?.writeText(shareURL)}
              className="mt-2 px-4 py-1.5 bg-green-800/50 hover:bg-green-700/50 text-green-200 text-sm rounded-lg transition-colors">{t.copyLink}</button>
          </div>
          <div className="flex items-center justify-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm">{t.waiting}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── GAME SCREEN ──
  const sd = gameState?.trickShowdown;
  const trickLead = sd ? sd.lead : (gameState?.currentTrick?.lead || []);
  const trickResponse = sd ? sd.response : (gameState?.currentTrick?.response || []);
  const leaderIdx = sd ? sd.leaderIdx : gameState?.currentTrick?.leaderIdx;
  const showdownWinner = sd ? sd.winner : null;

  let myTrickCards = [], opTrickCards = [];
  let iAmResponder = false, opIsResponder = false;
  if (leaderIdx === playerIdx) { myTrickCards = trickLead; opTrickCards = trickResponse; opIsResponder = true; }
  else if (leaderIdx === 1 - playerIdx) { opTrickCards = trickLead; myTrickCards = trickResponse; iAmResponder = true; }

  const isPlaying = gameState?.handPhase === "playing" && gameState?.phase === "playing";
  const inShowdown = !!sd;
  // Response cards are hidden unless it's a showdown (responder beat the leader)
  const hideMyResponse = iAmResponder && !inShowdown;
  const hideOpResponse = opIsResponder && !inShowdown;
  const canPlay = isMyTurn && selectedCards.length > 0 && isPlaying && !gameState?.doublingPhase && !inShowdown && !collectingTrick;
  const reqResp = !gameState?.leadPhase ? (gameState?.currentTrick?.requiredCount || trickLead.length) : 0;
  const doublingForMe = gameState?.doublingPhase && gameState.doublingPhase.proposer !== playerIdx;
  const doublingWaiting = gameState?.doublingPhase && gameState.doublingPhase.proposer === playerIdx;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={TABLE_BG}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/50 border-b border-green-900/40 z-10">
        {/* Left: score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-amber-200 font-bold text-sm">{t.title}</span>
            <span className="text-green-700 text-[10px]">#{gameId}</span>
          </div>
          <div className="flex items-center bg-black/40 rounded-lg px-2.5 py-1 gap-2">
            <div className="flex flex-col items-center leading-none">
              <span className="text-[10px] text-green-400/60">{t.you}</span>
              <span className="text-lg font-bold text-amber-300">{myMatchScore}</span>
            </div>
            <div className="flex flex-col items-center leading-none">
              <span className="text-[10px] text-green-400/40">/{gameState?.playTo}</span>
              <span className="text-green-600 text-xs font-bold">vs</span>
            </div>
            <div className="flex flex-col items-center leading-none">
              <span className="text-[10px] text-green-400/60">{t.opp}</span>
              <span className="text-lg font-bold text-green-300">{opMatchScore}</span>
            </div>
          </div>
        </div>

        {/* Center: stake + turn */}
        <div className="flex flex-col items-center gap-0.5">
          {gameState?.stakeLevel > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-700/80 text-white">
              {stakeDisplayName(gameState.stakeLevel, t)}
            </span>
          )}
          {isPlaying && !gameState?.doublingPhase && (
            <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${isMyTurn ? "bg-amber-600/80 text-white" : "bg-black/30 text-green-400/70"}`}>
              {isMyTurn ? (gameState?.leadPhase ? t.yourTurnLead : t.yourTurnRespond) : (gameState?.leadPhase ? t.oppTurnLead : t.oppResponding)}
            </span>
          )}
        </div>

        {/* Right: status + actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${opponentConnected ? "bg-green-400" : "bg-red-400 animate-pulse"}`} />
            <span className={`text-[10px] ${opponentConnected ? "text-green-400" : "text-red-300"}`}>{opponentConnected ? t.online : t.offline}</span>
          </div>
          {isPlaying && (
            <button onClick={claim31} className="px-2 py-1 bg-red-700/80 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition-colors leading-none">{t.claim31}</button>
          )}
          <LangToggle lang={lang} setLang={setLang} />
        </div>
      </div>

      {statusMsg && <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 text-white px-4 py-2 rounded-lg text-sm shadow-lg">{statusMsg}</div>}

      {/* Opponent disconnected banner */}
      {!opponentConnected && opponentEverConnected && gameState?.phase === "playing" && (
        <div className="bg-red-900/80 border-b border-red-700/50 px-4 py-3 text-center z-20">
          <p className="text-white font-bold text-sm">{t.oppDisconnected}</p>
          <p className="text-red-200/70 text-xs mt-0.5">{t.oppDisconnectedSub}</p>
        </div>
      )}

      {/* Turn indicator removed — now shown in header */}

      {/* Doubling proposal overlay */}
      {doublingForMe && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-6 max-w-xs w-full mx-4 border border-amber-700/30 shadow-2xl text-center">
            <p className="text-amber-100 text-lg font-bold mb-2">{STAKE_LEVELS[gameState.doublingPhase.proposedLevel]?.label}</p>
            <p className="text-green-300/80 text-sm mb-4">{t.proposeRaise(stakeDisplayName(gameState.doublingPhase.proposedLevel, t))}</p>
            <p className="text-green-400/60 text-xs mb-4">{t.declineInfo(stakePoints(gameState.stakeLevel))}</p>
            <div className="flex gap-3">
              <button onClick={() => respondToDouble(true)} className="flex-1 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors">{t.accept}</button>
              <button onClick={() => respondToDouble(false)} className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors">{t.decline}</button>
            </div>
          </div>
        </div>
      )}

      {doublingWaiting && (
        <div className="text-center py-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-700/60 text-amber-100 animate-pulse">
            {t.waitingForDoubleResp(STAKE_LEVELS[gameState.doublingPhase.proposedLevel]?.label)}
          </span>
        </div>
      )}

      {/* Main game area — sidebar + center */}
      <div className="flex-1 flex pb-2 overflow-hidden">

        {/* Left sidebar: Trump + Stock */}
        <div className="flex flex-col items-center justify-center gap-4 px-2 sm:px-4 py-3 border-r border-green-900/30 bg-black/15 flex-shrink-0 w-24 sm:w-32">
          {/* Trump */}
          {gameState?.trumpCard && (
            <div className="flex flex-col items-center">
              <span className="text-amber-300/90 text-xs sm:text-sm font-bold mb-1.5 tracking-wide">{t.trump}</span>
              <div className="trump-glow rounded-lg">
                <Card card={gameState.trumpCard} size="medium" />
              </div>
            </div>
          )}
          {/* Stock */}
          <div className="flex flex-col items-center">
            <span className="text-green-300/80 text-xs sm:text-sm font-bold mb-1.5 tracking-wide">{t.stock}</span>
            <div className="relative">
              {gameState?.stock?.length > 0 ? (
                <>
                  {/* Stacked stock cards */}
                  {Array.from({ length: Math.min(3, Math.ceil(gameState.stock.length / 10)) }).map((_, i) => (
                    <div key={`stk-${i}`} className="absolute w-14 sm:w-16 h-[4.9rem] sm:h-[5.6rem] rounded-lg border border-gray-600"
                      style={{ background: CARD_BACK, top: -i * 2, left: i * 1.5, zIndex: i }} />
                  ))}
                  <Card faceDown size="medium" />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-amber-200 text-xs font-bold px-2 py-0.5 rounded-full z-10">{gameState.stock.length}</span>
                </>
              ) : (
                <div className="w-14 sm:w-16 h-[4.9rem] sm:h-[5.6rem] rounded-lg border-2 border-dashed border-green-800/30 flex items-center justify-center">
                  <span className="text-green-700/50 text-xs">{t.empty}</span>
                </div>
              )}
            </div>
          </div>
          {/* Last trick badge */}
          {gameState?.lastTrick && (
            <div className="flex flex-col items-center">
              <span className="text-green-300/80 text-xs font-semibold mb-1">{t.lastTrick}</span>
              <div className={`rounded-lg px-2 py-1 text-xs font-bold ${gameState.lastTrick.winner === playerIdx ? "bg-green-800/60 text-green-200" : "bg-red-900/50 text-red-200"}`}>
                {gameState.lastTrick.winner === playerIdx ? t.youWon : t.oppWon}
              </div>
            </div>
          )}
        </div>

        {/* Center: Hands + Tricks + Piles */}
        <div className="flex-1 flex flex-col justify-between px-2 sm:px-4 min-w-0">

          {/* Opponent hand + pile row */}
          <div className="flex items-center justify-center gap-2 py-2 pr-14">
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="text-green-300/70 text-[10px] font-semibold mb-0.5">{t.oppPile}</span>
              <div className={`relative w-10 h-[3.5rem] ${opScorePile.length > 0 ? "animate-pile-collect" : ""}`} key={opScorePile.length}>
                {opScorePile.length > 0 ? (
                  <>
                    {Array.from({ length: Math.min(opScorePile.length, 4) }).map((_, i) => (
                      <div key={`ops-${i}`} className="absolute w-10 h-[3.5rem] rounded-md border border-gray-600 shadow-sm"
                        style={{ background: CARD_BACK, top: -i * 1.5, left: i * 0.5 }} />
                    ))}
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">{opScorePile.length}</span>
                  </>
                ) : (
                  <div className="w-10 h-[3.5rem] rounded-md border border-dashed border-green-800/25" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {opHand.map((_, i) => (
                <div key={`op-${dealAnimKey}-${i}`} className="animate-slide-deal-opp" style={{ animationDelay: `${i * 200}ms` }}>
                  <Card faceDown size="small" style={{ marginLeft: i > 0 ? "-0.4rem" : 0 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Trick area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2 relative min-h-[10rem]">
            {/* Showdown winner badge */}
            {inShowdown && (
              <div className="absolute top-1 left-1/2 z-20 animate-badge-bounce">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-lg ${showdownWinner === playerIdx ? "bg-green-600 text-white" : "bg-red-700 text-white"}`}>
                  {showdownWinner === playerIdx ? t.youWon : t.oppWon}
                </span>
              </div>
            )}

            {/* Collect animation overlay — cards sweep to winner's pile */}
            {collectingTrick && (() => {
              const isMyWin = collectingTrick.winner === playerIdx;
              const collectX = isMyWin ? "40px" : "-40px";
              const collectY = isMyWin ? "80px" : "-80px";
              const collectLeaderIsMe = collectingTrick.leaderIdx === playerIdx;
              const myCollect = collectLeaderIsMe ? collectingTrick.lead : collectingTrick.response;
              const opCollect = collectLeaderIsMe ? collectingTrick.response : collectingTrick.lead;
              // Response cards stay face-down during non-showdown collect
              const opIsResp = !collectLeaderIsMe;
              const myIsResp = collectLeaderIsMe ? false : true;
              return (
                <>
                  {opCollect.length > 0 && (
                    <div className="flex justify-center gap-2">
                      {opCollect.map((c, i) => (
                        <div key={`col-op-${c}`} className="anim-collect"
                          style={{ '--collect-x': collectX, '--collect-y': collectY, animationDelay: `${i * 120}ms` }}>
                          {opIsResp ? <Card faceDown size="small" /> : <Card card={c} size="small" />}
                        </div>
                      ))}
                    </div>
                  )}
                  {myCollect.length > 0 && (
                    <div className="flex justify-center gap-2">
                      {myCollect.map((c, i) => (
                        <div key={`col-my-${c}`} className="anim-collect"
                          style={{ '--collect-x': collectX, '--collect-y': collectY, animationDelay: `${i * 120}ms` }}>
                          {myIsResp ? <Card faceDown size="small" /> : <Card card={c} size="small" />}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Opponent trick cards */}
            {!collectingTrick && opTrickCards.length > 0 && (
              <div className={`flex justify-center gap-2 ${inShowdown ? "animate-showdown-glow" : ""}`}>
                {opTrickCards.map((c, i) => (
                  <div key={`opt-${c}`} className="animate-trick-enter-opp" style={{ animationDelay: `${i * 180}ms` }}>
                    {hideOpResponse
                      ? <Card faceDown size="small" />
                      : <Card card={c} size="small" className={inShowdown && showdownWinner !== playerIdx ? "ring-2 ring-red-400" : ""} />
                    }
                  </div>
                ))}
              </div>
            )}

            {/* VS divider during showdown */}
            {inShowdown && opTrickCards.length > 0 && myTrickCards.length > 0 && (
              <div className="text-amber-400/60 text-xs font-bold">VS</div>
            )}

            {/* My trick cards */}
            {!collectingTrick && myTrickCards.length > 0 && (
              <div className={`flex justify-center gap-2 ${inShowdown ? "animate-showdown-glow" : ""}`}>
                {myTrickCards.map((c, i) => (
                  <div key={`myt-${c}`} className="animate-trick-enter" style={{ animationDelay: `${i * 180}ms` }}>
                    {hideMyResponse
                      ? <Card faceDown size="small" />
                      : <Card card={c} size="small" className={inShowdown && showdownWinner === playerIdx ? "ring-2 ring-green-400" : ""} />
                    }
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My hand + actions area */}
          <div className="mt-auto pb-2">
            {/* Action buttons row — above hand, clear of chat icon */}
            <div className="flex justify-center gap-3 pb-1.5 pr-14">
              {canDouble && isPlaying && !doublingWaiting && (
                <button onClick={proposeDouble} className="px-5 py-2 rounded-xl font-bold text-sm bg-red-800/80 hover:bg-red-700 text-white transition-all duration-200 shadow-lg border border-red-600/30 hover:scale-105 active:scale-95">
                  {nextStakeLabel(gameState?.stakeLevel || 0)}
                </button>
              )}
              {isMyTurn && isPlaying && !gameState?.doublingPhase && (
                <button onClick={playCards} disabled={!canPlay}
                  className={`px-8 py-2 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg ${canPlay ? "bg-amber-600 hover:bg-amber-500 hover:scale-105 active:scale-95 text-white" : "bg-gray-700/50 text-gray-500 cursor-not-allowed"}`}>
                  {gameState?.leadPhase
                    ? `${t.play} ${selectedCards.length || "?"} ${selectedCards.length !== 1 ? t.cards : t.card}`
                    : `${t.respondWith} ${selectedCards.length}/${reqResp}`}
                </button>
              )}
            </div>
            {/* Hand + pile row */}
            <div className="flex items-end justify-center gap-2 pr-14">
              <div className="flex items-end justify-center gap-1 sm:gap-2 hand-fan min-w-0">
                {myHand.map((c, i) => {
                  const isNew = newMyCards.includes(c);
                  return (
                    <div key={c} className={isNew ? "animate-slide-deal" : ""} style={isNew ? { animationDelay: `${i * 200}ms` } : {}}>
                      <Card card={c} selected={selectedCards.includes(c)} onClick={() => toggleCard(c)}
                        disabled={!isMyTurn || !isPlaying || !!gameState?.doublingPhase || inShowdown} />
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col items-center flex-shrink-0">
                <span className="text-green-300/70 text-[10px] font-semibold mb-0.5">{t.yourPile}</span>
                <div className={`relative w-10 h-[3.5rem] ${myScorePile.length > 0 ? "animate-pile-collect" : ""}`} key={myScorePile.length}>
                  {myScorePile.length > 0 ? (
                    <>
                      {Array.from({ length: Math.min(myScorePile.length, 4) }).map((_, i) => (
                        <div key={`mps-${i}`} className="absolute w-10 h-[3.5rem] rounded-md border border-gray-600 shadow-sm"
                          style={{ background: CARD_BACK, top: -i * 1.5, left: i * 0.5 }} />
                      ))}
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">{myScorePile.length}</span>
                    </>
                  ) : (
                    <div className="w-10 h-[3.5rem] rounded-md border border-dashed border-green-800/25" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dealing Animation Overlay */}
      {dealingCards && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          {/* Opponent's dealt cards (top) */}
          <div className="flex items-center justify-center gap-2 mb-8 h-24">
            {dealingCards.opCards.map((_, i) => (
              <div key={`deal-op-${i}`} className="deal-card-enter-opp" style={{ animationDelay: `${i * 50}ms` }}>
                <Card faceDown size="normal" />
              </div>
            ))}
          </div>

          {/* Center deck + trump */}
          <div className="flex items-center gap-6 mb-8">
            {/* Deck */}
            <div className="relative">
              {Array.from({ length: Math.min(5, 30 - dealingCards.myCards.length * 2 - dealingCards.opCards.length * 2) }).map((_, i) => (
                <div key={`deck-${i}`} className="absolute rounded-lg border border-gray-600"
                  style={{
                    background: CARD_BACK,
                    width: "5rem", height: "7.5rem",
                    top: -i * 2, left: i * 1,
                    zIndex: i,
                    transition: "all 0.3s ease",
                  }} />
              ))}
              <div style={{ width: "5rem", height: "7.5rem" }}>
                <Card faceDown size="normal" />
              </div>
            </div>

            {/* Trump card — revealed after first card is dealt */}
            {dealingCards.myCards.length + dealingCards.opCards.length > 0 && dealingCards.trumpCard && (
              <div className="deal-trump-reveal">
                <div className="flex flex-col items-center">
                  <span className="text-amber-300/90 text-xs font-bold mb-1 tracking-wide">{t.trump}</span>
                  <div className="trump-glow rounded-lg">
                    <Card card={dealingCards.trumpCard} size="normal" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* My dealt cards (bottom) */}
          <div className="flex items-center justify-center gap-2 mt-0 h-24">
            {dealingCards.myCards.map((c, i) => (
              <div key={`deal-my-${c}`} className="deal-card-enter-me">
                <Card card={c} size="normal" />
              </div>
            ))}
          </div>

          {/* Done indicator */}
          {dealingCards.done && (
            <div className="mt-4 text-amber-300/80 text-sm font-bold animate-pulse tracking-wider">
              {gameState?.leadPhase && gameState?.turn === playerIdx ? t.yourTurnLead : t.oppTurnLead}
            </div>
          )}
        </div>
      )}

      {/* Ready Modal — new hand/match start */}
      {gameState?.handPhase === "ready" && gameState?.phase === "playing" && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4 border border-amber-700/30 shadow-2xl text-center">
            <h2 className="text-3xl font-bold mb-3 text-amber-100">
              {gameState.isNewMatch ? t.newMatchReady : t.newHandReady}
            </h2>
            <p className="text-green-300/70 text-sm mb-2">{t.playingTo(gameState.playTo)}</p>
            <div className="bg-black/30 rounded-xl p-3 mb-4">
              <p className="text-green-400/70 text-xs mb-1">{t.matchScore}</p>
              <p className="text-xl font-bold text-amber-200">{gameState.matchScores[playerIdx]} — {gameState.matchScores[1 - playerIdx]}</p>
            </div>
            <p className="text-green-400/60 text-sm mb-4">{t.pressStart}</p>
            {gameState.playersReady?.[playerIdx] ? (
              <div className="py-3 rounded-xl bg-green-800/40 text-green-300 font-semibold text-sm animate-pulse">{t.waitingForBoth}</div>
            ) : (
              <button onClick={pressReady}
                className={`w-full py-3 font-bold text-lg rounded-xl transition-all duration-200 shadow-lg ${
                  confirmStart
                    ? "bg-green-700 hover:bg-green-600 text-white scale-105"
                    : "bg-amber-700 hover:bg-amber-600 text-white"
                }`}>
                {confirmStart ? t.confirmStart : t.start}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hand Over Overlay */}
      {gameState?.handPhase === "handover" && gameState?.phase === "playing" && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4 border border-amber-700/30 shadow-2xl text-center">
            <h2 className="text-2xl font-bold mb-2 text-amber-100">
              {gameState.handWinner === -1 ? t.draw : gameState.handWinner === playerIdx ? t.handWon : t.handLost}
            </h2>
            <p className="text-green-300/80 mb-2 text-sm">{gameState.handWinReason}</p>
            {gameState.handWinner !== -1 && (
              <p className="text-amber-300 mb-4 text-sm font-semibold">+{stakePoints(gameState.stakeLevel)} {stakePoints(gameState.stakeLevel) !== 1 ? t.pts : t.pt} ({stakeDisplayName(gameState.stakeLevel, t)})</p>
            )}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-black/30 rounded-xl p-3">
                <p className="text-green-400/70 text-xs mb-1">{t.yourHand}</p>
                <p className="text-2xl font-bold text-amber-200">{pilePoints(myScorePile)}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-3">
                <p className="text-green-400/70 text-xs mb-1">{t.opponent}</p>
                <p className="text-2xl font-bold text-amber-200">{pilePoints(opScorePile)}</p>
              </div>
            </div>
            <div className="bg-black/30 rounded-xl p-3 mb-4">
              <p className="text-green-400/70 text-xs mb-1">{t.matchScore}</p>
              <p className="text-lg font-bold text-amber-200">{gameState.matchScores[playerIdx]} — {gameState.matchScores[1 - playerIdx]}</p>
            </div>
            <button onClick={startNextHand} className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors shadow-lg">{t.nextHand}</button>
          </div>
        </div>
      )}

      {/* Match Over */}
      {(phase === "matchover" || gameState?.phase === "matchover") && gameState && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4 border border-amber-700/30 shadow-2xl text-center">
            <h2 className="text-3xl font-bold mb-2 text-amber-100">
              {gameState.matchScores[playerIdx] >= gameState.playTo ? t.matchWon : t.matchLost}
            </h2>
            <p className="text-green-300/80 mb-4 text-sm">{gameState.handWinReason}</p>
            <div className="bg-black/30 rounded-xl p-4 mb-6">
              <p className="text-green-400/70 text-xs mb-1">{t.finalScore}</p>
              <p className="text-3xl font-bold text-amber-200">{gameState.matchScores[playerIdx]} — {gameState.matchScores[1 - playerIdx]}</p>
              <p className="text-green-400/60 text-xs mt-1">{t.playingTo(gameState.playTo)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={newMatch} className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors shadow-lg">{t.newMatch}</button>
              <button onClick={backToMenu} className="w-full py-2 bg-black/30 hover:bg-black/50 text-green-300/80 text-sm font-semibold rounded-xl transition-colors border border-green-800/40">{t.backToMenu}</button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {gameState && playerIdx !== null && (
        <ChatWidget gameId={gameId} playerIdx={playerIdx} gameState={gameState} setGameState={setGameState} />
      )}
    </div>
  );
}
