import { Inter, Noto_Sans_Bengali } from 'next/font/google'

export const latinFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-latin',
})

// Bengali needs its own family: Inter has no Bengali glyphs, so a mixed label like
// "স্টক / Stock" would fall back to whatever the OS offers, with different metrics, and break
// baseline alignment (§4.1).
export const bengaliFont = Noto_Sans_Bengali({
  subsets: ['bengali'],
  display: 'swap',
  variable: '--font-bengali',
})
