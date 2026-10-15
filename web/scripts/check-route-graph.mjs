#!/usr/bin/env node
import { createRequire } from 'node:module'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const parser = require('@typescript-eslint/parser')

const HERE = dirname(fileURLToPath(import.meta.url))
const DEFAULT_ROOT = resolve(HERE, '..')

const EXEMPT_INBOUND = new Set(['/', '/login'])
const NAV_CALLS = new Set(['push', 'replace', 'prefetch', 'redirect', 'navigate'])
const NAV_PROPS = new Set(['href', 'to', 'path', 'url'])
const EXTERNAL = /^[a-z][a-z\d+\-.]*:/i
const NON_ROUTES = ['mailto:', 'tel:', 'data:', 'javascript:', 'blob:']

const PAGE_FILE = /^page\.(tsx|ts|jsx|js)$/
const SOURCE_FILE = /\.(tsx|ts|jsx|js)$/
const SKIPPED_DIRS = new Set(['node_modules', '.next', 'coverage'])

const posix = (path) => path.split(sep).join('/')

function isDirectory(path) {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

function listSourceFiles(dir) {
  const found = []

  for (const entry of readdirSync(dir)) {
    if (SKIPPED_DIRS.has(entry)) {
      continue
    }

    const full = posix(join(dir, entry))

    if (isDirectory(full)) {
      found.push(...listSourceFiles(full))
    } else if (SOURCE_FILE.test(entry)) {
      found.push(full)
    }
  }

  return found
}

function walk(node, visit, parent = null) {
  if (Array.isArray(node)) {
    for (const item of node) {
      walk(item, visit, parent)
    }

    return
  }

  if (node === null || typeof node !== 'object' || node.type === undefined) {
    return
  }

  visit(node, parent)

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || key === 'range' || key === 'loc') {
      continue
    }

    walk(value, visit, node)
  }
}

function staticString(node, constants) {
  if (node === null || node === undefined) {
    return null
  }

  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value
  }

  if (node.type === 'Identifier') {
    return constants.get(node.name) ?? null
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((element) => element.value.cooked ?? '').join('')
  }

  return null
}

function moduleConstants(program) {
  const constants = new Map()

  for (const statement of program.body) {
    const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement

    if (declaration === null || declaration === undefined || declaration.type !== 'VariableDeclaration') {
      continue
    }

    for (const entry of declaration.declarations) {
      if (entry.id?.type !== 'Identifier') {
        continue
      }

      const value = staticString(entry.init, constants)

      if (value !== null) {
        constants.set(entry.id.name, value)
      }
    }
  }

  return constants
}

// Route groups like "(marketing)" do not appear in the URL; "[slug]" matches any one segment.
function segmentsOf(path) {
  return path
    .split('/')
    .filter((segment) => segment.length > 0 && !segment.startsWith('('))
    .map((segment) => (segment.startsWith('[') ? '*' : segment))
}

function routeForFile(appDir, file) {
  if (!file.startsWith(appDir)) {
    return null
  }

  const relativePath = posix(relative(appDir, dirname(file)))

  return relativePath === '' ? '/' : `/${segmentsOf(relativePath).join('/')}`
}

function normaliseHref(href, baseRoute) {
  const target = href.split('#')[0].split('?')[0]
  const joined = target.startsWith('/') ? target : `${baseRoute === '/' ? '' : baseRoute.replace(/\/$/, '')}/${target}`

  const segments = segmentsOf(joined)

  return `/${segments.join('/')}`
}

function isNavigationTarget(href) {
  if (href.length === 0 || href.startsWith('/api/')) {
    return false
  }

  if (href.startsWith('#') || href.startsWith('//') || NON_ROUTES.some((prefix) => href.startsWith(prefix))) {
    return false
  }

  return !EXTERNAL.test(href)
}

function matchesRoute(route, routes) {
  if (routes.has(route)) {
    return true
  }

  return [...routes.keys()].some((declared) => {
    if (!declared.includes('*')) {
      return false
    }

    const pattern = new RegExp(`^${declared.split('/').map((segment) => (segment === '*' ? '[^/]+' : segment)).join('/')}$`)

    return pattern.test(route)
  })
}

