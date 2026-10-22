# DATA_VIZ.md — how a financial figure is presented

This is the section whose only job is to make the legacy defects impossible to ship again. Every
rule below is stated as an instruction a component can either follow or be reviewed against, and
each names the defect it prevents (`docs/MASTER_PLAN.md` §0, `docs/MASTER_PLAN.md` §4).

Not a chart library specification. v1 ships two graphical things — the aged AR/AP bucket strip and
the order-progress stage bar (`SCREENS.md` §1, §5) — and everything else is a table of signed
numbers. That is the honest scope: a report whose charts are decorative and whose numbers are wrong
is the product this project is replacing.

---

## 1. The figure cell

The atomic unit. One money cell, drawn exactly the same way on every screen:

```
 [sign slot] [integer+group digits] [.] [2 fraction digits]      ← type.money, tnum, right-aligned
 [−]         12,34,567                                    .      50
```

| Element | Rule | Prevents |
|---|---|---|
| **Sign** | In any **single-column** presentation the sign is printed when negative. **Never suppressed, never replaced by parentheses, never implied by colour alone.** It occupies its own fixed-width slot to the left of the digits so a column mixing signed and unsigned figures does not shift its decimal separator. In a **two-column** Dr/Cr presentation the sign is carried by the column the figure is placed in (§2). | The legacy grid wrapped every figure in `Math.abs(amount)` under a header that promised to distinguish debit from credit. Law L13 bans `Math.abs` in a render path outright. |
| **Digits** | `type.money`, tabular figures (`tnum`), Latin always. | Proportional digits make a ledger column unreadable; Bangla digits cannot be tabular because Noto Sans Bengali exposes no `tnum` (§3.4 of `DESIGN.md`, verified against the GSUB table). |
| **Decimal separator** | Always `.` with exactly two fraction digits for BDT (invariant I7 types money at 2dp). Never fewer, never more, never omitted for "clean" numbers. `12,300` in one row beside `12,300.00` in the next is a defect: the reader cannot tell which one was rounded. |
| **Alignment** | Right-aligned and **decimal-aligned**: units under units, paisa under paisa, in both the header row's placeholder and every body row. Achieved by tabular digits plus right alignment plus the fixed sign slot — not by a monospace font. |
| **Currency** | Named once per screen in the identity strip and once per money column group in its header (`BDT`), **never inside a cell.** A cell containing a foreign-currency transaction amount is the single exception and carries its ISO code in `type.meta` after the figure: `2,400.00 USD`. | Two screens disagreeing about whose currency they were in — trial balance hardcoded `USD` beside a `BDT` balance sheet. |
| **Side (Dr/Cr)** | Two adjacent columns, one sticky header each naming the side, separated by a 1px `borderStrong` vertical rule. Position and header carry the meaning; colour carries none. | `FinalBalance = credits − debits`, which is zero for any balanced ledger and was shipped as a column of the report. |
| **Side (Dr/Cr)** | Two adjacent columns, one sticky header each naming the side, separated by a 1px `borderStrong` vertical rule. Position and header carry the meaning; colour carries none. | `FinalBalance = credits − debits`, which is zero for any balanced ledger and was shipped as a column of the report. |
| **Zero** | `0.00`, a real figure, when the value is genuinely zero. An em dash `—` when the value does not exist (a non-postable group row, the unpopulated side of a one-sided GL line per invariant I2). The two are never interchangeable. | A grid of dashes read as "nothing happened" when the truth was "it netted to zero", and vice versa. |
| **Not available** | `Not recorded` in `type.meta` + `textTertiary`, plus an exclusion note in the totals row. Never `0.00`, never blank. | Silent exclusion from a total — the mechanism by which a report looks calm and is wrong. |

**A cell is a component, not a pattern.** `MoneyCell` (one type per file, L1) is the only place a
figure is formatted and laid out; a screen that hand-rolls `value.toFixed(2)` is a screen that will
drift.

---

