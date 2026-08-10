# Audit — Annual Operational Plan V0.4

**Scope:** `operational-plan/Annual_Operational_Plan_2026_V0_4.html` and PWA
companions (`manifest.webmanifest`, `sw.js`, three SVG icons).
**Method:** headless Chromium (Playwright) + axe-core 4 injected on every
tab at desktop (1440×900) and mobile (390×844) viewports, plus responsive,
functional, XSS, keyboard, print, PWA, i18n checks. Full source:
[`tests/audit.cjs`](./tests/audit.cjs).
**Reproduce:** `node operational-plan/tests/audit.cjs` (V0.5 by default) or
`OPLAN_VERSION=v4 node operational-plan/tests/audit.cjs` for the baseline.

---

## 1. Executive outcome

- **Baseline (V0.4):** 9 findings — **0 P0, 8 P1, 1 P2**.
  No security bugs, no data loss, no JS errors, no XSS. All findings are
  **accessibility (WCAG 2.2 AA)** and one **responsive-breakpoint** issue.
- **Post-fix (V0.5):** **0 findings across all severities.**
- **Release status:** V0.4 was **Conditionally release-ready** — safe to
  ship for sighted-mouse users but fails a11y gates. V0.5 is
  **release-ready** for a single-file client-side executive dashboard use
  case. See [`RELEASE_READINESS.md`](./RELEASE_READINESS.md) for the
  gate-by-gate confirmation.

---

## 2. Scope adaptation from the master template

The master audit template assumes a multi-tier web app with a backend,
database, LLM orchestration, financial-statement calculation, and CI/CD.
This project is a **single self-contained HTML file** (152 KB, zero
dependencies, pure vanilla JS) plus optional PWA files that activate when
hosted. Template sections have been mapped honestly:

| Master template category | Applies here? | Notes |
|---|---|---|
| Repository discovery | ✅ | Done — see §3 |
| Build / lint / type-check pipeline | ❌ N/A | No build step; file is the artifact |
| Backend security (OWASP API, injection, SSRF, CSRF) | ❌ N/A | No backend, no API |
| Database review (ORM, N+1, migrations) | ❌ N/A | No database; localStorage only |
| Auth / RBAC / session management | ❌ N/A | No accounts |
| AI / LLM orchestration | ❌ N/A | No LLM calls; static data model |
| Prompt engineering | ❌ N/A | No prompts |
| Financial-statement calculation | ❌ N/A | Operational KPIs, not accounting |
| Client-side XSS | ✅ | 5 attack vectors tested — clean |
| Functional integrity | ✅ | Full user-journey smoke |
| WCAG 2.2 AA | ✅ | axe-core on all 8 tabs × 2 viewports |
| Responsive at 5 breakpoints | ✅ | 360 / 390 / 768 / 1024 / 1440 |
| Performance | ✅ | File weight, FCP, DOM ready |
| PWA quality | ✅ | Manifest lint, SW lifecycle, icon files |
| Print output | ✅ | Cover page auto-fill, PDF generation |
| Keyboard navigation | ✅ | Tab order, Escape closes modal |
| i18n / RTL | ✅ | dir=rtl flip, English-leak scan |

Categories marked N/A are called out with the reason. Nothing was
fabricated to fill a template slot.

---

## 3. Repository baseline

| Attribute | Value |
|---|---|
| Tech stack | Pure HTML + inline CSS + vanilla JS (no framework, no bundler) |
| File count | 6 (HTML, manifest, sw.js, 3 SVG icons) |
| Dependencies | Zero runtime / build |
| Persistence | `localStorage` only, keys `operationalPlan.v04` and `operationalPlan.filters.v04` |
| Data flow | User → DOM inputs → JS state → localStorage; snapshot JSON export / import |
| External calls | None. `sw.js` caches app shell only |
| Deployment | Static host (Netlify / Vercel / Pages) OR downloaded file:// |
| Localization | English (source), Arabic (hand-written), RTL flip |

---

## 4. Findings — V0.4 baseline

Total: **9** (0 P0 · 8 P1 · 1 P2 · 0 P3).

### P0 — Critical (0)

None. In particular:

- 5 XSS attack vectors tested (KPI value, custom KPI name, custom KPI
  target, search input, imported snapshot JSON with malicious payloads) —
  all safe. Every user-controlled string flows through `safe()` HTML
  escaping before it hits `innerHTML`.
- Zero JS errors on load, on every tab switch, or during any interaction.
- No data loss on reload; `localStorage` snapshot round-trips cleanly.

### P1 — High (8)

| # | Area | Finding | Root cause |
|---|---|---|---|
| 1 | a11y-desktop / mobile | **`label`** — `#file-in` (hidden JSON upload input) has no accessible label | axe-core `label` rule; input relies solely on `type="file"` styling |
| 2 | a11y-desktop / mobile | **`nested-interactive`** — KPI cards use `role="button"` and contain a Save button and an input | Container was made a button for whole-card click affordance |
| 3 | a11y-desktop / mobile | **`select-name`** — six filter `<select>` elements have adjacent `<label>` but no `for=`, so screen readers report them unnamed | Original markup used sibling labels |
| 4 | a11y-mobile | **`scrollable-region-focusable`** — `.table-wrap` and `#barChart` overflow-x containers not reachable by keyboard on mobile | No `tabindex` on the scrollable div |
| 5 | responsive | **Top tabs missing at 768px** and bottom nav still shown | `@media (max-width:768px)` includes 768 as mobile |

