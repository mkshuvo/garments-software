import type { NextConfig } from 'next'

// One config file. The legacy tree shipped next.config.js AND next.config.ts; TypeScript won the
// race, so the api rewrite everyone assumed was live never applied.
const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
}

export default nextConfig
