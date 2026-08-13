# Prompt — Generate the UI for Annual Operational Plan 2026

Copy-paste this entire brief into any AI design generator (v0, Lovable,
Figma AI, Galileo, Uizard, Windsurf, Vercel v0, Claude Artifacts, etc.).
It contains every design token, component spec, and behavior rule so
the generator doesn't guess.

---

## 1. What you are building

A single-file, client-side **Executive Dashboard** for an operational
plan. Users open one HTML file; enter monthly KPI values; track risks,
projects, and decisions; and export snapshots. **No backend, no
database, no accounts, no telemetry.** All state persists to
`localStorage` on the user's own device.

- **Deliverable:** ONE self-contained HTML file (all CSS inline in
  `<style>`, all JS inline in `<script>`, zero CDN, zero npm, zero build).
- **Optional companion files** for PWA install: `manifest.webmanifest`,
  `sw.js`, three SVG icons (192, 512, maskable).
- **Framework rule:** vanilla JavaScript only. No React, Vue, Svelte,
  Alpine, jQuery, Tailwind, Bootstrap.

---

## 2. Users

- Department director / executive — approves and reviews monthly
- Section managers — enter and validate KPI values
- Auditors / reviewers — inspect the snapshot, print for signature
- Data owners — close data-gaps checklist

Design for the director as the primary user. Everyone else is
secondary. The layout should make the current state understandable in
under five seconds of glance.

---

## 3. Design language

**Feel:** calm, professional, executive, credible. Low decoration. No
random gradients, no glassmorphism, no floating particles, no
emoji-heavy UI. This is a document that gets printed and signed, not
a marketing page.

### Color tokens (use these exact hex values)

| Token | Hex | Role |
|---|---|---|
| `--navy` | `#1A2A6C` | Primary — headers, active tabs, KPI card accent, chart |
| `--navy-2` | `#243085` | Hover / secondary accent |
| `--navy-deep` | `#0F1A4A` | Bottom of header gradient |
| `--red` | `#B91C1C` | Critical / off-track / red heatmap |
| `--teal` | `#0E7490` | Header border accent, custom KPI accent, install button |
| `--blue` | `#1D4ED8` | Digital / medium priority accent |
| `--green` | `#15803D` | On-track status, completed gaps |
| `--amber` | `#B45309` | Watch status, high-priority projects, warnings |
| `--grey` | `#475569` | Labels, meta text, muted |
| `--line` | `#E2E8F0` | Borders, dividers, pill backgrounds |
| `--bg` | `#F4F7FB` | Page background |
| `--bg-2` | `#EAF0F7` | Card gradient bottom |
| `--card` | `#FFFFFF` | Card background |

**Header gradient:** `linear-gradient(135deg, #243085, #1A2A6C 60%, #0F1A4A)` — full width, 24 px padding, 4 px teal border-bottom.

**Shadows:** `0 1px 2px rgba(15,23,42,.04), 0 6px 18px rgba(26,42,108,.06)` — soft, executive.

### Typography

- **Font stack (both LTR and RTL):**
  `system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, Tahoma, sans-serif`
  (system-ui MUST be first to avoid font-swap CLS shifts)
- **Scale:**
  - Page title (h1): 22 px, 800 weight
  - Section title (h2): 18 px, 800 weight, navy, with a 4 × 20 px teal accent bar `::before`
  - Card title (h3): 13–14 px, 800 weight, navy, uppercase for scope-cards
  - KPI value: 22 px, 800 weight, tabular numerals
  - Body: 13 px, 400 weight, `#0F172A`
  - Meta / label: 10–11 px, 700 weight, grey, letter-spacing 0.3–0.4 px, uppercase
- **Line-height:** 1.55 for body, 1.3 for headings.

### Spacing / radii / grid

- **Border radius:** 6 px (pills, small controls), 8 px (buttons, inputs), 12 px (cards)
- **Card padding:** 18–20 px
- **Grid gap:** 14–16 px
- **Max content width:** 1400 px, centered
- **Header padding:** 24 px × 32 px (mobile: 14 px × 16 px)
- **Touch target minimum on mobile:** 44 px

