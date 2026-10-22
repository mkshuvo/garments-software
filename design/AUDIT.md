# AUDIT.md — initial critique of this design

**DEGRADED: single-context** (no sub-agent/Task tool is exposed in this session, so impeccable's
`critique` invariant — Assessment A and Assessment B in two isolated contexts — could not be met.
The two assessments were run sequentially in one context, A first and recorded in full before any
detector output was read, which is the fallback the reference prescribes. Treat this report as one
judgement with a deterministic scan attached, not as two independent ones.)

(The reference prescribes this banner with a leading warning-sign glyph. The glyph is dropped because
the project rule for these files is no emoji; the banner text itself is verbatim.)

Method: degraded single-context · Assessment A (design review) completed and recorded before
Assessment B (detector) output was opened.
Target: `design/PRODUCT.md`, `design/DESIGN.md`, `design/SCREENS.md`, `design/DATA_VIZ.md`, and the
two rendered artefacts `design/mocks/trial-balance.html` and `design/mocks/order-progress.html`.
Mode: Operate. The subject is a specification, so what is being scored is the system **as specified,
seen through the two mocks** — not a shipped screen.

## Tooling actually run, and what it said

- `impeccable context` (once, per SKILL.md setup): reported `NO_PRODUCT_MD` and
  `PRODUCT_INIT_REQUIRED`, `RESOLVED_CONTEXT` with `productPath: null`, `designPath: null`,
  `hasVisualImplementation: false`, `platform: null`; `MANUAL_DETECTOR_REQUIRED` (no automatic
  design hook is active); `SUBAGENT_AUTHORIZATION`; and an `UPDATE_AVAILABLE` notice for
  impeccable v4.7.0 against the installed v4.5.2, which was **not** applied and is reported here
  rather than acted on.
- Because no question tool or decision page exists in this session, `init` used its stated
  fallback: it inferred from the explicit brief and from `docs/MASTER_PLAN.md`, whose §1.4 and §2.5
  are recorded owner decisions rather than guesses. `design/PRODUCT.md` marks its inferred and
  undecided fields inside `## Capabilities and Constraints` and `## Evidence on Hand`. It was not
  interviewed into existence and should be corrected by the owner where it guesses.
- The direction round (`concept-seed --scope direction`) was **not** run, because the visual world is
  brief-pinned: `MASTER_PLAN.md` §4 names the candidates and the standing instruction picks the
  language from `awesome-design-md`, and the reference says a brief-pinned direction beats the roll
  and routes to the mode file instead. `reference/mode-operate.md` was read and its limits applied:
  the world lends type, palette, density and one signature move only, and never the navigation model
  or the controls.
- Build path is code-led by contract: an Operate surface is code-led whatever the project records,
  and no comp round was run. Nothing was written to `.impeccable/config.json`, which is outside the
  `design/` directory this agent owns.
- `impeccable detect --json design/mocks/*.html`: run **twice** — once before the fixes below
  (5 findings, exit 2) and once after (5 findings, identical, exit 2). The second run is justified
  because the files changed materially between them; the identical result is the evidence that the
  fixes introduced no new violation.
- Browser inspection and the overlay injection step were **not** possible: this session has no
  browser automation tool, so there is no user-visible overlay and no console readout. That is the
  fallback signal, stated rather than glossed.
