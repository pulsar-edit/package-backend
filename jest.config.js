const config = {
  setupFilesAfterEnv: ["<rootDir>/tests/helpers/global.setup.jest.js"],
  verbose: true,
  reporters: [["default", { summaryThreshold: 0 }]],
  collectCoverage: true,
  coverageReporters: ["text", "clover"],
  coveragePathIgnorePatterns: [
    "<rootDir>/tests/",
    "<rootDir>/test/",
    "<rootDir>/node_modules/",
  ],
  projects: [
    {
      displayName: "Integration-Tests",
      globalSetup: "<rootDir>/node_modules/@databases/pg-test/jest/globalSetup",
      globalTeardown:
        "<rootDir>/node_modules/@databases/pg-test/jest/globalTeardown",
      setupFilesAfterEnv: [
        "<rootDir>/tests/helpers/handlers.setup.jest.js",
        "<rootDir>/tests/helpers/global.setup.jest.js",
      ],
      testMatch: [
        "<rootDir>/tests/full/**.test.js",
        "<rootDir>/tests/database/**.test.js",
      ],
    },
    {
      displayName: "Unit-Tests",
      setupFilesAfterEnv: ["<rootDir>/tests/helpers/global.setup.jest.js"],
      testMatch: ["<rootDir>/tests/unit/**/**.test.js"],
    },
  ],
};

module.exports = config;
