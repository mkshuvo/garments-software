/** @jest-environment node */
import { lawCases } from '../helpers/LawCases'

describe('L1 one-component-per-file', () => {
  lawCases('one-component-per-file', {
    valid: [
      { code: 'export function TrialBalance() {\n  return null\n}\n\nconst columnWidth = 120', filename: 'src/components/TrialBalance.tsx' },
      { code: 'export function useTrialBalance() {\n  return []\n}', filename: 'src/hooks/UseTrialBalance.ts' },
      { code: 'function helper() {\n  return 1\n}\n\nexport function Panel() {\n  return null\n}', filename: 'src/components/Panel.tsx' },
    ],
    invalid: [
      {
        code: 'export function TrialBalance() {\n  return null\n}\n\nexport function TrialBalanceRow() {\n  return null\n}',
        filename: 'src/components/TrialBalance.tsx',
        errors: [{ messageId: 'extra' }],
      },
      {
        code: 'export function Panel() {\n  return null\n}\n\nexport function usePanelState() {\n  return 1\n}',
        filename: 'src/components/Panel.tsx',
        errors: [{ messageId: 'extra' }],
      },
    ],
  })
})

describe('L1 one-type-per-file', () => {
  lawCases('one-type-per-file', {
    valid: [
      { code: 'export type TrialBalanceRow = { readonly code: string }', filename: 'src/types/TrialBalanceRow.ts' },
      {
        code:
          'type ColumnWidth = number\n\nexport type TrialBalanceRow = { readonly code: string }\n\nconst width: ColumnWidth = 1\n\nexport { width }',
        filename: 'src/types/TrialBalanceRow.ts',
      },
    ],
    invalid: [
      {
        code:
          'export type TrialBalanceRow = { readonly code: string }\n\nexport type TrialBalanceTotals = { readonly debit: number }',
        filename: 'src/types/TrialBalanceRow.ts',
        errors: [{ messageId: 'extra' }],
      },
      {
        code: 'export enum AccountSide {\n  Debit,\n  Credit\n}\n\nexport type AccountDirection = (typeof AccountSide)[keyof typeof AccountSide]',
        filename: 'src/types/AccountSide.ts',
        errors: [{ messageId: 'extra' }],
      },
    ],
  })
})

describe('L1b file-name-matches-declaration', () => {
  lawCases('file-name-matches-declaration', {
    valid: [
      { code: 'export function LocaleSwitcher() {\n  return null\n}', filename: 'src/components/LocaleSwitcher.tsx' },
      { code: 'export default function Page() {\n  return null\n}', filename: 'src/app/admin/dashboard/page.tsx' },
      { code: 'export type TrialBalanceRow = { readonly code: string }', filename: 'src/types/TrialBalanceRow.ts' },
      { code: 'export const designTokens = {}', filename: 'src/theme/Tokens.ts' },
    ],
    invalid: [
      {
        code: 'export function TrialBalanceGrid() {\n  return null\n}',
        filename: 'src/components/Charts.tsx',
        errors: [{ messageId: 'mismatch' }],
      },
      { code: 'export const rows = []', filename: 'src/components/TrialBalanceDtos.ts', errors: [{ messageId: 'aggregate' }] },
      {
        code: 'export type Row = { readonly code: string }\n\nexport type Totals = { readonly debit: number }',
        filename: 'src/types/AccountTypes.ts',
        errors: [{ messageId: 'aggregate' }],
      },
    ],
  })
})

describe('L1 no-barrel-export', () => {
  lawCases('no-barrel-export', {
    valid: [
      { code: "export { TrialBalance } from './TrialBalance'", filename: 'src/components/Single.ts' },
      { code: 'const width = 1\n\nexport { width }', filename: 'src/components/Widths.ts' },
    ],
    invalid: [
      {
        code:
          "export { TrialBalance } from './TrialBalance'\nexport type { TrialBalanceRow } from './TrialBalanceRow'",
        filename: 'src/components/Exports.ts',
        errors: [{ messageId: 'barrel' }],
      },
      {
        code: "export * from './TrialBalance'",
        filename: 'src/components/index.ts',
        errors: [{ messageId: 'barrel' }],
      },
    ],
  })
})