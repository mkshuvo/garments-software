'use strict'

const { isAllowed, stringOf } = require('./support/paths.cjs')

const CURRENCY_CODES = new Set([
  'USD', 'EUR', 'GBP', 'BDT', 'INR', 'PKR', 'JPY', 'CNY', 'AED', 'SGD', 'MYR', 'AUD', 'CAD',
  'CHF', 'ZAR', 'LKR', 'NPR', 'SAR', 'TRY', 'THB',
])

const BCP_47 = /^[a-z]{2,3}(-[A-Z]{2,3}|-[A-Z][a-z]{3})(-[A-Za-z0-9]{2,8})*$/

const INTL_FORMATTERS = new Set([
  'NumberFormat',
  'DateTimeFormat',
  'DisplayNames',
  'RelativeTimeFormat',
  'ListFormat',
  'PluralRules',
  'Collator',
])

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
      currency: 'L13: currency code {{code}} is tenant data, not a component constant. Two screens with different currencies is how the legacy trial balance shipped USD next to a BDT balance sheet.',
      locale: 'L13: locale tag {{tag}} must come from the active Locale, never a literal (the legacy report hardcoded en-US).',
      formatter: 'L13: Intl.{{name}} here is constructed from a literal; pass the tenant locale instead.',
    },
  },
  create(context) {
    const allow = (context.options[0] ?? {}).allow ?? ['src/i18n/']

    if (isAllowed(context.filename, allow)) {
      return {}
    }

    return {
      Literal(node) {
        const value = stringOf(node)

        if (value === null) {
          return
        }

        if (CURRENCY_CODES.has(value)) {
          context.report({ node, messageId: 'currency', data: { code: value } })
          return
        }

        if (BCP_47.test(value)) {
          context.report({ node, messageId: 'locale', data: { tag: value } })
        }
      },
      TemplateElement(node) {
        const value = node.value.cooked ?? ''

        if (CURRENCY_CODES.has(value)) {
          context.report({ node, messageId: 'currency', data: { code: value } })
        }
      },
      NewExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Intl' &&
          node.callee.property.type === 'Identifier' &&
          INTL_FORMATTERS.has(node.callee.property.name) &&
          node.arguments.length > 0 &&
          node.arguments[0].type === 'Literal'
        ) {
          context.report({
            node,
            messageId: 'formatter',
            data: { name: node.callee.property.name },
          })
        }
      },
    }
  },
}
