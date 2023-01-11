# Style Guide

The Style Guide chosen for the `package-backend` intends to be non-intrusive, and aims to not get in the way of a programmer, and only aims to increase the readability of the repo as well as follow some of our principals.

Some of the Style Guide rules are enforced via `prettier` which is a code formatting, or prettifying tool that in some cases will automatically format the code according to our style guide so that you don't have to, if you style differs.

Additionally the `package-backend` uses `eslint` to look for issues in the code.

Our ESLint rules are run on Codacy, to alert of errors there, but only there, as to not interfere with the development practice. Having them warned of there gives us the ability to see where our Style Guide is being broken and fix it as needed, while not hounding a new Contributor with these issues.

## Style Guide Rules

* camelCase: We enforce the use of camelCase variables within this repo for readability purposes, and keeping the code similar enough throughout the codebase. This rule is enforced via ESLint.
* Cyclomatic Complexity: We enforce a maximum cyclomatic complexity on any one function to reduce the likelihood of mistakes and bugs within a code block. This rule is enforced via ESLint.
* Type-Safe Equality Operators: We enforce the use of `===` or `!==` to avoid type coercion. Some instances it will be needed to use alternative comparisons, and these are accounted for. This rule will not flag usage when comparing against two literal values, when evaluating `typeof`, and when comparing against `null`. This rule is enforced via ESLint.
* Max Nesting: We enforce a Max Nesting Depth of `4` within a code block. Following our coding principle of [Early Return Patterns](ARCHITECTURE.md). This is enforced via ESLint.
* Double Quotes: We enforce the usage of Double Quotes when possible within code. This rule is enforced via Prettier and should be done automatically once code is merged into the repo.
* Semicolons: We enforce the use of Semicolons at the end of lines. This rule is enforced via Prettier.
