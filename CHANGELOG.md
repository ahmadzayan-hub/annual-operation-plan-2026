# Changelog — Annual Operational Plan

All notable changes to the operational-plan deliverable. Dates are the
commit date on branch `operational-plan-v03`.

Each version is a self-contained HTML file preserved in this folder for
reference. Only the latest version is the "active" one — see `README.md`
for the current release.

---

## V0.6.1 (current) — Performance perfect scores

**Highlight:** Lighthouse Perf **100 / 100 / 100 / 100** on mobile.

### Fixed
- **CLS 0.49 → 0.005** — root cause was font-swap, not layout reservation.
  Prepending `system-ui, -apple-system` to the font stack resolves
  immediately on Chromium/other engines instead of falling through
  `'Segoe UI'` (Windows-only) → Helvetica → Arial with different text
  metrics on each step.

### Verified
- Performance: 79 → **100** (+21)
- CLS: 0.49 → **0.005** (100× under the 0.1 target)

---

## V0.6 — Post-Lighthouse hardening + deploy configs

Lighthouse against V0.5 surfaced 4 real perf issues and 2 client-side
gaps the axe-only audit missed. V0.6 fixes both categories and ships
one-command deploy configs.

### Added
- `README.md` — folder overview, deploy recipes for Netlify / Vercel / Pages
- `_headers` (Netlify) — CSP, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy, COOP, CORP; correct manifest MIME type; bfcache-
  friendly Cache-Control
- `netlify.toml` — one-command deploy, `/` rewrites to current release
- `vercel.json` — same for Vercel
- Snapshot import schema validator (`validateSnapshot()`): rejects
  malformed JSON with descriptive toast BEFORE any state is written
- localStorage quota resilience: `saveState()` catches
  `QuotaExceededError` and surfaces a bilingual toast

### Fixed (Lighthouse-flagged)
- `errors-in-console` (favicon.ico 404) — added `<link rel="icon">`
- `heading-order` — `.section-title` divs promoted to `<h2>`, card
  `<h4>` → `<h3>`
- `bf-cache` disabled — `_headers` sends `Cache-Control: no-cache`
  (not `no-store`) so the page is eligible for back/forward cache

### Verified
- Performance: 62 → 79 (mobile hosted)
- Best Practices: 96 → 100
- Accessibility: 98 → 100
- Total Blocking Time: 640 ms → 0 ms
- Time to Interactive: 2.4 s → 1.5 s

### Storage
- Snapshot format bumped to v06; loads v05 / v04 / v03 / v02 files
  transparently via `LEGACY_KEYS` fallback

---

## V0.5 — Post-audit accessibility fixes

Master-prompt audit template applied to V0.4 surfaced 9 findings (0 P0,
8 P1, 1 P2). V0.5 lands the fixes; result is 0 findings across all
severities.

### Added
- `tests/audit.cjs` — reproducible headless audit runner (Playwright +
  axe-core; 10 test suites)
- `AUDIT_V0_4.md` — full baseline report with severity, root cause,
  reproduction command
- `RELEASE_READINESS.md` — Gate A–G assessment

### Fixed (axe-core violations)
- `nested-interactive` on KPI cards — removed `role="button"` from
  cards, added explicit `.kpi-details-btn` in card footer
- `label` on `#file-in` hidden JSON upload input
- `select-name` on 6 filter selects — added `for=` on every `<label>`
  plus `aria-label` on every `<select>`
- Two search inputs got `.sr-only` visually-hidden labels
- `scrollable-region-focusable` on `.table-wrap` and `#barChart` —
  `tabindex="0"` + `role="group"` where needed + visible focus outline
- Mobile breakpoint: `max-width: 768px` → `max-width: 767px` so 768 px
  portrait tablets get the desktop nav
- `#lbl-install` (PWA Install button) missing translation added
- Focus restore: `openKpiModal` records `document.activeElement`;
  `closeModal` restores focus to trigger

### Verified
- 9 findings → 0
- All 8 tabs at desktop 1440 + mobile 390 clean under axe-core WCAG
  2.0/2.1/2.2 A+AA

---

## V0.4 — Mobile-first + PWA (Android installable)

### Added
- Bottom tab bar visible on `<768px`, top tabs hidden — one-thumb
  navigation with 8 short EN/AR labels
- 44 px touch targets on inputs, buttons, filters, pills
- Modal full-screen on phones with sticky header
- Compact heatmap grid on narrow viewports
- PWA: `manifest.webmanifest`, `sw.js`, three SVG icons (192, 512,
  maskable). Service worker caches app shell for offline use
- Header "Install app" button (appears when Chrome fires
  `beforeinstallprompt`)
- Custom KPI CRUD: user can add / edit / delete KPIs on top of the
  built-in 10; custom KPIs render with teal accent + "CUSTOM" tag
- Global search across KPIs / projects / risks / gaps / decisions with
  live-filtered results dropdown
- Chart annotations: click a bar to add / edit / remove a note; amber
  "!" badge + hover tooltip on annotated bars
- Print cover page (first PDF page) with title, prepared-by, date,
  live status summary, TOC, reviewer + approver signature blocks

### Fixed
- All prior versions unchanged as historical references

---

## V0.3 — Monthly history + deep-links + CSV

### Added
- Per-KPI monthly history (`YYYY-MM` → value) with SVG sparklines
  showing the trend on each card
- Modal history workspace: large sparkline, editable table for every
  month, month-picker for backfill
- Deep-link tabs (`#t1`..`#t8` in URL, restored on load)
- CSV export per filterable table (UTF-8 BOM for Excel + Arabic)
- Persistent filters — project + risk filter state survives reload
- Fixed heatmap "Low" row was hardcoded to 0

### Verified
- Backwards compatible: V0.2 snapshots load, flat values auto-promote
  to current month

---

## V0.2 — Live entry, bilingual UI, snapshot I/O

### Added
- Live KPI value entry per card, auto-status vs target (green/amber/red)
- Full `localStorage` persistence for KPIs, notes, decisions, gaps
- Complete EN↔AR language toggle (dir, every label, hand-written Arabic)
- JSON snapshot Save / Load for sharing state across users/devices
- Notes per KPI (in modal) — audit trail
- Decision approval workflow: Approve / Hold / Decline / Reset
- Auto-computed portfolio status on Executive tab
- Reset all data (with confirm prompt, locale-aware text)
- Keyboard nav: cards focusable, Enter opens modal, Esc closes
- Toast notifications for save/load/reset

---

## V0.1 — Static seed

Static executive dashboard baseline. 8 tabs (Exec Summary, Monthly
Dashboard, Asset Performance Plan, Projects & Budget, Risks & Controls,
Digital Transformation, Data Gaps V1.0, Decisions Required), 10 KPI
cards, 10 projects with filters, 10 risks with heatmap, 8 digital
initiatives, 10 data gaps tracker, 6 decision cards, 5-stage roadmap,
bilingual titles, single self-contained HTML.

No interactivity beyond tab switching, filters, and gap-status pills
(the last only in-memory).