export function checkRouteGraph(root) {
  const appDir = `${posix(resolve(root))}/src/app`
  const srcDir = `${posix(resolve(root))}/src`
  const routes = new Map()
  const files = isDirectory(srcDir) ? listSourceFiles(srcDir) : []

  if (isDirectory(appDir)) {
    for (const file of files) {
      if (!PAGE_FILE.test(file.split('/').pop())) {
        continue
      }

      const route = routeForFile(appDir, file)

      if (route !== null && !routes.has(route)) {
        routes.set(route, file)
      }
    }
  }

  const edges = []
  const importers = new Map()

  for (const file of files) {
    const program = parser.parseForESLint(readFileSync(file, 'utf8'), { filePath: file }).ast
    const constants = moduleConstants(program)
    const baseRoute = routeForFile(appDir, file) ?? '/'

    walk(program.body, (node, parent) => {
      if (node.type === 'ImportDeclaration' && typeof node.source?.value === 'string') {
        importers.set(node.source.value, (importers.get(node.source.value) ?? 0) + 1)
      }

      if (node.type === 'JSXAttribute' && parent?.type === 'JSXOpeningElement' && node.name?.name === 'href') {
        const value =
          node.value?.type === 'JSXExpressionContainer'
            ? staticString(node.value.expression, constants)
            : staticString(node.value, constants)

        if (value !== null) {
          edges.push({ from: file, href: value, baseRoute })
        }

        return
      }

      if (node.type === 'Property') {
        const key = node.key?.name ?? node.key?.value

        if (NAV_PROPS.has(key)) {
          const value = staticString(node.value, constants)

          if (value !== null) {
            edges.push({ from: file, href: value, baseRoute })
          }
        }

        return
      }

      if (node.type !== 'CallExpression' || node.arguments.length === 0) {
        return
      }

      const callee = node.callee
      const name = callee.type === 'Identifier' ? callee.name : (callee.property?.name ?? '')

      if (!NAV_CALLS.has(name)) {
        return
      }

      const value = staticString(node.arguments[0], constants)

      if (value !== null) {
        edges.push({ from: file, href: value, baseRoute })
      }
    })
  }

  const inbound = new Map()
  const broken = []
  const checked = []

  for (const edge of edges) {
    if (!isNavigationTarget(edge.href)) {
      continue
    }

    const target = normaliseHref(edge.href, edge.baseRoute)
    checked.push({ ...edge, target })

    if (matchesRoute(target, routes)) {
      const sources = inbound.get(target) ?? new Set()
      sources.add(edge.from)
      inbound.set(target, sources)
      continue
    }

    broken.push({ ...edge, target })
  }

  const orphans = [...routes.keys()].filter((route) => !inbound.has(route) && !EXEMPT_INBOUND.has(route))
  const components = files.filter((file) => file.includes('/src/components/'))
  const importedNames = new Set(
    [...importers.keys()].map((specifier) => {
      const clean = specifier.startsWith('@/') ? specifier.slice(2) : specifier

      return clean.split('/').pop().replace(/\.[^.]+$/, '')
    }),
  )
  const unreachable = components.filter((file) => {
    const stem = file.split('/').pop().replace(/\.[^.]+$/, '')

    return !importedNames.has(stem)
  })

  return { routes, edges, checked, broken, orphans, components, unreachable, filesScanned: files.length }
}

function print(graph, root) {
  const distinct = new Set(graph.checked.map((edge) => edge.target))

  console.log(`pages                     : ${graph.routes.size}`)
  console.log(`navigation sources scanned : ${graph.edges.length}`)
  console.log(`internal hrefs checked     : ${graph.checked.length} (${distinct.size} distinct targets)`)
  console.log(`source files parsed        : ${graph.filesScanned}`)
  console.log(`components reachable       : ${graph.components.length - graph.unreachable.length}/${graph.components.length}`)

  for (const [route, file] of graph.routes) {
    console.log(`  page ${route.padEnd(26)} ${posix(relative(root, file))}`)
  }
}

export function violations(graph, root = '') {
  const shown = (path) => (root.length === 0 ? path : posix(relative(root, path)))

  return [
    ...graph.broken.map((edge) => `L14: ${shown(edge.from)} navigates to ${edge.target}; no page declares that route`),
    ...graph.orphans.map((route) => `L14: route ${route} has a page but no inbound navigation`),
    ...graph.unreachable.map((file) => `L16: ${shown(file)} is not imported by any source file`),
  ]
}

function main() {
  const args = process.argv.slice(2)
  const rootIndex = args.indexOf('--root')
  const root = posix(rootIndex === -1 ? DEFAULT_ROOT : resolve(args[rootIndex + 1]))
  const graph = checkRouteGraph(root)

  print(graph, root)

  const failures = violations(graph, root)

  if (failures.length > 0) {
    console.log('')
    failures.forEach((failure) => console.log(`FAIL ${failure}`))
    console.log(`\nroute graph: FAIL (${failures.length} violation(s))`)
    process.exitCode = 1

    return
  }

  console.log('\nroute graph: PASS')
}

const entry = process.argv[1] === undefined ? '' : posix(resolve(process.argv[1]))

if (entry.endsWith('scripts/check-route-graph.mjs')) {
  main()
}
