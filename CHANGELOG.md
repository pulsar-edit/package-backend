# Changelog

* Format inspired by [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
* Project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [Unreleased]

* Decouple HTTP Handling from backend logic
* Added webhooks to be triggered after a package, or package version are published. Allowing notifications of these events to other services. Like the Pulsar Discord.
* Fixed a bug where a 0 result search could provide incorrect pagination.
* Fixed a bug where the incorrect webhook was triggered during package version publication.
* Added "Feature Detection", where the backend will determine what languages a grammar package supports, as well as if this package provides any snippets.
* Prevented a bug where uncaught errors during HTTP handling could crash the whole server instance.
* Rewrote nearly all HTTP server startup, replacing ExpressJS common syntax with a novel endpoint object schema, allowing an endpoint object to define not only the logic needed for each endpoint, but it's parameters, it's OpenAPI schema information, as well as ensuring every endpoint is easily testable against it's intended returns.
* Fixed a bug that could prevent publication of new package versions.
* Added an `owner` field to packages, allowing the owner of a package to be collected during publication, as well as a filterable item during package listings.
* Fixed a bug that could prevent the combination of multiple search criteria during package search.
* Ensured the backend uses the name of a backend as determined by it's `package.json` when checking for availability of a package name, rather than the name of the repository.
* Added a new `/api/owners/:ownerName` endpoint.
* Modularized Query Parameters, to have them also define their OpenAPI schema directly within the queries module.
* Added `filter` query parameter support to `/api/packages/search`.

## [v1.1.0](https://github.com/pulsar-edit/package-backend/releases/tag/v1.1.0)

* Removed nearly all static data returns during dev runs, to reduce chance of bugs being missed.
* Removed dev server support.
* Fixed an issue where delivery time generated badges wouldn't appear on a list.
* Implemented object builder patterns, to reduce verbosity and knowledge needed throughout the codebase.
* Improved errors returned during a new package version publish.
* Improved internal log injection safety checks, to further mitigate any malicious logs.
* Added a new service filter to the `/api/packages` endpoint, to filter a package based off the services it consumes or provides.
* Added badge support, and added automated `Made for Pulsar!` badges to packages.
* Fixed an issue where the `package` `data` column wouldn't be updated correctly during a new version publish.
* Refactored all `/packages` endpoints, to make future changes and fixes easier.
* Improved errors returned in some situations to increase transparancy on the server's logic.
* Fixed an issue that would stop the `rename` query parameter from being handled correctly.
* Fixed issue that could cause package download URL's to not resolve properly.
* Improved search handling to support spaces among other stop words to still resolve the expected search query.
* Deprecate `/api/packages/:packageName/versions/:versionName/events/uninstall`. This endpoint no longer has any effect, but will still return a successful query to avoid user impact.
* Refactored the existing testing platform
* Refactored all interactions with GitHub, Git, and provided the base system to support multiple VCS services in the future.

## [v1.0.1](https://github.com/pulsar-edit/package-backend/releases/tag/v1.0.1)

* Improved Documentation
* Improved Version management
* Replaced StateStore with more secure version
* Added support for finding owner of a renamed GitHub repo
* Fixed usage of `URL` within code
* Added ability to update package metadata on a new version publish
* Added new Featured Packages
* Fixed a bug when updating a package version
* Improved handling of remote GitHub API HTTP Errors
* Improved Log Sanitizing
* Improved ability to retrieve the owner of a package's repo
* Fixed a bug that wouldn't allow a version of a package to be deleted
* Added Swagger Documentation, and in cloud endpoint to access.
* Added ability to limit mocks when running the dev server
* Added support for `theme` slug replacement on `/packages` routes
* Added Options Support for all Endpoints
* Enabled RateLimiting
* Removed StateStore
* New Management of Stargazers on the Database
* Fixed Pagination on Search and other relevant endpoints

## [v1.0.0](https://github.com/pulsar-edit/package-backend/releases/tag/v1.0.0)

* Created all routes to achieve feature parity with Atom.io API Server
* Created all Database interactions to support existing set of routes
* Feature Parity with all Query Parameters used in upstream API Server

> Additional improvements available via Commit Messages and Pull Requests
