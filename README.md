# Annual Operational Plan 2026

## Product Authority

| | |
|---|---|
| **Primary User** | Department director / planning lead |
| **Job To Be Done** | Manage annual & monthly performance without Excel chaos |
| **System of Record** | Targets, KPIs, monthly reviews, management actions |
| **System of Intelligence** | Deterministic trend alerts, traffic-light status |
| **Explicit Non-Goals** | Invoice validation engine (displays VERTEX results only) · task management (→ ExecFlow) · SaaS rewrite — the core stays offline |


Single-file client-side executive dashboard. Zero dependencies, zero
backend, zero telemetry. Everything persists to `localStorage` on the
user's own device; nothing is transmitted.

## Current release

**V0.6** — `Annual_Operational_Plan_2026_V0_6.html` (~160 KB).

Older versions are preserved alongside as historical references:

| File | Notes |
|---|---|
| `Annual_Operational_Plan_2026_V0_1.html` | Static seed, no interactivity |
| `Annual_Operational_Plan_2026_V0_2.html` | Live KPI entry + localStorage |
| `Annual_Operational_Plan_2026_V0_3.html` | Monthly history + sparklines + CSV export + deep-link tabs |
| `Annual_Operational_Plan_2026_V0_4.html` | Mobile-first + PWA + custom KPIs + global search + chart annotations + print cover page |
| `Annual_Operational_Plan_2026_V0_5.html` | Post-audit accessibility fixes (0 WCAG 2.2 AA violations) |
| **`Annual_Operational_Plan_2026_V0_6.html`** | Post-Lighthouse perf + hardening (this release) |

## What V0.6 adds on top of V0.5

- **CLS 0.49 → target ~0**: KPI cards reserve a fixed `min-height` and
  the sparkline slot always occupies its 40 px, so late-rendering content
  no longer shifts the layout.
- **`errors-in-console` fix**: favicon link added — no more 404 for
  `/favicon.ico`.
- **Heading order fix**: section titles are proper `<h2>`, card headings
  are `<h3>`. Skipped-level warnings gone.
- **localStorage quota resilience**: `saveState()` catches
  `QuotaExceededError`, surfaces a bilingual toast, and logs a warning
  telling the user to Save the snapshot to a file instead.
- **Snapshot import schema validation**: uploaded JSON is validated
  against a strict shape before it can populate state. Invalid files are
  rejected with a descriptive toast (e.g. `customKPIs: exceeds 200
  entries`) instead of loading silently.
- **Deployment configs**: `_headers` (Netlify), `netlify.toml`,
  `vercel.json` — ship-ready CSP, security headers, correct manifest
  MIME type, and `/` → current-release rewrite.

## Files in this folder

```
├── Annual_Operational_Plan_2026_V0_{1..6}.html   # release chain
├── manifest.webmanifest                          # PWA manifest
├── sw.js                                         # service worker (app-shell cache)
├── icon-{192,512,maskable}.svg                   # PWA icons
├── _headers                                      # Netlify security headers
├── netlify.toml                                  # Netlify deploy config
├── vercel.json                                   # Vercel deploy config
├── AUDIT_V0_4.md                                 # baseline audit + V0.5 fix report
├── RELEASE_READINESS.md                          # Gate A–G assessment (V0.5)
├── tests/audit.cjs                               # reproducible audit (Playwright + axe-core)
└── README.md                                     # this file
```

## How to use

### As a downloaded file (offline, single-user)

1. Download `Annual_Operational_Plan_2026_V0_6.html`.
2. Open it in any modern browser (Chrome, Edge, Safari, Firefox).
3. Enter KPI values, notes, decision statuses. Everything saves to your
   browser's `localStorage`.
4. Use the **Save** button in the header to export the current state as
   a JSON snapshot. Use **Load** on another device to import it.

### As a hosted app (Android install support, multi-device link)

Any static host works. Netlify or Vercel deploy in one click.

**Netlify:**
```bash
# From this operational-plan/ folder:
npx netlify deploy --prod --dir .
```

**Vercel:**
```bash
# From this operational-plan/ folder:
npx vercel --prod
```

**GitHub Pages:** use Settings → Pages → Source: GitHub Actions. See [DEPLOY.md](DEPLOY.md) for the tested static-package workflow and one-time setup.

Once hosted over HTTPS, Chrome on Android automatically detects the
manifest + service worker + icons and offers an "Install" prompt. The
header's **Install app** button lights up when the browser makes the
`beforeinstallprompt` event available.

### On Android (installed as an app)

After installing from a hosted HTTPS URL:

- Home-screen icon opens the plan fullscreen (no browser UI).
- App-shell is cached by `sw.js`, so the plan works offline.
- Data persists in the browser's `localStorage` for that origin.
- **Sync between devices** — use the Save/Load buttons to move a JSON
  snapshot between devices; there is no server-side account.

## Reproducing the checks

```sh
npm ci
npx playwright install --with-deps chromium
npm test
npm run build
npm run test:browser
npm run test:audit
```

Node-only regressions cover persistence, legacy migration, deletion, invalid
snapshots and keyboard-control markup. Browser acceptance covers custom KPI
create/update/delete, save/reload, exported JSON restore in a fresh context,
invalid-import preservation, Arabic/English accessibility including dialogs,
and offline reload/edit/save under a repository subpath. The original ten-suite
audit also runs with local pinned dependencies. CI rejects P0 or P1 findings.

The 2026-10-23 hardening fixes prevent deleted final-month values resurfacing,
validate nested snapshot data before rendering, make decision/gap actions
keyboard-operable, label dialog controls and retain focus within dialogs.
Service-worker cache cleanup is scoped to this application's cache names.
These changes do not add a server or telemetry. See [DEPLOY.md](DEPLOY.md) for
current hosting status verification and the backup contract. Historical audit
scores in older documents are not evidence of a current live deployment.

## Non-goals

This project does **not** call any AI model, does **not** have a
backend, does **not** collect analytics, and does **not** send data
anywhere. It is a client-only executive-dashboard document. If you need
cloud sync, multi-user editing, or LLM assistance, it needs a companion
service — not a rewrite of this file.

## Content safety

All content is deliberately generic. Zero references to any organisation,
city, or vendor across the HTML, service worker, manifest, or icons.
The seed data models rail-maintenance operational KPIs at abstract level
for illustration.