### Motion

- Transitions ≤ 200 ms, ease
- Card hover: `translateY(-2px)` + shadow lift
- No decorative animation. Respect `prefers-reduced-motion`.

---

## 4. Global layout

Top-to-bottom:

1. **Print cover page** — `display: none` except in `@media print`. See §6.9.
2. **Header** — dark gradient. Contains:
   - Title block (left): app name (h1) + subtitle
   - Meta block (right): version badge (teal), draft badge (amber), "Last updated" badge (translucent)
   - Global search input (icon-prefixed)
   - Action bar: **Install app** (teal, only visible when installable), **العربية / English** (ghost), **💾 Save**, **📂 Load**, **Reset data**, **Print / Export PDF** (primary — white on navy)
3. **Sticky top tabs** — 8 numbered tabs, visible on ≥ 768 px. Active tab: navy border-bottom + numbered pill flips from grey to navy background.
4. **Fixed bottom nav** — 8 icon-numbered buttons, visible on < 768 px only. Same tabs as #3, short labels.
5. **Main content** — max 1400 px, one tab-panel visible at a time.
6. **Footer** — small, muted, one-line disclaimer.

Deep-link tabs via URL hash: `#t1`..`#t8`.

---

## 5. The 8 tabs

### 5.1 Executive Summary (`#t1`)

- **Portfolio status strip** — auto-computed 4-cell grid at top:
  - "KPIs with values" — `X / 10` (green if all, amber if some, red if 0)
  - "Data gaps closed" — `X / 10`
  - "Decisions approved" — `X / 6`
  - "Red risks" — a raw number, always red
- **Executive message card** — white card with navy left-border (RTL: right-border). One or two paragraphs of plan purpose. Shows only the current language.
- **2 × 2 grid of scope cards:**
  - "What is Confirmed" — green dots, list of 6 items
  - "What is Pending" — amber dots, list of 6
  - "Version Scope" — teal dots, list of 6
  - "Key Decisions Required" — red dots, list of 6

Each scope card: h3 title with colored dot, then a `<ul>` of bullet items (each bullet has a small colored disc marker).

### 5.2 Monthly Dashboard (`#t2`)

- **Data integrity notice** — soft amber banner explaining that data stays on the device
- **KPI header bar** — [+ Add custom KPI] (teal) on the left, [CSV] (navy) on the right
- **KPI grid** — 2–4 columns depending on width. Each **KPI card**:
  - Impact-colored left accent bar (high=red, medium-high=amber, medium=blue)
  - Header: KPI name (h3, navy) + status badge (green/amber/red/grey pill)
  - Big value (22 px) + month label (e.g. "98 · Aug 2026")
  - Target line ("Target: ≥ 98%")
  - Sparkline slot (40 px reserved) — small inline SVG polyline of last 12 months, teal end-dot
  - Entry row: number input + [Save] button (bigger targets on mobile)
  - Footer: impact tag on left, [View details →] link on right
  - Custom KPIs get a teal "CUSTOM" corner tag

### 5.3 Asset Performance Plan (`#t3`)

- **Two-column comparison table** — traditional plan (left) vs Asset Performance Plan (right). Left column with grey ✗ prefix, right column with green ✓ prefix. Teal-highlighted right header.
- **5-stage roadmap** — 5 numbered circles in a horizontal row (stack on mobile). Stage 1 pre-highlighted as "active". Each stage is clickable and expands to reveal an "Activities / Outcome" detail block.

### 5.4 Projects & Budget Portfolio (`#t4`)

- **5 summary cards** — Total Projects, Total Portfolio Value, Approved Budget YYYY, Largest Project, Main Budget Focus
- **Filter row** — Category / Priority / Status / Budget selects + free-text search + [Reset] + [CSV]
- **Projects table** — columns: #, Project Name (bold navy), Category, Priority (colored pill), Status (colored pill), Estimated Value, Approved YYYY (right-aligned tabular numerals), Required Action
- **Budget chart** — horizontal or vertical bar chart of budget per category. Each bar clickable to add/edit a note; annotated bars show an amber "!" corner badge with a hover tooltip.

