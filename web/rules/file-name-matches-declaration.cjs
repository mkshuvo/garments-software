'use strict'

const path = require('node:path')
const { classify } = require('./support/definitions.cjs')

const AGGREGATE_STEMS = [
  'index', 'dtos', 'models', 'types', 'enums', 'interfaces', 'classes', 'entities', 'requests',
  'responses', 'common', 'shared', 'misc', 'utils', 'helpers', 'constants', 'globals', 'core', 'base',
]

// A file named `TrialBalanceDtos.ts` or `AccountTypes.ts` is the same breach as one literally
// called `Dtos.ts`: the plural category in the stem is the tell that a drawer of declarations was
// parked there. Matching only exact stems left the common case unpoliced.
function aggregateCategoryOf(stem) {
  const lower = stem.toLowerCase()

  if (AGGREGATE_STEMS.includes(lower)) {
    return lower
  }

  return AGGREGATE_STEMS.find((category) => lower.endsWith(category)) ?? null
}

const APP_ROUTER_STEMS = [
  'page', 'layout', 'template', 'loading', 'error', 'global-error', 'not-found', 'default', 'route',
]

module.exports = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      aggregate:
        'L1b: “{{stem}}” is an aggregate filename. A plural category is the tell that a drawer of declarations got parked in one file.',
      mismatch:
        'L1b: this file is named “{{stem}}” but declares {{name}}. Name the file after the thing it declares.',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename()
    const stem = path.basename(filename).replace(/\.[^.]+$/, '')

    if (APP_ROUTER_STEMS.includes(stem.toLowerCase())) {
      return {}
    }

    return {
      Program(program) {
        const category = aggregateCategoryOf(stem)

        if (category !== null) {
          context.report({ node: program, messageId: 'aggregate', data: { stem } })
          return
        }

        const { units, types } = classify(program)
        const declared = [...units.map((unit) => unit.name), ...types]

        if (declared.length === 0 || declared.some((name) => name.toLowerCase() === stem.toLowerCase())) {
          return
        }

        context.report({ node: program, messageId: 'mismatch', data: { stem, name: declared.join(', ') } })
      },
    }
  },
}
