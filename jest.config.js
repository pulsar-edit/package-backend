const config = {
  setupFilesAfterEnv: [
    "<rootDir>/test/global.setup.jest.js",
  ],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ["text", "clover"],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/tests_integration/fixtures/**",
    "<rootDir>/test/fixtures/**",
    "<rootDir>/node_modules/**",
  ],
  projects: [
    {
      displayName: "Integration-Tests",
      globalSetup: "<rootDir>/node_modules/@databases/pg-test/jest/globalSetup",
      globalTeardown:
        "<rootDir>/node_modules/@databases/pg-test/jest/globalTeardown",
      setupFilesAfterEnv: [
        "<rootDir>/test/handlers.setup.jest.js",
        "<rootDir>/test/global.setup.jest.js",
      ],
      testMatch: ["<rootDir>/test/*.integration.test.js"],
    },
    {
      displayName: "Unit-Tests",
      testMatch: ["<rootDir>/src/tests/*.test.js"],
    },
    {
      displayName: "VCS-Tests",
      testMatch: [
        "<rootDir>/src/vcs_providers_tests/**/*.test.js",
        "<rootDir>/src/vcs_providers_tests/*.test.js",
      ],
    },
    {
      displayName: "Handler-Tests",
      globalSetup: "<rootDir>/node_modules/@databases/pg-test/jest/globalSetup",
      globalTeardown: "<rootDir>/node_modules/@databases/pg-test/jest/globalTeardown",
      setupFilesAfterEnv: [
        "<rootDir>/test/handlers.setup.jest.js",
        "<rootDir>/test/global.setup.jest.js",
      ],
      testMatch: [
        "<rootDir>/test/*.handler.integration.test.js",
      ]
    },
  ],
};

module.exports = config;