## 2. Debit and credit as two different things

The failure mode this must avoid is subtle: after the `Math.abs` fix, the easy over-correction is to
make credits negative, so a screen shows `−45,000.00` in a Credit column. Now a reader has two signs
for one fact and neither of them is the answer to "which side is this on".

The system's answer, in priority order:

1. **Two columns.** `Debit` and `Credit`, mutually exclusive per line (I2). A GL detail line populates
   exactly one and dashes the other. **The column is chosen by the algebraic sign of the value: a
   positive net goes in the Debit column, a negative net in the Credit column as its magnitude.**
   That is what makes the two column totals equal, which is the assertion the report exists to make.
2. **Headers name the side**, are sticky, and the vertical rule between the pairs runs the height of
   the table. A reader who looks up from the middle of a long column can still tell what he is
   looking at.
3. **A signed balance carries its side as a word.** In a single signed column — the GL detail's
   running balance, a variance, a margin — the value renders `51,150.00 Dr` / `−2,400.00 Cr`:
   magnitude, sign, side. The word is in `type.meta` at 12px in `textSecondary`, and it is **not**
   colour-dependent.
4. **A balance on the wrong side of its account is flagged in words, not moved silently.** When a
   debit-normal account ends with a credit balance, the figure lands in the Credit column (so the
   grid ties) **and the account row carries the chip `Abnormal balance`**. Putting it in the Debit
   column with a minus would look more alarming and would make the two column totals disagree by
   twice the amount — a report that fails its own control total because of a presentation choice is
   worse than the defect it was meant to highlight.
5. **`NormalBalance` is data, and it crosses the DTO boundary.** The client cannot decide which
   column a derived balance belongs to, or whether that side is abnormal, without the account's type
   and subtype — the legacy `AccountBalanceDto` dropped `categoryName`, so the client guessed.
   `src/Ledger/NormalBalance.cs`, `AccountType.cs` and `AccountSubType.cs` exist; the read model must
   carry them.
6. **Colour means adversity, never side.** `stateDanger` on a money figure means "this figure is
   adverse and signed negative", full stop, and it always arrives with the sign printed where a sign
   is shown. `DESIGN.md` §2.5 explains why a green/red Dr/Cr pairing was rejected.

**How to fill the columns without breaking L13.** The two-column split must be written as a signed
branch, not as an absolute value:

```
balance >= 0  ->  { debit: balance,  credit: null }
balance <  0  ->  { debit: null,     credit: -balance }     // unary negation, in the negative branch
```

Law L13's rule bans `Math.abs` in a render path, and the reason it exists is that the legacy grid
threw the sign away and printed one unsigned column. Here the sign selects the column and the
`Abnormal balance` chip names the case the sign would otherwise hide, so nothing is discarded — but
an implementation that reaches for `Math.abs(balance)` still fails the build, and it should: the
branch is the point. `null` renders as an em dash, never `0.00` (§1).

**Derived-balance definition is written down, on screen.** The trial balance carries a line in its
period note and in the print footer:
`Balance = Σ debits − Σ credits; the column the balance falls in is its side.` The legacy product's
`FinalBalance = credits − debits` was an inversion nobody could see because the formula lived in
code. A formula that determines what a column means is user-facing documentation.

---

## 3. Formatting recipes: verified, not assumed

Every output below was produced on this machine by `node v24.15.0` using `Intl.NumberFormat`, for
the value `1234567.5`, currency BDT, 2 fraction digits. These are the actual bytes, so the spec is
not a guess about ICU's behaviour.

