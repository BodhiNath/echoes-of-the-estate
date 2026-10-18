// Screens, chapter flow, HUD. Entry point.
import { CHAINS, CHAPTERS, ROOMS, ENERGY, SKUS, GEM_COSTS } from './data.js';
import { S, save, reset, onChange, syncEnergy, msToNextEnergy, addEnergy, spendCoins } from './state.js';
import { mountBoard, render as renderBoard, gemRefill, gemSweep, flash, clearSelection } from './board.js';
import { mountPuzzle, resetPuzzle, puzzleHint, puzzleTitle } from './puzzle.js';
import { sfx } from './audio.js';

export const VERSION = '0.1.0';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

// ---------- chapter helpers ----------
const chapter = () => CHAPTERS.find(c => c.id === S.chapter);
const qKey = (ch, i) => `${ch.id}:${i}`;
function openQuests() {
  const ch = chapter();
  if (!ch || S.phase !== 'quests') return [];
  return ch.quests.map((q, i) => ({ idx: i, chain: q[0], tier: q[1], label: q[2] }))
    .filter(q => !S.delivered[qKey(ch, q.idx)]);
}
const storyWaiting = () => ['intro', 'gate', 'outro'].includes(S.phase);

function onDeliver(q) {
  const ch = chapter();
  S.delivered[qKey(ch, q.idx)] = true;
  if (openQuests().length === 0) {
    S.phase = ch.gate ? 'gate' : 'outro';
    save();
    setTimeout(advance, 700);
  } else save();
}

function advance() {
  const ch = chapter();
  if (!ch) { S.phase = 'done'; save(); show('hub'); return; }
  if (S.phase === 'intro') {
    playScene(ch, ch.intro, () => { S.phase = 'quests'; save(); show('boardScreen'); });
  } else if (S.phase === 'gate') {
    show('puzzleScreen'); startPuzzle(ch.gate);
  } else if (S.phase === 'outro') {
    playScene(ch, ch.outro, () => {
      addEnergy(ENERGY.chapterBonus); S.gems += 5;
      const next = CHAPTERS.find(c => c.id === ch.id + 1);
      if (next) { S.chapter = next.id; S.phase = 'intro'; } else { S.phase = 'done'; }
      save();
      flash(`Chapter ${ch.id} complete. +${ENERGY.chapterBonus} energy, +5 gems. ${ROOMS[ch.room].name} unlocked.`);
      show('hub');
    });
  } else if (S.phase === 'quests') {
    show('boardScreen');
  } else show('hub');
}

// ---------- story overlay ----------
const WHO = { tape: 'Marguerite · cassette', you: 'You', letter: 'A letter', journal: 'Her journal', voice: 'A voice', end: '' };
function playScene(ch, lines, done) {
  const ov = $('#story'); let i = 0;
  const draw = () => {
    const [kind, text] = lines[i];
    $('#story .chap').textContent = `Chapter ${ch.id} — ${ch.title}`;
    $('#story .who').textContent = WHO[kind] ?? kind;
    const l = $('#story .line'); l.className = 'line ' + kind; l.textContent = text;
    $('#story .count').textContent = `${i + 1} / ${lines.length}`;
    $('#story .next .btn').textContent = i === lines.length - 1 ? 'Continue' : 'Next';
  };
  const step = () => { sfx.tap(); if (i < lines.length - 1) { i++; draw(); } else { ov.classList.remove('open'); ov.onclick = null; done(); } };
  ov.onclick = step;
  draw(); ov.classList.add('open');
}

// ---------- puzzle ----------
function startPuzzle(id) {
  $('#puzzleTitle').textContent = puzzleTitleFor(id);
  $('#hintText').textContent = '';
  mountPuzzle($('#wires'), id, {
    onProgress(got, total, filled, cells) { $('#pProgress').textContent = `${got}/${total} wired · ${filled}/${cells} cells`; },
    onWin(fullFill) {
      S.puzzlesDone[id] = { fullFill };
      addEnergy(ENERGY.puzzleBonus);
      const gems = fullFill ? 10 : 4; S.gems += gems;
      S.phase = 'outro'; save();
      flash(`Power restored. +${ENERGY.puzzleBonus} energy, +${gems} gems${fullFill ? ' (every cell wired!)' : ''}.`);
      setTimeout(advance, 900);
    },
  });
  $('#puzzleTitle').textContent = puzzleTitle();
}
function puzzleTitleFor() { return puzzleTitle(); }

