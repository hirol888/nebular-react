/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.tsx?$': ['@sucrase/jest-plugin', { jsxRuntime: 'automatic' }]
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  setupFilesAfterEnv: ['./configuration/jest/jsdom.mocks.js'],
  moduleNameMapper: {
    '@nebular-react/(.*)': '<rootDir>/src/nebular-react-$1/src'
  },
  collectCoverageFrom: [
    'src/nebular-react-*/src/**/*.{ts,tsx}',
    '!**/*.story.tsx',
    '!**/index.ts',
    '!**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      statements: 89,
      branches: 76,
      functions: 86,
      lines: 89
    }
  }
};
