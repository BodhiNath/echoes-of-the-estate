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

## Status 2026-10-17 (end of session)
Done:
- Keystore `H:\EchoesOfTheEstate-Keys\echoes-upload.jks` (alias `echoes`); password in `echoes-upload.password.txt` beside it.
- Signed bundle `H:\EchoesOfTheEstate-TWA\app-release-bundle.aab` (versionCode 1, 0.1.0) and `app-release-signed.apk`. Upload cert SHA-256 `CE:96:FA:48:…:9E:98`.
- Asset links live: https://bodhinath.github.io/.well-known/assetlinks.json (repo BodhiNath/bodhinath.github.io).
- Privacy policy live: https://bodhinath.github.io/echoes-of-the-estate/privacy.html
- Store assets in `store/`: 3 phone screenshots (800×1599) + feature graphic 1024×500. Listing text in `docs/PLAY-LISTING.md`.
- Android project repo: BodhiNath/echoes-of-the-estate-android.

Remaining (Play Console, in the owner's Chrome — https://play.google.com/console/):
1. Choose developer account → Create app → name "Echoes of the Estate", Game, Free, English (US).
2. Set up app: privacy policy URL above; App access = all functionality available without restrictions; Ads = no; Content rating questionnaire (Puzzle, nothing flagged); Target audience 13+; Data safety = no data collected or shared; Government app = no; Financial features = none; Health = none; News = no; Category Games › Puzzle.
3. Main store listing: paste from `docs/PLAY-LISTING.md`; upload `icons/icon-512.png`, `store/feature-graphic-1024x500.png`, and the three screenshots.
4. Testing › Internal testing → Create release → upload `app-release-bundle.aab` → accept Play App Signing (Google-managed key) → add testers → Save and roll out.
5. Copy the **App signing key certificate** SHA-256 from Setup › App integrity and add it to `assetlinks.json` (second entry in the fingerprints array), commit and push. Without this the TWA shows a browser bar on devices that installed from Play.
6. After internal-test install proves the TWA opens full-screen, promote to Production and submit for review.

Build-environment notes (Windows): bubblewrap config `jdkPath` must be the 8.3 short path (spaces break apksigner); `androidSdkPath` is `…\Sdk\cmdline-tools\latest` with a junction `build-tools → ..\..\build-tools`; `local.properties` points Gradle at the real SDK root; run `bubblewrap build` from PowerShell with the project folder on PATH.

## Status 2026-10-18 — Play Console (done in owner's Chrome, HomFax TM account)
- App created: "Echoes of the Estate", com.echoesestate.game, Game, Free. App id 4976442430252424047.
- Internal testing release **2 (0.1.0)** published (versionCode 2, minSdk 24, targetSdk 36). Tester list "Echoes Internal" (owner's two addresses). Opt-in link: https://play.google.com/apps/internaltest/4701312758709011886
- Play App Signing on (Google-managed key). App signing SHA-256 `BB:C1:1B:F3:…:98:6D` added to assetlinks.json (live) and twa-manifest.json.
- Default store listing saved (text from PLAY-LISTING.md, icon, feature graphic, 3 screenshots, AI assets: not labelled).
- App content declarations saved: privacy policy, ads (none), sign-in (none required), content rating (IARC: ESRB Everyone, all "No"), target audience 13+, data safety (no collection/sharing), advertising ID (not used), government (no), financial (none), health (none).
- Store settings: Game › Puzzle; contact email + website published.
- "Send app for review" is still locked: Play requires a **closed test with ≥12 opted-in testers for 14 days** on this (personal) developer account before production access can be requested. Internal testing is unreviewed and shows the temporary name "com.echoesestate.game (unreviewed)" until then.

Next (owner, or Claude with permission):
1. Closed testing › Alpha › Create new release › Add from library (bundle 2) › release notes › Save and publish.
2. Add testers (12+ real people) to the Alpha track and send them the opt-in link.
3. After 14 days with ≥12 opted-in, Dashboard › Apply for production access, then promote to Production.

Lessons: build-tools 34 junction + 8.3 JDK path + local.properties are all required on this machine; the Play Console asset uploader has no file input — drop events built from fetched files (GitHub Pages URLs) work; dialogs that say "Publish change on Google Play?" must be confirmed before navigating away.

## Status 2026-10-18 (later) — submitted for review
- Closed testing › Alpha: release 2 (0.1.0) saved; 177 countries + rest of world; testers = Echoes Internal only; feedback email set.
- **16 changes sent to Google for review** from Publishing overview (quick checks, then review; typically up to 7 days). Internal testing stays live meanwhile.
- Closed-test opt-in link (works once review passes and the track is live): https://play.google.com/apps/testing/com.echoesestate.game
- Owner to do: add real testers to the "Echoes Internal" email list (Internal/Closed testing › Testers › arrow on the list) until ≥12 have opted in via the link above; after 14 continuous days, Dashboard › Apply for production access.
- Note: the pre-existing lists Beta Testers (8), Beta (9) and Pipely Beta Test (10) were deliberately left unticked to keep the game separate from Pipely; ticking them is the fastest route to 12 if the owner is fine with that.
