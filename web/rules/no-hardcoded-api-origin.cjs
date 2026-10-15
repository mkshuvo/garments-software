'use strict'

const { isAllowed, stringOf } = require('./support/paths.cjs')

const PATTERNS = [
  { test: /\bhttps?:\/\//i, detail: 'a URL scheme' },
  { test: /\blocalhost\b/i, detail: 'localhost' },
  { test: /\b127\.0\.0\.1\b/, detail: 'a loopback address' },
  { test: /:\d{4,5}\b/, detail: 'a port number' },
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
      origin:
        'L12: an API origin must come from NEXT_PUBLIC_API_BASE_URL, never from source (found {{detail}}). The legacy rewrite rule pointed at http://localhost:8080 and nobody noticed until production.',
    },
  },
  create(context) {
    const allow = (context.options[0] ?? {}).allow ?? ['src/api/ApiBaseUrl.ts']

    if (isAllowed(context.filename, allow)) {
      return {}
    }

    function check(node) {
      const value = node.type === 'Literal' ? stringOf(node) : node.value.cooked ?? ''

      if (value === null || value === undefined) {
        return
      }

      const hit = PATTERNS.find((pattern) => pattern.test.test(value))

      if (hit !== undefined) {
        context.report({ node, messageId: 'origin', data: { detail: hit.detail } })
      }
    }

    return {
      'Literal': check,
      TemplateElement: check,
    }
  },
}
