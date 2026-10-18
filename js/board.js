// Merge workbench: 7x9 grid, generators, drag-to-merge, 5-merge bonus, deliveries.
import { BOARD, CHAINS, GENERATORS, QUEST_REWARD, GEM_COSTS } from './data.js';
import { S, save, spendEnergy, spendGems, addEnergy } from './state.js';
import { sfx, buzz } from './audio.js';
import { ENERGY } from './data.js';

const { cols, rows } = BOARD;
const idx = (r, c) => r * cols + c;
const rc = (i) => [Math.floor(i / cols), i % cols];
const inB = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols;

let root, infoEl, opts;
let selected = null;        // cell index of selected item
let drag = null;            // { from, ghost, startX, startY, moved }

export function mountBoard(container, info, options) {
  root = container; infoEl = info; opts = options;
  root.style.setProperty('--cols', cols);
  root.style.setProperty('--rows', rows);
  root.innerHTML = '';
  for (let i = 0; i < cols * rows; i++) {
    const d = document.createElement('div');
    d.className = 'cell';
    d.dataset.i = i;
    root.appendChild(d);
  }
  root.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  render();
}

export function render() {
  const cells = S.board;
  for (let i = 0; i < cells.length; i++) {
    const el = root.children[i];
    const v = cells[i];
    el.className = 'cell';
    el.innerHTML = '';
    if (!v) continue;
    if (v.gen) {
      const g = GENERATORS[v.gen];
      el.classList.add('gen');
      el.innerHTML = `<span class="glyph">${g.glyph}</span><span class="tag">tap</span>`;
      el.title = g.name;
    } else {
      const ch = CHAINS[v.chain];
      el.classList.add('item', 'shape-' + ch.shape);
      if (v.tier === 5) el.classList.add('max');
      el.style.setProperty('--c', ch.color);
      el.innerHTML = `<span class="glyph">${ch.glyph[v.tier - 1]}</span><span class="tier">${v.tier}</span>`;
      el.title = ch.tiers[v.tier - 1];
      if (i === selected) el.classList.add('sel');
      if (v.fresh) { el.classList.add('pop'); delete v.fresh; }
    }
  }
  renderInfo();
}

function renderInfo() {
  if (!infoEl) return;
  const v = selected != null ? S.board[selected] : null;
  if (!v || v.gen) {
    const q = opts.openQuests();
    infoEl.innerHTML = q.length
      ? `<div class="hint">Needed: ${q.map(x => `<b style="--c:${CHAINS[x.chain].color}">${CHAINS[x.chain].tiers[x.tier - 1]}</b>`).join(' · ')}</div>`
      : `<div class="hint">All items delivered. Open the story.</div>`;
    return;
  }
  const ch = CHAINS[v.chain];
  const name = ch.tiers[v.tier - 1];
  const next = v.tier < 5 ? `Merge two for <b>${ch.tiers[v.tier]}</b>` : `<b>Top tier.</b> Deliver it.`;
  const q = opts.openQuests().find(x => x.chain === v.chain && x.tier === v.tier);
  infoEl.innerHTML = `<div class="sel-name" style="--c:${ch.color}">${ch.glyph[v.tier - 1]} ${name} <small>tier ${v.tier}</small></div>
    <div class="sel-next">${next}</div>
    ${q ? `<button class="btn jade" id="deliverBtn">Deliver → ${q.label}</button>` : ''}`;
  const b = infoEl.querySelector('#deliverBtn');
  if (b) b.onclick = () => deliver(selected, q);
}

// ---------- generators ----------
function nearestFree(from) {
  const [fr, fc] = rc(from);
  const seen = new Set([from]);
  const queue = [[fr, fc]];
  while (queue.length) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc;
      if (!inB(nr, nc)) continue;
      const ni = idx(nr, nc);
      if (seen.has(ni)) continue;
      seen.add(ni);
      if (!S.board[ni]) return ni;
      queue.push([nr, nc]);
    }
  }
  return -1;
}

function tapGenerator(i) {
  const g = GENERATORS[S.board[i].gen];
  const target = nearestFree(i);
  if (target < 0) { sfx.deny(); flash('Board is full. Merge or deliver something.'); return; }
  if (!spendEnergy(1)) { sfx.deny(); flash('Out of energy. It refills over time, or use gems.'); opts.onEnergyEmpty && opts.onEnergyEmpty(); return; }
  let roll = Math.random(), chain = g.drops[g.drops.length - 1][0];
  for (const [c, p] of g.drops) { if (roll < p) { chain = c; break; } roll -= p; }
  S.board[target] = { chain, tier: 1, fresh: true };
  S.stats.taps++;
  sfx.spawn();
  selected = target;
  save(); render();
}

// ---------- merging ----------
function cluster(i) {
  const v = S.board[i];
  const out = [i]; const seen = new Set(out);
  const q = [i];
  while (q.length) {
    const cur = q.shift();
    const [r, c] = rc(cur);
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc;
      if (!inB(nr, nc)) continue;
      const ni = idx(nr, nc);
      const w = S.board[ni];
      if (!seen.has(ni) && w && !w.gen && w.chain === v.chain && w.tier === v.tier) { seen.add(ni); out.push(ni); q.push(ni); }
    }
  }
  return out;
}

