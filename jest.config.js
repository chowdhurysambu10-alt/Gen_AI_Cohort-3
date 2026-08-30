module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  testTimeout: 30000,
  verbose: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/functions/src/$1'
  }
};
