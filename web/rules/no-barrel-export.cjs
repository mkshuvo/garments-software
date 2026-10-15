'use strict'

const path = require('node:path')

module.exports = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      barrel:
        'L1: a re-export barrel hides what is reachable. {{detail}} Import from the declaring file; the legacy index.ts listed fifteen components of which thirteen were dead.',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename()
    const stem = path.basename(filename).replace(/\.[^.]+$/, '').toLowerCase()
    const reexports = []

    return {
      ExportAllDeclaration(node) {
        reexports.push(node)
      },
      'ExportNamedDeclaration[source!=null]'(node) {
        reexports.push(node)
      },
      'Program:exit'(program) {
        if (reexports.length === 0) {
          return
        }

        const isIndex = stem === 'index'

        if (!isIndex && reexports.length < 2) {
          return
        }

        const detail = isIndex
          ? `index.${path.extname(filename).slice(1)} re-exports ${reexports.length} module(s).`
          : `${reexports.length} modules are re-exported from one file.`

        context.report({ node: program, messageId: 'barrel', data: { detail } })
      },
    }
  },
}
