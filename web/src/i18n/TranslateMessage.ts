import type { MessageKey } from './MessageKey'
import type { MessageValues } from './MessageValues'
import type { Messages } from './Messages'

const missingMarker = (key: string): string => `[i18n:${key}]`

const placeholder = /\{([A-Za-z0-9_]+)\}/g

export function translateMessage(messages: Messages, key: MessageKey, values?: MessageValues): string {
  const leaf = key
    .split('.')
    .reduce<unknown>((cursor, segment) => readSegment(cursor, segment), messages as unknown)

  if (typeof leaf !== 'string') {
    return missingMarker(key)
  }

  if (values === undefined) {
    return leaf
  }

  return leaf.replace(placeholder, (whole: string, name: string) => {
    const replacement = values[name]
    return replacement === undefined ? whole : String(replacement)
  })
}

function readSegment(cursor: unknown, segment: string): unknown {
  if (typeof cursor !== 'object' || cursor === null) {
    return undefined
  }

  return (cursor as Record<string, unknown>)[segment]
}