### 5.5 Risks & Controls (`#t5`)

- **3 × 3 heatmap** — first row header "Impact: Low/Medium/High", then three data rows keyed by likelihood (High/Medium/Low). Cells:
  - High/High, High/Med → Red gradient
  - Medium/High, Medium/Med, Low/High → Amber
  - The rest → dashed grey (empty visual)
  - Each cell shows a big count on top + level label under
- **Risk profile summary card** on the right — auto-computed sentence
- **Filter row** — Rating / Likelihood / Impact selects + search + [Reset] + [CSV]
- **Risks table** — #, Risk (bold navy), Likelihood, Impact, Rating (colored pill with dot), Mitigation

### 5.6 Digital Transformation (`#t6`)

- **Card grid (auto-fill, min 280 px)** — each card:
  - Teal top border, small icon-labelled tag ("PDM", "RCA", etc.) in corner
  - h3 title (14 px)
  - 3 fields: Objective / Asset Performance Value / Current Maturity (with a maturity bar — teal→blue gradient — and a "X% maturity" label) / Required Next Action
  - Optional meta tags at bottom (timeline, budget)

### 5.7 Data Gaps Tracker (`#t7`)

- **3 gap stat cards** — Not Started (red num), In Progress (amber), Completed (green)
- [CSV] button
- **Gaps table** — #, Required Data (bold), Source, Owner, Priority, Status — status column contains three interactive pills (Not Started / In Progress / Completed). Clicking a pill sets the status and updates the counters + Executive tab's portfolio status.

### 5.8 Decisions Required (`#t8`)

- **Card grid (auto-fill, min 320 px)** — each **decision card**:
  - Navy left-border (RTL: right)
  - h3 title with prefix number
  - "Why it matters:" paragraph
  - 2 × 2 meta grid: Required By / Owner / Status
  - Action pills row: [Approve] [Hold] [Decline] [Reset] — clicked pill becomes filled, others outlined; badge in meta grid updates to match

---

## 6. Shared components (specs)

### 6.1 Button

- **Primary:** white bg, navy text, 8 px radius, 7 × 12 px pad, 12 px font, 700 weight
- **Ghost (on dark):** transparent, white border 1 px @ 35% opacity, white text
- **Reset:** grey `--line` bg, navy text
- **Destructive:** soft red bg `#FEE2E2`, dark red text `#7F1D1D`
- **Focus:** 2 px teal outline, 2 px offset, 4 px radius

### 6.2 Input / select

- 8 px radius, 1 px `--line` border, white bg, 13 px, min-height 42 px on mobile
- Focus: navy border + 3 px navy @ 10% shadow ring
- Every input MUST have `<label for="">` or `aria-label`. Hidden labels use `.sr-only` (visually-hidden but screen-reader accessible).

### 6.3 Pill / badge

- 10 px font, 800 weight, uppercase, 0.3–0.4 px letter-spacing, 2 × 8 px pad, 999 px radius
- Variants: Critical (red bg/text), High (orange), Medium (blue), Low (grey), Active (green), Planning (amber), Study (cyan)
- Status pill: On track (green), Watch (amber), Off track (red), No data (soft amber)

### 6.4 Table

- Header: navy bg, white text, 11 px, 800 weight, uppercase, 12 px pad
- Body: 12.5 px, 11 × 10 px pad, striped even rows very light
- Hover: `--bg` background
- Wrapper: `overflow-x: auto`, `tabindex="0"` so keyboard users can scroll on mobile, focus outline teal

### 6.5 Modal

- Overlay `rgba(15,26,74,.42)` with 200 z-index
- Container: 580 px max width, 90 vh max height, 14 px radius
- Header: navy bg, sticky, white ✕ button (30 × 30, aria-label "Close")
- Body: 22 px pad, fields stacked with 10 px `--grey` uppercase labels
- On mobile: full-screen, radius top-only
- Focus: trap in modal, restore to trigger element on close, Esc key closes

### 6.6 Global search

