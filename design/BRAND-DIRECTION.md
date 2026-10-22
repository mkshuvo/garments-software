# Design direction — shortlist for the P4 gate

Status: **superseded.** `design/DESIGN.md` freezes the token set for the P4 gate and is authoritative
where the two disagree. This file stays as the record of how the shortlist was evaluated; its
structure recommendation (SAP's restraint with Stripe's numeric discipline) is what `DESIGN.md`
adopted, and its proposal to reserve a green/red pair for debit/credit semantics was rejected there
with reasons — see `DESIGN.md` section 2.5 and `AUDIT.md` item 8.
The P4 gate itself was closed on the fonts claim in this file: `Inter` and `Noto Sans Bengali` are
verified real, loadable and metrically characterised in `DESIGN.md` section 3.1.
Source of the evaluation below: `awesome-design-md` brand specs, judged against this buyer — a
Bangladeshi garment factory owner and their accountant — not against taste.

## What the surface actually has to survive

These come from verified defects in the legacy tree and the buyer profile, and they do the
deciding:

1. **Print.** Reports go on paper in a paper-first culture. A dark product shell fails here, and
   dark-on-white screenshots make a poor sales asset.
2. **Tabular money.** The old grid rendered every figure through `Math.abs()` with hardcoded `USD`,
   so debits and credits were indistinguishable. Proportional digits make a ledger column
   unreadable; `tnum` is a requirement, not a flourish.
3. **Density.** Order progress, stock and trial balance are long tables of numbers. Chrome must
   stay quiet and rows must pack.
4. **Two scripts.** Bangla and Latin appear side by side (`স্টক / Stock`). Inter has no Bengali
   glyphs, so a second family with matching metrics is mandatory — already wired in
   `web/src/theme/AppFonts.ts` as Inter + Noto Sans Bengali.
5. **Bright room, ordinary screens.** A factory office is not a dark studio.

## Candidates evaluated

| Brand | Fit | Why it is or is not the one |
|---|---|---|
| **SAP** | strong | White canvas, two greys and one blue; chrome is deliberately quiet so the page reads as an *application frame*, not marketing. Flat broad bands instead of shadow, 8px control radius, and a 350–700 weight range that distinguishes text classes at one size. Structurally the closest match to an Operate surface. Its own typeface (72) is licensed and needs substituting. |
| **Stripe** | strong on the specific thing | The only candidate that *explicitly* specifies `tnum` tabular figures wherever money and numerics matter, plus a money-cell typography role we can copy directly. But its dashboard track "flips polarity to a dark-app shell" — wrong for print and for this room — and its display signature is thin-weight editorial marketing type. |
| **IBM / Carbon** | weak in practice | Conceptually apt (enterprise data density, flat-square), but the extracted spec is marketing-only: its own Known Gaps note says the real Carbon data tables, breadcrumbs and contextual menus are *not* in the analysis. Nothing usable to take. |
| **Linear** | wrong | Near-black canvas (`#010102`). Best-in-class restraint, but it loses on print and on a bright office. |
| **Notion / Airtable** | wrong register | Illustration-rich, card-driven marketing surfaces. Card soup is exactly what produced the legacy balance screen's ten nested `Card` components. |

## Recommendation

**SAP's structure with Stripe's numeric discipline.** Concretely, at P4:

- Adopt SAP's chrome restraint: white canvas, `#f5f6f7` / `#eaecee` flat bands for grouping instead
  of shadow, one accent colour, 8px control radius.
- Take from Stripe only the money rule: a dedicated tabular-figure role for every cell holding an
  amount, with `font-feature-settings: "tnum"` and tightening already present in
  `web/src/app/globals.css` as `.tnum` — promote it from a helper class to a token-level type role.
- Accent: one chromatic signal, not two. SAP's blue (`#0057d2`) reads credible for finance and
  survives print; a green/red pair stays reserved for **debit and credit semantics only**, never
  decoration, and must always carry the sign as well as the colour.
- Light theme everywhere, including reports. No dark product shell.
- Fonts stay Inter + Noto Sans Bengali as built — no proprietary substitution risk, and Bengali
  metrics are already handled.

## To verify at the P4 gate, not assume

- Bengali and Latin baseline alignment inside a dense table cell, at real row heights.
- Tabular figures actually aligning in Bangla-numeral contexts if that is ever requested.
- Printed output legibility of the accent-on-white hierarchy, at A4.
- That `impeccable`'s critique pass finds no decorative lift, gradient card, or invented sparkline —
  the specific things that made the old trial balance screen both ugly and false.
