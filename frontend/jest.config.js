const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.simple.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  // Very aggressive timeouts to prevent hanging tests
  testTimeout: 3000, // 3 seconds max per test
  // Single worker to avoid conflicts
  maxWorkers: 1,
  // Clear everything between tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  resetModules: true,
  // Force exit to prevent hanging
  detectOpenHandles: true,
  forceExit: true,
  // Bail on first failure to stop quickly
  bail: 1,
  // Disable coverage to speed up
  collectCoverage: false,
  // Additional settings to prevent hanging
  verbose: false,
  silent: false,
  // Centralized test location
  testMatch: [
    '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/__tests__/**/**/*.{js,jsx,ts,tsx}'
  ]
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)