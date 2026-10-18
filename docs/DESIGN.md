# Echoes of the Estate — Design Spec v1 (2026-10-17)

Standalone consumer game. No relationship to HomFax, Pipely, StormCast or Ambassador.
Goal: fastest credible path to a Google Play listing with real retention and a billing
funnel that can be switched on after the first release is approved.

## What changed from the pasted blueprint ("make it better")

| Blueprint said | v1 does instead | Why |
|---|---|---|
| Unity client, SQLite, Node/Go backend, cloud save, LiveOps engine | Vanilla HTML5 PWA, zero backend, local save | Ships in days, not quarters. Same PWA→TWA pipeline already proven on Play with Pipely. Backend only when there is revenue to protect. |
| 150 MB initial download | Under 200 KB app shell, offline after first load | Install friction is the number-one funnel killer; owner's own Play data (125 installs → 6 accounts) proves it. |
| Energy gates everything | Energy gates generator taps only. Reading the next chapter, delivering items, puzzles and renovation never cost energy. | Players quit when the story they came for is behind a timer. Gate the grind, never the reward. |
| "Bailout" packs at the moment of sunk-cost frustration | No interrupt offers in v1. Shop is a single calm screen. | Google Play's 2025+ policy pressure on manipulative monetization; and reviews. Convert on desire, not frustration. |
| Dual currency bought with cash from day one | Coins + gems both earned in play in v1. Play Billing SKUs are defined but inert until a release is approved. | Payments are Needs Approval under the operating protocol. Design the funnel now, flip it later. |
| Spatial puzzle "every three chapters" | Chapter 3 and chapter 6 are authored wire-routing gates with guaranteed solutions and a hint | Hand-authored puzzles feel fair; generated ones feel random. |
| Generic tier colors | Each chain has a color AND a shape AND a tier numeral | Color-blind safe; also reads at small sizes. |
| Haptic on every merge | Haptic on merge, chime pitch rises with tier, success arpeggio on tier-5 | Cheap, measurable dopamine. |

## Premise (kept, sharpened)
You inherit Halloway House, a decaying manor on the Washington coast, from great-aunt
Marguerite. She left a cassette answering machine full of voice notes and a house full of
locked doors. Someone else has a key.

## Core loop
1. Tap a generator on the workbench (1 energy) → drops a tier-1 item.
2. Drag identical items together → tier+1. Five identical → two of the next tier.
3. Deliver quest items → coins, gems, story progress.
4. Finish a chapter's quests → story scene (free) → next chapter.
5. Chapters 3 and 6 end in a wire-routing puzzle gate (free, hint available).
6. Spend coins in the Estate view to restore rooms; each fixture has two styles.

## Chains (5 tiers each)
- Tools: Rusty Nail → Bent Screwdriver → Hand Tools → Toolbox → Master Toolkit
- Keys: Key Fragment → Tarnished Key → Brass Key → Skeleton Key → Estate Key
- Lights: Matchbook → Candle Stub → Oil Lamp → Storm Lantern → Beacon Lamp
- Papers: Torn Page → Letter Fragment → Sealed Letter → Journal → Ledger
- Timber: Driftwood → Plank → Beam → Framing → Restored Timber

Generators: Toolshed Crate (Tools/Keys), Tide Basket (Timber/Lights), Writing Desk (Papers, rare Keys).

## Economy v1 (all earned, nothing sold)
- Energy: max 100, +1 per 90 s, chapter clear +30, puzzle clear +20.
- Coins: quest rewards; spent on renovation.
- Gems: chapter clear, puzzle full-fill bonus; spent on instant energy (20 gems = full) and board-clear.

## Play Billing SKUs (defined, inert until release approved)
- energy_small $0.99, energy_large $2.99, gem_pouch $4.99, estate_pass $9.99 (monthly: daily energy + exclusive styles).

## Honest numbers
No revenue projections. The pasted 70–80 % IAP / 20–30 % ads split is unsourced and treated as illustrative. First real number will be D1 retention from the Play internal test track.

## Out of scope for v1
Cloud save, accounts, ads, LiveOps events, rewarded video, cosmetic skins beyond two styles per fixture, chapters 7+.
