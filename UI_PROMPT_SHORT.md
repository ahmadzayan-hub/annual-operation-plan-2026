# UI prompt — short version

Compact brief for **visual-first design tools** (v0.dev, Figma AI /
Figma Make, Lovable, Galileo AI, Uizard, Windsurf, Vercel v0).
For full-code generators (Claude Artifacts, code-model IDEs), use
`UI_PROMPT.md` instead — it has behavior and validation rules those
tools need.

---

## Copy from here

Design a single-page **Executive Operational Plan dashboard** — a
calm, professional interface for a department director to review
monthly KPIs, projects, risks, and decisions. Think enterprise SaaS
polish (Linear, Vercel, Notion), not marketing-page glitz. No
gradients except the header, no glassmorphism, no decorative
animations. This is a document that gets printed and signed.

### Brand

- **Palette:** navy `#1A2A6C` (primary), teal `#0E7490` (accent), amber
  `#B45309` (warn), red `#B91C1C` (critical), green `#15803D` (ok),
  slate `#475569` (meta), page bg `#F4F7FB`, card bg `#FFFFFF`,
  border `#E2E8F0`.
- **Font:** system-ui first (`system-ui, -apple-system, 'Segoe UI',
  Helvetica Neue, Arial, sans-serif`).
- **Radius:** 8 px controls, 12 px cards. Soft shadow, tabular numerals
  for numbers.
- **Bilingual EN / AR** with full RTL mirror on toggle. Arabic is
  hand-written, not machine-translated.

### Layout

- **Header** with dark-navy 135° gradient, 4 px teal underline.
  Contains: title block (app name + subtitle) · version + status
  badges · global search input (icon prefix) · action bar (Install app,
  language toggle, Save, Load, Reset, Print).
- **Sticky top tabs** on desktop, numbered 1–8. **Fixed bottom nav**
  on mobile (< 768 px), same 8 tabs with short labels.
- **Main content**, max 1400 px, one tab visible at a time.
- **Footer**, small muted line.

### The 8 tabs

1. **Executive Summary** — 4-cell portfolio status strip
   (KPIs entered, gaps closed, decisions approved, red risks), then
   an executive-message card, then a 2×2 grid of scope cards
   ("Confirmed" green, "Pending" amber, "Version Scope" teal,
   "Decisions Required" red).
2. **Monthly Dashboard** — grid of **KPI cards**. Each card: name +
   status badge (green/amber/red pill), big value + month label
   ("98 · Aug 2026"), target line, 12-month sparkline, inline value
   input + Save button, "View details →" link. Impact-colored left
   accent bar.
3. **Asset Performance Plan** — side-by-side comparison table
   (Traditional Plan ✗ vs Asset Performance Plan ✓, teal-highlighted
   right column). Below: 5-stage horizontal roadmap with expandable
   detail on click.
4. **Projects & Budget Portfolio** — 5 summary cards up top,
   filter row (Category / Priority / Status / Budget / search /
   Reset / CSV), projects table (right-aligned tabular currency),
   bar chart of budget per category with clickable annotation
   badges.
5. **Risks & Controls** — 3×3 heat-map (rows: likelihood high→low;
   cols: impact low→high; cells: red / amber / dashed grey with
   count numbers), risk-profile summary card, filter row, risks
   table with rating pill (colored dot + label).
6. **Digital Transformation** — auto-fill card grid, each card:
   teal top border, tag chip in corner, title, Objective / Value /
   Maturity (with a teal→blue progress bar + "X% maturity") / Next
   Action, meta chips at bottom (timeline, budget).
7. **Data Gaps Tracker** — 3 stat cards (Not Started red,
   In Progress amber, Completed green), table where each row's
   Status cell has three interactive pills that update counters live.
8. **Decisions Required** — card grid, each decision card has a
   navy left border, numbered title, "Why it matters" paragraph,
   2×2 meta grid (Required By / Owner / Status), and an action row
   of pills: [Approve] [Hold] [Decline] [Reset] — selected pill
   fills, others outlined.

### Shared components

- **Pills:** 10 px, 800 weight, uppercase, colored variants (Critical
  red, High orange, Medium blue, Low grey; On track green, Watch
  amber, Off track red).
- **Modal:** 580 px max, navy sticky header, white ✕ close, form
  fields with uppercase grey labels. On mobile: full-screen with
  radius-top-only.
- **Search dropdown:** appears under the header input, results
  grouped by section (KPIs / Projects / Risks / Gaps / Decisions),
  each result is a bold navy title + grey subtitle.
- **Toast:** fixed bottom-center, navy pill, slide-up-in, fade after
  ~2.4 s. Use for save / load / reset / quota / validation feedback.
- **Table:** navy uppercase header, dense body, striped even rows,
  hover wash, horizontal scroll on mobile.
- **Sparkline:** inline SVG polyline in navy, teal end-dot, 110×28 in
  cards, 180×40 in modal. Always reserves 40 px of vertical space
  (empty state renders an invisible SVG).
- **Print cover page:** first page in print output only — title,
  version, prepared-by, print date, live status, table of contents,
  two-column signature block. Zero screen footprint.

### States (all required)

Empty · loading skeleton · success (toast + inline) · error (toast +
inline red) · focus (2 px teal outline, 2 px offset) · disabled
(50 % opacity) · hover-lift on cards · active-tab pill flip.

### Responsive rules

- **< 768 px:** bottom nav visible, top tabs hidden; filter rows
  stack; modal full-screen; KPI grid single-column; touch targets
  44 px minimum.
- **≥ 768 px:** top tabs visible, bottom nav hidden; filters inline;
  modal centered.

### Non-negotiable quality bar

- WCAG 2.2 AA, axe-clean: every input labelled, every button named,
  no nested interactive elements, visible focus everywhere,
  contrast ≥ 4.5:1.
- Semantic HTML: h1 title, h2 per section, h3 per card, no skipped
  levels.
- Lighthouse mobile: Perf 100, A11y 100, Best Practices 100, SEO 100.
- CLS ≤ 0.1 — put `system-ui` first in the font stack and reserve
  height for late-rendering SVGs.
- Zero external CDN, zero framework, vanilla JS only if the output
  is code. All CSS and JS inline in one HTML file.

### Sample data to use (no Lorem)

- 10 KPIs (Safety Critical Incidents, PM Compliance, Service
  Affecting Failures, MTTR, MTBF, Contractor KPI Score, Project
  Milestone Achievement, Budget Utilisation, Critical Spares
  Availability, Digital Maintenance Maturity)
- 10 projects — signalling upgrade, cable replacement, seat
  refurbishment, tram sub-system upgrade, obstacle detection, OT
  cybersecurity, digital twin study, onboard video, escalator
  lighting, etc.
- 10 risks — signalling obsolescence, project delays, incomplete
  failure data, spare shortage, contractor KPIs, OT cyber, resource
  pressure, RCA closure, budget alignment, data governance
- 6 decisions — endorse baseline, approve KPI dashboard, assign data
  owners, approve APP transition, monthly reliability board,
  quarterly digital review

**No references to any real organisation, city, or vendor. All content
is generic operational-plan sample data.**

---

## End of copy — instructions for you

- **v0.dev:** paste as first message; expect 2–3 iterations to get
  all 8 tabs looking right.
- **Figma AI / Make:** paste the whole thing into the prompt field.
  It'll produce artboards; you'll want to review the RTL variant
  separately after the LTR one lands.
- **Lovable / Galileo:** paste as project brief; ask for it to output
  a static HTML deliverable (not React).
- **If the tool caps prompt length:** cut everything above "Brand"
  and everything below "Non-negotiable quality bar". Keep the middle.
