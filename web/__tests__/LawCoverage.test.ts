import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'

// Normalise the root the same way the file list is normalised below: on Windows `resolve` returns
// backslashes while the scanned paths are forward-slashed, so leaving SRC un-normalised makes the
// prefix strip silently do nothing and every relative-path assertion compares against an absolute one.
const SRC = resolve(__dirname, '..', 'src').split(sep).join('/')

function sourceFiles(dir: string): string[] {
  const found: string[] = []

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)

    if (statSync(full).isDirectory()) {
      found.push(...sourceFiles(full))
    } else if (/\.(ts|tsx)$/.test(entry)) {
      found.push(full)
    }
  }

  return found.map((file) => file.split(sep).join('/'))
}

const files = sourceFiles(SRC)
const contents = new Map(files.map((file) => [file.replace(`${SRC}/`, ''), readFileSync(file, 'utf8')]))

function filesContaining(pattern: RegExp): string[] {
  return [...contents].filter(([, text]) => pattern.test(text)).map(([name]) => name)
}

describe('law coverage over the shipped source', () => {
  it('scans a non-empty tree, so a green run means something', () => {
    expect(files.length).toBeGreaterThan(30)
  })

  it('has exactly one API client (L12)', () => {
    expect(filesContaining(/axios\.create\(/)).toStrictEqual(['api/ApiClient.ts'])
    expect(filesContaining(/^\s*import\s+.*from\s+'axios'/m)).toStrictEqual(['api/ApiClient.ts', 'api/ToApiError.ts'])
  })

  it('touches no raw transport or browser storage outside the client module (L12)', () => {
    expect(filesContaining(/\bfetch\s*\(|XMLHttpRequest/)).toStrictEqual([])
    expect(filesContaining(/localStorage|sessionStorage|indexedDB/)).toStrictEqual(['api/AccessTokenStore.ts'])
  })

  it('carries no origin literal (L12)', () => {
    expect(filesContaining(/https?:\/\//)).toStrictEqual([])
    expect(filesContaining(/localhost|127\.0\.0\.1|:8080/)).toStrictEqual([])
  })

  it('never strips a financial sign (L13)', () => {
    expect(filesContaining(/Math\.abs/)).toStrictEqual([])
  })

  it('keeps currency and locale out of source (L13)', () => {
    expect(filesContaining(/\b(?:USD|EUR|GBP|BDT|INR|JPY|CNY)\b/)).toStrictEqual([])
    expect(filesContaining(/\b[a-z]{2,3}-[A-Z]{2,3}\b/)).toStrictEqual([])
  })

  it('reaches no mock through production code (L13)', () => {
    expect(filesContaining(/NODE_ENV/)).toStrictEqual([])
    expect(filesContaining(/\b(?:mock|fake|stub|dummy)[A-Z]/i)).toStrictEqual([])
  })

  it('keeps colour in one file (L15)', () => {
    expect(filesContaining(/#(?:[0-9a-fA-F]{3,8})\b|rgba?\s*\(|hsla?\s*\(/)).toStrictEqual(['theme/Tokens.ts'])
  })

  it('ships no barrel and no TODO (L1, L3)', () => {
    expect(files.filter((file) => file.endsWith('/index.ts') || file.endsWith('/index.tsx'))).toStrictEqual([])
    expect(filesContaining(/TODO|FIXME|for now/i)).toStrictEqual([])
  })
})
