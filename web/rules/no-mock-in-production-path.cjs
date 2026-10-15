'use strict'

const { isAllowed } = require('./support/paths.cjs')

const MOCK_MODULE = /(mock|stub|fake|dummy|msw|faker)/i

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
      envBranch:
        'L13: nothing may branch on NODE_ENV to choose a data source. The legacy /dev/trial-balance endpoint looked real only because the build decided what to serve.',
      mockModule: 'L13: {{name}} is test scaffolding and must not be reachable from application code.',
      mockName: 'L13: {{name}} reads as invented data; production code receives values, it does not fabricate them.',
    },
  },
  create(context) {
    const allow = (context.options[0] ?? {}).allow ?? []

    if (isAllowed(context.filename, allow)) {
      return {}
    }

    return {
      MemberExpression(node) {
        if (
          node.object.type === 'MemberExpression' &&
          node.object.object.type === 'Identifier' &&
          node.object.object.name === 'process' &&
          node.object.property.type === 'Identifier' &&
          node.object.property.name === 'env' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'NODE_ENV'
        ) {
          context.report({ node, messageId: 'envBranch' })
        }
      },
      ImportDeclaration(node) {
        const source = node.source.value

        if (typeof source === 'string' && MOCK_MODULE.test(source)) {
          context.report({ node, messageId: 'mockModule', data: { name: source } })
        }
      },
      'VariableDeclaration, FunctionDeclaration, TSTypeAliasDeclaration, TSInterfaceDeclaration, ClassDeclaration, TSEnumDeclaration'(
        node,
      ) {
        for (const declaration of describedNames(node)) {
          context.report({ node, messageId: 'mockName', data: { name: declaration } })
        }
      },
    }
  },
}

const INVENTED_NAME = /^(mock|fake|stub|dummy|lorem|sample|placeholder)[_A-Z]/i

function describedNames(node) {
  if (node.type === 'VariableDeclaration') {
    return node.declarations
      .filter((declaration) => declaration.id.type === 'Identifier' && INVENTED_NAME.test(declaration.id.name))
      .map((declaration) => declaration.id.name)
  }

  if (node.id !== undefined && node.id !== null && node.id.type === 'Identifier' && INVENTED_NAME.test(node.id.name)) {
    return [node.id.name]
  }

  return []
}
