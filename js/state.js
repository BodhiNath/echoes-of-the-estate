// Save state, energy regeneration, currencies. localStorage only (offline-first, no accounts).
import { BOARD, ENERGY } from './data.js';

const KEY = 'eote.save.v1';
const listeners = new Set();

function freshBoard() {
  const cells = new Array(BOARD.cols * BOARD.rows).fill(null);
  // Three generators fixed near the top row.
  cells[1] = { gen: 'crate' };
  cells[3] = { gen: 'basket' };
  cells[5] = { gen: 'desk' };
  // A few starter items so the first merge happens inside ten seconds.
  cells[15] = { chain: 'tools', tier: 1 };
  cells[16] = { chain: 'tools', tier: 1 };
  cells[22] = { chain: 'lights', tier: 1 };
  cells[24] = { chain: 'lights', tier: 1 };
  cells[30] = { chain: 'keys', tier: 1 };
  return cells;
}

export function defaultState() {
  return {
    v: 1,
    createdAt: Date.now(),
    energy: ENERGY.max,
    energyAt: Date.now(),      // timestamp energy was last computed
    coins: 0,
    gems: 5,
    chapter: 1,                // current chapter id
    phase: 'intro',            // intro | quests | gate | outro | done
    delivered: {},             // `${chapter}:${questIndex}` -> true
    puzzlesDone: {},           // puzzleId -> { fullFill: bool }
    rooms: {},                 // roomId -> { fixtureId -> styleIndex }
    board: freshBoard(),
    stats: { merges: 0, taps: 0, deliveries: 0 },
    settings: { sound: true, haptics: true },
  };
}

export let S = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    if (!s || s.v !== 1 || !Array.isArray(s.board)) return defaultState();
    return Object.assign(defaultState(), s);
  } catch { return defaultState(); }
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode: play unsaved */ }
  for (const fn of listeners) fn(S);
}

export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function reset() {
  S = defaultState();
  save();
}

// Energy regenerates while the app is closed; compute lazily from the last timestamp.
export function syncEnergy() {
  const now = Date.now();
  if (S.energy >= ENERGY.max) { S.energyAt = now; return S.energy; }
  const gained = Math.floor((now - S.energyAt) / ENERGY.regenMs);
  if (gained > 0) {
    S.energy = Math.min(ENERGY.max, S.energy + gained);
    S.energyAt = S.energyAt + gained * ENERGY.regenMs;
    if (S.energy >= ENERGY.max) S.energyAt = now;
  }
  return S.energy;
}

export function msToNextEnergy() {
  if (S.energy >= ENERGY.max) return 0;
  return Math.max(0, ENERGY.regenMs - (Date.now() - S.energyAt));
}

export function spendEnergy(n = 1) {
  syncEnergy();
  if (S.energy < n) return false;
  if (S.energy === ENERGY.max) S.energyAt = Date.now();
  S.energy -= n;
  return true;
}

export function addEnergy(n) {
  syncEnergy();
  S.energy = Math.min(ENERGY.max, S.energy + n);
  if (S.energy >= ENERGY.max) S.energyAt = Date.now();
}

export function spendGems(n) {
  if (S.gems < n) return false;
  S.gems -= n;
  return true;
}

export function spendCoins(n) {
  if (S.coins < n) return false;
  S.coins -= n;
  return true;
}
