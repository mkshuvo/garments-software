import { RuleTester } from 'eslint'
import type { Rule, RuleTester as RuleTesterTypes } from 'eslint'

const DEFAULT_FILENAME = 'src/components/Case.tsx'

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
})

function withFilename<Case extends { filename?: string; code: string }>(case_: Case): Case {
  return { ...case_, filename: case_.filename ?? DEFAULT_FILENAME }
}

export function lawCases(
  ruleName: string,
  cases: {
    readonly valid: ReadonlyArray<string | (RuleTesterTypes.ValidTestCase & { filename?: string })>
    readonly invalid: ReadonlyArray<RuleTesterTypes.InvalidTestCase & { filename?: string }>
  },
): void {
  const loadedRule = require(`../../rules/${ruleName}.cjs`) as Rule.RuleModule

  ruleTester.run(ruleName, loadedRule, {
    valid: cases.valid.map((case_) => (typeof case_ === 'string' ? { code: case_, filename: DEFAULT_FILENAME } : withFilename(case_))),
    invalid: cases.invalid.map(withFilename),
  })
}
