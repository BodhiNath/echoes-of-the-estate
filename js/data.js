// Echoes of the Estate — static game data. No code here, only content.
export const CHAINS = {
  tools:  { name: 'Tools',  color: '#d98b3a', shape: 'hex',
            tiers: ['Rusty Nail','Bent Screwdriver','Hand Tools','Toolbox','Master Toolkit'],
            glyph: ['🔩','🪛','🔧','🧰','🛠️'] },
  keys:   { name: 'Keys',   color: '#c9b44a', shape: 'diamond',
            tiers: ['Key Fragment','Tarnished Key','Brass Key','Skeleton Key','Estate Key'],
            glyph: ['🗝','🗝️','🔑','🗝️','🔐'] },
  lights: { name: 'Lights', color: '#e0c26a', shape: 'circle',
            tiers: ['Matchbook','Candle Stub','Oil Lamp','Storm Lantern','Beacon Lamp'],
            glyph: ['🔥','🕯️','🪔','🏮','💡'] },
  papers: { name: 'Papers', color: '#9bb7c9', shape: 'square',
            tiers: ['Torn Page','Letter Fragment','Sealed Letter','Journal','Ledger'],
            glyph: ['📄','📃','✉️','📓','📒'] },
  timber: { name: 'Timber', color: '#8c6a4f', shape: 'tri',
            tiers: ['Driftwood','Plank','Beam','Framing','Restored Timber'],
            glyph: ['🪵','🪵','🪵','🏗️','🏠'] },
};

export const GENERATORS = {
  crate:  { name: 'Toolshed Crate', glyph: '📦', drops: [['tools', .6], ['keys', .4]] },
  basket: { name: 'Tide Basket',    glyph: '🧺', drops: [['timber', .6], ['lights', .4]] },
  desk:   { name: 'Writing Desk',   glyph: '🪶', drops: [['papers', .85], ['keys', .15]] },
};

export const BOARD = { cols: 7, rows: 9 };
export const ENERGY = { max: 100, regenMs: 90_000, chapterBonus: 30, puzzleBonus: 20 };
export const GEM_COSTS = { refill: 20, clearBoard: 10 };
export const QUEST_REWARD = { coinsPerTier: [5, 12, 30, 80, 200], gemsAtTier5: 3 };

// Chapters. quests: [chain, tier(1-5), label]. gate: puzzle id or absent. Scenes are dialog lines.
export const CHAPTERS = [
  { id: 1, title: 'The Gate', room: 'gatehouse',
    intro: [
      ['tape', 'If you are hearing this, the house chose you. Not the lawyers. Not the bank. You.'],
      ['tape', 'The gate sticks. There is a crate in the shed with what you need. Do not trust the man from the bank.'],
      ['you',  'Great-aunt Marguerite. Four years of silence and now a cassette.'],
    ],
    quests: [ ['tools', 3, 'Free the gate hinge'], ['lights', 3, 'Light the path'] ],
    outro: [
      ['you',  'The hinge gives. Beyond the gate the house is… bigger than the photographs.'],
      ['tape', 'Good. Now find the foyer. Mind the stairs. They were never finished for a reason.'],
    ] },
  { id: 2, title: 'The Foyer', room: 'foyer',
    intro: [
      ['you',  'Boards nailed across the staircase. From the inside.'],
      ['tape', 'There is a room in this house that is not on the plans. Elias found it in sixty-one. I never did.'],
      ['you',  'Elias. Her brother. The one who drowned in the storm.'],
    ],
    quests: [ ['tools', 4, 'Pull the boards'], ['keys', 3, 'Open the hall closet'], ['papers', 3, 'Read the sealed letter'] ],
    outro: [
      ['letter', '"Margie — the lights went out at 9:40, not midnight like they said. Somebody cut them. I am going down to the fuse room. If I do not come back, check the plans." — E.'],
      ['you',  'Nine-forty. The night of the storm. Someone cut the power before the surge hit.'],
    ] },
  { id: 3, title: 'The Fuse Room', room: 'fuseroom', gate: 'wire1',
    intro: [
      ['you',  'The fuse room. Every wire has been pulled from its terminal. Deliberately.'],
      ['tape', 'You will need to route them yourself. Red to red. Do not let them cross. He always said: do not let them cross.'],
    ],
    quests: [ ['lights', 4, 'Hang the storm lantern'], ['timber', 3, 'Brace the doorway'] ],
    outro: [
      ['you',  'The breaker holds. Light, for the first time in years.'],
      ['you',  'And in the dust on the stairs — a second set of footprints. Fresh. Going up.'],
    ] },
  { id: 4, title: 'The Study', room: 'study',
    intro: [
      ['you',  'Her study. The desk is locked. Someone has already tried to force it.'],
      ['tape', 'My journal is in the desk. Read it before you judge me. Read it before you judge Elias.'],
    ],
    quests: [ ['papers', 4, 'Recover the journal'], ['keys', 4, 'Open the desk'], ['timber', 4, 'Rebuild the bookshelf'] ],
    outro: [
      ['journal', '"Oct 12, 1962. He is alive. He writes from Astoria under another name. He says the bank man was in the house that night. He says there was a ledger."'],
      ['you',  'Elias survived the storm. And someone in this town has spent sixty years making sure nobody knew.'],
    ] },
  { id: 5, title: "The Widow's Walk", room: 'walk',
    intro: [
      ['you',  "The widow's walk. From here you can see the lighthouse."],
      ['tape', 'When the beacon lamp is lit, he will know you are here. Light it. Then wait.'],
    ],
    quests: [ ['lights', 5, 'Light the beacon lamp'], ['keys', 5, 'Forge the estate key'], ['timber', 5, 'Restore the railing'] ],
    outro: [
      ['you',  'Across the water, the lighthouse answers. Three flashes. Then three more.'],
      ['you',  'Behind me, downstairs, the front door opens. I did not leave it unlocked.'],
    ] },
  { id: 6, title: 'The Room Not on the Plans', room: 'hidden', gate: 'wire2',
    intro: [
      ['you',  'The plans show a wall. The wall shows a seam.'],
      ['tape', 'One more panel. The hardest one. He built it that way so only family could get in.'],
    ],
    quests: [ ['tools', 5, 'Assemble the master toolkit'], ['papers', 5, 'Find the ledger'] ],
    outro: [
      ['you',  'The ledger. Sixty years of payments from the bank man to the county. Every page signed.'],
      ['voice', 'A voice behind me, old and steady: "You have her eyes. Put the ledger down and we can talk about what happened to your great-uncle."'],
      ['end',  'Chapter 7 is in development. Your progress is saved.'],
    ] },
];

