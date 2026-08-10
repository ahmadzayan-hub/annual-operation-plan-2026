# Release Readiness — Annual Operational Plan V0.6

**Current file:** `operational-plan/Annual_Operational_Plan_2026_V0_6.html`
**Companions:** `manifest.webmanifest`, `sw.js`, three SVG icons,
`_headers` (Netlify), `netlify.toml`, `vercel.json`
**Version chain:** V0.1 → V0.2 → V0.3 → V0.4 → V0.5 (post-audit a11y)
→ **V0.6** (post-Lighthouse perf + hardening + deployment configs).
Prior versions preserved in the folder as historical references.

**Verdict:** **Release-ready.** All four Lighthouse categories at 100
after the font-stack fix pinned the last outstanding CLS shift.

---

## Gates — status

| Gate | Applies? | Result | Evidence |
|---|---|---|---|
| **A. Build quality** | Partial | ✅ | No build step; syntax verified via headless load (0 pageerror, 0 console.error) |
| **B. Testing** | Yes | ✅ | `tests/audit.cjs` — 10 suites × 8 tabs × 2 viewports; **0 findings on V0.6** |
| **C. UX** | Yes | ✅ | All critical journeys verified in audit + Lighthouse |
| **D. Performance** | Yes | ✅ | Lighthouse Perf **100** mobile hosted (up from 62 on V0.5), CLS **0.005**, TBT 0 ms, TTI 1.5 s |
| **E. Security & privacy** | Yes (client-only) | ✅ | 5 XSS vectors clean, snapshot import schema-validated, quota-safe, no network egress, CSP + security headers shipped for Netlify/Vercel |
| **F. AI quality** | ❌ N/A | — | No LLM in this project |
| **G. Documentation** | Yes | ✅ | AUDIT_V0_4.md, RELEASE_READINESS.md (this), README.md, deployment configs |

---

## Gate detail — what changed since V0.5

### Gate A — Build quality
Unchanged. No build. Verified 0 pageerror + 0 console.error on hosted
load.

### Gate B — Testing
Custom audit: **0 findings** across P0/P1/P2/P3.
Lighthouse now runs against a locally-hosted URL for realistic numbers.

### Gate D — Performance (verified numbers)

Lighthouse V0.6.1, hosted local, mobile emulation:

| Metric | V0.4 baseline | V0.5 | V0.6 | **V0.6.1** |
|---|---|---|---|---|
| Performance | not measured | 62 | 79 | **100** ↑38 vs V0.5 |
| Accessibility | not measured | 98 | 100 | **100** |
| Best Practices | not measured | 96 | 100 | **100** |
| SEO | not measured | 100 | 100 | **100** |
| First Contentful Paint | 92 ms (file://) | 1.6 s | 1.5 s | **1.4 s** |
| Largest Contentful Paint | — | 1.6 s | 1.5 s | **1.5 s** |
| Total Blocking Time | — | 640 ms | 0 ms | **0 ms** |
| Interactive (TTI) | — | 2.4 s | 1.5 s | **1.5 s** |
| Cumulative Layout Shift | — | 0.49 | 0.49 | **0.005** ↓ 100× |
| errors-in-console | — | 1 (404 favicon) | 0 | **0** |
| heading-order | — | fail | pass | **pass** |
| bf-cache | — | disabled | eligible | **eligible** |

**CLS resolution.** The stuck 0.49 CLS turned out to be a font-swap
shift, not a layout-reservation issue. My original stack `'Segoe UI',
'Helvetica Neue', Arial, Tahoma, sans-serif` forced multiple font-family
resolutions on the Chromium container running Lighthouse (Segoe UI is a
Windows font, not present), and each cascade step produced different
text metrics — hence the shift on `<main>`. Prepending
`system-ui, -apple-system` to the stack resolves to the OS system font
on the first try, eliminating the metric change. CLS dropped from 0.49
to **0.005** (target is ≤ 0.1). Documenting the root cause for the next
time someone hits this — CLS pointing at `<main>` with no sources
almost always means font swap.

### Gate E — Security & privacy

Verified in V0.5 for XSS (5 vectors clean) — re-verified in V0.6.
**New in V0.6:**

- **Snapshot import schema validation** (`validateSnapshot()`): rejects
  imported JSON with wrong shape or > 200 custom KPIs with a descriptive
  toast instead of silently loading.
- **localStorage quota resilience**: `saveState()` catches
  `QuotaExceededError` and surfaces a bilingual toast; was silent in V0.5.
- **Deployment security headers** shipped:
  - `Content-Security-Policy` restricting scripts/styles to `self` +
    `unsafe-inline` (required for the app's inline JS/CSS);
    `img-src` allows `data:` for CSV BOM only; every other directive is `self`.
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Resource-Policy: same-origin`
  - `manifest.webmanifest` served with correct `application/manifest+json`
  - Cache-Control tuned for bf-cache eligibility (no `no-store`)

### Gate G — Documentation

Present in repo:
- `README.md` — folder overview, install paths, deployment recipes
- `AUDIT_V0_4.md` — full baseline audit + V0.5 fix report
- `RELEASE_READINESS.md` — this file
- `tests/audit.cjs` — reproducible audit
- Inline: JS commented, i18n keys named hierarchically, snapshot format
  documented in save/load handlers

---

## Unresolved risks / known limitations

| # | Risk | Impact | Status |
|---|---|---|---|
| 1 | Not tested on real Android device | PWA install flow only structurally verified | User needs to smoke-test after hosting on HTTPS |
| 2 | Only Chromium tested (Playwright default; no Firefox/WebKit in this env) | Behavior unverified on other engines | Cross-browser suite would take ~15 min once binaries available |
| 3 | No user research | UX judgments are heuristic | Not a shipping blocker for an internal working baseline |
| 4 | Unused JS ~21 KiB (Lighthouse) | Some Arabic i18n strings unused until AR toggle | Not wasteful — used the moment user toggles AR |

Resolved in V0.6.1:
- ✅ Lighthouse CLS 0.49 → 0.005 via font-stack pinning

Resolved since V0.5:
- ✅ localStorage quota silent failure → catches + toasts (was #5 in V0.5)
- ✅ Snapshot import schema validation → strict validator (was #6 in V0.5)
- ✅ Lighthouse not run → run and reported real numbers (was #1 in V0.5)
- ✅ CSP + security headers for hosted deployment → `_headers` + `vercel.json`

---

## Reproduce

```bash
cd operational-plan

# Custom audit (Playwright + axe-core, 10 suites)
node tests/audit.cjs                  # V0.6 current  → 0 findings
OPLAN_VERSION=v5 node tests/audit.cjs # V0.5 baseline → 0 findings
OPLAN_VERSION=v4 node tests/audit.cjs # V0.4 baseline → 9 findings

# Lighthouse (hosted mobile emulation)
http-server . -p 8765 -s -c-1 &
npx lighthouse http://127.0.0.1:8765/Annual_Operational_Plan_2026_V0_6.html \
  --output=json --output-path=/tmp/lh.json \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu"
```

Prerequisites installed once in the container:
```bash
npm install --prefix /tmp axe-core@4 lighthouse chrome-launcher
```

---

## Recommendation

**Ship V0.6.** Deploy to Netlify or Vercel (configs included; one
command each). Smoke on Android Chrome after HTTPS is up — that's the
one live-device gate this audit couldn't cover.