- `impeccable critique-storage` persistence was **not** performed: its write path is
  `.impeccable/critique/`, outside the `design/` ownership boundary granted to this agent. This file
  is the durable record instead; a later run in the project root can persist properly.

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | The identity strip, the as-of timestamp, the stale-data band and the control-total band are genuinely strong. Missing: any defined progress state for a long-running projection rebuild, and the 1.2s skeleton budget is a number with no behaviour attached. |
| 2 | Match System / Real World | 3 | The cash book is specified in the two-sided shape of his paper book; Dr/Cr, fiscal period and ৳ are his world. Undermined by: every Bangla string is a non-native placeholder awaiting the P9 review, and `Abnormal balance` / `At risk` thresholds are English-authored. |
| 3 | User Control and Freedom | 2 | No keyboard model anywhere in the spec. No defined escape from a long report, no way to leave and return to the import wizard with the mapping intact (the requirement is stated for the error case only), no undo for a mistyped stage count. |
| 4 | Consistency and Standards | 3 | One `MoneyCell`, one focus mechanism, one density component, one identity strip. Unresolved: Tier B routes must not appear for a Tier A tenant, and no entitlement mechanism exists, so the L14 route graph is per-tenant and unspecified. |
| 5 | Error Prevention | 3 | `Post` disabled until the taka difference is exactly `0.00` with the amount as the reason; refused import rows named per row; period lock disclosed. Missing: no duplicate-import guard in the UI beyond the I5 idempotency note, and no draft recovery on the manual journal. |
| 6 | Recognition Rather Than Recall | 3 | Chips carry words, thresholds are printed in the legend, the balance formula is on the page. The stacked record layout and the note references avoid memory bridges. |
| 7 | Flexibility and Efficiency of Use | 1 | Explicitly unaddressed. The accounts clerk lives in these screens eight hours a day and the spec gives him no keyboard shortcuts, no saved filter sets, no bulk posting, no column pinning. This is the weakest number in the table and it is honest. |
| 8 | Aesthetic and Minimalist Design | 4 | Aggressively restrained: no KPI cards, no sparklines, no gradient, no hover elevation, exactly two permitted graphics, one accent, four series tokens. Every element earns its space because the rules delete the ones that would not. |
| 9 | Error Recovery | 3 | Errors name the problem and the recovery, retry preserves the last good view with its timestamp, an invariant refusal is translated into the constraint in human words. Missing: no offline queue or replay story, which the flaky-connection requirement implies. |
| 10 | Help and Documentation | 2 | There is a file-format note in the import and a formula line on the reports. There is no contextual help for a mapping problem, no explanation of what a lock tier means to a non-accountant, and no in-product answer to "why is this number different from my register". |
| **Total** | | **27/40** | **Acceptable** — significant improvements needed before the pilot |

## Design specificity verdict

**Does it feel authored for this product, or category-interchangeable?** Partly authored, with one
interchangeable zone.

Genuinely product-specific and not liftable into another ERP: the identity strip as the mechanism that
makes two screens unable to disagree about currency; the control-total band as a first-class element
of a report rather than a background job; the em dash versus `0.00` versus `Not recorded` distinction
drawn straight from invariant I2; the two-sided cash book; the rule that colour means adversity and
never side; `Latin digits because the Bengali face has no tnum`, which came from parsing a GSUB table
and cannot be copied by a product that did not check.

Interchangeable: the shell. A left rail, a filter bar, a sticky table and a title row with two
buttons is every admin product. The world was allowed to lend type, palette, density and the signature
move, and the move — decimal-aligned figures with the sign in its own slot and the currency named once
per screen — is real but quiet; it does not make the shell recognisable the way the SAP spec's banded
zones make SAP's page. On an Operate surface that is a legitimate trade, and `MASTER_PLAN.md` §4 asked
for exactly this restraint, but the honest reading is that the product's character currently lives in
its report conventions, not in its frame.

## Deterministic scan

`impeccable detect --json`, five warnings, exit 2, identical across both runs:

| Finding | File | Verdict |
|---|---|---|
| `cramped-padding` — `.topbar` children flush against `border-bottom` | both mocks | **False positive.** The identity strip is a fixed 48px bar with 12px/16px text centred by flex; the air above and below is 16px. The detector is reading a flush border box, not a cramped line. The underlying constraint it does catch is worth keeping: at 48px the strip cannot grow, so a long legal name must ellipsize rather than wrap (`DESIGN.md` §3.5 length budget). |
| `cramped-padding` — `.scroll` children flush against border on all sides | `trial-balance.html` | **Considered disagreement.** A data grid is edge-to-edge by design; the row rules and the header band are the inset. Recording it because it puts a floor under future work: at compact density `cellPaddingX` is 8px, which is the detector's minimum. Any proposal to tighten a ledger cell below 8px is now a flagged change, not a quiet edit. |
| `overused-font` — primary font `inter` | both mocks | **Unresolved by design, with reasons.** Inter is already loaded in `web/src/theme/AppFonts.ts` and the brief forbids changing the app; impeccable's own Operate rules say system stacks and workhorse UI faces are the right register for a screen people operate; SAP's spec names Inter as its closest open substitute; and a second family is mandatory regardless because Inter has no Bengali range. The detector is correct in the general case and wrong in this one, and the reason it is wrong is documented rather than waved away. |