| Call | Output | Verdict |
|---|---|---|
| `Intl.NumberFormat('bn-BD', {style:'currency', currency:'BDT', minimumFractionDigits:2, maximumFractionDigits:2})` | `১২,৩৪,৫৬৭.৫০৳` | **Forbidden.** Bangla digits, lakh grouping *and* a trailing symbol, all chosen by a browser locale nobody configured. This is the trap the legacy `en-US`/`USD` hardcoding fell into from the opposite direction. |
| `…('bn-BD', { …, numberingSystem: 'latn' })` | `12,34,567.50৳` | Latin digits restored, grouping still South-Asian, symbol still trailing. Shows `numberingSystem` alone is not enough to control grouping. |
| `…('bn-BD-u-nu-latn', …)` | `12,34,567.50৳` | The locale-extension form behaves identically. Either mechanism works; the option form is preferred because it is visible in code. |
| `Intl.NumberFormat('en-IN-u-nu-latn', {style:'currency', currency:'BDT', currencyDisplay:'narrowSymbol', …})` | `৳12,34,567.50` | South-Asian grouping, Latin digits, leading symbol. |
| `Intl.NumberFormat('en-US-u-nu-latn', {… narrowSymbol …})` | `৳1,234,567.50` | Western grouping, same symbol placement. |
| `Intl.NumberFormat('en-US-u-nu-latn', {minimumFractionDigits:2, maximumFractionDigits:2})` | `1,234,567.50` | **This is the money-cell recipe.** No symbol in the cell (rule §1), grouping from the tenant setting, digits Latin. |
| `Intl.NumberFormat('en-IN-u-nu-latn', {minimumFractionDigits:2, maximumFractionDigits:2})` | `12,34,567.50` | The other permitted tenant setting. |

### The rules that follow

- **Grouping style is tenant data, never browser data.** `settings/company` offers `western`
  (`1,234,567.50`) and `south-asian` (`12,34,567.50`, lakh/crore). The legacy screen hardcoded
  `en-US`; §4.1 of `MASTER_PLAN.md` requires the choice to be stored per tenant. The mapping
  `grouping style → BCP-47 tag` lives in `src/i18n/`, which is the only path law L13 permits to
  contain a locale literal (`web/eslint.config.mjs`: `no-hardcoded-currency-or-locale`, allow
  `['src/i18n/']`). A formatter in `src/format/` that writes `'en-IN'` will fail the build, and it
  should.
- **`numberingSystem: 'latn'` is mandatory on every formatter construction**, in both locales.
  Without it the column is set in digits the loaded Latin face cannot tabulate.
- **The ISO code, not the symbol, is the identity-strip currency.** `BDT` is legible to the
  accountant, survives a font without U+09F3, and cannot be mistaken for another rupee. The ৳ symbol
  may appear in a printed statutory header where the tenant's own template requires it; it resolves
  from Noto Sans Bengali because Inter has no Bengali range (`DESIGN.md` §3.4).
- **`currencyDisplay: 'narrowSymbol'` is permitted only for the symbol form.** If an engine throws
  `RangeError`, the formatter falls back to `currencyDisplay: 'code'`, i.e. `BDT 12,34,567.50`, and
  the fallback is a deliberate visible difference, not a silent one.
- **Percentages** are `type.money` with one fraction digit and an explicit `+`/`−` when they measure
  a change: `+2.4%`, `−14.3%`. A percentage beside a taka figure without a sign is a claim about
  direction that the reader must infer.
- **Counts** are tabular and right-aligned in the same column rhythm as the money they accompany, so
  `12,000 pcs` sits over `45,000.00` without a jagged edge. Units are `type.meta` in `textTertiary`,
  never inside the numeric cell.
- **Dates** come from the existing `formatDate(value, locale)` (`src/format/FormatDate.ts`), which
  passes the active `Locale` rather than a literal. A report header prints the date in long form; a
  table cell prints `dd MMM yyyy` so a column of dates scans; both are stated per screen and the
  fiscal period is always alongside (`FY 2026-27 · Period 4`). A date alone does not tell an auditor
  which period a figure belongs to.

---

## 4. Company and period are part of the figure

No financial figure is ever rendered without its identity context available on the same screen. The
mechanism is the identity strip (`DESIGN.md` §5): company legal name, fiscal period, `BDT`, as-of
timestamp. It is one component reading tenant context, so it cannot diverge between two screens the
way `USD` diverged from `BDT`.

