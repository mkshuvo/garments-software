/** @jest-environment node */
import { lawCases } from '../helpers/LawCases'

describe('L13 no-math-abs', () => {
  lawCases('no-math-abs', {
    valid: ['export const signed = movement.amount', 'export const rounded = Math.round(amount)'],
    invalid: [
      { code: 'export const shown = Math.abs(amount)', errors: [{ messageId: 'abs' }] },
      { code: 'export const total = lines.reduce((sum, line) => sum + Math.abs(line.netBalance), 0)', errors: [{ messageId: 'abs' }] },
    ],
  })
})

describe('L13 no-hardcoded-currency-or-locale', () => {
  lawCases('no-hardcoded-currency-or-locale', {
    valid: [
      { code: 'export const digits = new Intl.NumberFormat(locale, { minimumFractionDigits: scale })' },
      { code: 'export const label = new Intl.DateTimeFormat(activeLocale, dateStyle).format(openedOn)' },
      { code: "export const supportedLocales = ['en', 'bn']", filename: 'src/i18n/Locale.ts' },
    ],
    invalid: [
      { code: "export const currency = 'USD'", errors: [{ messageId: 'currency' }] },
      { code: "export const currency = 'BDT'", errors: [{ messageId: 'currency' }] },
      { code: "export const locale = 'en-US'", errors: [{ messageId: 'locale' }] },
      {
        code: "export const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })",
        errors: [{ messageId: 'formatter' }, { messageId: 'locale' }, { messageId: 'currency' }],
      },
    ],
  })
})

describe('L13 no-mock-in-production-path', () => {
  lawCases('no-mock-in-production-path', {
    valid: [
      'export const trialBalance = await apiClient.get("/api/v1/trial-balance")',
      "export const environment = process.env.NEXT_PUBLIC_API_BASE_URL",
    ],
    invalid: [
      {
        code: "export function load() {\n  if (process.env.NODE_ENV === 'development') {\n    return devTrialBalance()\n  }\n  return apiClient.get('/api/v1/trial-balance')\n}",
        errors: [{ messageId: 'envBranch' }],
      },
      { code: "import MockAdapter from 'axios-mock-adapter'", errors: [{ messageId: 'mockModule' }] },
      { code: 'export const mockAccounts = []', errors: [{ messageId: 'mockName' }] },
      { code: 'export function fakeTrialBalance() {\n  return []\n}', errors: [{ messageId: 'mockName' }] },
    ],
  })
})