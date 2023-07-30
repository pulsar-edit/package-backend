const config = {
  setupFilesAfterEnv: ["<rootDir>/test/global.setup.jest.js"],
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
      testMatch: [
        "<rootDir>/test/*.integration.test.js",
        "<rootDir>/test/database/**/**.js",
      ],
    },
    {
      displayName: "Unit-Tests",
      setupFilesAfterEnv: ["<rootDir>/test/global.setup.jest.js"],
      testMatch: [
        "<rootDir>/test/*.unit.test.js",
        "<rootDir>/test/handlers/**/**.js",
      ],
    },
    {
      displayName: "VCS-Tests",
      setupFilesAfterEnv: ["<rootDir>/test/global.setup.jest.js"],
      testMatch: ["<rootDir>/test/*.vcs.test.js"],
    },
    {
      displayName: "Handler-Tests",
      globalSetup: "<rootDir>/node_modules/@databases/pg-test/jest/globalSetup",
      globalTeardown:
        "<rootDir>/node_modules/@databases/pg-test/jest/globalTeardown",
      setupFilesAfterEnv: [
        "<rootDir>/test/handlers.setup.jest.js",
        "<rootDir>/test/global.setup.jest.js",
      ],
      testMatch: ["<rootDir>/test/*.handler.integration.test.js"],
    },
  ],
};

module.exports = config;
