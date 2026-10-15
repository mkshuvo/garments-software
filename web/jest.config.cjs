module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css)$': '<rootDir>/__tests__/helpers/StyleStub.cjs',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          moduleResolution: 'node',
          target: 'ES2022',
          esModuleInterop: true,
          strict: true,
          noUnusedLocals: false,
          noUnusedParameters: false,
        },
      },
    ],
  },
  // Fixtures are deliberately-broken sample apps consumed as DATA by RouteGraph tests, and helpers
  // are modules — neither is a suite. Discovery is restricted to *.test.* so a fixture that must
  // fail to compile cannot fail the test run for the wrong reason.
  testMatch: ['<rootDir>/__tests__/**/*.test.(ts|tsx)'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/__tests__/fixtures/', '/__tests__/helpers/'],
  transformIgnorePatterns: ['/node_modules/'],
}