function tryMerge(from, to) {
  const a = S.board[from], b = S.board[to];
  if (!a || !b || a.gen || b.gen) return false;
  if (a.chain !== b.chain || a.tier !== b.tier || a.tier >= 5) return false;
  const next = a.tier + 1;
  // 5-merge bonus: the target's cluster (excluding the dragged piece) plus the dragged piece.
  const cl = cluster(to).filter(i => i !== from);
  if (cl.length + 1 >= 5) {
    const consume = [from, ...cl.slice(0, 4)];
    for (const i of consume) S.board[i] = null;
    S.board[to] = { chain: a.chain, tier: next, fresh: true };
    const second = nearestFree(to);
    if (second >= 0) S.board[second] = { chain: a.chain, tier: next, fresh: true };
    flash('Five-merge! Two ' + CHAINS[a.chain].tiers[next - 1] + 's.');
  } else {
    S.board[from] = null;
    S.board[to] = { chain: a.chain, tier: next, fresh: true };
  }
  S.stats.merges++;
  sfx.merge(next);
  if (next === 5) sfx.fanfare();
  selected = to;
  return true;
}

// ---------- deliveries ----------
function deliver(i, q) {
  const v = S.board[i];
  if (!v || v.gen) return;
  S.board[i] = null;
  const coins = QUEST_REWARD.coinsPerTier[v.tier - 1];
  S.coins += coins;
  let gems = 0;
  if (v.tier === 5) { gems = QUEST_REWARD.gemsAtTier5; S.gems += gems; }
  S.stats.deliveries++;
  selected = null;
  sfx.deliver();
  flash(`Delivered. +${coins} coins${gems ? ` +${gems} gems` : ''}`);
  save();
  opts.onDeliver(q);
  render();
}

// ---------- gem actions ----------
export function gemRefill() {
  if (S.energy >= ENERGY.max) { flash('Energy is already full.'); return false; }
  if (!spendGems(GEM_COSTS.refill)) { sfx.deny(); flash(`Need ${GEM_COSTS.refill} gems.`); return false; }
  addEnergy(ENERGY.max); sfx.deliver(); save(); return true;
}
export function gemSweep() {
  const ones = S.board.map((v, i) => (v && !v.gen && v.tier === 1) ? i : -1).filter(i => i >= 0);
  if (!ones.length) { flash('No tier-1 clutter to sweep.'); return false; }
  if (!spendGems(GEM_COSTS.clearBoard)) { sfx.deny(); flash(`Need ${GEM_COSTS.clearBoard} gems.`); return false; }
  for (const i of ones) S.board[i] = null;
  sfx.deliver(); save(); render(); return true;
}

// ---------- pointer handling ----------
function cellFromPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  const cell = el && el.closest && el.closest('.cell');
  return cell && cell.parentElement === root ? +cell.dataset.i : -1;
}

function onDown(e) {
  const i = cellFromPoint(e.clientX, e.clientY);
  if (i < 0) return;
  const v = S.board[i];
  if (!v) { selected = null; render(); return; }
  if (v.gen) { tapGenerator(i); return; }
  e.preventDefault();
  drag = { from: i, startX: e.clientX, startY: e.clientY, moved: false, ghost: null };
}

function onMove(e) {
  if (!drag) return;
  const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
  if (!drag.moved && Math.hypot(dx, dy) < 6) return;
  e.preventDefault();
  if (!drag.moved) {
    drag.moved = true;
    const src = root.children[drag.from];
    const g = src.cloneNode(true);
    g.classList.add('ghost'); g.classList.remove('sel');
    const r = src.getBoundingClientRect();
    g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
    document.body.appendChild(g);
    drag.ghost = g; drag.w = r.width; drag.h = r.height;
    src.classList.add('lifted');
  }
  drag.ghost.style.transform = `translate(${e.clientX - drag.w / 2}px, ${e.clientY - drag.h / 2}px)`;
  const over = cellFromPoint(e.clientX, e.clientY);
  for (const c of root.children) c.classList.remove('over', 'can');
  if (over >= 0 && over !== drag.from) {
    const t = root.children[over];
    t.classList.add('over');
    const v = S.board[over], a = S.board[drag.from];
    if (v && !v.gen && v.chain === a.chain && v.tier === a.tier && a.tier < 5) t.classList.add('can');
  }
}

function onUp(e) {
  if (!drag) return;
  const d = drag; drag = null;
  for (const c of root.children) c.classList.remove('over', 'can', 'lifted');
  if (d.ghost) d.ghost.remove();
  if (!d.moved) {                      // tap: select / toggle
    selected = selected === d.from ? null : d.from;
    sfx.tap();
    render();
    return;
  }
  const to = cellFromPoint(e.clientX, e.clientY);
  if (to < 0 || to === d.from) { render(); return; }
  const target = S.board[to];
  if (!target) {                       // move
    S.board[to] = S.board[d.from]; S.board[d.from] = null; selected = to;
  } else if (!tryMerge(d.from, to)) {
    if (!target.gen) {                 // swap two items
      const tmp = S.board[to]; S.board[to] = S.board[d.from]; S.board[d.from] = tmp; selected = to;
    } else { sfx.deny(); }
  }
  save(); render();
}

// ---------- toast ----------
let toastT;
export function flash(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}

export function clearSelection() { selected = null; }
