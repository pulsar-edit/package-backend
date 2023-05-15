# Style Guide

This document covers the enforced styleguide of both the code within this repository, as well as the documentation.

## Code Style Guide

The adopted coding style guide intends to be as non-problamatic as possible for those that need to adhere to it. With it being automatically enforced wherever possible to reduce the need to know it fully. For the style guide rules that are enforced via `prettier` those are applied once merging any changes to the `main` branch, meanwhile other rules are enforced via `eslint` which can only alert of issues on `Codacy` rather than change them automatically.

The following list contains all coding style guide rules that should be adhered to:

  * `camelCase`: Usage of `camelCase` is enforced to keep variable names readable, and keeping code fragments in sync. (Enforced via `ESLint`)

  * Cyclomatic Complexity: The cyclomatic complexity of any individual function is monitored to reduce the likely-hood of error prone code, due to complextiy. (Enforced via `ESLint`)

  * Type-Safe Equality Operators: Usage of equality operators is enforced to avoid type coercion. Using a Type-Safe Equality Operator refers to using `===` or `!===` instead of `==` and `!=`. Some instances do require using alternative comparison methods, which are accounted for, such as `typeof` and `null` comparisons. That is, any comparisons between two literal values will not be enforced or flagged. (Enforced via `ESLint`)

  * Max Nesting: This code base enforces a Max Nesting depth of `4` within a single code block. Enforcing a max nesting depth helps to ensure adherence to this repositories coding principle [Early Return Pattern](ARCHITECTURE.md). (Enforced via `ESLint`)

  * Double Quotes: Usage of double quotes instead of single quotes is enforced within this repository. (Enforced via `prettier`)

  * Semicolons: Ensuring to end each line/block of JavaScript with a semicolon is required. (Enforced via `prettier`)

## Documentation Style Guide

The documentation style used within this repository indicates what's considered best practice and to be strived for, but it does not indicate that documentation will always adhere to these goals. If in any locations the existing documentation does not adhere to this style guide, a PR for improvement is more than welcome.

The following list highlights the most important aspects of the documentation style guide used, but generally the [Google Highlights Style Guide](https://developers.google.com/style/highlights) should be followed:

  * Write for a global audience: Such as using simple words for ease of translation, and avoiding colloqualisms.
  * Use second person: "You" rather than "we".
  * Use active voice: Make clear who's performing the action.
  * Write inclusive documentation: Such as avoiding ableist language, and unnecessarily genered language.
  * Provide alt text: Standard practice within this repository is to place alt text after a `>` symbol.
