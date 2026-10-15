'use strict'

const path = require('node:path')

function posix(filename) {
  return filename.split(path.sep).join('/')
}

// Patterns are repo-relative fragments ("src/api/"), matched as a path suffix so a Windows
// absolute path and a POSIX one behave identically in the rule tests.
function matchesPath(filename, pattern) {
  const target = posix(filename)
  const needle = posix(pattern)

  if (needle.endsWith('/')) {
    return target.includes(`/${needle}`) || target.startsWith(needle)
  }

  return target === needle || target.endsWith(`/${needle}`)
}

function isAllowed(filename, allowlist) {
  return (allowlist ?? []).some((pattern) => matchesPath(filename, pattern))
}

function stringOf(node) {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((element) => element.value.cooked ?? '').join('')
  }

  return null
}

module.exports = { matchesPath, isAllowed, stringOf, posix }
