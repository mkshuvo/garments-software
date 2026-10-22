# SCREENS.md — screen-level decisions

Every screen below is specified against `DESIGN.md` tokens and `DATA_VIZ.md` figure rules. Where a
screen needs a read model that does not exist yet, it says so; nothing here is allowed to be built
against invented data (L13), and each screen's **partial/absent** state is a first-class deliverable
rather than a fallback.

Mode: Operate. Navigation model, controls and affordances are the standard ones for the platform;
the visual world contributes type, palette, density and the one signature move only.

---

## 0. Information architecture

Tier A ships six routes; Tier B adds four; Tier C adds two. Out of v1 entirely, with no nav entry
and no placeholder page: APS/scheduling, MRP, QMS, barcode WMS, self-serve billing.

```
/                      redirect to /orders/today for a signed-in owner
/orders/today          Morning order progress            Tier A   ← the landing route
/orders/{id}           Order detail: stages, ship date   Tier A
/costing/{styleId}     Cost per style versus price       Tier A
/cash-book             Daily cash book                   Tier A
/cash-book/new         Cash receipt/payment entry        Tier A
/ledger/trial-balance  Trial balance                     Tier A
/ledger/journals       Journal listing + manual journal  Tier A
/ledger/accounts       Chart of accounts                 Tier A
/ledger/detail         GL detail, drill from TB          Tier A
/reports/ar            Aged receivables                  Tier B
/reports/ap            Aged payables                     Tier B
/inventory             Stock on hand vs committed        Tier B
/purchasing            PO → GRN → bill → payment         Tier B
/sales                 SO → dispatch → invoice → receipt Tier B
/payroll               Payslips, attendance              Tier C
/onboarding/*          Opening balances and CoA import   vendor-run, owner-visible
/settings/company      Legal name, currency, grouping,   Tier A
                       fiscal year, locale
```

Rail grouping, five top-level items maximum per group (working-memory limit):
**Today** (order progress) · **Money** (cash book, ledger, trial balance, AR/AP) ·
**Costing** (cost per style) · **Goods** (inventory, purchasing, sales — Tier B only) ·
**Company** (settings, onboarding, payroll).

Rules that apply to every screen:

- The **identity strip** (`DESIGN.md` §5) is present and correct on any screen showing a figure.
- One primary action per screen, `actionNeutral` fill, right-aligned in the page-title row.
- Breadcrumb only when the user drilled in; a top-level route does not need one.
- Every table: sticky header, `TableContainer` scroll, breakpoint variants, skeleton, the three
  distinct empties, a real error state, and `partial-data` handling per `DATA_VIZ.md` §7.
- Every route has an inbound nav link (L14). A screen nobody can navigate to is deleted, not
  hidden — that is the specific defect that left 15 of 18 legacy trial-balance components
  unreachable while the one that shipped was the worse of the two.
- No screen renders a trend, sparkline or KPI tile without a real series. In practice this means
  **there are no KPI tiles in this product.** The morning number is a count of at-risk orders,
  stated as a number in a sentence, not a card.

---

## 1. Morning order progress — `/orders/today`

**The screen that decides the purchase.** `MASTER_PLAN.md` §1.4 lists "where is my order?" as the
first thing a factory owner feels, and §5 P7 makes production and job costing the phase that closes
the sale. It is not a dashboard; it is a shipment-risk list.

**Purpose.** Answer, before the owner has finished his tea: *am I going to miss a shipment, and
which one?*

**Legible in one second.** Three things, in this order: (1) how many orders are at risk or already
late, as a sentence at the top; (2) the single nearest ship date and what it belongs to; (3) whether
the screen is showing today's view or a stale one. The owner must not have to read a table to learn
whether he has a problem.

**Layout.**

```
[page title: Order progress]                        [primary: Update a stage]
[Sentence row — see below]
[Filter bar: buyer | month | status — 4 chips max, on surfaceMuted]
[Table, default density 40px rows]
 Buyer / Style            Order     Qty     Ship date  Days  Stage progress                 Status
 Meridian / SS-204-A      PO-1187  12,000   14 Nov       -3   Cut [####] Stitch [##] Pack [ ]  Late
 Blue Harbor / FW-118-C   PO-1191   8,400   22 Nov       +8   Cut [####] Stitch [##]           On track
```