- Header input with `🔍` icon prefix
- Dropdown appears on input, positioned absolute below the input
- Results grouped by section (KPIs / Projects / Risks / Data Gaps / Decisions) with grey uppercase group headings
- Each result: bold navy title + grey subtitle
- Click routes to correct tab; KPI clicks also open the KPI modal
- Escape / outside-click dismisses

### 6.7 Toast

- Fixed bottom-center, 24 px offset, navy bg, white text
- 8 px radius, `0 8px 24px rgba(15,26,74,.30)` shadow
- Slide-up in, fade out after 2.4 s
- `role="status" aria-live="polite"`

### 6.8 Chart annotations

- Click any bar → prompt for a note (blank input = remove)
- Amber "!" 16 × 16 circle badge in the top-right of annotated bar
- Hover shows navy tooltip with the note, small caret pointing down at the bar

### 6.9 Print cover page

- Only visible in `@media print`
- Contains: 32 px title, 16 px sub, 4-row meta block (Document / Prepared by / Print date / Status), Table of Contents (numbered list of 8 tabs), 2-column signature block (Reviewed by / Approved by) with a 2 px `#0F172A` top-border line

### 6.10 Portfolio status

- 4-cell auto-fit grid on Executive tab
- Big number (26 px, 800 weight) colored green / amber / red based on ratio
- Small uppercase label below

### 6.11 Sparkline

- Inline SVG, default 110 × 28 (card), 180 × 40 (modal)
- Navy polyline, 1.6 px stroke-width, round caps
- Teal end-dot (2.6 px radius) for latest month
- Empty state: return an SVG that RESERVES the space but draws nothing (prevents layout shift)

### 6.12 Heatmap

- CSS grid, 130 px + 3 fr columns
- Cells 90 px min-height, gradient background
- Clickable cells set the risk-rating filter

---

## 7. States (must all be designed)

| State | Requirement |
|---|---|
| Empty | Every list, table, chart, KPI card has a designed empty view with an "unset" affordance |
| Loading | Skeleton or subtle pulse; not a spinner in the center |
| Success | Toast on save + inline visual (green pill / filled state) |
| Error | Toast + inline red text on the offending field |
| Focus | Visible teal 2 px outline on every interactive element |
| Disabled | 50% opacity, no cursor pointer |
| Hover (desktop only) | Elevation lift on cards, background wash on rows |
| Active tab | Navy border-bottom + pill flip |

---

## 8. Interactions

- **KPI value entry** → auto-computes status vs target:
  - target-type "zero" → 0 = On track, else Off track
  - target-type "gte X" → ≥ X = On track, X-5 to X = Watch, < X-5 = Off track
  - target-type "trend" → presence alone = On track (user narrates)
- **Custom KPI** — [+ Add custom KPI] opens a form modal: EN name, AR name, target text, target type (dropdown), threshold number (only if gte), impact level. Save creates the card; open modal on the custom card has a red [Delete KPI] button.
- **Snapshot Save** — writes a JSON download with version, timestamp, kpi map, decisions, gaps, customKPIs, annotations.
- **Snapshot Load** — reads uploaded JSON, VALIDATES schema (right types, custom KPI count ≤ 200, name/id fields present), rejects malformed with a descriptive toast.
- **Reset data** — confirm dialog (locale-aware), then clears all localStorage keys and re-seeds defaults.
- **Language toggle** — flips `dir="rtl"` / `ltr` on `<html>`, swaps every visible label using an i18n dictionary, keeps state. Full mirror layout on RTL.
- **Install** — listen for `beforeinstallprompt`, reveal the Install button when the event fires, call `deferredPrompt.prompt()` on click.
- **Deep-link tabs** — `location.hash = '#t4'` opens Projects tab; tab clicks call `history.replaceState` (no back-button pollution); `hashchange` listener keeps external nav live.
- **CSV export per table** — UTF-8 with BOM (Excel + Arabic compatibility), ISO-8601-dated filename.
- **Chart annotation** — click a bar → `prompt()` for a note, save keyed by category name.
- **Print** — a `beforeprint` handler populates cover-page date and status.

---

## 9. Responsive rules

