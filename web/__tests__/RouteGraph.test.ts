import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const SCRIPT = resolve(__dirname, '..', 'scripts', 'check-route-graph.mjs')
const ROOT = resolve(__dirname, '..')

function run(root: string) {
  const result = spawnSync(process.execPath, [SCRIPT, '--root', root], { encoding: 'utf8' })

  return { status: result.status ?? 1, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

describe('L14 route graph closure', () => {
  it('accepts a tree where every href resolves and every page is reachable', () => {
    const run_ = run(resolve(ROOT, '__tests__/fixtures/route-graph/closed'))

    expect(run_.output).toContain('route graph: PASS')
    expect(run_.status).toBe(0)
  })

  it('rejects a navigation target with no page', () => {
    const run_ = run(resolve(ROOT, '__tests__/fixtures/route-graph/broken-link'))

    expect(run_.status).not.toBe(0)
    expect(run_.output).toContain('no page declares that route')
    expect(run_.output).toContain('/workspace/ledger')
  })

  it('rejects a page nobody navigates to', () => {
    const run_ = run(resolve(ROOT, '__tests__/fixtures/route-graph/orphan-page'))

    expect(run_.status).not.toBe(0)
    expect(run_.output).toContain('route /workspace/unlinked has a page but no inbound navigation')
  })

  it('reports the counts it actually checked', () => {
    const run_ = run(resolve(ROOT, '__tests__/fixtures/route-graph/closed'))

    expect(run_.output).toMatch(/pages\s+: 3/)
    expect(run_.output).toMatch(/navigation sources scanned\s+: \d+/)
    expect(run_.output).toMatch(/internal hrefs checked\s+: \d+ \(\d+ distinct targets\)/)
  })

  it('passes on the shipped application', () => {
    const run_ = run(ROOT)

    expect(run_.output).toContain('route graph: PASS')
    expect(run_.status).toBe(0)
  })
})
