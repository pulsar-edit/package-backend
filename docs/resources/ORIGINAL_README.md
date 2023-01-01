# Atom Backend
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/d4ca4ded429c446fb28d0654c8c05d6d)](https://www.codacy.com/gh/confused-Techie/atom-backend/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=confused-Techie/atom-backend&amp;utm_campaign=Badge_Grade)
[![codecov](https://codecov.io/gh/confused-Techie/atom-backend/branch/main/graph/badge.svg?token=LZ33F9DSH4)](https://codecov.io/gh/confused-Techie/atom-backend)

[![CI - Standards](https://github.com/confused-Techie/atom-backend/actions/workflows/ci-standards.yml/badge.svg)](https://github.com/confused-Techie/atom-backend/actions/workflows/ci-standards.yml)
[![CI - Tests](https://github.com/confused-Techie/atom-backend/actions/workflows/ci-tests.yml/badge.svg)](https://github.com/confused-Techie/atom-backend/actions/workflows/ci-tests.yml)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

> This is originally based off the research done on [Atom Community Server Backend](https://github.com/confused-Techie/atom-community-server-backend) which was written in Golang. But has been switched to JS for more broad support.

## Wanting to Contribute?

### Developers please read through this whole document again, as it documents large changes in how to contribute.

To read through an overview and find links for contributors take a look at [the Documentation](/docs/index.md)

---

Please note that there should be two versions of this repo.

* [`pulsar-edit/package-backend`](https://github.com/pulsar-edit/package-backend)
* [`confused-Techie/atom-backend`](https://github.com/confused-Techie/atom-backend)

The version of this server that exists on `confused-Techie`'s repo is intended to be the version that reaches feature parity with the existing Atom.io Backend Server. As in until it reaches release version 1.0.0 - Once this happens that repo will likely be archived, or stop receiving updates. The reason this should still exist untouched, is so that any other user of Atom that wants a drop in replacement of the backend server will be able to use this, with zero modifications, to support their Atom instance.

But once version 1.0.0 is released, then all new features, and new developments should be brought over to `pulsar-edit/package-backend` since that repo will contain the Backend Server intended to be used by Pulsar.

So with this in mind, please use the above to correctly address any issues or PRs. Until this warning is removed.

## Updated Information

**Atom-Backend is MOVING**

While this is currently the home for the new backend during development, that won't always be the case.

The long term goals will be to have this package move to the new `Pulsar-Edit` repo. If you are wondering what's 'Pulsar' while the title here says 'Atom' [read more](https://github.com/pulsar-edit/.github/tree/main/profile) about this change.

The goal for now is of course to keep this new Backend compatible with any fork of Atom that may arise, as currently it should be a drop in replacement of the currently existing backend.

If you'd like to get more involved in the new 'Community-Based, Hackable, Text Editor' feel free to visit the ['Pulsar-Edit' Org](https://github.com/pulsar-edit) and get involved however you can. Additionally there's a ['Pulsar-Edit' Discord](https://discord.gg/QFxZjW4ZuS) to get involved with other maintainers.

## Get Started

To start developing with this package, it should be rather quick.

In the root folder for the downloaded package:
```bash
npm install .
```

To install all package dependencies.

Then go ahead and create an `app.yaml` file, or rename the `app.example.yaml` to `app.yaml`. The contents of these files can mirror each other or you can read through the comments of `app.example.yaml` to find suitable alternatives for what you are testing. This config specifies the port of the server, the URL, as well as many other aspects.

Finally, while not at all recommended, you can run the API Server with `node .`.

It is instead recommended that you use the built in scripts to run the server. Of which there are several that can be run with `npm run $SCRIPT_NAME`

* `start`: Starts the Backend Server normally. Using your `config.yaml` for all needed values. This is what's used in production.

* `test:unit`: This can be used for unit testing, like items placed in `./src/tests`. Using this does the following:
  - Sets `NODE_ENV=test`
  - Sets `PULSAR_STATUS=dev`
  - Runs the unit tests located in `./src/tests/` using `jest`.
  - Requires that there will be no calls to the Database. This does not handle the loading of the Database in any way.
  - Uses mocked responses for all functions in `./src/storage.js` to avoid having to contact Google Storage APIs.

* `test:integration`: This is used exclusively for Integration testing. As in tests that require a Database to connect to.
  - Sets `NODE_ENV=test`
  - Sets `PULSAR_STATUS=dev`
  - Runs the integration tests located in `./src/tests_integration` using `jest`.
  - Requires the ability to spin up a local Database that it will connect to, ignoring the values in your `config.yaml`
  - Uses mocked responses for all functions in `./src/storage.js` to avoid having to contact Google Storage APIs.

* `start:dev`: This can be used for local development of the backend if you don't have access to the production database. Spinning up a local only Database for testing purposes. But otherwise running the backend server exactly like `start`.
  - Sets `PULSAR_STATUS=dev`
  - Starts up the server using `./src/dev_server.js` instead of `./src/server.js`
  - Requires the ability to spin up a local Database that it will connect to, ignoring the values in your `config.yaml`
  - Uses mocked responses for all functions in `./src/storage.js` to avoid having to contact Google Storage APIs.

* `api-docs`: Uses `@confused-techie/quick-webserver-docs` to generate documentation based off the JSDoc style comments, only documenting the API Endpoints. This should be done by GitHub Actions.

* `lint`: Uses `prettier` to format and lint the codebase. This should be done by GitHub Actions.

* `complex`: Uses `complexity-report` to generate complexity reports of the JavaScript. Keep in mind this does not support ES6 yet, so not all functions are documented. This should be done by GitHub Actions.

* `js-docs`: Uses `jsdoc2md` to generate documentation based off JSDoc comments within the codebase. This should be done by GitHub Actions.

There are some additional scripts that you likely won't encounter during normal development of the Backend, but are documented here for posterity.

* `contributors:add`: Uses `all-contributors` to add a new contributor to the README.md

* `test_search`: Uses the `./scripts/tools/search.js` to run the different search methods against a pre-set amount of data, and return the scores.

* `migrations`: This is used by `@database/pg-migrations` to run the SQL scripts found in `./src/dev-runner/migrations/001-initial-migration.sql` to populate the local database when in use by certain scripts mentioned above.


## Development with a Local Database

To make development as easy as possible, and to ensure everyone can properly test there code, the ability for a local database to be automatically spun up is now included in the Backend Server.

This means that if you run any of the following scripts it will assume you have the ability to run a local database.

* `test:integration`
* `start:dev`

The ability to spin up this local database means that your system must have docker installed. Then using docker the Backend Server will automatically start up a development database and insert data into it. This means you can safely delete any data, or otherwise test as if working on the production database.

To check what data you should expect to be able to find within the database view the [Migration Script](/src/dev-runner/migrations/0001-initial-migration.sql).

If you experience any issues using this new feature, please feel free to open an issue.

## Documentation

To view researched information and the behavior that will be mirrored from the original Backend is available [here](/docs/overview.md).

If you would like to read more about the routes available those are available [here](/docs/api.md).

There's a crash course guide to any new contributors available [develpers.md](/docs/developers.md). As well as JSDoc generated [documentation](/docs/JavaScript.md) of the source code.

Additionally for any bug hunters [Complexity Reports](/docs/complexity-report.md) are generated. Keep in mind since the tools underlying AST generator doesn't support ES6 not everything is included currently.

Finally there are many `TODO::`s scattered around for things that still need to be done. Otherwise a collection of 'Good First Issues' are [available](https://github.com/confused-Techie/atom-backend/issues). And lastly theres a collection of all [functions/methods](/docs/major_todo.md) and their current status to help someone quickly jump in.

If you'd like to help [Atom-Community Core](https://github.com/atom-community/atom) there is still much work to be done.

Please note that for the time being this documentation of the Read Me is overly verbose to allow easy communication while in development.

### Data

There is quite a bit of data that can be obtained from the API.

The API needs to be aware of:

* Package Repo entries
* List of valid users and tokens to provide for them.
* Each users list of all stared repos
* Each repos list of all users that have starred it.
* The time a repo was created
* The last time a repo has been updates.

Things to note:

* When a repo has a change of name, the old name will permanently redirect to its current version of the repo.
* This means the name of a repo is never able to be a unique identifier.
* A repo can transfer owners
* This means the owner or creator of a repo is also not sufficient to be a unique identifier.

This means that simply storing the archive or future package repo entries will not be sufficient.

The proposed solution to this issue:

A possible way to solve this issue while not having to work with complex data types.

#### package_pointer.json
This file will act as a pointer to the specific data of each package.
With each key being a packages name, and pointing to its raw file location.
If a package changes name a new entry will be created under the new name, pointing to the same file.
This also means if we don't remove the previous entry, the old name will still point to the file.

#### package_repo files
These JSON files will be saved under a UUID like so `UUIDv4.json` allowing any content inside to change
while always pointing to the same file.
This UUIDv4.json will also be the location the package_pointer.json index will refer to.

Within each package file will be additional data not retrieved in the API. Including a list of all users
that have stared the package, listed by their username.
Additionally will list the creation date, and last modified date.
But these values will be removed before returning via the API.

#### users.json
A large user object. Where their username is the key to the object, and inside will be (once we determine how to handle auth) any valid keys for the user, which is used to check authenticated requests,
additionally which will contain an array of every package they have stared. This value can use the packages name, as long as it then uses the pointer to find the package data.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/confused-Techie"><img src="https://avatars.githubusercontent.com/u/26921489?v=4?s=100" width="100px;" alt=""/><br /><sub><b>confused_techie</b></sub></a><br /><a href="https://github.com/confused-Techie/atom-backend/commits?author=confused-Techie" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Digitalone1"><img src="https://avatars.githubusercontent.com/u/25790525?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Giusy Digital</b></sub></a><br /><a href="https://github.com/confused-Techie/atom-backend/commits?author=Digitalone1" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/DeeDeeG"><img src="https://avatars.githubusercontent.com/u/20157115?v=4?s=100" width="100px;" alt=""/><br /><sub><b>DeeDeeG</b></sub></a><br /><a href="#ideas-DeeDeeG" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/ndr-brt"><img src="https://avatars.githubusercontent.com/u/8570990?v=4?s=100" width="100px;" alt=""/><br /><sub><b>ndr_brt</b></sub></a><br /><a href="https://github.com/confused-Techie/atom-backend/commits?author=ndr-brt" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
