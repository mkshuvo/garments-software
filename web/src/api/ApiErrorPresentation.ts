import type { MessageKey } from '@/i18n/MessageKey'
import type { MessageValues } from '@/i18n/MessageValues'

export type ApiErrorPresentation = {
  readonly messageKey: MessageKey
  readonly values?: MessageValues
}
