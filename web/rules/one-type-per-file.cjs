'use strict'

const { classify } = require('./support/definitions.cjs')

module.exports = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      extra:
        'L1: {{name}} is a second visible type in this file. Types are the domain vocabulary, one per file, in TypeScript exactly as in C#.',
    },
  },
  create(context) {
    return {
      Program(program) {
        const { types } = classify(program)

        for (const name of types.slice(1)) {
          context.report({ node: program, messageId: 'extra', data: { name } })
        }
      },
    }
  },
}
