/** @jest-environment node */
import { lawCases } from '../helpers/LawCases'

const TOKEN_SOURCE = 'src/theme/Tokens.ts'

describe('L15 no-inline-color-literal', () => {
  lawCases('no-inline-color-literal', {
    valid: [
      { code: "export const background = designTokens.color.surfaceMuted", filename: 'src/components/Case.tsx' },
      { code: "export const navy = '#0B1437'", filename: TOKEN_SOURCE },
      { code: 'export const css = "var(--font-latin)"', filename: 'src/theme/AppTheme.ts' },
    ],
    invalid: [
      { code: "export const sx = { color: '#ffffff' }", errors: [{ messageId: 'color' }] },
      { code: "export const wash = 'rgba(11, 20, 55, 0.6)'", errors: [{ messageId: 'color' }] },
      { code: 'export const wash = `hsl(210, 50%, 20%)`', errors: [{ messageId: 'color' }] },
      {
        code: "export const a = '#0B1437'\nexport const b = 'rgb(255, 255, 255)'",
        errors: [{ messageId: 'color' }, { messageId: 'color' }],
      },
    ],
  })
})

describe('L17 no-hardcoded-ui-string', () => {
  lawCases('no-hardcoded-ui-string', {
    valid: [
      "export const view = <Typography>{t('login.title')}</Typography>",
      "export const view = <Button title={t('common.retry')} onClick={submit} />",
      'export const view = <Typography>{" "}</Typography>',
      "export const view = <Typography>{formattedAmount}</Typography>",
    ],
    invalid: [
      {
        code: 'export const view = <Typography>Total assets</Typography>',
        errors: [{ messageId: 'text' }],
      },
      {
        code: "export const view = <Typography>{'Net Position'}</Typography>",
        errors: [{ messageId: 'text' }],
      },
      {
        code: 'export const view = <Button label="Sign in" />',
        errors: [{ messageId: 'text' }],
      },
      {
        code: 'export const view = <img alt="Company logo" />',
        errors: [{ messageId: 'text' }],
      },
      {
        code: 'export const view = <Typography>স্টক</Typography>',
        errors: [{ messageId: 'text' }],
      },
    ],
  })
})