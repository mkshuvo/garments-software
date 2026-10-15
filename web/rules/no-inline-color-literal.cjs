'use strict'

const { isAllowed } = require('./support/paths.cjs')

const PATTERNS = [
  { test: /#[0-9a-fA-F]{3,8}\b/, detail: 'a hex colour' },
  { test: /\brgba?\s*\(/, detail: 'an rgb()/rgba()' },
  { test: /\bhsla?\s*\(/, detail: 'an hsl()/hsla()' },
]

module.exports = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: { allow: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
      },
    ],
    messages: {
      color:
        'L15: {{detail}} literal. Colour exists once, in src/theme/Tokens.ts; the legacy trial balance carried about forty of these and one theme could not survive that.',
    },
  },
  create(context) {
    const allow = (context.options[0] ?? {}).allow ?? ['src/theme/Tokens.ts']

    if (isAllowed(context.filename, allow)) {
      return {}
    }

    function check(node, value) {
      if (typeof value !== 'string') {
        return
      }

      const hit = PATTERNS.find((pattern) => pattern.test.test(value))

      if (hit !== undefined) {
        context.report({ node, messageId: 'color', data: { detail: hit.detail } })
      }
    }

    return {
      Literal(node) {
        check(node, node.value)
      },
      TemplateElement(node) {
        check(node, node.value.cooked)
      },
    }
  },
}