// ---------- hub ----------
function renderHub() {
  const ch = chapter();
  const el = $('#hub'); el.innerHTML = '';
  const card = document.createElement('div'); card.className = 'card';
  const doneCount = CHAPTERS.filter(c => c.id < S.chapter).length + (S.phase === 'done' ? 1 : 0);
  if (!ch || S.phase === 'done') {
    card.innerHTML = `<h2>The story continues</h2><div class="meta">Six chapters complete. Chapter 7 is in development; your estate and progress are saved.</div>
      <div class="progress"><i style="--pct:100%"></i></div><button class="btn wide" id="toBoard">Keep merging on the workbench</button>`;
    el.appendChild(card);
    $('#toBoard').onclick = () => show('boardScreen');
  } else {
    const qs = ch.quests.map((q, i) => {
      const d = S.delivered[qKey(ch, i)];
      return `<li class="${d ? 'done' : ''}"><span class="sw" style="--c:${CHAINS[q[0]].color}"></span>${q[2]} <small style="margin-left:auto;color:var(--ink2)">${CHAINS[q[0]].tiers[q[1] - 1]}</small></li>`;
    }).join('');
    const action = { intro: 'Play the scene', quests: 'Open the workbench', gate: `Enter: ${ch.title}`, outro: 'Continue the story' }[S.phase];
    card.innerHTML = `<h2>Chapter ${ch.id} · ${ch.title}</h2><div class="meta">${ROOMS[ch.room].name} · ${doneCount} of ${CHAPTERS.length} chapters done</div>
      <div class="progress"><i style="--pct:${Math.round(100 * doneCount / CHAPTERS.length)}%"></i></div>
      <ul class="quests">${qs}</ul><button class="btn wide ${storyWaiting() ? 'brass' : 'jade'}" id="chapAct">${action}</button>`;
    el.appendChild(card);
    $('#chapAct').onclick = () => { sfx.tap(); advance(); };
  }
  // Rooms
  const h = document.createElement('h3'); h.textContent = 'Halloway House'; h.style.margin = '6px 0 10px'; el.appendChild(h);
  for (const c of CHAPTERS) {
    const room = ROOMS[c.room];
    const unlocked = c.id < S.chapter || S.phase === 'done';
    const r = document.createElement('div'); r.className = 'card room' + (unlocked ? '' : ' locked');
    const picks = S.rooms[c.room] || {};
    r.innerHTML = `<h2 style="font-size:17px">${room.name}</h2><div class="meta">${unlocked ? 'Restore each fixture. Choose a style.' : `Unlocks after chapter ${c.id}`}</div>` +
      (unlocked ? room.fixtures.map(f => {
        const owned = picks[f.id] != null;
        return `<div class="fixture"><div class="fx-head"><span class="nm">${f.name}</span><span class="cost">${owned ? `Restyle: ${Math.ceil(f.cost * .2)} coins` : `${f.cost} coins`}</span></div><div class="fx-styles">` +
          f.styles.map((s, si) => `<button class="sty ${picks[f.id] === si ? 'pick' : ''}" data-room="${c.room}" data-f="${f.id}" data-s="${si}" ${picks[f.id] === si ? 'disabled' : ''}>${s}</button>`).join('') +
          `</div></div>`;
      }).join('') : '');
    el.appendChild(r);
  }
  el.querySelectorAll('.sty').forEach(b => b.onclick = () => buyStyle(b.dataset.room, b.dataset.f, +b.dataset.s));
}

function buyStyle(roomId, fid, si) {
  const f = ROOMS[roomId].fixtures.find(x => x.id === fid);
  const picks = S.rooms[roomId] = S.rooms[roomId] || {};
  const cost = picks[fid] != null ? Math.ceil(f.cost * .2) : f.cost;
  if (!spendCoins(cost)) { sfx.deny(); flash(`Need ${cost} coins. Deliver quest items to earn more.`); return; }
  picks[fid] = si; sfx.deliver(); save();
  flash(`${f.name}: ${f.styles[si]}.`);
  renderHub();
}

