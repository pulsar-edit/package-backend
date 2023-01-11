module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:node/recommended"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "node/no-unpublished-require": [
      "error",
      {
        allowModules: [
          "supertest",
          "../node_modules/@databases/pg-test/jest/globalSetup",
          "../node_modules/@databases/pg-test/jest/globalTeardown",
        ],
      },
    ],
    "no-process-exit": "off",
    // Custom Rules as Determined by the maintainers of package-backend
    "camelcase": [
      "error",
      {
        "ignoreGlobals": true,
        "ignoreImports": true,
      }
    ],
    "complexity": [
      "error"
    ],
    "eqeqeq": [
      "error",
      "smart"
    ],
    "max-depth": [
      "error",
      4
    ]
  },
  plugins: [],
  globals: {
    jest: "readonly",
    test: "readonly",
    expect: "readonly",
    describe: "readonly",
    beforeAll: "readonly",
    afterEach: "readonly",
    process: "writeable",
    Buffer: "readonly",
  },
};