Additional requirements:

- **Every exported row carries the same four fields as columns**, not as a header comment. A CSV
  without a company and a period is a file that will be merged with another tenant's by accident.
- **Printed pages repeat the strip in the page header** and the footer carries
  `Σ debits = Σ credits = 12,34,567.50 BDT · printed by {actor} · page n of m · {as-of}`. A page
  separated from its bundle must be identifiable and must state its own control total.
- **Tenancy is visible, not assumed.** RLS guarantees isolation underneath; the strip makes it
  legible above. Both are required — the legacy cache key with no tenant in it is the reason the
  guarantee exists, and the reason a screen must still name the company.

---

## 5. The two permitted graphics

**A chart is allowed only where the number of underlying values is fixed and real, and every value
is printed beside its mark.**

| Graphic | Rule |
|---|---|
| Order-progress stage bar | Four segments over the real stages; each boundary has a printed count (`Cut 12,000 · Stitch 7,400`). Never a percentage meter without its numerator and denominator. Segment fills come from `seriesPrimary`/`seriesMid`/`seriesSoft`/`seriesNeutral` only. |
| Aged-receivable bucket strip | Five segments in real proportion, each with its taka total and invoice count printed beneath, each labelled in text. Colour is a redundancy on top of a label, never the label. |

Prohibited, with the legacy evidence:

- **Sparklines.** The old grid drew one hardcoded SVG path per row (`TrialBalanceTreeGrid.tsx:31-41`)
  — a shape with no series behind it. Impeccable's craft floor also bans progress rings and
  sparklines standing in for content. Nothing in this product gets one.
- **KPI cards with a "trend".** The old value was `{2.5} // Mock trend for now`. A big number in a
  rounded card with an arrow is the most persuasive and least informative element available to a
  dishonest screen.
- **Donut/pie for a cost composition.** Replaced by the composition table in `SCREENS.md` §6, where
  a remainder cannot be hidden and each line links to its postings.
- **Any chart with no data.** Absence renders as the empty state that names the module, never as a
  flat line at zero.

---

## 6. Column geometry

A money column is sized to its widest expected value, not to its header text.

| Content | Min width | Notes |
|---|---|---|
| Money, BDT, western grouping | `112px` (`layout.moneyColumnMinWidth`) | Holds `12,34,567.50` plus a sign slot at 14px tnum. |
| Money, South-Asian grouping | `112px` | Same digit count, different grouping positions. |
| Foreign transaction amount | `128px` | Figure plus ISO code. |
| Account code | `88px` | Six-digit code in `type.code`. |
| Gapless journal number | `112px` | `CJ-4-00138`; sized to the longest pattern the numbering rule can emit, including the period segment. |
| Days-to-ship | `56px` | Signed integer plus a one-character margin. |
| Status chip | `104px` | Sized for the longer of the two locales; a wrapping chip changes row height and breaks the grid (`DESIGN.md` §3.5). |

A column that cannot hold its widest real value is widened, truncated with a tooltip, or the report
loses a column. It is never allowed to overflow into its neighbour, because two touching taka figures
read as one figure.

---

## 7. When the report disagrees with the ledger

This is the state the whole rewrite exists to make visible. The `Verifier` computes control totals
(`Σ gl_lines = reported balance`) and alarms on drift; the UI's obligation is to **show the alarm on
the face of the report**, not to route it to a log.

