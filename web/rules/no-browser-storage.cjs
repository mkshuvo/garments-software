'use strict'

const { isAllowed } = require('./support/paths.cjs')

const BANNED_STORES = new Set(['localStorage', 'sessionStorage', 'indexedDB'])

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
      storage:
        'L12: browser storage belongs to the API client module only; anything else drifts out of the auth and tenancy lifecycle ({{name}}).',
    },
  },
  create(context) {
    const allow = (context.options[0] ?? {}).allow ?? ['src/api/']

    if (isAllowed(context.filename, allow)) {
      return {}
    }


    return {
      MemberExpression(node) {
        // Only match the object when it is a bare identifier. Reading the property of a nested
        // member expression instead would report `window.sessionStorage.clear()` twice: once for
        // `window.sessionStorage` and again for the outer `.clear`, whose object name is the same
        // store. A law that shouts twice per line gets ignored.
        const object = node.object.type === 'Identifier' ? node.object.name : ''
        const property = node.property.type === 'Identifier' ? node.property.name : ''

        for (const candidate of [object, property]) {
          if (BANNED_STORES.has(candidate)) {
            context.report({ node, messageId: 'storage', data: { name: candidate } })
            return
          }
        }
      },
    }
  },
}
