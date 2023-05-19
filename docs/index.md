# Package Backend Documentation

This document introduces the `package-backend` documentation layout and resources, which should hopefully guide you to what's most helpful.

## For Users

To contact the maintainers, please use the [Pulsar Discord](https://discord.gg/7aEbB9dGRT), open an [issue](https://github.com/pulsar-edit/package-backend/issues), or start a [discussion](https://github.com/orgs/pulsar-edit/discussions).

The following are some links that may be helpful:

  * You've discovered a security vulnerability: [Security Policy](https://github.com/pulsar-edit/package-backend/security/policy)
  * You need help managing a Pulsar account: [Managing your Pulsar account](./reference/manage_pulsar_account.md)
  * You can't find a package from Atom: []()

## For Developers

Welcome! Pulsar happily accepts all contributors, and contributions are always encouraged.

To begin contributing it's recommended to ensure that you've read the following:

  * [Contributing Guide](../../CONTRIBUTING.md)
  * [Architecture File](../../ARCHITECTURE.md)

While the Architecture File can provide insight into the overall structure of the Package Backend, other times it may be necessary to learn more about specific aspects of the Package Backend. If at any point, you don't find the below documentation to properly explain what's needed to contribute please let the maintainers know.

The following list introduces the documentation required to become familiar with the Package Backend:

  * [Glossary](./reference/glossary.md): A summary of terminology needed to understand the documentation.
  * [Style Guide](./reference/style_guide.md): This repositories coding and documentation style guide.
  * [Pulsar Package Badge Specification](./reference/badge_spec.md): Specification of the badges applied to packages on the Pulsar Package Registry.
  * [Mysterious Object Structures](./reference/structures.md): Documentation about the widely used, but less understood object structures within the Pulsar Package Registry.

A number of documents within this repo are automatically generated. These documents can help to view the codebase as it is right now. These documents can be helpful to identify problem areas or to learn about the source code itself.

The following list contains automatically generated content:

  * [API Definition](./reference/API_Definition.md): This provides the spec of the Package Backends Public API. An API Spec is also available on the [web](https://api.pulsar-edit.dev/swagger-ui/).
  * [Source Code Docs](./reference/Source_Documentation.md): Documentation generated via JSDocs.
  * [Complexity Reports](./resources/complexity-report.md): Complexity Reports can be helpful in identifying complex areas of code, which are more likely to contain errors. (Note: The tool that generates the complexity report does not yet support ES6 syntax, so may be missing some functions.)
