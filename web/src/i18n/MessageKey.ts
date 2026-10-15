import type { Messages } from './Messages'

type LeafPaths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : T[K] extends object ? `${K}.${LeafPaths<T[K]>}` : never
    }[keyof T & string]

export type MessageKey = LeafPaths<Messages>