The sentence row (not a card, `type.bodyLead` 450, plain `surfaceBase`, no icon):

> 3 orders ship within 10 days. 1 is past its ship date. 2 styles are behind at stitching.

Built from the real query, and when the answer is zero it says so:

> Nothing ships in the next 10 days. Next date: 14 Nov, Meridian SS-204-A.

**Stage progress** is the one graphical element: a segmented bar over the four real stages
(cutting → stitching → packing → dispatch, the Tier A mode of §5 P7) where the completed portion is
`seriesPrimary`, the in-progress portion `seriesMid`, the remainder `seriesSoft`, and each segment
boundary is labelled in the row's `type.meta` when hovered *or* read from the Status column. The
bar is a rendering of a real count of pieces completed per stage; it is never a decorative meter.
The same information exists as text in `Stage progress` for print and for `bn`.

**Days** is a signed integer in `type.money` (tabular, right-aligned): `+8` means eight days of
slack, `-3` means three days late. **The sign is printed**, because "3" next to a date is ambiguous
and the whole screen is about that ambiguity.

**Status** is a chip, and only these five exist: `On track` (`stateSuccess`/`#e9f5ee`),
`At risk` (`stateWarning`/`#fdf3e2`), `Late` (`stateDanger`/`#fdecee`), `Dispatched`
(`chromeInk`/`surfaceBand`), `Held` (`stateDanger` text, `surfaceBase` background, outlined). The
threshold that produces them is stated in the row's tooltip *and* in `settings/company`, because an
owner who disagrees with "at risk" must be able to change the number, not argue with the colour.

