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