No inline colour literals escaped the `:root` blocks in either mock, and no `Math.abs`, no hardcoded
currency and no raw string literal exists in `design/` at all — the three laws most at risk here are
respected in the artefacts and quoted as constraints in the prose.

## What was found wrong during this audit, and changed

These are defects in this design work itself, found by checking rather than by re-reading.

1. **[P0] The Dr/Cr column rule was wrong and would have made every trial balance fail its own
   control total.** The first draft said an abnormal balance "prints in its normal-balance column with
   an explicit minus". Computing the mock proved that puts `-2,400.00` into the Debit column while the
   corresponding liability sits in Credit, so the two column totals disagree by twice the amount —
   the report contradicts the assertion it exists to make, which is the legacy failure in a new form.
   **Changed:** the column is chosen by the algebraic sign of the value; the abnormal case is named by
   the `Abnormal balance` chip; `DATA_VIZ.md` §2 item 4 now records why the alarming-looking version
   was rejected.
2. **[P0] The mock's own trial balance did not tie.** Movements came out 6,28,059.50 apart. Fixed by
   rebuilding the dataset from balancing journals, then **parsing the finished HTML back out and
   summing all fifteen posted rows** to confirm Opening / Movements / Closing each tie at
   17,60,450.00 / 50,36,300.00 / 52,79,850.00. A mock whose trial balance is wrong would be the exact
   thing this project is replacing.
3. **[P1] Two colour choices failed the WCAG floor they were claimed to meet.** `textTertiary`
   candidate `#6b7280` measured 4.47:1 on `surfaceMuted` and 4.08:1 on `surfaceBand`, under 4.5.
   Replaced with `#616b7a` (4.99 / 4.56). `borderStrong` `#b6bec9` measured 1.88:1 against white,
   under the 3:1 required for a control boundary, and is changed to `#7d8898` (3.59 / 3.32 / 3.03).
   **And the existing `focusRing: #33415c` is the same colour as the primary button's own fill**, so a
   focused primary button currently shows nothing at all; changed to `#0040b0` (8.90:1).
4. **[P1] The mock contained a real sticky-header bug.** Both header tiers were pinned to `top: 0`, so
   the group band would sit on the Dr/Cr labels as soon as the table scrolled. Fixed in the mock with
   tiered offsets, and it exposed a token gap: `density.stickyHeaderHeight` promised one height for a
   header that needs two, so `stickyHeaderHeightTwoTier` (72px / 88px) was added to DESIGN.md §4.2 and §9.
5. **[P1] The row-height token was a clamp masquerading as a rule.** `--row-h: 32px` with two-line
   cells (the FX rate note, the rounding note, a ship date with its booking line) silently overflowed
   the grid it claimed to enforce. Fixed properly: the token is now `tableRowMinHeight`, two-line cells
   are forbidden at compact density and pushed to a footnote list under the table, and the default
   density is explicitly allowed to grow by one leading step.
6. **[P2] `no-math-abs` would have blocked the correct implementation.** Splitting a signed balance
   across two columns tempts `Math.abs(balance)`, which L13 rejects. `DATA_VIZ.md` §2 now gives the
   signed-branch form so the integrator writes the branch, not the absolute value.
7. **[P2] Formatting recipes were specified from measured output instead of assumed.** The naive
   `Intl.NumberFormat('bn-BD', {style:'currency', currency:'BDT'})` on this machine returns
   `১২,৩৪,৫৬৭.৫০৳` — Bangla digits, lakh grouping and a trailing symbol chosen by a locale nobody
   configured. `DATA_VIZ.md` §3 now tabulates seven real outputs, including which option controls
   digits versus which controls grouping, so the money formatter cannot be written by guesswork.
8. **[P2] A rejected recommendation is recorded rather than dropped.** `design/BRAND-DIRECTION.md`
   reserved a green/red pair for debit and credit semantics. That is reversed here (§2.5 of
   `DESIGN.md`) because a credit to a liability and a credit to an asset are opposite facts wearing one
   colour. The shortlist file stays as the record of the reasoning; `DESIGN.md` says it supersedes it.
