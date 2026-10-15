import { isLocale } from './IsLocale'
import type { Locale } from './Locale'

// Bangla is the default, not an option a tenant has to find. The buyer is a factory owner in
// Bangladesh and `Tenant.DefaultLanguage` is already 'bn' on the server; a frontend that fell back
// to English contradicted the domain model on every unconfigured deployment. The message layer is
// typed against the Bangla catalogue, so a missing key is a compile error rather than a blank
// screen — which is what makes defaulting safe.
const fallbackLocale: Locale = 'bn'

export function defaultLocale(): Locale {
  const configured = process.env.NEXT_PUBLIC_DEFAULT_LOCALE
  return configured !== undefined && isLocale(configured) ? configured : fallbackLocale
}
