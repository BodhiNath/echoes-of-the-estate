// Wire-routing gate: connect each color's two terminals; wires may not cross.
import { PUZZLES, WIRE_COLORS } from './data.js';
import { sfx } from './audio.js';

let root, n, P, paths, owner, active, cb, done;

export function mountPuzzle(container, id, callbacks) {
  root = container; P = PUZZLES[id]; n = P.size; cb = callbacks; done = false;
  paths = {}; owner = new Array(n * n).fill(null); active = null;
  root.innerHTML = '';
  root.style.setProperty('--n', n);
  for (let i = 0; i < n * n; i++) {
    const d = document.createElement('div');
    d.className = 'wcell'; d.dataset.i = i;
    root.appendChild(d);
  }
  for (const [color, [a, b]] of Object.entries(P.pairs)) {
    paths[color] = [];
    for (const [r, c] of [a, b]) {
      const el = root.children[r * n + c];
      el.classList.add('term');
      el.style.setProperty('--w', WIRE_COLORS[color]);
      el.dataset.color = color;
      el.innerHTML = '<span class="dot"></span>';
    }
  }
  root.onpointerdown = onDown;
  root.onpointermove = onMove;
  root.onpointerup = root.onpointercancel = onUp;
  render();
}

const rc = (i) => [Math.floor(i / n), i % n];
const adjacent = (a, b) => { const [r1, c1] = rc(a), [r2, c2] = rc(b); return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1; };
const endpoints = (color) => P.pairs[color].map(([r, c]) => r * n + c);
const complete = (color) => { const p = paths[color]; const e = endpoints(color); return p.length > 1 && e.includes(p[0]) && e.includes(p[p.length - 1]); };

function setPath(color, cells) {
  for (const i of paths[color]) owner[i] = null;
  paths[color] = cells;
  for (const i of cells) owner[i] = color;
}

function cellAt(x, y) {
  const el = document.elementFromPoint(x, y);
  const c = el && el.closest && el.closest('.wcell');
  return c && c.parentElement === root ? +c.dataset.i : -1;
}

function onDown(e) {
  if (done) return;
  const i = cellAt(e.clientX, e.clientY); if (i < 0) return;
  e.preventDefault();
  root.setPointerCapture && root.setPointerCapture(e.pointerId);
  const el = root.children[i];
  if (el.classList.contains('term')) {
    const color = el.dataset.color;
    setPath(color, [i]);
    active = color;
  } else if (owner[i]) {
    const color = owner[i];
    const p = paths[color];
    setPath(color, p.slice(0, p.indexOf(i) + 1));
    active = color;
  } else return;
  sfx.wire();
  render();
}

function onMove(e) {
  if (!active || done) return;
  e.preventDefault();
  const i = cellAt(e.clientX, e.clientY); if (i < 0) return;
  const last = paths[active][paths[active].length - 1];
  if (i === last) return;
  if (adjacent(i, last)) { if (extend(i)) render(); return; }
  // Fast swipe skipped cells: walk straight along the row or column, stopping at the first block.
  const [r1, c1] = rc(last), [r2, c2] = rc(i);
  if (r1 !== r2 && c1 !== c2) return;
  const dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
  let r = r1, c = c1, changed = false;
  while (r !== r2 || c !== c2) {
    r += dr; c += dc;
    if (!extend(r * n + c)) break;
    changed = true;
  }
  if (changed) render();
}

// Extend (or truncate) the active path to cell i, which must be adjacent to its current end.
function extend(i) {
  const p = paths[active];
  if (complete(active)) return false;                 // finished wires don't extend
  if (owner[i] === active) { setPath(active, p.slice(0, p.indexOf(i) + 1)); return true; }
  if (owner[i]) return false;                         // blocked by another wire
  const el = root.children[i];
  if (el.classList.contains('term') && el.dataset.color !== active) return false;  // foreign terminal
  setPath(active, [...p, i]);
  sfx.wire();
  if (complete(active)) sfx.connect();
  return true;
}

function onUp() {
  if (!active) return;
  active = null;
  render();
  const colors = Object.keys(P.pairs);
  if (colors.every(complete)) {
    done = true;
    const fullFill = owner.every(Boolean);
    root.classList.add('solved');
    sfx.fanfare();
    setTimeout(() => cb.onWin(fullFill), 700);
  }
}

function render() {
  for (let i = 0; i < n * n; i++) {
    const el = root.children[i];
    el.classList.remove('on');
    delete el.dataset.a; delete el.dataset.b;
    const color = owner[i];
    if (!color) { el.style.removeProperty('--p'); continue; }
    el.classList.add('on');
    el.style.setProperty('--p', WIRE_COLORS[color]);
    const p = paths[color], k = p.indexOf(i);
    const dirs = [];
    for (const j of [p[k - 1], p[k + 1]]) {
      if (j == null) continue;
      const [r1, c1] = rc(i), [r2, c2] = rc(j);
      dirs.push(r2 < r1 ? 'u' : r2 > r1 ? 'd' : c2 < c1 ? 'l' : 'r');
    }
    if (dirs[0]) el.dataset.a = dirs[0];
    if (dirs[1]) el.dataset.b = dirs[1];
  }
  const total = Object.keys(P.pairs).length, got = Object.keys(P.pairs).filter(complete).length;
  cb.onProgress && cb.onProgress(got, total, owner.filter(Boolean).length, n * n);
}

export function resetPuzzle() {
  if (!P) return;
  for (const c of Object.keys(paths)) setPath(c, []);
  done = false; root.classList.remove('solved');
  render();
}

export function puzzleHint() { return P ? P.hint : ''; }
export function puzzleTitle() { return P ? P.title : ''; }
