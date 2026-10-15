import { bn } from './messages/bn'
import { en } from './messages/en'
import type { Locale } from './Locale'
import type { Messages } from './Messages'

export const allMessages: Record<Locale, Messages> = { en, bn }
