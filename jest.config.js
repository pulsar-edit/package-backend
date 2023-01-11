const config = {
  collectCoverage: true,
  coverageReporters: ["text", "clover"],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/tests_integration/fixtures/**",
    "<rootDir>/node_modules/**",
  ],
  projects: [
    {
      displayName: "Integration-Tests",
      globalSetup: "<rootDir>/node_modules/@databases/pg-test/jest/globalSetup",
      globalTeardown:
        "<rootDir>/node_modules/@databases/pg-test/jest/globalTeardown",
      testMatch: ["<rootDir>/src/tests_integration/*.test.js"],
    },
    {
      displayName: "Unit-Tests",
      testMatch: ["<rootDir>/src/tests/vcs.test.js"],
    },
  ],
};

module.exports = config;
