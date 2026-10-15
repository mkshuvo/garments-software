import type { MessageKey } from './MessageKey'
import type { MessageValues } from './MessageValues'

export type Translator = (key: MessageKey, values?: MessageValues) => string
