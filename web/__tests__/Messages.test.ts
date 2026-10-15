import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { allMessages } from '@/i18n/AllMessages'
import { translateMessage } from '@/i18n/TranslateMessage'
import type { MessageKey } from '@/i18n/MessageKey'
import type { Messages } from '@/i18n/Messages'

const WEB_ROOT = resolve(__dirname, '..')

function leafPaths(tree: unknown, prefix = ''): string[] {
  if (typeof tree === 'string') {
    return [prefix]
  }

  return Object.entries(tree as Record<string, unknown>).flatMap(([key, value]) =>
    leafPaths(value, prefix.length === 0 ? key : `${prefix}.${key}`),
  )
}

describe('L17 message catalogues', () => {
  it('gives every English key a Bangla counterpart and no extras', () => {
    const english = leafPaths(allMessages.en).sort()
    const bangla = leafPaths(allMessages.bn).sort()

    expect(bangla).toStrictEqual(english)
    expect(english.length).toBeGreaterThan(0)
  })

  it('never ships an empty translation', () => {
    for (const locale of ['en', 'bn'] as const) {
      for (const path of leafPaths(allMessages[locale])) {
        const value = translateMessage(allMessages[locale], path as MessageKey)

        expect(value.trim().length).toBeGreaterThan(0)
        expect(value).not.toContain('[i18n:')
      }
    }
  })

  it('renders Bengali script for the Bangla catalogue', () => {
    expect(translateMessage(allMessages.bn, 'login.title')).toBe('সাইন ইন')
    expect(translateMessage(allMessages.bn, 'common.emptyTitle')).toContain('তথ্য')
  })

  it('marks a key that is absent at runtime instead of rendering blank', () => {
    const incomplete = { ...allMessages.en, errors: undefined } as unknown as Messages

    expect(translateMessage(incomplete, 'errors.network')).toBe('[i18n:errors.network]')
  })

  it('interpolates values', () => {
    expect(translateMessage(allMessages.en, 'common.signedInAs', { email: 'owner@factory.bd' })).toBe(
      'Signed in as owner@factory.bd',
    )
    expect(translateMessage(allMessages.bn, 'errors.rejected', { status: 500 })).toContain('500')
  })

  it('keeps tabular figures available for money columns', () => {
    const css = readFileSync(resolve(WEB_ROOT, 'src/app/globals.css'), 'utf8')

    expect(css).toContain('font-feature-settings')
    expect(css).toContain('tnum')
  })

  it('declares no colour outside the token source', () => {
    const css = readFileSync(resolve(WEB_ROOT, 'src/app/globals.css'), 'utf8')

    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(css).not.toMatch(/rgba?\s*\(/)
  })

  it('agrees between the font variables and the token references', () => {
    const fonts = readFileSync(resolve(WEB_ROOT, 'src/theme/AppFonts.ts'), 'utf8')
    const tokens = readFileSync(resolve(WEB_ROOT, 'src/theme/Tokens.ts'), 'utf8')

    for (const name of ['latin', 'bengali'] as const) {
      const declared = new RegExp(`variable: '--font-${name}'`).test(fonts)
      const referenced = new RegExp(`var\\(--font-${name}\\)`).test(tokens)

      expect(declared).toBe(true)
      expect(referenced).toBe(true)
    }
  })
})
