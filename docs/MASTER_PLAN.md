# MASTER PLAN — Garments ERP, greenfield rebuild

**Status:** Approved for execution · **Owner:** Mohsin · **Date:** 2026-10-16
**Legacy tree:** `master` @ `176b9b7`, 108 commits, to be tagged `legacy-final` and frozen read-only.

---

## 0. What we are replacing, and why the plan starts here

Everything in this section was executed and verified on 2026-10-15/16, not inferred from docs.

| Fact | Evidence |
|---|---|
| Backend compiles, but 22 of ~35 service registrations are commented out | [Program.cs:81-112](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Program.cs#L81-L112) |
| Frontend `npm run build` exits **1**; two imports point at files that do not exist | `@/components/icons/SocialIcons` at [login/page.tsx:22](file:///C:/Users/Mohsin/Projects/garments-software/frontend/src/app/login/page.tsx#L22), `@/components/debug/AuthDebug` at [categories/page.tsx:4](file:///C:/Users/Mohsin/Projects/garments-software/frontend/src/app/admin/accounting/categories/page.tsx#L4) |
| Cash book entry controller cannot be constructed — injects two unregistered services | [CashBookEntryController.cs:30-33](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Controllers/CashBookEntryController.cs#L30-L33) |
| `CashBookController` fabricates successful postings | `journalEntryId = Guid.NewGuid()` at [CashBookController.cs:63-64](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Controllers/CashBookController.cs#L63-L64) |
| Cash book posts **single-sided, `Posted`** journal entries — one line, no balance check | `// Create single journal entry line (credit only)` at [EnhancedCashBookService.cs:372-401](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Services/EnhancedCashBookService.cs#L372-L401) |
| The trial balance **hides correct entries and shows the broken ones** | completed entries are set `Approved` [:188](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Services/EnhancedCashBookService.cs#L188); the report filters `Status == Posted` [:299](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Services/TrialBalanceService.cs#L299) |
| Debits arrive **negative** from the API and are rendered **unsigned** in USD | [TrialBalanceService.cs:328-330](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Services/TrialBalanceService.cs#L328-L330) → `Math.abs(amount)` at [TrialBalanceTreeGrid.tsx:28](file:///C:/Users/Mohsin/Projects/garments-software/frontend/src/components/trial-balance/TrialBalanceTreeGrid.tsx#L28) |
| Equity is fabricated as `\|assets\| − \|liabilities\|` and labelled "Net Position" | [TrialBalanceDashboard.tsx:70-80](file:///C:/Users/Mohsin/Projects/garments-software/frontend/src/components/trial-balance/TrialBalanceDashboard.tsx#L70-L80) |
| Trend sparklines are one hardcoded SVG path per row; KPI trends are `{2.5} // Mock trend for now` | [TrialBalanceTreeGrid.tsx:31-41](file:///C:/Users/Mohsin/Projects/garments-software/frontend/src/components/trial-balance/TrialBalanceTreeGrid.tsx#L31-L41), [TrialBalanceKPIs.tsx:169](file:///C:/Users/Mohsin/Projects/garments-software/frontend/src/components/trial-balance/TrialBalanceKPIs.tsx#L169) |
| Audit logging writes nothing, ever — the table exists in no migration and no snapshot | `CreateTable(name: "AuditLogs")` → 0 matches; `AuditLogEntry` → 0 occurrences in `ApplicationDbContextModelSnapshot.cs` |
| Actor identity is fabricated: `return Guid.Parse("00000000-…-000000000001")` with `// TODO: Get from JWT` | [JournalEntryController.cs:365-370](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Controllers/JournalEntryController.cs#L365-L370) |
| **Anyone can mint an administrator.** No `[Authorize]` on the controller or the action | [AdminSetupController.cs:10,30](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Controllers/AdminSetupController.cs#L10) |
| EF model and schema disagree: `date` vs `timestamptz`, enum-as-string vs integer, 12 declared indexes never migrated | [DatabaseConfig.cs:113-115](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Config/DatabaseConfig.cs#L113-L115) vs snapshot `:220` |
| One migration uses a SQL Server type against Postgres — it cannot apply | `type: "uniqueidentifier"` at [20250726200000_AddCategoryIdToJournalEntryLine.cs:16](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Migrations/20250726200000_AddCategoryIdToJournalEntryLine.cs#L16) |
| No tenancy exists. Zero `tenant_id`/`CompanyId` on any accounting table; `TrialBalances` snapshot table keyed by Year/Month | grep across `Models/`, `Data/`, `Migrations/` |
| Cache keys carry no tenant; invalidation is a logging stub; "memoization" keys on `string.GetHashCode()` | [TrialBalanceCacheService.cs:130-174](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Services/TrialBalanceCacheService.cs#L130-L174), [TrialBalanceCalculationMemoizationService.cs:219-236](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Services/TrialBalanceCalculationMemoizationService.cs#L219-L236) |
| Tests are fiction: `<Compile Remove="Tests/**" />` while `xunit`/`Moq`/`Test.Sdk` ship inside the production csproj | [GarmentsERP.API.csproj:13-14,31-39](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/GarmentsERP.API.csproj#L13-L14) |
| No CI, no tags, no `.env`, two conflicting `next.config` files, no foreign keys at all | [ApplicationDbContext.cs:391](file:///C:/Users/Mohsin/Projects/garments-software/backend/GarmentsERP.API/Data/ApplicationDbContext.cs#L391) |

**The actual lesson.** This product has never been simultaneously buildable and runnable, and nothing was ever checking. So the rewrite's first deliverable is not a feature — it is a **machine that cannot lie about state**. Every phase below terminates at a gate that a script, not a narrative, decides.

**One advantage we inherit:** because the accounting subsystem never ran, **there is no live ledger to migrate**. We build the new schema clean and import history as data. `docs/progress.md` claiming Purchasing complete is also wrong — `PurchaseOrder`, `SalesOrder`, `WorkOrder`, `BillOfMaterial`, `Payroll`, `Attendance` and `Leave` entities do not exist anywhere. Five of the six modules are genuinely new, not revived.

---

## 1. Product definition

**One sentence:** a multi-tenant, double-entry-first ERP for garments manufacturing and trading businesses, whose books are provably correct and whose screen quality reads as a commercial product.

### 1.1 Production-ready means all of these
1. Every endpoint reachable and correct, or the file is deleted. No dead code shipped.
2. Ledger invariants enforced **in the database**, not in a service that might be commented out.
3. Two tenants provably isolated, verified by an automated cross-tenant test that runs on every commit.
4. `up` migrations apply cleanly to an empty Postgres in CI. Rollback tested.
5. Real, executable test suites on both sides, in the build, gating merge.
6. Separated `dev` / `staging` / `prod` topology, no MailHog or pgAdmin in prod.
7. Backup + **restore drill** evidence, not just a backup cron.
8. No anonymous endpoint except health/readiness and explicitly public auth routes.
9. Observability: structured logs with request correlation, metrics, error tracking.
10. A documented release procedure a competent operator can follow cold.

### 1.2 Marketing-ready means all of these
1. A public landing page built from an approved `DESIGN.md` token set (§4).
2. A **seeded demo tenant** with realistic apparel data — no `Math.abs`, no mock sparklines, no "Mock trend for now".
3. Self-serve trial signup → working workspace in under 3 minutes, unassisted.
4. Screenshots, a product tour and a short demo video captured from the real app, never from mock data.
5. Pricing page, security/data page, docs hub, onboarding checklist.
6. A named reference: the MM Fashion cash-book import shown as a live before/after.
7. Zero broken links: a CI route-graph check proves every nav href resolves.

### 1.3 Explicitly in scope for v1 ("everything")
Accounting · Inventory & products · Sales, invoicing & payments · Purchasing & vendor bills · HR & payroll · Production (work orders, BOM, WIP, subcontracting, job costing) · Reporting · Tenancy/admin.
Nothing is parked. Modules land in tranches (§3), because accounting correctness outranks breadth and every one of these modules is a *producer* into the same ledger.

---

## 2. Architecture

### 2.1 The spine: every module posts, nothing reports from its own tables

The previous build had three trial-balance engines that disagreed by construction. The fix is structural: **one immutable ledger, everything else is a projection.**

```
SourceDocument            invoice, bill, payment, stock move, payroll run, work order
   │                      (mutable, tenant-scoped, has its own workflow)
   ▼
PostingIntent             append-only event: doc type + id, event, posting date,
   │                      currency, rule_version.  Idempotency key lives here.
   ▼
AccountResolver           effective-dated account determination → emits a snapshot
   ▼
JournalFactory            builds a balanced line set; header-vs-line rounding decision;
   │                      dual-currency amounts on every line
   ▼
Poster                    ONE transaction: mint gapless number (SELECT … FOR UPDATE),
   │                      insert idempotency row, period-lock check, balance trigger
   ▼
Immutable GL              journal header + lines. UPDATE/DELETE revoked.
   ▼
Projections               Trial Balance · P&L · Balance Sheet · Cash Flow · AR/AP aging
   │                      all keyed by as_of, all re-derivable from GL
   ▼
PeriodClose               the closing journal is an ordinary journal; it advances the lock
   ▼
Verifier                  control totals, hash chain, CoA-vs-posting integrity, drift alarm
```

Consequences we accept for the whole program:
- A module **never** computes a financial figure from its own tables. It emits a `PostingIntent`.
- Report numbers are derived, and any derived number can be rebuilt from GL. Denormalised balance columns are permitted only as caches with a rebuild job and a reconciliation control.
- Historical documents do not recompute when a rule changes. Resolved accounts, rate and rule version are **snapshotted onto the line**.

### 2.2 The eight invariants (researched, then enforced)

Sourced from Odoo `account.move`, ERPNext GL Entry + Period Closing Voucher + Immutable Ledger, NetSuite GL Audit Numbering and period close, Oracle header-level rounding, Xero journal reversal, Square "Books: an immutable double-entry service", TigerBeetle account flags, and Postgres RLS practice. Full list in the research record; the engineering rules:

| # | Rule | Enforcement |
|---|---|---|
| I1 | `Σ debit = Σ credit` per journal **and per currency** | DB trigger re-aggregating siblings in-txn → `RAISE EXCEPTION`. App validation is advisory only. |
| I2 | A line has `debit > 0` **XOR** `credit > 0`, never both, never zero | `CHECK` constraint. No single-signed `amount` column. |
| I3 | Posted ⇒ immutable. Corrections are reversal entries carrying `reversed_entry_id` (+ Storno flag) | `REVOKE UPDATE, DELETE ON gl_* FROM app_role`. Status flags are **not** immutability — the old code's `Reversed` flip left the money in the books. |
| I4 | Gapless monotonic numbering per (tenant, journal, period), minted at post time, never recycled | counter row + `SELECT … FOR UPDATE`; voided documents still consume a number; unique index backs it. |
| I5 | Posting is idempotent on a source key | `UNIQUE (tenant_id, source_type, source_id, iteration)`. Makes safe retry and legal re-posting possible. |
| I6 | Effective-dated period lock, checked at write | Odoo's three tiers: soft lock for non-advisers, hard lock, tax lock. Prior-period adjustments post *into* the open period with disclosure, never retro-posted. |
| I7 | Money typed per currency, one explicit rounding policy | `numeric` with per-currency scale (BDT 2dp), never float. Rounding residue posts to a configured **Header Rounding Account** (Oracle pattern), never truncates silently. Line stores transaction *and* functional amounts. |
| I8 | Limits are DB-side; balances are derived and re-derivable | TigerBeetle-style flags adapted for stock: negative stock, over-allocation, credit limit as constraints, not UI warnings. |

### 2.3 Multi-tenancy
Shared schema, `tenant_id` leading every table, **`FORCE ROW LEVEL SECURITY`**, app role is not the table owner, `set_config('app.tenant_id', …, true)` set per transaction.
Not `AddDbContextPool` — pooling makes the session variable leak between requests. Use `AddDbContext` with a pooled *connection* (`Npgsql` does this itself, and resets state on reuse). Schema-per-tenant is reserved for a future regulated tier, not v1.
Every cache key, every queue message, every background job and every file path carries `tenant_id`. The old cache key (`startDate:endDate:groupBy:…`, no tenant) is the exact bug this closes.

### 2.4 Chart of accounts
Adjacency + `ltree` path, GiST-indexed. Parent rows are **non-postable** (ERPNext rejects GL entries on group accounts). `AccountType` **and** `AccountSubType` are explicit columns — the old code sniffed `accountNameLower.Contains("cash")`, and allowed `AccountType` to be flipped on an account with posted lines, silently inverting every historical balance. Subtypes are immutable once posted to.

### 2.5 Confirmed domain parameters (owner decisions, 2026-10-16 — binding)

These three were resolved because each lands in a table that invariant I3 makes immutable.

1. **Currency: BDT functional, full multi-currency.** Every GL line stores transaction amount *and* BDT functional amount, with the rate and its effective date snapshotted onto the line (I7). Unrealised FX revaluation runs at period close and posts through the ordinary posting engine — not as a manual balance adjustment. Foreign-currency vendor bills are assumed present, which is realistic for garment import of trim and fabric.
2. **Fiscal calendar: July–June, 12 periods** (Bangladesh fiscal year). Gapless numbering (I4) is scoped per `(tenant, journal, period)` on this calendar; the three-tier lock (I6) advances on it; `JournalType.Opening` posts the 1 July opening journal. Period 13 support is *not* built — the schema keeps the period key as a foreign reference so a 13-period tenant can be added without altering the GL table.
3. **Deployment: VPS + Docker Compose.** `infra/compose.prod.yml` is a real topology, not the current dev stack with MailHog/pgAdmin/Redis-Commander bolted on. P8's restore drill is a documented `pg_restore` against a fresh volume with row-count and control-total verification — the `Verifier` totals from P4 are what proves a restore is faithful, not just that it completed.

### 2.6 Solution layout — modular monolith, one type per file

```
src/
  Core/                 money, tenant context, clock, ids, results, errors
  Ledger/              CoA, journals, GL, posting engine, periods, reversal  ← the kernel
  Platform/            tenancy, identity, RBAC, audit, files, email, jobs, cache
  Modules/
    Inventory/         products, apparel matrix, warehouses, stock ledger
    Purchasing/        PO, GRN, vendor bills, payments
    Sales/             SO, invoices, receipts, allocations, tax
    Payroll/           employees, attendance, payslips, payroll journals
    Production/        work orders, BOM, WIP, subcontracting, job costing
  Api/                 composition root, controllers, middleware  (the only host)
tests/
  Unit/  Integration/  LedgerProperty/  LedgerGolden/  TenantIsolation/  E2E/
web/                   Next.js 16 app
design/                DESIGN.md token source, component specs
infra/                 compose.dev.yml  compose.prod.yml  ci/  observability/
```

---

## 3. Engineering law — enforced by CI, not by memory

The failure mode of the previous build was not ignorance, it was **no gate**. Each rule below has a checker; a rule with no checker is a preference.

| # | Rule | Gate |
|---|---|---|
| L1 | **One type per file.** Every class, interface, enum, record and DTO — C#, TypeScript, everywhere. | Analyzer/script fails any file declaring >1 top-level type. |
| L2 | No commented-out registrations, ever. Composition root resolves **every** controller and service. | Startup test enumerates all controllers/`I*Service` and constructs each. Missing DI = red. |
| L3 | No fake success. Ban `Guid.NewGuid()` as a returned identifier, `NotImplementedException` behind a 200, and `TODO` in any controller path. | CI grep + "did this actually persist?" integration assertion per write endpoint. |
| L4 | Financial invariants live in the database (I1-I8). App validation improves the error message, nothing more. | Migration diff review + constraint-existence test. |
| L5 | Posted rows immutable. Corrections are reversals with a link. | `REVOKE` present in migration; test asserts `UPDATE` on posted GL throws. |
| L6 | Test packages never reference the app project's production csproj. Tests compile in the build. | Separate test assemblies; CI fails on test SDK in `Api.csproj`. |
| L7 | Migrations apply to an **empty** Postgres in CI, forward and back. | Catches the `uniqueidentifier` class of failure that hid for a year. |
| L8 | Every endpoint has explicit authorisation. `FallbackPolicy = RequireAuthenticatedUser`; opt out per-route, never opt in. | Metadata scan: any endpoint without a policy is red. Anonymous allow-list is a reviewed file. |
| L9 | Cross-tenant access is impossible and *proven*. | `TenantIsolation` suite: tenant A's principal requesting every B resource by guessed id, all endpoints. Must fail. |
| L10 | Every cache key contains tenant. Every cache has a tested invalidation path. | Cache-miss/invalidation test per cached read. |
| L11 | Culture-invariant for all persisted/serialised numbers. | Roslyn analyzer for `ToString()`/`(decimal)` casts on money. |
| L12 | Frontend: **one** env-driven API client, one auth interceptor. No raw `fetch` + `localStorage`. | ESLint `no-restricted-imports` + CI grep for `fetch(` and `localStorage` outside the client. |
| L13 | No `Math.abs` on a financial value in a render path. No hardcoded currency or locale. No mock data reachable from a production build. | CI grep; `NODE_ENV`-branched mock endpoints are banned outright (that is how `dev/trial-balance` fooled everyone). |
| L14 | Route graph must be closed: every nav href resolves; every page has an inbound route. | Script walks `src/app` against nav config. |
| L15 | Design tokens have one source. No inline hex/`rgba` literals in components (~40 in the old trial balance alone). | Stylelint/ESLint rule; token file is the only place colours exist. |
| L16 | No dead code ships. Unreachable components are deleted in the phase that replaces them. | Bundle/Knit coverage + explicit "components reachable" report per gate. |

---

## 4. Design — routed through the tooling, per standing instruction

Design is not freehand. Per the owner's rule, every interface task goes through **`impeccable`** (design, critique, audit, polish) and **`awesome-design-md`** (exact token sets from named brands).

**Direction:** a financial product that reads trustworthy, not playful. Dense, tabular, numeric-alignment-first. Candidates to evaluate at the P4 gate, then one is chosen and written to `design/DESIGN.md` as the single token source: **Linear** (restraint, density), **Stripe** (financial credibility, type discipline), **Notion** (calm surfaces). Rejected by default: decorative hover lifts on data cards, gradient hero cards, sparklines without a real series.

**The accounting UI patterns we hold ourselves to** — each responds to a specific verified defect:
- Signed amounts, never `Math.abs`. Dr/Cr shown as signed with explicit column semantics; negative in red **with the sign present**.
- Real account codes in the "Code" column. The old grid printed a truncated GUID under a header promising a code.
- Per-currency normal-balance logic surfaced to the client (`accountType`/`subType` must survive the DTO boundary — the old `AccountBalanceDto` dropped `categoryName`).
- Ledger-correct date range with an explicit "Opening / Period movements / Closing" column set, and the range actually changeable (the shipped screen imported `DateRangeSelector` and never mounted it, so it was permanently month-to-date).
- Every table: sticky header, `TableContainer` scroll, breakpoint variants, skeleton, empty state, **and a real error state**. `catch { console.error }` rendering a blank page under a live header is banned; so is the worse variant — a plausible-looking empty report with no message.
- No trend, chart or KPI without a real series behind it. Two screens must not disagree on currency (old: trial balance hardcoded `USD`, balance screen showed `BDT`).
- One theme. The old `/trial-balance` forced `#0B1437` navy against a `#ffffff` sidebar from the shared shell.

`impeccable` runs as a **critique gate** at the end of each UI-bearing phase; its findings are fixed before the phase is called done, and the before/after is captured for the marketing assets in P9.

---

## 5. Phases and gates

Every phase ends at a **gate**: a command that prints PASS/FAIL with evidence, plus a live screen or endpoint I demonstrate. Nothing starts until the previous gate passes. Gates are reviewed by you.

### P0 — Freeze and the truth machine
Tag `legacy-final`; extract read-only schema + MM Fashion CSV mapping into `legacy-reference/`. New solution skeleton at §2.5 with an empty bootable app. Build CI: both builds, both lint, type-check, migrations-on-empty-DB, L1/L2/L3/L6/L14/L15 checkers, and a `verify-all.sh` that is the single gate command. Fix the frontend's two dead imports only if we keep any page; otherwise the new `web/` starts clean. Docker Desktop must be running — it currently is not.
**Gate:** green pipeline on an app that does nothing yet, on every push. *This is the phase that could not have been skipped.*

### P1 — Tenancy, identity, RBAC
`Tenant`/`Company`, `ApplicationUser`, profiles, roles, `(resource, action)` permissions **seeded** (the old seeder was commented out, so the permission layer was decorative). RLS forced, `set_config` per transaction, JWT with real subject claims — one claim name, not the old three (`NameIdentifier` / `sub` / `id`). Deny-by-default fallback policy. Superuser bootstrap as an offline CLI, never an HTTP endpoint like `POST /api/AdminSetup/create-admin`.
**Gate:** `TenantIsolation` suite passes; two seeded tenants cannot see each other through any endpoint.

### P2 — Ledger kernel *(the highest-value phase)*
CoA with `ltree` + non-postable parents; journals; `gl_entry`/`gl_line` with I1-I8 as DB constraints/triggers; gapless numbering; idempotent posting; effective-dated exchange rates; fiscal year, periods, three-tier lock; opening-balance journals (`JournalType.Opening` existed in the old enum and was referenced nowhere); reversal with `reversed_entry_id` + Storno; header/line rounding with a rounding account; tamper-evident append-only audit with before/after values and real actor identity.
**Gate:** property-based tests (FsCheck) over random line sets proving you cannot create an unbalanced, single-sided, double-sided or zero-amount posted entry; `UPDATE`/`DELETE` on posted GL throws; golden-file trial balance correct **including opening balances and prior periods** — the exact thing the old report got wrong.

### P3 — Posting sources: manual + cash book + bank
Manual journal (the only working path today — `IJournalEntryService`, registered), cash book, customer/vendor payments and allocations, bank accounts, transfers, reconciliation. MM Fashion CSV import rebuilt on the posting engine with explicit account-mapping configuration, replacing the old `GetOrCreateCategoryAsync` behaviour of auto-creating CoA accounts from free text with `new Random().Next(100,999)` codes.
**Gate:** real client CSV → balanced GL → trial balance that ties; each write endpoint proven by "did it persist" assertions (L3).

### P4 — Reporting, design system, and the trial balance redo
Projections over materialised read models keyed by `as_of`, all re-derivable: Trial Balance, GL detail, journal listing, P&L, Balance Sheet, Cash Flow, Aged AR/AP, tax return, budget variance, cost-centre/dimension P&L. `Verifier` runs control totals (`Σ gl_lines = reported balance`) and alarms on drift. **`design/DESIGN.md` chosen and applied here** via `awesome-design-md`; `impeccable` critique pass. The 5,611-line `components/trial-balance/` folder — where 15 of 18 components were unreachable and the routed screen was the *worse* of the two — is not ported; the new report replaces it and the dead folder is deleted.
**Gate:** numbers tie to the `Verifier`; export + print; L13/L14/L15/L16 green; screenshot pack exists and every figure on it is real.

### P5 — Inventory & apparel matrix
Products with style/colour/size matrix that must **not** fragment the GL; warehouses, locations; stock ledger as its own append-only ledger reconciling to the GL stock account (ERPNext's stock-ledger-vs-GL comparison is the model); perpetual valuation with backdated-write repost handling; negative stock blocked DB-side (I8); batch/lot and fabric-roll tracking with shrinkage.
**Gate:** `Stock Balance` report reconciles to the GL inventory account to the paisa, on a dataset with backdated movements.

### P6 — Purchasing and Sales cycles
PO → GRN → vendor bill → payment; SO → dispatch/delivery → invoice → receipt → allocation. Tax schemes/rates effective-dated, price lists, partials and credit notes as **reversals** (I3), document workflows with approval. This finally builds the modules `docs/progress.md` marked complete.
**Gate:** procure-to-pay and order-to-cash cycles post correct balanced journals; AR/AP aging ties; credit note leaves both original and reversal visible.

### P7 — Payroll, HR and Production
Employees, attendance, leave, payslip generation posting via effective-dated determination rules; **work orders, BOM cost roll-up, WIP as a real GL account fed by consumption, subcontracting (issued-vs-held stock, processing bills), job/order costing per style, COGS.** Apparel specifics from the research: CMT labour at SAM/minute rates, cut-make-trim flow, size-colour matrix costing.
**Gate:** a complete job — fabric issued, cutting/stitching/packing consumed, subcontracted trim, FG receipt — produces WIP and COGS that tie to the ledger and to the stock ledger simultaneously.

### P8 — SaaS hardening
Self-serve trial signup, email verification + password reset (neither route existed: `/register`, `/forgot-password`, `/reset-password` were all 404 links), plans/entitlements and billing hooks, demo tenant, onboarding checklist + sample-data generator, production topology split from dev, secret management (post the 2026-10-15 scrub), structured logging with correlation ids, metrics, error tracking, backup **and a restore drill**, documented release runbook + rollback.
**Gate:** a stranger reaches a working trial workspace in under 3 minutes unassisted; restore drill produces a byte-verified test; prod compose contains no MailHog/pgAdmin/Redis-Commander.

### P9 — Marketing and launch
Landing page from `design/DESIGN.md`, pricing, product tour and demo video shot against the demo tenant, security/data page, docs hub, MM Fashion before/after case study, launch checklist.
**Gate:** site live, no placeholder copy, every screenshot traceable to a real screen in the app.

**Dependency shape:** P0 → P1 → P2 → P3 → P4, then P5/P6/P7 in that order (stock before the cycles that move it; both before payroll/production which consume it). P8 needs P4 to be demoable; P9 needs P8.

---

## 6. Data strategy

No legacy runtime data exists, so this is an import, not a migration.
1. `legacy-reference/` holds the old schema and the MM Fashion CSV mapping (read-only).
2. MM Fashion Ltd CSVs become the **demo tenant** and the P3 tie-out corpus. They were scrubbed from git history on 2026-10-15 and stay out of the repo — referenced by path, never committed.
3. Import is idempotent per I5, and re-runnable after a mapping fix without duplicate postings.
4. Chart of accounts is built once as a **template** with a garments-specific seed, then per-tenant customisable. "MM Fashion categories" become tenant data under a configurable category set — the single largest productisation step, because today they are hard-coded into the domain model.

---

## 7. Standing risks and how the plan answers them

| Risk | Answer |
|---|---|
| "Everything" breadth outruns the core and we rebuild a wide-but-dead app. | P2 must gate green before any module phase. Modules are posting sources, never parallel implementations of reporting. |
| Docs drift back into fiction (`progress.md` has one ~120-line block duplicated six times and claims modules that do not exist). | Status lives in the gate script's last output, not prose. `docs/progress.md` is regenerated from evidence in P0 and deleted as a hand-maintained file. |
| Another "temporarily commented out to resolve compilation errors". That phrase is what killed 22 registrations — and it points at the real cause: `net10.0` pinned against `Microsoft.AspNetCore.*` / EF `8.0.x` packages. | Single version set, `dotnet out of support` check in CI, packages upgraded in P0 and locked via `packages.lock.json`. |
| Correctness verified by eyeball. | Golden-file + property-based tests in P2. `Verifier` control totals in P4 run continuously, not on demand. |
| Design regressing to inline hex soup. | L15 gate + `impeccable` critique at every UI phase. |
| Marketing assets built on mock data, as `DevTrialBalanceController` did. | L13 bans mock endpoints in production builds; P9 assets derive only from the P8 demo tenant. |
| Docker Desktop down, so no phase is verifiable locally. | P0 prerequisite: engine running, `make` targets re-verified against the real daemon. |

---

## 8. Open decisions

**Resolved 2026-10-16** and now binding in §2.5: currency scope (BDT functional + full multi-currency) · fiscal calendar (July–June, 12 periods) · deployment target (VPS + Docker Compose).

Still open, none of them blocking P0:

1. **Tax regime.** VAT/discovery rules for garments in the operating country, and whether withholding tax on vendor bills is in v1. Needed before P6, since it changes account determination.
2. **Billing/entitlement model** for SaaS tiering — plans by users, by modules, or by transaction volume. Needed before P8.
3. **Which brand aesthetic** to evaluate at the P4 gate (§4) before `design/DESIGN.md` is frozen — Linear, Stripe or Notion.

---

## 9. Immediate next action

**P0 — Freeze and truth machine.** Not blocked by any open decision. One prerequisite: **Docker Desktop must be running** — it is currently down, and P0's migrations-apply-to-an-empty-Postgres gate cannot be verified without it.
