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
        ],
      },
    ],
    "no-process-exit": "off",
    // Custom Rules as Determined by the maintainers of package-backend
    complexity: ["error"],
    eqeqeq: ["error", "smart"],
    "max-depth": ["error", 4],
    camelcase: "off",
  },
  plugins: [],
  globals: {
    jest: "readonly",
    test: "readonly",
    expect: "readonly",
    describe: "readonly",
    beforeAll: "readonly",
    afterEach: "readonly",
    afterAll: "readonly",
    process: "writeable",
    Buffer: "readonly",
    Joi: "readonly",
  },
};
