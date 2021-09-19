require('dotenv/config')

module.exports = {
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^__mocks__/(.*)$': '<rootDir>/__mocks__/$1',
  },
  preset: 'ts-jest',
  resetMocks: true,
  testEnvironment: 'node',
}
