require('dotenv').config({ path: './.env.test' });

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  globalSetup: './tests/globalSetup.ts',
  globalTeardown: './tests/globalTeardown.ts',
  globals: {
    __TEST_AUTH_TOKEN__: process.env.TEST_AUTH_TOKEN || 'default_test_token_if_not_set',
  },
  reporters: [
    "default",
    ["jest-html-reporters", {
      "publicPath": "./html-report",
      "filename": "report.html",
      "expand": true,
      "openReport": false
    }]
  ]
};