9. **[P3] Three contrast figures I had written from memory were wrong** (7.07 versus the computed
   7.57 for `chromeInk`; 16.90 versus 16.43 for `textPrimary` on the selected surface; "white on
   `actionNeutral` 10.24" while the label token is `textInverse #f7f9fb`, which measures 9.70). All
   recomputed and corrected. The mistake is the interesting part: a design document full of numbers
   that were not measured is the same category of failure as a report full of sparklines.

## Persona red flags

**Alex — impatient power user, in practice the accounts clerk.** No keyboard shortcuts exist anywhere
in the spec for posting, paging a GL, or moving through the import mapping. No bulk action: he cannot
select twelve cash-book entries and post them together, and the manual journal has no draft recovery.
He must click through a filter bar every morning because nothing can be saved. He will run the ledger
in Excel beside the app, which is the adoption failure this product cannot survive. Highest
abandonment risk in the whole set, and heuristic 7 scored 1 because of it.

**Sam — screen reader, keyboard only.** The two-column Dr/Cr pair is *visually* unambiguous but its
accessibility mapping is unspecified: a `<td>` in the Credit column needs its column header associated
correctly across a two-tier header, and a two-tier header is exactly where `scope="colgroup"` versus
`aria-describedby` gets silently wrong. The sign slot, the `Dr`/`Cr` word and the `Abnormal balance`
chip read as trailing text and may be announced after the figure rather than around it. The stage bar
carries a hand-written `role="img"` `aria-label` in the mock, which is a good instinct and an
untested one. **Nothing in this audit was verified with an assistive technology**; contrast and
colour-independence were computed, which is the half of Sam's checklist that can be closed on paper.

**Nasim — the owner, project persona** (derived from `PRODUCT.md` ## Users and ## Operating Context:
Bangla-first, phone in the morning, distrustful of a number that does not match his register). Walks
"am I going to miss a shipment": the sentence answers in his language, `Days` is signed and readable,
`Late` is red **and** says Late, and the stale-data band tells him whether today is unknown or merely
quiet — those four things work. The valleys: every Bangla string he would read is currently a
non-native placeholder, and the order-progress screen cannot exist before P7, so at the pilot he will
be shown a screen that is not there yet.

**Riley — stress tester.** Probes that the spec answers: zero rows, one row, and a filter excluding
everything are three different states and are named separately, which is where most products lie.
Probes it does not answer: paste an Excel range into the import mapping with a stray thousands comma;
a particulars line of 400 characters; a tenant whose legal name is 70 characters in Bangla beside a
1280px viewport; refresh in the middle of the four-step import. The wizard has a state-preservation
requirement only for the transport-error case.

**The outside accountant (a persona the product must win and no predefined list covers).** He gets
one printed page with no app open. He can see the balance formula, the control total, the as-of
timestamp, the printer, the page number, and every row's real account code, in monochrome. The
weakness: there is no **reconciliation bridge** on the printed report — nothing that lets him tie a
trial-balance line back to the ledger without the app, and the `Tie to ledger` action is
screen-only.

## Cognitive load

Checklist failures: **2 of 8** (moderate, address soon).
- *Minimal choices*: the trial balance header row presents a range selector, a filter bar of four
  chips plus clear, eight columns and two actions — over four simultaneous options at the point where
  the owner wants one answer.
- *Working memory*: the import's step 2 requires holding the old file's labels while scrolling the
  tenant's chart of accounts. Partially mitigated by showing the source column's first three values
  inline, which the spec requires but which has not been tested with a real 40-column file.
Passing: single focus, chunking (the report is one table), grouping, hierarchy, one thing at a time in
the wizard, progressive disclosure via the stacked record layout.

## Emotional journey

Peak: the cost-per-style screen, where an owner learns something true about his own business for the
first time. The spec protects it by showing composition before total, and by refusing to present a
margin built on incomplete consumption. Valley: the opening-balance import — 30 minutes of column
mapping and refusals, and the honest UI choice made here was to make the refusals *visible per row*
rather than smooth them over, which lengthens the valley in order to shorten the argument afterwards.
Reassurance at the high-stakes moment is the control-total band plus `Do not file this`; that pairing is
the most important single decision in the set, because the emotion at the moment of filing a return is
dread, and dread is answered by an assertion, not by a spinner.

## Priority issues

1. **[P0] Nothing in this design has been rendered or read by a human eye in a browser.** The Bangla
   clipping argument is derived from parsed `hhea`/`OS/2` metrics (1.325em versus 1.210em) and from
   GSUB feature inspection, which is stronger evidence than a guess and weaker than a screenshot:
   matra clipping, jukta overlap, and whether `line-height: 1.45` is genuinely enough cannot be
   settled without one. **Fix:** at the P4 gate, render both mocks and a live table, in both locales,
   at 32px rows, and measure. **Suggested command:** `/impeccable adapt`.
2. **[P1] There is no keyboard or bulk-action model.** The accounts clerk is the daily user and the
   spec serves the owner. **Fix:** before any UI phase, add a keyboard layer to `SCREENS.md` (tab
   order through a money grid, `p` to post, `/` to focus search, saved filter sets per user,
   multi-select posting) and a power-user path per screen. **Suggested command:** `/impeccable harden`.
3. **[P1] `moneyColumnMinWidth: 112px` is sized by arithmetic, not by the widest value the ledger can
   actually produce.** A totals column holding `12,34,56,789.00` breaks it, and there is no max-width
   or scale-down policy. **Fix:** state a max-value policy (size to the report's own widest rendered
   figure, never truncate a figure) and test it against a crore-scale tenant. **Suggested command:**
   `/impeccable layout`.
4. **[P2] Tier-gating of routes is unspecified, so the L14 route graph differs per tenant.** Either
   an entitlement mechanism is designed or Tier B routes ship un-gated for every pilot. **Fix:**
   decide with the owner; do not let the app agent improvise it. **Suggested command:**
   `/impeccable shape`.
5. **[P2] Every Bangla string here is non-native.** `অস্বাভাবিক ব্যালেন্স`, `চলমান কাজ (WIP)` and the
   rail labels are placeholders and some of them are probably wrong in the way §5 P2 warns about.
   **Fix:** schedule the native review with P9 as the plan already does, and treat the mock's Bangla
   as geometry proof, not as copy. **Suggested command:** `/impeccable clarify`.

## Minor observations

- The detector's Inter finding stays open on purpose; it is documented, not ignored.
- `design/PRODUCT.md` is not where impeccable expects it (project root), so future `impeccable
  context` runs will re-report `NO_PRODUCT_MD` until the integrator places or copies it.
- The two mocks disagree with each other on locale by intent, which means neither shows what the
  product's most common real state looks like: an English account code and Bangla particulars in the
  same cell of an English-locale table. That mixed case is asserted safe by the stack order but is
  not drawn anywhere.
- No screen exists for the reversal *flow* itself — `SCREENS.md` §4 states the outcome (both rows
  visible) but not the interaction, and a correction is the one write path where a wrong click
  becomes an audit finding.
- The spec has no offline/replay behaviour despite the flaky-connection requirement in `PRODUCT.md`.
- The stacked record layout is asserted to double as the P8 WhatsApp status message. Nobody has
  written a WhatsApp message template, and 4.4's claim is a hypothesis.
- `DESIGN.md` §6.2 is the only place an `rgba()` may exist besides colour tokens; that is a
  consequence of L15 nobody had previously noticed, and it is worth a line in the law's documentation.

## Questions to consider

- What would a confident version of the shell look like, given that the report conventions currently
  carry all of the product's character and the frame carries none?
- If the owner's accountant only ever sees one printed page, is that page — with its control total,
  formula, code column and footer — the actual product, and should the screen be designed as its
  preview instead of the reverse?
- The morning sentence answers "am I going to miss a shipment". Should the screen then sort by
  *consequence* (value at risk) rather than by date, and would the owner trust that more or less?
- Heuristic 7 at 1 is a design decision, not an omission. Is the accounts clerk a first-class user of
  this product or an incidental one? `PRODUCT.md` currently says he is the second reader of the
  second screen, which does not match how he will actually be used.

---

Questions skipped: this agent has no answer channel (it is a delegated subagent with no question tool
and no user present), so the two-round critique close could not be performed. The five priority
issues above are the actionable list; the delegating agent should put the P1 keyboard-model and
P1 column-max decisions to the owner, since both change the spec rather than the code.
