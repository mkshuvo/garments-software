/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In development, rewrite API calls to the backend
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://backend:8080/api/:path*', // Internal Docker network
        },
      ];
    }
    return [];
  },
  // Enable experimental features for better Docker support
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // Disable telemetry for Docker builds
  telemetry: false,
};

module.exports = nextConfig;