- **Breakpoint:** 767 px. Below → mobile. 768+ → desktop.
- **Mobile (<767 px):**
  - Top tabs hidden; bottom nav visible (fixed to `bottom: 0` with `safe-area-inset-bottom` padding)
  - Action bar wraps; buttons min-height 38–44 px
  - Filter row stacks vertically, inputs full-width
  - Modal takes 100% width/height with radius top-only
  - KPI grid → single column
  - Heatmap → 90 px header column + 3 equal-width data columns, smaller counts
- **Tablet / Desktop (≥768 px):**
  - Top tabs visible, horizontal scroll if overflow
  - Bottom nav hidden
  - Filter row inline
  - Modal centered, 580 px max

---

## 10. Internationalization (EN + AR)

- Every user-visible string flows through an i18n dictionary keyed by `en` / `ar`.
- Arabic strings are HAND-WRITTEN, not machine-translated.
- `<html dir>` flips between `ltr` and `rtl` on language toggle.
- Text alignment, borders (left/right), margin/padding directions, and dropdown positions MUST all mirror on RTL. Use logical properties or explicit `[dir="rtl"]` overrides.
- Sparkline direction and chart bar order do NOT mirror (data reads left-to-right in both).
- Numeric formatting: locale-aware for dates (`toLocaleDateString('ar-AE'|'en-GB')`); numbers stay Latin.

---

## 11. Accessibility (WCAG 2.2 AA — non-negotiable)

- Semantic HTML: `<h1>` page title, `<h2>` per section, `<h3>` per card. No skipped levels.
- Every form control has `<label for="">` or `aria-label`
- Every button has visible or aria label
- No nested interactive elements (no button inside a button)
- Visible `:focus-visible` outline on every interactive element (2 px teal, 2 px offset)
- Modal traps focus, Esc closes, focus returns to trigger element on close
- Scrollable regions (tables, chart) have `tabindex="0"` so keyboard users can scroll them
- Color contrast ≥ 4.5:1 for text
- Status changes announced (`aria-live="polite"` on toast, `role="status"`)
- Language switch updates `<html lang>` too, not just `dir`

---

## 12. Data + persistence

- All state saved to `localStorage` under a versioned key (`operationalPlan.v06`).
- Legacy-key fallback so older snapshot formats load.
- `saveState` wraps `localStorage.setItem` in try/catch; on `QuotaExceededError`, surface a bilingual toast telling the user to Save the JSON.
- Snapshot JSON validator: type check every field, cap custom-KPI count, reject with descriptive error BEFORE writing state.

---

## 13. What to deliver

1. **One HTML file** — self-contained, all CSS in `<style>`, all JS in `<script>`, zero CDN, zero build.
2. **manifest.webmanifest** — PWA metadata: `name`, `short_name`, `start_url`, `display: standalone`, `theme_color: #1A2A6C`, three icon entries (192, 512, maskable).
3. **sw.js** — service worker with `install` / `activate` / `fetch` handlers, cache-first strategy for the app shell.
4. **Three SVG icons** — 192 × 192, 512 × 512, 512 × 512 maskable. Use the navy gradient background and a stylized bar-chart mark.

---

## 14. Non-goals

- No LLM calls
- No backend, no API
- No user accounts, no login
- No analytics or telemetry
- No third-party fonts, no CDN
- No dark mode (unless the AI tool insists on adding it — then it must be a full separate palette, not just inverted)
- No decorative animations
- No fake / placeholder Lorem-ipsum data — use realistic operational-plan sample data

---

## 15. Success criteria

The generated UI is acceptable when:

- Lighthouse (mobile, hosted): **Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100**
- axe-core: **0 WCAG 2.2 AA violations** across every tab at both desktop and mobile viewports
- CLS ≤ 0.1 (use `system-ui` first in the font stack)
- 0 JS console errors
- Every tab renders under 2 s
- Layout works from 360 px up to 1440 px+ without horizontal scroll
- RTL flip is complete — nothing left aligned to the wrong side
- Printing produces a proper cover page + 8 sections, no interactive controls visible

Anything failing these criteria is a rework.
