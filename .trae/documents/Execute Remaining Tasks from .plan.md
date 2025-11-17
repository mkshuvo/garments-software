## Approach Overview
- Recreate the look‑and‑feel using our own components and styles (no code copy).
- Derive a precise design system (tokens, layout, components) from the reference by measurement and visual audit.
- Validate with repeatable checks (visual diffs, spacing/typography scales, a11y and performance budgets).

## Step 1 — Visual Audit & Inventory
- Pages: Dashboard, List/Table, Forms, Modals, Charts, Profile/Settings.
- Components: Sidebar, Topbar, Breadcrumbs, KPI cards, Tables, Filters, Tabs, Dropdowns, Toasts, Pagination.
- Interactions: Hover/focus states, active nav highlighting, modal open/close, form validation messaging.

## Step 2 — Metric Extraction (No Code Copy)
- Typography: extract font families, sizes, line heights, weights by measurement; define a typographic scale.
- Colors: sample primary, secondary, success, warning, error, neutrals; create semantic roles and token names.
- Spacing: measure padding/margins; define a spacing scale (e.g., 4/8/12/16…); document grid.
- Elevation/Border: capture border radii, shadows; define elevation tokens.
- Breakpoints: identify layout switches and drawer behavior; map to responsive breakpoints.

## Step 3 — Design Tokens & Themes
- Build a token JSON (colors, typography, spacing, radii, shadows) and expose via CSS variables + MUI theme.
- Support light/dark modes; ensure contrast meets WCAG 2.1 AA.

## Step 4 — Layout Shell
- Implement a responsive shell: permanent/mini sidebar + topbar; content area with breadcrumbs.
- Behavior: collapse/expand sidebar; sticky topbar; mobile drawer.

## Step 5 — Component Library (MUI + Custom)
- KPI Card: title, value, badge, trend, optional tiny chart slot.
- Data Table: virtualized rows, sortable headers, filters, action cells, skeleton loaders.
- Filters: date range, type, status, search; debounce and clear actions.
- Forms: React Hook Form with MUI inputs; error/validation patterns.
- Modals: standardized sizes, header/footer actions, keyboard focus traps.
- Charts: pick library (e.g., Recharts/Chart.js) and theme it to tokens.

## Step 6 — Pages Implementation
- Dashboard: arrange cards, charts, recent tables per reference layout.
- Journal Entries: refactor to Kanakku‑styled filters/table/export.
- Cashbook Simple: refactor forms/list.
- Profile/Settings: consistent forms and tabs.

## Step 7 — Accessibility & Performance
- A11y: ARIA roles, keyboard nav, focus outlines, semantic headings.
- Performance: code splitting for routes, virtualization, image optimization, bundle budgets.

## Step 8 — Validation & QA
- Visual checks: screenshot comparisons (tolerance‑based), spacing/typography verification.
- a11y audits: axe/cypress; fix violations.
- Perf audits: LCP/TTI, interaction timing; meet budgets.

## Deliverables
- Design tokens + MUI theme with light/dark.
- Layout shell and component set.
- Refactored pages matching the reference style.
- Validation reports (visual, a11y, perf) and acceptance criteria checklists.

## Plan Folder
- Create `.plan/ui-redesign-kanakku-inspired/` with `requirements.md`, `design.md`, `tasks.md`, and Mermaid diagrams.

## Request
- Approve to generate the plan folder and start Phase 1 (tokens + layout shell).