export const ROOMS = {
  gatehouse: { name: 'Gatehouse', fixtures: [
    { id: 'gate',  name: 'Iron Gate',   cost: 60,  styles: ['Wrought Black', 'Verdigris Green'] },
    { id: 'lamps', name: 'Gate Lamps',  cost: 40,  styles: ['Brass Carriage', 'Frosted Globe'] } ] },
  foyer: { name: 'Foyer', fixtures: [
    { id: 'stairs', name: 'Staircase',  cost: 120, styles: ['Oak Runner', 'Bare Walnut'] },
    { id: 'chand',  name: 'Chandelier', cost: 90,  styles: ['Crystal', 'Ship Lantern'] },
    { id: 'floor',  name: 'Floor',      cost: 80,  styles: ['Checker Marble', 'Wide Plank'] } ] },
  fuseroom: { name: 'Fuse Room', fixtures: [
    { id: 'panel', name: 'Panel',       cost: 70,  styles: ['Enamel Grey', 'Copper'] },
    { id: 'bench', name: 'Workbench',   cost: 50,  styles: ['Steel', 'Butcher Block'] } ] },
  study: { name: 'Study', fixtures: [
    { id: 'desk',   name: 'Desk',       cost: 150, styles: ['Mahogany', 'Painted Sage'] },
    { id: 'shelf',  name: 'Bookshelf',  cost: 110, styles: ['Floor-to-ceiling', 'Glass Cabinet'] },
    { id: 'rug',    name: 'Rug',        cost: 60,  styles: ['Persian Red', 'Woven Grey'] } ] },
  walk: { name: "Widow's Walk", fixtures: [
    { id: 'rail',  name: 'Railing',     cost: 130, styles: ['Turned Spindle', 'Iron Lattice'] },
    { id: 'scope', name: 'Telescope',   cost: 100, styles: ['Brass', 'Blackened'] } ] },
  hidden: { name: 'The Hidden Room', fixtures: [
    { id: 'safe',  name: 'Safe',        cost: 200, styles: ['Green Steel', 'Walnut Cabinet'] } ] },
};

// Wire-routing puzzles. Cells are [row,col]. Each color has exactly two endpoints.
// Both have a known full-fill solution (see docs/DESIGN.md).
export const PUZZLES = {
  wire1: { size: 5, title: 'Main Breaker', hint: 'Red runs down the left edge. Green takes the top and the right.',
    pairs: { red: [[0,0],[4,0]], green: [[0,1],[4,4]], blue: [[1,1],[4,3]], gold: [[2,1],[4,2]] } },
  wire2: { size: 6, title: 'Panel Behind the Wall', hint: 'Red and green hug the outer edges. Violet is a tiny corner.',
    pairs: { red: [[0,0],[5,1]], green: [[0,1],[5,5]], blue: [[1,1],[5,2]], gold: [[2,1],[3,3]], violet: [[2,3],[3,2]] } },
};
export const WIRE_COLORS = { red: '#e05a4e', green: '#5fb77d', blue: '#4f8fd6', gold: '#e3b84f', violet: '#a56fd1' };

// Play Billing SKUs — defined for the funnel, INERT in v1 (no purchase path is wired).
export const SKUS = [
  { id: 'energy_small', name: 'Energy Flask',  desc: 'Full energy refill', price: '$0.99' },
  { id: 'energy_large', name: 'Energy Cask',   desc: '3 refills + 10 gems', price: '$2.99' },
  { id: 'gem_pouch',    name: 'Gem Pouch',     desc: '60 gems', price: '$4.99' },
  { id: 'estate_pass',  name: 'Estate Pass',   desc: 'Daily energy + exclusive styles, monthly', price: '$9.99' },
];
