'use strict'

const { classify } = require('./support/definitions.cjs')

module.exports = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      extra:
        'L1: one component or hook per file. {{name}} is a second one in the same file — the legacy barrel made it impossible to tell what a screen actually mounted.',
    },
  },
  create(context) {
    return {
      Program(program) {
        const { units } = classify(program)

        for (const { name, node } of units.slice(1)) {
          context.report({ node, messageId: 'extra', data: { name } })
        }
      },
    }
  },
}
