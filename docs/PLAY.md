# Google Play rollout (Trusted Web Activity)

Same pipeline that shipped Pipely. Nothing here is run until a Play release is approved.

## 1. Host
GitHub Pages serves the PWA over HTTPS at the URL in the README. Every push to `main` redeploys.

## 2. Wrap
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://<pages-url>/manifest.webmanifest
#   package id: com.echoesestate.game   (NOT a Pipely or HomFax id)
#   signing key: a NEW keystore for this app, stored in H:\EchoesOfTheEstate-Keys (never in the repo)
bubblewrap build
```

## 3. Digital Asset Links
Put the SHA-256 of the new signing key into `/.well-known/assetlinks.json` on the Pages site so the TWA opens full-screen without the browser bar.

## 4. Play Console
- New app, Games > Puzzle, free, contains no ads, no in-app purchases (v1).
- Internal test track first. First real metric: D1 retention from that track.
- Data safety: no data collected, no data shared (save is local only).

## 5. Billing (later, Needs Approval)
Add the four SKUs from `js/data.js` as managed products / a subscription in Play Console, then wire the Digital Goods API in the TWA. Keep `estate_pass` under Play's $999.99 per-period cap (it is $9.99).

## Do not
- Do not reuse the Pipely keystore, package id, or Play listing.
- Do not add a Play trial offer on top of any in-game free period.