**Data it reads.** A read model that does not exist yet (it is P7's deliverable): per open sales
order and style — buyer, style code, order quantity, committed ship date, pieces completed per
stage, WIP location, and the last status update timestamp. Tier B adds subcontract legs.
Today's backend has no `SalesOrder` or `WorkOrder` entity: `docs/MASTER_PLAN.md` §0 records that
`docs/progress.md` marking Purchasing complete was wrong and that `PurchaseOrder`, `SalesOrder`,
`WorkOrder`, `BillOfMaterial`, `Payroll`, `Attendance` and `Leave` do not exist anywhere. **This
screen cannot be built until P7, and the route must not ship before it** — L14 over an empty route
is worse than no route.

**States.**

| State | What it shows |
|---|---|
| Empty — new tenant | "No open orders yet. Orders arrive from Sales (P6) or from the opening import." Link to `/onboarding`. Not "No data yet" alone: the owner must learn *who* writes this table. |
| Empty — filtered | "No orders match Buyer: Meridian Apparel." with one control: `Clear filters`. Never the new-tenant message here; that would claim the ledger is empty when it is not. |
| One order | The row plus the sentence; no chart appears to fill space. |
| Many | Sticky header, virtualised past 200 rows, and the sentence row counts all rows rather than the visible page. Ship-date order is default and is the only sane sort; a second sort key is available but not the default. |
| Error | `ErrorState` naming the failure and offering retry, **plus the last successfully loaded view timestamp**: `Could not refresh. Showing data from 09:12.` An owner on a flaky connection must be able to tell "no risk today" from "I don't know today". |
| Partial | Any order whose stage counts are incomplete renders its progress segment in `seriesNeutral` with the label `Not reported`, and the sentence row excludes it and says so: `3 orders ship within 10 days. 2 have no stage data.` Silence about missing data is how a missed shipment becomes a surprise. |
| Mobile < 600px | The stacked record layout: ship date and Days first, status chip beside them, stage bar under, buyer/style as the block label. The primary action moves to the bottom of the viewport (thumb zone) because this screen is opened on a phone standing up. |

---

## 2. Cash book — `/cash-book`

**Purpose.** The daily physical record of money in and out, which in this market is a hand-written
book and the owner's single most trusted artefact. Tier A, and the legacy product's only genuinely
used feature.

**Legible in one second.** Today's closing cash balance and the count of movements, both in the
report header, plus *which* side of the book each movement is on.

**Layout.** A day-columned ledger: the classic cash-book shape (Receipts on the left, Payments on
the right) rather than a generic transaction list, because that is the shape the owner's paper book
has and the shape his accountant expects to see on paper.

```
[page title: Cash book]                       [primary: New entry]  [secondary: Print day]
[Period: FY 2026-27 · Period 4 (Oct)  |  Cash account: 1111 — Cash in hand  |  BDT]
 Receipts                                              Payments
 Date  Particulars            Ref      Amount          Date  Particulars            Ref     Amount
 02    Ali Rana — deposit     CB-0412   45,000.00      02    Weekly bazaar           CB-0413   12,300.00
 …
 Day totals                                        45,000.00                       12,300.00
 Opening 18,450.00    Closing 51,150.00
```

- Two sides in one scroll region, each with its own sticky header, separated by a 1px
  `borderStrong` vertical rule. Amount columns decimal-aligned, `type.money`, grouping from tenant
  settings.
- **The closing balance row is `surfaceBand` with `type.moneyTotal`.** It is the only number on the
  screen that is a claim about the world, and it must be visibly a total.
- `Ref` is the document reference in `type.code`. It is a real gapless journal/document number, and
  it links to `/ledger/detail`.
- Below the two-sided table, a collapsible section: **this day's journal**, showing the balanced
  debit/credit lines the postings produced, with a link per line. This is the structural repair of
  the legacy defect where the cash book posted *single-sided* entries and the controller fabricated
  `journalEntryId = Guid.NewGuid()`. If the screen cannot show the journal, the posting is not
  trustworthy.

**Data it reads.** Cash-book entries plus the journal each produced (P3's deliverable), keyed by
tenant, day, and cash account. Read model does not exist yet.

**States.**

| State | What it shows |
|---|---|
| Empty — new tenant | `No entries for 3 Nov. Opening balance: 0.00.` plus the route to a first entry. Never a blank grid under a live header. |
| Empty — day with no movements | `0.00` on both sides and a real closing balance carried from the previous day. **The carried balance is shown; the day is not hidden.** A trading day with nothing in the book is information. |
| One entry | Both sides render; the empty side still has its header and its `0.00` total. |
| Many | Sticky headers on both sides, skeleton rows, page-by-day rather than infinite scroll — a clerk reconciles a day, not a stream. |
| Error | Names the failing half: `Receipts loaded. Payments could not be read.` A partially-loaded two-sided book must not print a closing balance from one side alone. Balance row is suppressed and replaced with `stateDanger` text `Cannot compute a closing balance from half a day.` |
| Partial | Any entry whose journal did not post is listed with an `Not posted` chip (`stateDanger`) and its amount **excluded from the totals**, and the totals row states the exclusion: `Day totals exclude 1 entry (not posted).` |
| Immutability | A posted entry has no edit control. `Correct` opens the reversal flow and both the original and the mirror appear. I3 made visible. |

---

## 3. Trial balance — `/ledger/trial-balance`

**Purpose.** The report the buyer's accountant and the VAT officer read, and the specific thing this
rewrite must not repeat. It is also the P2 gate's golden-file deliverable.

**Legible in one second.** Does it tie. The screen's first visual fact is the balance assertion, not
a number of accounts.

**Layout.**

```
[page title: Trial balance]         [primary: Print]  [secondary: Export CSV]
[Period range selector — mounted and working, defaulting to FY-to-date]
[Control-total band — see below]
 Code  Account                        Opening Dr   Opening Cr   Movement Dr  Movement Cr  Balance Dr  Balance Cr
 1111  Bank and cash in hand          18,450.00           0.00    1,20,340.00       45,200.00  93,590.00        0.00
 2101  Suppliers (local)                   0.00       9,80,000.00      2,30,000.00   1,20,000.00      0.00  8,80,000.00
 …
 TOTAL                                            12,34,567.50  12,34,567.50  …
```

- **Column set is `Opening / Period movements / Closing`, each split Dr and Cr** — six money
  columns, which is exactly why `layout.reportMaxWidth: none` exists (`DESIGN.md` §4.3) and why this
  report prints landscape.
- Header row uses two-tier headers: a group band (`Opening`, `Movements`, `Closing`) over the Dr/Cr
  pair. The group band is `surfaceMuted` with a `borderStrong` bottom rule; the Dr/Cr pair is
  separated by a vertical `borderStrong` rule that runs the height of the table. **Position plus the
  rule plus the label is what tells a debit from a credit. Colour does not.**
- `Code` is the real account code in `type.code`. The legacy grid printed a truncated GUID under a
  header promising a code; a code column that cannot hold a code is deleted, not filled with a GUID.
- Account names are `textPrimary`, group (non-postable) accounts are `type.tableCellStrong` on
  `surfaceBand` and their money cells are empty rather than zero-filled, so a parent row cannot be
  mistaken for a posting.
- A signed balance that sits on the *wrong* side of an account's normal balance is not hidden: the
  figure lands in the column its own sign selects — which is what lets the two column totals tie —
  **and** the account row carries an `Abnormal balance` chip (`stateWarning`) naming the condition.
  Silently letting the reader discover it by comparing two columns is what an auditor's first
  question is about, and `DATA_VIZ.md` §2 records why putting it in the normal column with a minus
  instead would break the report's own control total.
- **Range is changeable.** `MASTER_PLAN.md` §0 records that the shipped screen imported
  `DateRangeSelector` and never mounted it, leaving the report permanently month-to-date. The
  selector is part of the acceptance criteria for this screen, not a component in the tree.

**Control-total band.** Immediately under the title row, `type.bodyLead`, and the first thing read:

> `Σ debits = Σ credits = 12,34,567.50 BDT · ties to the ledger · as of 3 Nov 2026, 09:12`

If the `Verifier` disagrees: a `stateDanger` band, `#fdecee` background, that states the difference
in taka and instructs: `Report total differs from the ledger by BDT 0.02. Do not file this.`
`DATA_VIZ.md` §7 has the full rule.

**Data it reads.** The P4 trial-balance projection keyed by `as_of`, plus `NormalBalance` per
account subtype (already modelled: `src/Ledger/NormalBalance.cs`, `AccountType.cs`,
`AccountSubType.cs`). The `accountType`/`subType` pair **must survive the DTO boundary** — the
legacy `AccountBalanceDto` dropped `categoryName`, and without the normal balance the client cannot
decide which column a figure belongs to, which is how "FinalBalance = credits − debits" got
shipped.

**States.**

| State | What it shows |
|---|---|
| Empty — pre-import | `No opening balances. Run the opening-balance import for 1 July 2026, or post a journal.` Links to `/onboarding`. This is the state where an ERP is usually judged, so it names the next action rather than showing a zero grid. |
| One account | Full column set, totals row, control-total band. Nothing else changes. |
| Many | Sticky header, group rows collapsed by default with a per-group expand, and the totals row always visible at the bottom of the container. |
| Error | `ErrorState` naming the failing projection and the retry; the control-total band is replaced by `stateDanger` `Cannot verify — no report data.` **Never a table of zeroes.** A plausible-looking empty report is the banned variant. |
| Partial | A period the `Verifier` has not run: `Unverified` chip (`stateInfo`) next to the control-total band, and the print footer carries the same word. |
| Locked period | `surfaceBand` banner naming the lock tier (`soft` / `hard` / `tax`) and the date, and no cell is editable — this report never was, but the banner is what stops an owner asking why nothing happens when he clicks. |

---

## 4. General ledger detail — `/ledger/detail`

**Purpose.** The drill-down that makes a trial-balance figure defensible: every line behind one
account in one period, in posting order, with the document behind each.

**Legible in one second.** Which side each line is on, and the running balance after it.

**Layout.**

```
[breadcrumb: Trial balance / 1111 Bank and cash in hand]
[header: account code + name, normal balance side, currency, period]
 Date      Journal    Ref        Particulars                     Debit        Credit      Balance
 02 Oct     CJ-4      CB-0412    Ali Rana — deposit            45,000.00          —     63,450.00 Dr
 07 Oct     PJ-9      PV-0088    Weekly bazaar                        —      12,300.00    51,150.00 Dr
 31 Oct     OP-1      —          Opening balance carried            —              —     18,450.00 Dr (opening)
 [page nav: 1 2 3 … of 41]                        [primary: Export]  [secondary: Print]
```

- `Debit` and `Credit` are mutually exclusive by invariant I2, so **exactly one is populated per
  line** and the other is an em dash, not `0.00`. A zero in both columns would claim the line was
  both; an em dash says the line is one-sided by construction. This is the clearest possible
  expression of I2 and it is not absolute-valuing anything.
- `Balance` is signed and always carries its side as text: `51,150.00 Dr` / `8,80,000.00 Cr`. A
  negative balance prints `−2,400.00 Cr` **and** red, sign present.
- Opening-balance lines are marked and dated 1 July of the fiscal year, never mixed into period
  movements — `MASTER_PLAN.md` §5 P2 requires the golden-file trial balance to be correct
  *including opening balances and prior periods*, and this is the screen where that is checked.
- `Ref` links to the source document; a reversal line shows `Reverses JV-113` and the original shows
  `Reversed by JV-201`. **Both stay visible** (I3). There is no "delete" and no silent `Reversed`
  flag flip that leaves the money in the books.
- A foreign-currency line shows the transaction amount and code in its own column pair plus the
  BDT functional amount, with the rate and its effective date in `type.meta` under the line,
  snapshotted rather than recomputed.

**Data it reads.** `gl_entry`/`gl_line` joined to journal and account; gapless numbers already minted
at post time; period lock state. No new backend work beyond a read model.

**States.** Empty (account exists, no lines in range — `No movements in Period 4. Opening 18,450.00
Dr, closing 18,450.00 Dr.`); one line; many (paginated at 100, not virtualised, because a clerk
cites a page number to an auditor); error (names the account and range it failed on); partial (an
unposted source document listed with `Not posted` and excluded from the running balance, stated in
the footer).

---

## 5. Aged receivables — `/reports/ar`

**Purpose.** "Who owes me." Tier B, and the report an owner runs before he pays a supplier.

**Legible in one second.** The total owed, and how much of it is beyond 30 days — those two numbers
are the whole reason the screen exists.

**Layout.**

```
[page title: Aged receivables]      [as-of selector]  [primary: Print]  [secondary: Export]
 Total receivable  8,42,300.00 BDT      Beyond 30 days  1,20,450.00 BDT (14.3%)
[Bucket strip — 5 segments, real proportions, labelled counts]
 0–30     31–60     61–90     91–180    180+
seriesPrimary  seriesMid  seriesMid  stateWarning  stateDanger
 Customer            Inv no    Due date   0–30        31–60       61–90       91–180      180+        Total
 Meridian Apparel  INV-204   14 Nov   2,40,000.00        —           —           —          —    2,40,000.00
 Blue Harbor       INV-198   02 Oct          —     45,000.00        —           —          —      45,000.00
```

- The bucket strip is the one chart: five segments whose widths are the real proportions, each with
  its taka figure and its invoice count printed beneath it. Nothing is inferred from colour: every
  segment carries a label and a number, so it survives print and colour-blindness.
- Bucket membership is by **due date, not invoice date**, and the definition is printed in the
  column group header's tooltip and in the print footer. An owner and his accountant must be able to
  see which rule produced the ageing.
- A figure never appears in two buckets; an allocation table is reachable from the row, and partial
  allocations show `Allocated 20,000.00 of 45,000.00`.
- Rows sorted by oldest bucket first, then by amount. The `Total` column is the row's own sum and is
  `type.moneyTotal`; the footer total is `surfaceBand` and must equal the sum of the bucket columns,
  with the control-total line beneath.
- Tier B also needs the mirrored payables screen; it is the same spec with the account side and the
  sign convention flipped, and the same bucket rule stated.

**Data it reads.** An AR aging projection keyed by `as_of`, invoice lines, receipts and allocations
(P6). Does not exist yet.

**States.** Empty (no open invoices — `Nothing outstanding as of 3 Nov.`); one customer; many
(sticky header, group-by-customer with totals per customer, since an owner reads by buyer not by
invoice); error; partial — an invoice whose allocation job has not run is listed under `Unallocated`
with the amount and a `Reconcile` action, and its total is excluded from the buckets and named in
the header line: `8,42,300.00 BDT total, 20,000.00 unallocated.`

---

## 6. Cost per style versus price — `/costing/{styleId}`

**Purpose.** §1.4's second buying reason and the trust moment: *what did this style really cost me,
am I losing money?* Most small factories genuinely do not know. Getting it wrong here is worse than
not having the screen, so the screen's first job is to show its own composition.

**Legible in one second.** The margin per piece, in taka, with its sign — and whether the cost is
complete.

**Layout.** A composition table, not a chart.

```
[page title: Cost per style]  [style selector: SS-204-A · Meridian Apparel · 12,000 pcs]
 Price per piece                                    485.00 BDT
 —— Cost of goods per piece
   Fabric — knitted jersey, 0.62 kg @ 210.00        130.20
   Trims and accessories                             38.50
   Cut, stitch, pack labour (CMT, 26 SAM @ 2.10)      54.60
   Subcontract — dyeing                               22.00
   Overhead allocation                                 41.30
   Wastage allowance 6%                                14.90
 —— Total cost per piece                             301.50
 —— Margin per piece                                 183.50
 —— Margin on order (12,000 pcs)                 22,02,000.00
[Caveat band — see states]
```

- Composition first, total second. A single big number is the legacy KPI-card mistake again; the
  owner has to be able to argue with a line.
- Every cost line carries its source in `type.meta`: which job, which bill, which payroll run, and
  which ledger account it posted to, linked. A cost line that cannot be traced is not a cost, it is
  an estimate, and the row must then be labelled `Estimated` (`stateInfo`).
- `Total cost per piece` and `Margin per piece` are `type.moneyTotal` on `surfaceBand`; the margin
  line is the only figure on this screen allowed to go red, and only with a printed `−`.
- **Currency honesty.** Price is often in the order currency (USD for an export buyer) and cost is in
  BDT. This screen shows both explicitly: a `Rate 1 USD = 121.40 BDT, effective 01 Oct 2026` line,
  snapshotted from the ledger, and a per-piece price stated in both. Two screens must never disagree
  about which currency they are in; here the disagreement is possible by nature of the business, so
  it is disclosed rather than hidden.
- No chart. A composition table with real numbers out-performs a donut and cannot lie about the
  remainder.

**Data it reads.** Job/order costing per style (P7), WIP and COGS postings, BOM roll-up, CMT rates.
The gate for that phase is the same report tying to the ledger *and* the stock ledger — so the
screen must offer a `Tie to ledger` action that runs the control total and shows its result inline.

**States.** Empty (style has no work order — `No production recorded for SS-204-A. Cost appears once
fabric is issued.`); one style; many (a per-style list at compact density with cost, price, margin
and a `Below cost` chip in `stateDanger` on any style whose total cost exceeds price); error; and
**partial — the important one**: a style whose consumption is incomplete renders the cost lines it
has, marks the missing ones `Not recorded`, and shows the caveat band:
`Cost is incomplete: dyeing consumption not yet posted. Do not use this margin for pricing.`
A "am I losing money" answer built on half the costs is the most damaging wrong number in the
product.

---

## 7. Opening-balance import — `/onboarding/opening-balances`

**Purpose.** Where ERP products lose the buyer, and the launch-critical feature of P8: a hand-held
pilot lives or dies on data onboarding. It is also the first screen a new tenant ever sees figures
on, and the first chance to prove the ledger is honest.

**Legible in one second.** How many rows will post, how many will not, and why.

**Layout.** A four-step wizard at `layout.wizardWidth` (720px), one decision per step, with the
state of the whole file visible at all times in a right-hand summary column.

```
1 Choose file        CSV/Excel of the old trial balance or cash book
2 Map columns        Old column → account code + Dr/Cr side  (a two-column table, 20 rows visible)
3 Review             Row-by-row: postable / refused / needs a mapping. Totals must tie.
4 Post               One opening journal dated 1 July 2026, gapless number, and the receipt
```

- **Step 3 cannot be skipped and cannot be "auto-fixed".** The legacy behaviour was
  `GetOrCreateCategoryAsync` creating CoA accounts from free text with `new Random().Next(100,999)`
  codes. Here, an unmapped row is *refused and named*, never invented. The UI therefore has to be
  honest about a mapping problem instead of papering over it, which is the point of the screen.
- The review table shows `Old label | Mapped account code | Account name | Side | Amount` per row,
  and the footer shows three figures: `Σ debits`, `Σ credits`, `Difference`. **Post is disabled
  until Difference is exactly 0.00**, and the disabled reason names the taka amount:
  `Debits and credits differ by BDT 1,240.00. Opening balances must balance.` (I1 as a visible
  precondition, not a server surprise.)
- Refused rows are counted, listed, and downloadable as a correction file — an owner's clerk fixes a
  CSV, he does not fix 40 screen validations one at a time.
- Step 4's receipt is the trust moment and must look like one: `Opening journal OP-0001 dated
  01 Jul 2026 · 42 lines · 12,34,567.50 Dr = 12,34,567.50 Cr · posted by Mohsin · links to
  /ledger/detail`. Re-runnable after a mapping fix **without duplicating postings** (I5), and the
  screen states that: `This file was imported once before (09:41). Re-importing replaces the
  draft mapping, not the posted journal.`
- Print and a "one page per account" variant exist here too, because the pilot's accountant will
  sign the opening balance sheet on paper.

**Data it reads.** CoA template plus tenant chart (`ChartOfAccount`, `BaseChartOfAccounts`), the
opening-balance posting path (`IOpeningBalances`, `JournalType.Opening` — all real, in
`src/Ledger/`), the idempotency key from I5.

**States.**

| State | What it shows |
|---|---|
| Empty | Not an empty state — a starting state with the file-format help and a real column list. It must say what a correct file looks like in the tenant's language. |
| One row | Full review table plus the three footer figures. |
| Many (10k rows) | Virtualised review, a per-error-code filter (`unmapped` / `unknown account` / `unbalanced` / `locked period`), and a count in the summary column at all times. Progress is per-batch, not a single spinner: 10,000 rows on a flaky connection must show how far it got. |
| Error — transport | Names the step it failed on and preserves every mapping the user made. The wizard must not lose a mapping because the network dropped between step 2 and 3. |
| Error — refusal | The database's own invariant, in human terms, naming the row and the line: `Row 8,412: an amount cannot be both a debit and a credit.` |
| Partial | `4,120 of 4,143 rows postable. 23 rows need a mapping. Opening balances are not posted.` Nothing is posted halfway: a partial import is a refused import with a to-do list, and the trial balance stays in its own pre-import empty state until step 4 completes. |
| Locked target date | `The period covering 01 Jul 2026 is tax-locked.` Names the tier and what the owner must do instead (post into the open period with disclosure, per I6). |

---

## 8. Journal listing and manual journal — `/ledger/journals`

Short, because it is the one path that works today (`api/v1/ledger/journals`).

- Listing: date, gapless journal number, journal type, narrative, `Dr total`, `Cr total`, status,
  actor. Numbered rows link to detail. Filter by journal type and period.
- Manual entry: a line grid with `Account | Particulars | Debit | Credit`, a running
  `Dr − Cr` difference in the footer, `Post` disabled while it is non-zero with the taka figure as
  the reason, and a visible `This posts immediately and cannot be edited` line above the button —
  the endpoint already returns posted, not draft (`LedgerJournalsController`), and the UI must not
  imply a second step that does not exist.
- Domestic amounts only today; a foreign-currency line is refused with the reason
  `This form posts in BDT only. A currency line needs the rate the ledger already supports.`
  Stated rather than discovered.

---

## 9. Settings — company

Small, and load-bearing because four decisions on this screen change every other screen: legal name
(both scripts), functional currency, number grouping (`western` / `south-asian`), fiscal year start
month, and UI locale. Each change previews its effect: switching grouping re-renders a sample figure
`12,34,567.50 → 1,234,567.50` on the spot, because the alternative is a tenant discovering the
change after a report has been filed.