| Condition | Presentation |
|---|---|
| Report ties | The control-total line in `type.bodyLead`, `textSecondary`, no colour: `Σ debits = Σ credits = 12,34,567.50 BDT · ties to the ledger · as of 3 Nov 2026, 09:12`. Ties is a positive assertion, so it is stated; it is not represented by the absence of an error. |
| Report differs by any amount | `stateDanger` band on `#fdecee` **above** the table: `Report total differs from the ledger by BDT 0.02. Do not file this.` The difference is printed in taka with its own sign, and the band is placed before the figures so nobody reads 40 rows before learning the answer. |
| Difference is zero but the ledger is unverified | `Unverified` chip in `stateInfo` beside the control-total line, and the same word in the print footer. Not an error, and not silence. |
| A projection is stale (no `as_of` recompute since the last posting) | `Figures as of 3 Nov 2026, 09:12 · 41 postings since then` in `type.meta`, with a `Refresh` control in the band itself. |
| A source document exists that has not posted | The row is listed with `Not posted` (`stateDanger`), **excluded** from every total, and each total row names the exclusion: `Day totals exclude 1 entry (not posted).` |
| A posting succeeded but the write is unconfirmed | The entry is marked `Unconfirmed` and the screen refuses to print, with the reason on the print button. Half-trusted money must not leave the building on paper. |
| Rounding residue exists | The header-rounding account's line is shown in the journal detail with its own amount and the note `Rounding residue, per the configured policy`. Never folded into a neighbouring line to make a column tie. |

**Hard prohibitions in this area.** An error swallowed into a `catch` that renders an empty table.
A zero-filled report when the projection failed. A `console.error` and a shrug. A plausible-looking
empty report with no message. Each of those is the legacy behaviour, and each is worse than a crash
because it can be filed with the VAT office.

---

## 8. Immutability and correction, made visible

A posted row cannot be updated (I3, enforced by `REVOKE`), and the UI must express that rather than
hide it:

- No edit affordance on a posted document, anywhere. `Correct` opens the reversal flow.
- A reversal links **both ways**: the mirror says `Reverses JV-113`, the original says
  `Reversed by JV-201`, and both rows remain in every report for their own periods.
- Voided documents still consume a number (I4). The listing shows the gap-free sequence and a void
  row is present with its status, because a missing number in a gapless sequence is itself evidence.
- A prior-period adjustment posts into the open period and is **disclosed at the top of the report**
  it affects (`I6`), with its own row in the report's movement columns and a note naming the period
  it belongs to. Never retro-posted silently, never footnoted away.
- **Storno is not implemented and must not be designed in.** `UsesStorno` exists on the journal and
  nothing honours it; a Storno correction repeats the original side with a negated amount, which
  `CK_gl_line_debit_xor_credit` refuses because it requires `> 0`. Any screen that shows a "negative
  debit" as a normal case would be depicting a mode this ledger cannot post (`MASTER_PLAN.md` §5 P2).
- Every write path shows its actor. The old controller fabricated
  `Guid.Parse("00000000-…-000000000001")` with a `// TODO: Get from JWT`. A row whose actor is
  unknown is rendered as `Unattributed` in `stateWarning`, and there should be no such rows.

---

## 9. Audit checklist for any screen that renders money

Run this against the render, not against the intent. It is the list `AUDIT.md` was scored on and it
is the list the P4 gate's screenshot pack must survive.

1. Is the company, the fiscal period, the currency code and the as-of timestamp visible without
   scrolling?
2. Does every negative figure carry a printed sign, and does every coloured figure carry a word?
3. Is any `Math.abs` present in the render path? (L13 makes this a build failure, not a review note.)
4. Are the debit and credit sides distinguishable with the colour removed — print in monochrome and
   look at it?
5. Do the digits align on the decimal separator across the whole column, including the header row?
6. Is `0.00` distinguished from `—` distinguished from `Not recorded`, and is each exclusion named
   in the totals?
7. Does the grouping match the tenant setting rather than the browser, in both directions
   (`12,34,567.50` versus `1,234,567.50`)?
8. Does the control-total statement exist, and does a disagreement appear above the figures?
9. Does every chart segment have a printed value and label beside it?
10. Does the printed page carry the header strip, the footer control total, the printer, and the page
    number?
11. Can every figure be drilled to the GL lines that produced it in one click?
12. Does an empty screen say which module will fill it, and does an error screen say how to recover?
