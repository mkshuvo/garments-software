'use strict'

const { isAllowed } = require('./support/paths.cjs')

const TEXT_PROPS = new Set([
  'title',
  'alt',
  'placeholder',
  'label',
  'helperText',
  'caption',
  'errorMessage',
  'message',
  'text',
  'summary',
  'aria-label',
  'aria-labelledby',
  'aria-description',
])

const STRUCTURAL = /^[$(]?[0-9.,%()[\]/{}\s-]*$/

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
      text:
        'L17: {{detail}} is user-facing copy in source. Pass a message key through useTranslations so the Bangla catalogue can actually reach it.',
    },
  },
  create(context) {
    const allow = (context.options[0] ?? {}).allow ?? []

    if (isAllowed(context.filename, allow)) {
      return {}
    }

    function report(node, value) {
      context.report({ node, messageId: 'text', data: { detail: `“${value.trim().slice(0, 40)}”` } })
    }

    return {
      JSXText(node) {
        if (node.value.trim().length === 0 || STRUCTURAL.test(node.value.trim())) {
          return
        }

        report(node, node.value)
      },
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier' || !TEXT_PROPS.has(node.name.name)) {
          return
        }

        const value = node.value

        if (value === null) {
          return
        }

        if (value.type === 'JSXLiteral' || (value.type === 'Literal' && typeof value.value === 'string')) {
          if (value.value.trim().length > 0 && !STRUCTURAL.test(value.value.trim())) {
            report(value, value.value)
          }

          return
        }

        if (value.type === 'JSXExpressionContainer' && value.expression.type === 'TemplateLiteral') {
          const cooked = value.expression.quasis.map((element) => element.value.cooked ?? '').join('')

          if (cooked.trim().length > 0) {
            report(value.expression, cooked)
          }
        }
      },
      JSXExpressionContainer(node) {
        if (node.expression.type !== 'Literal' || typeof node.expression.value !== 'string') {
          return
        }

        if (node.expression.value.trim().length > 0 && !STRUCTURAL.test(node.expression.value.trim())) {
          report(node.expression, node.expression.value)
        }
      },
    }
  },
}
