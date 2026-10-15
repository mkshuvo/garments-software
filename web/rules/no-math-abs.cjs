'use strict'

module.exports = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      abs:
        'L13: Math.abs discards the sign that tells a debit from a credit. Render the signed value; the account type decides the column, not the formatter.',
    },
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'Math' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'abs'
        ) {
          context.report({ node, messageId: 'abs' })
        }
      },
    }
  },
}
