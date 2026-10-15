'use strict'

const COMPONENT = /^[A-Z][A-Za-z0-9$]*$/
const HOOK = /^use[A-Z][A-Za-z0-9$]*$/

const TYPE_NODES = new Set(['TSTypeAliasDeclaration', 'TSInterfaceDeclaration', 'TSEnumDeclaration', 'ClassDeclaration'])

function hasJsx(node, depth = 0) {
  if (node === null || node === undefined || typeof node !== 'object' || depth > 40) {
    return false
  }

  if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
    return true
  }

  return Object.entries(node).some(([key, child]) => {
    if (key === 'parent' || key === 'range' || key === 'loc') {
      return false
    }

    return Array.isArray(child) ? child.some((item) => hasJsx(item, depth + 1)) : hasJsx(child, depth + 1)
  })
}

function nameOf(node) {
  if (node.id !== null && node.id !== undefined && node.id.type === 'Identifier') {
    return node.id.name
  }

  return null
}

function declarationOf(statement) {
  if (statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration') {
    return { declaration: statement.declaration, visible: true, typeOnly: statement.exportKind === 'type' }
  }

  return { declaration: statement, visible: false, typeOnly: false }
}

function unitNames(declaration) {
  if (declaration === null || declaration === undefined) {
    return []
  }

  if (declaration.type === 'VariableDeclaration') {
    return declaration.declarations
      .map((entry) => nameOf(entry))
      .filter((name) => name !== null)
  }

  const name = nameOf(declaration)

  return name === null ? [] : [name]
}

// Mirrors the C# law: only visible (exported) declarations count, so a file-private helper is not
// smuggled in as a second public type.
function classify(program) {
  const units = []
  const types = []

  for (const statement of program.body) {
    const { declaration, visible, typeOnly } = declarationOf(statement)

    if (declaration === null || declaration === undefined || !visible) {
      continue
    }

    if (TYPE_NODES.has(declaration.type)) {
      types.push(...unitNames(declaration))
      continue
    }

    if (declaration.type === 'FunctionDeclaration') {
      const name = nameOf(declaration)

      if (name !== null && (COMPONENT.test(name) || HOOK.test(name))) {
        units.push({ name, node: declaration, renders: hasJsx(declaration.body) })
      }

      continue
    }

    if (declaration.type === 'VariableDeclaration') {
      for (const entry of declaration.declarations) {
        const name = nameOf(entry)

        if (name === null || !(COMPONENT.test(name) || HOOK.test(name))) {
          continue
        }

        units.push({ name, node: declaration, renders: entry.init !== null && entry.init !== undefined && hasJsx(entry.init) })
      }
    }
  }

  return { units, types }
}

module.exports = { COMPONENT, HOOK, classify, hasJsx, nameOf, unitNames }
