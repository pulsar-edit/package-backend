# Reference Index

The Pulsar / Atom Backend happily accepts all form of contributions, and contributions are always welcome.

If you ever have any questions feel free to reach out on GitHub issues, PRs, Discussions, or through the [Pulsar Disccord](https://discord.gg/7aEbB9dGRT) where you can chat with the repo's creators.

Before contributing make sure you have read our [Contribtuing Guide](../../CONTRIBUTING.md).
Additionally it is helpful to read our [Architecture File](ARCHITECTURE.md).

Once you've read through the above and understand its contents you are ready to start diving into the code. A full guide on how to run your development environment is available in [build.md](../build.md).

## Automatically Generated Docs

After every push, GitHub Actions build several forms of documentation and resources about the codebase.

* Documentation for the entire source code using JSDoc comments found and outputs to [Source_Documentation.md](./Source_Documentation.md).
* Documentation for our API Endpoints built using JSDoc like comments from [`@confused-techie/quick-webserver-docs`](https://www.npmjs.com/package/@confused-techie/quick-webserver-docs) and outputs to [API_Definition.md](./API_Definition.md).
* Complexity reports for the codebase, which can be helpful in finding bug prone areas of code. Keep in mind the underlying tool does not support ES6 syntax, so some portions might be missing. But outputs to [complexity-report.md](../resources/complexity-report.md).

## Further Documentation

* Our build guide [build.md](../build.md).
* Codebase Glossary [glossary.md](./glossary.md).
* Our Style Guide [style_guide.md](./style_guide.md).
* A history of the [Admin_Actions.md](./Admin_Actions.md) that have been taken on the backend.
* Information on where Pulsar got it's packages and what to do if you do/don't see yours [packages.md](./packages.md).
* Guide to hosting your own instance of the Atom Backend for your fork of Atom [host_your_own.md](../host_your_own.md).
* Guide to writing Integration Tests and the data that is available to you within them [writingIntegrationTests.md](../writingIntegrationTests.md).
* Abstract overview of the codebase's modules and how they rely on each other [quick_source_overview.md](/quick_source_overview.md).
* How the backend handles Authentication [auth.md](./auth.md).
* How and what errors bubble through the code [bubbled_errors.md](./bubbled_errors.md).
* How our Logging Module Works in detail [logging.md](./logging.md).
* Definition and List of the code's Numeric Error codes [numeric_error_codes.md](./numeric_error_codes.md).
* The definition of the objects returned and handled [returns.md](./returns.md).
* Details of how the backend SQL Database is configured [database.md](./database.md).
* Details of some of the common queries used to retrieve data from the backend, and the format they are expected to return [queries.md](./queries.md).
* Finally someone once said to never get rid of the original ReadMe.md because they loved it so much. For them here's the original [README.md](../resources/ORIGINAL_README.md).