// ---------- shop ----------
function renderShop() {
  const el = $('#shop');
  el.innerHTML = `<div class="card"><h2>Gems</h2><div class="meta">You have <b>${S.gems}</b> gems. Earn them from chapters and puzzles.</div>
    <div class="gemrow"><button class="btn jade" id="shopRefill">Refill energy · ${GEM_COSTS.refill} gems</button><button class="btn" id="shopSweep">Sweep tier-1 clutter · ${GEM_COSTS.clearBoard} gems</button></div></div>
    <div class="card"><h2>Estate Store</h2><div class="meta">Available with the Google Play release.</div>` +
    SKUS.map(s => `<div class="sku"><div class="d">${s.name}<small>${s.desc}</small></div><span class="price">${s.price}</span><button class="btn" disabled>Soon</button></div>`).join('') +
    `<p class="note">Nothing in this version costs money. Every chapter, puzzle and room can be finished by playing.</p></div>`;
  $('#shopRefill').onclick = () => { gemRefill() && renderShop(); };
  $('#shopSweep').onclick = () => { gemSweep() && renderShop(); };
}

// ---------- HUD ----------
function fmt(ms) { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
function renderHud() {
  syncEnergy();
  $('#energyVal').textContent = `${S.energy}/${ENERGY.max}`;
  $('#energyBar').style.setProperty('--pct', `${100 * S.energy / ENERGY.max}%`);
  $('#energyNext').textContent = S.energy >= ENERGY.max ? 'full' : fmt(msToNextEnergy());
  $('#coinsVal').textContent = S.coins;
  $('#gemsVal').textContent = S.gems;
  $('#navHubBadge').style.display = storyWaiting() ? '' : 'none';
}

// ---------- screens ----------
function show(id) {
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  const navMap = { hub: 'navHub', boardScreen: 'navBoard', shop: 'navShop' };
  $$('#nav button').forEach(b => b.classList.toggle('on', b.id === navMap[id]));
  $('#nav').style.display = id === 'title' ? 'none' : '';
  $('#hud').style.display = id === 'title' ? 'none' : '';
  if (id === 'hub') renderHub();
  if (id === 'shop') renderShop();
  if (id === 'boardScreen') { clearSelection(); renderBoard(); }
  window.scrollTo(0, 0);
}

function renderTitle() {
  const started = S.chapter > 1 || S.phase !== 'intro' || S.stats.taps > 0;
  $('#btnContinue').style.display = started ? '' : 'none';
  $('#btnNew').textContent = started ? 'New game' : 'Begin';
  $('#btnNew').className = started ? 'btn ghost' : 'btn brass';
}

// ---------- settings ----------
function renderSettings() {
  $('#tSound').classList.toggle('on', S.settings.sound);
  $('#tHaptics').classList.toggle('on', S.settings.haptics);
  $('#verText').textContent = `v${VERSION} · merges ${S.stats.merges} · taps ${S.stats.taps} · deliveries ${S.stats.deliveries}`;
}

// ---------- boot ----------
function boot() {
  mountBoard($('#board'), $('#info'), {
    openQuests, onDeliver,
    onEnergyEmpty() { /* calm: the HUD shows the countdown; shop offers gems */ },
  });
  $('#btnContinue').onclick = () => { sfx.tap(); storyWaiting() ? (show('hub'), advance()) : show(S.phase === 'quests' ? 'boardScreen' : 'hub'); };
  $('#btnNew').onclick = () => {
    const started = S.chapter > 1 || S.stats.taps > 0;
    if (started && !confirm('Start over? Your estate and progress will be erased.')) return;
    reset(); sfx.tap(); renderTitle(); show('hub'); advance();
  };
  $('#navHub').onclick = () => show('hub');
  $('#navBoard').onclick = () => { if (S.phase === 'intro') { show('hub'); advance(); } else show('boardScreen'); };
  $('#navShop').onclick = () => show('shop');
  $('#settingsBtn').onclick = () => { renderSettings(); $('#settings').classList.add('open'); };
  $('#settingsClose').onclick = () => $('#settings').classList.remove('open');
  $('#tSound').onclick = () => { S.settings.sound = !S.settings.sound; save(); renderSettings(); };
  $('#tHaptics').onclick = () => { S.settings.haptics = !S.settings.haptics; save(); renderSettings(); };
  $('#resetBtn').onclick = () => { if (confirm('Erase all progress?')) { reset(); $('#settings').classList.remove('open'); renderTitle(); show('title'); } };
  $('#pHint').onclick = () => { $('#hintText').textContent = puzzleHint(); };
  $('#pReset').onclick = () => { resetPuzzle(); $('#hintText').textContent = ''; };
  $('#boardRefill').onclick = () => gemRefill();
  $('#boardSweep').onclick = () => gemSweep();

  onChange(renderHud);
  setInterval(renderHud, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { syncEnergy(); renderHud(); } });
  renderTitle(); renderHud(); show('title');

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}
boot();
