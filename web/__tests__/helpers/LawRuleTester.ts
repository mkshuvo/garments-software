import { RuleTester } from 'eslint'
import type { Rule, RuleTester as RuleTesterTypes } from 'eslint'

type CaseOptions = unknown[]

export type LawCases = {
  readonly valid: ReadonlyArray<string | (RuleTesterTypes.ValidTestCase & { options?: CaseOptions })>
  readonly invalid: ReadonlyArray<RuleTesterTypes.InvalidTestCase & { options?: CaseOptions }>
}

function loadRule(name: string): Rule.RuleModule {
  return require(`../../rules/${name}.cjs`) as Rule.RuleModule
}

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
})

export function defineLawCases(ruleName: string, cases: LawCases): void {
  ruleTester.run(ruleName, loadRule(ruleName), {
    valid: cases.valid.map((testCase) => (typeof testCase === 'string' ? { code: testCase } : testCase)),
    invalid: cases.invalid.map((testCase) => ({ filename: 'src/components/Probe.tsx', ...testCase })),
  })
}
