'use strict'

const { isAllowed } = require('./support/paths.cjs')

const BANNED_CALLS = new Set(['fetch', 'XMLHttpRequest', 'sendBeacon'])
const BANNED_MODULES = /^(axios|superagent|ky|whatwg-fetch)(\/|$)/

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
      rawCall:
        'L12: no raw network call here. Route the request through the single API client so the env-driven base URL and the auth interceptor always apply ({{detail}}).',
      rawModule: 'L12: only the API client module may import an HTTP library ({{name}}).',
    },
  },
  create(context) {
    const options = context.options[0] ?? {}
    const allow = options.allow ?? ['src/api/ApiClient.ts']

    if (isAllowed(context.filename, allow)) {
      return {}
    }

    function calleeText(node) {
      if (node.callee.type === 'Identifier') {
        return node.callee.name
      }

      if (node.callee.type === 'MemberExpression' && node.callee.property.type === 'Identifier') {
        return node.callee.property.name
      }

      return ''
    }

    function reportIfBanned(node) {
      const name = calleeText(node)

      if (BANNED_CALLS.has(name)) {
        context.report({ node, messageId: 'rawCall', data: { detail: name } })
      }
    }

    return {
      CallExpression: reportIfBanned,
      NewExpression: reportIfBanned,
      ImportDeclaration(node) {
        const source = node.source.value

        if (typeof source === 'string' && BANNED_MODULES.test(source)) {
          context.report({ node, messageId: 'rawModule', data: { name: source } })
        }
      },
    }
  },
}
