# Architecture

> As inspired by [matklad](https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html)

This document describes the high-level architecture of Pulsar's `package-backend`. If you want to familiarize yourself with the code base, you are just in the right place!

There are numerous other docs that touch on specific parts of the code base in detail, with a guide to them all available within the [docs](/docs/reference/index.md) folder.

## Guiding Principals

This section will define the guiding principals of the codebase as a whole.

- [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) (Don't Repeat Yourself): We aim to make code that is maintainable and reusable, and should whenever possible ensure we don't repeat any part of our code unless necessary.
- Inversion Denesting: We aim to have as few nested code blocks as possible. This is generally accomplished with Inversion Denesting, where we invert the error checking state of our code. So instead of checking first for the 'happy state' then allowing an `else` to come at the bottom of the file we instead first check for the 'unhappy state' adding an exclusive check at the top of the function, and letting the 'happy state' continue on as normal, not nested at all.
- [ISP](https://en.wikipedia.org/wiki/Interface_segregation_principle) (Interface Segregation Principle): We aim to ensure that we never pass any parameters that an interface will not need, and in most cases strive to pass as few parameters as possible by providing sane defaults to trailing formal parameters. That is require only what is expected to be different every time at the start of a functions interface and provide defaults for all other trailing parameters that's possible.
- Low Barrier to Entry: We above all else, strive to create a codebase that has a low barrier to entry. That is functions from a module need to not only be documented, but should have common returns, nearly all modules should aim to have common return structures which is largely accomplished via the [`Server Status Object`s](/docs/reference/bubbled_errors.md) and strict error bubbling within the code. In most cases you should be able to use any interface only by knowing what parameters it requires, and can safely expect the return of it's object by looking at returns near it.

## Birds Eye View

At the highest level overview, the `package-backend` is the service that responds to API requests from the Pulsar Editor or the [`package-frontend`](https://github.com/pulsar-edit/package-frontend) [web.pulsar-edit.dev](https://web.pulsar-edit.dev/) asking for details of packages published to the Pulsar Package Registry and returns the data requested.

This data can range from a collection of packages by specific filters/sorting, to starring those packages, creating user accounts, uploading new packages, or deleting packages or their versions.

At the slightly more specific level, the `package-backend` has been designed to interact with a [PostgreSQL](https://www.postgresql.org/) Database hosted remotely to create, delete, and modify columns and tables containing the entire Pulsar Package Registry. It then uses [ExpressJS](https://expressjs.com/) to manage it's HTTP Rest API to respond to user queries. Additionally it uses some remote calls to [Google Cloud Storage](https://cloud.google.com/storage/docs) for some types of static stored data, and lastly uses [SuperAgent](https://github.com/ladjs/superagent) to run API queries against GitHub when needed.

## Code Map

This section touches on briefly about the various directories within the `package-backend` and what's within them. Ideally helpful to locating the location of a new feature or to fix an existing bug.

### `docs`

As you might guess this contains nearly all documentation for the repo. Although additional documentation that is important not to ignore can be found in the following (some very obvious) files.

- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `README.md`

Additionally you'll find the following at the root of this directory:

- `reference`: This contains the documentation that's recommended to properly read through fully, using in depth explanations and examples of the internals of the codebase. While some documents contain high level abstractions from the codebase but detail things at the conceptual level. It's highly recommended to read through these if planning to contribute, where the [`index.md`](/docs/reference/index.md) contains a guide to everything within.
- `resources`: This folder contains mostly examples of schemas and data structures within the codebase. To allow there to be a known good copy of these files. Although there are a few exceptions from example only objects here.
  * `complexity-report.md`: This file is an automatically generated file containing the complexity stats of each and every function within the codebase. Helpful to look through and find areas that may need simplifying, or when a certain functions complexity is to high, where a bug is more likely to occur.
  * `featured_packages.json`: While this file does serve as a good reference to the format of this data, that's because it is quite literally the document that is published to cloud storage. If that file is updated in the cloud, it'll first be done here in a PR.
  * `featured_themes.json`: Like above, a good reference to the file, because it is the file actually hosted within the cloud.
  * `name_ban_list.json`: Again, lastly, this document is a good reference for the contents of this file, as it is the exact file uploaded to the cloud.
- `swagger`: This file contains the configuration for `swagger` which is our OpenAPI spec file detailing the API of the `package-backend`. This file additionally serves as the content used to create our API Browser hosted on the `package-backend` in the [cloud](https://api.pulsar-edit.dev/swagger-ui/).

Lastly within the root are additional documents which are helpful to read through, only separated from those in `reference` due to their importance, and having a non-scoped purpose.

### `scripts`

This folder you likely won't find of much use, unless you plan to stand up your own Database for your own instance of the `package-backend` to contact.

- `database`: Contains the SQL scripts needed to get every single table and column that the production Database for the Pulsar Package Backend has, and can directly be used to create a new database that will match what's being used within the code.
- `deprecated`: There is a ReadMe within this folder that provides more detail, but this folder contains code that was in one time used, now being deprecated, but still has plans to be reused when possible.
- `tools`: This folder contains some smaller pieces of code that served extracurricular tasks for the backend repo. Such as generating badges, or running tests.

### `src`

As you might assume this is now the folder that contains the actual code of the application. If you plan on writing actual sections of code this is the place you'll want to pay the most attention to.

- `dev-runner`: This folder contains any code that is only ever intended to be used during testing of the `package-backend`.
  * `migrations`: Contains an SQL migration script which is used to setup a temporary Database to test our code against. This is the data that's used during tests to ensure we never have to test against production.
  * `github_mock.js`: This file is a Mock GitHub API server, that is stood up with ExpressJS during testing, to allow us to more thoroughly test our code by letting it hit an actual API, instead of mocked functions.
- `handlers`: Every single endpoint of the API, will pass its Request and Response objects to a handler within this folder. Generally each file within the folder's name will begin with the slug of the API endpoint following `/api`. Such as for endpoints hitting `https://api.pulsar-edit.dev/api/packages` are all routed to the `package_handler.js`. There is also a `common_handler.js` which has shared HTTP utility functions for all handler files.
- `tests`: This folder contains all Unit-Tests for the `package-backend`. That is tests that don't require any communication with any external service. There is additionally a [ReadMe](/src/tests/README.md) within that details this further.
- `tests_integration`: This folder contains all Integration-Tests for the `package-backend` (Like you might've guessed). These are the tests that require some type of outside service interaction, but generally the test files themselves are burdened with creating a mock service to interact with. Such as creating a Mock GitHub Server, or a Mock Local Database. But there is again a [ReadMe](/src/tests_integration/README.md) containing more details.
- `tests_integration/fixtures`: This contains files used to supply our integration tests with data that may be needed more than once. Such as Modules that export `package.json` examples, or other relevant data to conduct testing.

From here there are a collection of files to aide in everything else for the `package-backend` which will be quickly detailed here. (Note this information is easy to become out of date, and should be crossed checked when reading for accuracy, as new files may exist, or files may deleted.) But if needed every single file should contain JSDoc comments at the very top detailing its purpose and rough behavior.
  * `auth.js`: Contains functions used to handle authentication the same way across all endpoints.
  * `cache.js`: Exports functions to help other code cache certain data.
  * `config.js`: This file reads our configuration and returns it to any module as needed. Reading from a configuration file and environment variables, but prioritizing environment variables.
  * `database.js`: This file contains all functions used to interact with the Database.
  * `debug_utils.js`: This file contains never in production used utility functions, that can aide in the process of debugging the application while coding.
  * `dev_server.js`: This file is the equivalent of `server.js` when running Integration-Tests.
  * `git.js`: This file contains all interactions with GitHub.
  * `logger.js`: This file is the only location that should be writing logs, and contains many utility functions to sanitize logs or format them as needed.
  * `main.js`: This file contains the actual definition of all API endpoints, routing any and all requests as needed to the proper handler.
  * `query.js`: This file is in charge of safely and accurately decoding query parameters from user input.
  * `server.js`: This is the file that starts up our ExpressJS Server in production. Whereas `dev_server.js` starts up the ExpressJS server when testing.
  * `storage.js`: This file contains all interactions with Google Cloud Storage.
  * `utils.js`: This file contains utility functions for the rest of the codebase to utilize.

## `root`

From here we are just left with the root of the file system, obviously there are a lot of files here to consider but we will only touch on the important ones.

- `app.example.yaml`: This is an example configuration file for running the `package-backend`, whereas the server expects to read from an `app.yaml` with the same contents. The format of this file is chosen as it's required to run an application within Google Cloud App Engine, which is how this service is hosted for Pulsar.
- `dispatch.yaml`: This file defines how routes are handled across Google Cloud App Engine services. Which is how we route traffic between the Frontend and Backend sites.
- `SECURITY.md`: This file describes what to do if there is a security bug discovered within the running server.

## Cross-Cutting Concerns

This section talks about anything that cannot be cleanly decomposed from the rest of the system, and may cause scattering or tangling throughout the codebase.

### System Boundaries

Luckily the `package-backend` has a single [system boundary](https://www.tedinski.com/2018/04/10/making-tests-a-positive-influence-on-design.html), that is our Rest API. Originally this boundary was defined by the upstream [Atom.io Package Registry](https://web.archive.org/web/20221215062551/https://flight-manual.atom.io/atom-server-side-apis/sections/atom-package-server-api) we were making a compatible version of. Since we wanted to be able to use this with Atom with nearly zero changes besides what the URL was. While that was originally accomplished to varying success, we now define that boundary. But of course the major concern here is making sure it still works with Pulsar, and for as long as possible any Atom users, or other forks of Atom that may be using our API. So we want to maintain compatibility for as long as possible, even if that means duplicating endpoints, or accepting ignored query parameters.

The master copy of this boundary can be found in [`API_Definition.md`](/docs/reference/API_Definition.md). This file is autogenerated using [`@confused-techie/quick-webserver-docs`](https://www.npmjs.com/package/@confused-techie/quick-webserver-docs) as a GitHub Action. Which takes the JSDoc-Like comments within [`main.js`](/src/main.js) and turns them into MarkDown. That means any change to the Rest API __must__ be documented within `main.js`. And should never be taken lightly.

Additionally any significant changes here should only come after the coordination with the rest of the Pulsar Team, a poll on Discord if needed, and teamwork to make it happen.

### Test Isolation

We have three major concerns that affect test isolation. This in turn effect isolation of the entire codebase. These have been stated above but we will again quickly cover them here.

- Google Cloud Storage: The `package-backend` relies on data that exists on Google Cloud Storage, and in order to test any aspects that deal with this we have to mock that data we would have returned from the cloud. This could mean that changes to their API or modules we use to interact with it could sneak up on us causing unknown issues.
- GitHub API: The `package-backend` heavily relies on the GitHub API when created packages, updating packages, creating users, and verifying ownership of individual packages. The way we have attempted to work around this is by creating a Mock GitHub API Server that will be run with ExpressJS during Integration-Tests, but as expected API changes or many other factors can still cause our tests to lack here.
- Database: The `package-backend` heavily relies on a Database to retrieve and store any type of data. We have luckily managed this aspect fairly well, by having our Integration-Test suite spin up a database on a Docker container locally to test against. By ensuring we keep the Database schema and versions accurate to what's available in production we are able to reliably test the majority of aspects in relation to the database. Other than testing instances of over-usage and scalability issues.

### Error Handling

Since any unrecoverable error should always be returned to the user, and never cause the server to crash, errors should always be handled, and caught around `try...catch` blocks, or to fail gracefully and return the output.

Most modules generically should never handle errors themselves, and instead return the error state to the handler of their interaction, that is the `handlers/xxx_handler.js`. Since only the handler will have the `Request` and `Response` objects in order to properly handle an error and return it to the user as needed.

The way we are able to accurately and consistently communicate an error to a higher level module, or to the handler of the interaction is through what we call here the `Server Status Object`. Which in short is an object with strict `key:value` pairs that can reliably pass information back to their root handler in order to communicate the exact error state, and further details if possible.

The structure of the `Server Status Object` has much more thorough documentation within [`bubbled_errors.md`](/docs/reference/bubbled_errors.md), named as such since the `Server Status Object` allows errors to bubble up modules until they reach their root handler.

Then once an error or failed state reaches the root handler, in most cases it will pass that along to the `common_handler.js` which contains the predetermined returns for each failure state, or in some special cases, the root handler can ignore the failed state and try to recover, or may even expect a failed error state to continue on. If the root handler is expecting a failed error state from the `Server Status Object` but receives a success state instead, it will then craft its own failed state `Server Status Object` to pass to the `common_handler.js` for communicating to the user of the failed state.