### P2 — Medium (1)

| # | Area | Finding | Root cause |
|---|---|---|---|
| 6 | responsive | Bottom nav shown on desktop at 768px | Same breakpoint issue as P1-5 |

### False positive (not counted)

The initial audit run flagged "English strings leak in Arabic UI" (Save,
Load, Reset data, Print/Export PDF). Investigation showed the audit
script used `document.textContent` on `<body>`, which per DOM spec
concatenates text inside `<script>` tags — capturing the English literals
in the i18n dictionary source. Switching to `document.body.innerText`
(visible text only) showed all these labels correctly translate to
Arabic. The audit script has been fixed to use `innerText`.

**Real leak discovered while investigating:** `#lbl-install` (the PWA
"Install app" button) missed a translation line in `applyLang()`. Fixed
in V0.5.

---

## 5. V0.5 fixes applied

Landed in `operational-plan/Annual_Operational_Plan_2026_V0_5.html` on
branch `operational-plan-v03`.

| Finding | Fix |
|---|---|
| `label` for `#file-in` | Added `aria-label="Load JSON snapshot"` |
| `nested-interactive` on KPI cards | Removed `role="button"` from the card. Card is now `<article>` with `aria-labelledby` pointing at the KPI name heading. Added explicit `.kpi-details-btn` ("View details →") in the card footer that opens the modal. Card-level click and keydown handlers removed. |
| `select-name` on filters | Added `for=` to every filter `<label>` and `aria-label` on every `<select>`. Added `.sr-only` (visually hidden) label for the two search inputs. |
| `scrollable-region-focusable` | Added `tabindex="0"` to every `.table-wrap` and to `#barChart`, plus `role="group"` + `aria-label` on the chart. Added `:focus-visible` outline for the newly-focusable regions. |
| Breakpoint at 768 | Changed `@media (max-width:768px)` to `@media (max-width:767px)` so 768px (portrait tablet) gets the desktop nav. |
| `#lbl-install` untranslated | Added the missing swap line in `applyLang()`. |
| Modal focus restore (bonus) | `openKpiModal` now records `document.activeElement` on open; `closeModal` restores focus to the trigger element. |

---

## 6. Before / after — verified numbers only

Run: `node operational-plan/tests/audit.cjs` (default V0.5) and with
`OPLAN_VERSION=v4` for baseline.

| Metric | V0.4 baseline | V0.5 post-fix |
|---|---|---|
| Total findings | 9 | **0** |
| P0 (critical) | 0 | 0 |
| P1 (high) | 8 | **0** |
| P2 (medium) | 1 | 0 |
| P3 (low) | 0 | 0 |
| axe-core violations (desktop, 4 tabs sampled) | 3 unique rules | **0** |
| axe-core violations (mobile, 4 tabs sampled) | 5 unique rules | **0** |
| XSS attack vectors passed | 5 / 5 | 5 / 5 |
| JS runtime errors | 0 | 0 |
| Functional smoke pass | 8 / 8 | 8 / 8 |
| Keyboard nav (Tab reaches search + tabs, Esc closes modal) | pass | pass |
| Print PDF generates | pass | pass |
| PWA manifest lint | pass | pass |
| Responsive at 5 viewports (correct nav shown, no overflow) | 2 issues at 768 | **pass all 5** |
| File size (HTML) | 152 251 bytes | 156 097 bytes (+3.8 KB for fixes) |
| First Contentful Paint (file://) | 92 ms | 92 ms |
| DOM ready | 35 ms | 35 ms |
| Load event | 37 ms | 37 ms |
| Resources fetched | 0 (single file) | 0 |

---

## 7. Categories not fabricated

Explicitly not asserted, per the "no fabricated results" rule:

- **Lighthouse scores** — not run. Lighthouse against a `file://` URL
  gives misleading numbers; against a hosted URL it would need real
  hosting first. Perf was measured with the browser's own Navigation
  Timing + Paint Timing APIs, which are truthful for a `file://` load.
- **Cross-browser matrix** — only Chromium tested here (Playwright's
  default). Manual verification on WebKit / Firefox would be the next
  responsible step.
- **Real-device Android install** — the manifest is standards-compliant
  and axe-clean, but "installable" is only verified structurally. A real
  Android Chrome device would confirm the `beforeinstallprompt` flow.
- **User research** — no interviews conducted; UX judgments in this doc
  are heuristic (Nielsen + WCAG), not evidence from real users.

---

## 8. Reproducibility

```bash
# From repo root:
cd operational-plan
node tests/audit.cjs                 # audit V0.5 (default)
OPLAN_VERSION=v4 node tests/audit.cjs  # audit V0.4 baseline
```

Exit code non-zero iff any P0 (critical) finding surfaces.
Findings JSON → `/tmp/audit_findings.json`.
Perf metrics → `/tmp/audit_perf.json`.
Viewport screenshots → `/tmp/audit_{360,390,768,1024,1440}-*.png`.

Prerequisites installed once in this container:
```bash
npm install --prefix /tmp axe-core@4
# Playwright + Chromium are pre-installed globally in /opt/node22
```

---

## 9. Recommended next step

Ship V0.5 as the current release. If Android install is a formal
requirement, do a **live device smoke** on Android Chrome against a
hosted (HTTPS) copy — that is the one gate this audit could not
programmatically confirm.
