# Package Backend Documentation

This document introduces the `package-backend` documentation layout and resources, which should hopefully guide you to what's most helpful.

Additionally some documents may be helpful for a wide range of reasons, which are listed below:

  * [Admin Actions](./reference/Admin_Actions.md): This document details all manual interventions into the Pulsar Package Registry, in terms of modifying package's data.
  * [API Definition](./reference/API_Definition.md): This document is the automatically generated specification of the Pulsar Package Registries API endpoints.

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

A quick note here, the following resources, while still incredibly helpful to understanding how the backend works, may be more likely to be out of date. So take any code examples with a grain of salt:

  * [Authentication](./reference/auth.md): How the Pulsar Package Registry handles authentication.
  * [Bubbled Errors](./reference/bubbled_errors.md): How and what errors bubble through the codebase.
  * [Database](./reference/database.md): Details of hwo the backend SQL Database is configured.
  * [Logging](./reference/logging.md): How the built in logging module works.
  * [Numeric Error Codes](./reference/numeric_error_codes.md): **Deprecated** Definition and List of numeric error codes that may be returned.
  * [Packages](./reference/packages.md): Information on where the Pulsar Package Registry got it's packages and what to do if you don't see yours.
  * [Queries](./reference/queries.md): **Deprecated** Details of some of the common SQL queries used to retrieve information from the Pulsar Package Registry.
  * [Returns](./reference/returns.md): Definition of the objects returned and handled.
  * [Server Status Object](./reference/server_status_object.md): Definition of the Server Status Object.
  * [Build](./build.md): Documentation on how to build the Pulsar Package Registry.
  * [Writing Integration Tests](./writingIntegrationTests.md): **Deprecated** Documentation about how to successfully write integration tests.

A number of documents within this repo are automatically generated. These documents can help to view the codebase as it is right now. These documents can be helpful to identify problem areas or to learn about the source code itself.

The following list contains automatically generated content:

  * [API Definition](./reference/API_Definition.md): This provides the spec of the Package Backends Public API. An API Spec is also available on the [web](https://api.pulsar-edit.dev/swagger-ui/).
  * [Source Code Docs](./reference/Source_Documentation.md): Documentation generated via JSDocs.
  * [Complexity Reports](./resources/complexity-report.md): Complexity Reports can be helpful in identifying complex areas of code, which are more likely to contain errors. (Note: The tool that generates the complexity report does not yet support ES6 syntax, so may be missing some functions.)
