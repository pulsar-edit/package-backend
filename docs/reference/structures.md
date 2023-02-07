This document aims to take some of the mystery out of objects used within the backend.

Since a lot of what's done on the backend is mutating object structures or working with them, it can be helpful to now document what structures some important functions expect, or will return.

## `database.insertNewPackageVersion()`

This function expects it's first argument to be one of `packJSON` and expects the following format:

* Essentially this object should be the full `package.json` of the version we want.
* There are some values that are required, and used by the database function:
  - `.name`: Expected to be the `package.json` `name` key
  - `.license`: Expected to contain the license of the package. If none is provided it defaults to `defaultLicense`
  - `.engines`: Expected to contain the packages engines field. If none is provided it defaults to `defaultEngine`
  - `.version`: Required, no default provided. If this key doesn't exist the database call *will* fail
* There are other values that are required that the database function *doesn't* use, but will be used later on.
  - `.sha`: This should be the SHA value of the tarball download for this version.
  - `.tarball_url`: This should be the GitHub (Or other VCS service) URL to download this versions code.
  - `.dist.tarball`: This value is not required. It is injected when the packages version data is returned. Migrated packages will already have this key, but will be pointing to an `atom.io` URL, and will need to be overridden when returning the package data.

A full example is below:

```json
{
  "sha": "4fd4a4942dc0136c982277cdd59351bb71eb776d",
  "dist": {
    "tarball": "https://www.atom.io/api/packages/codelink-tools/versions/0.14.0/tarball"
  },
  "main": "./lib/codelink-tools",
  "name": "codelink-tools",
  "version": "0.14.0",
  "keywords": [],
  "repository": "https://github.com/j-woudenberg/codelink-tools",
  "description": "An Atom package for CodeLink that includes a compiler, debugger, and a solution explorer",
  "tarball_url": "https://api.github.com/repos/j-woudenberg/codelink-tools/tarball/refs/tags/v0.14.0",
  "dependencies": {},
  "deserializers": {
    "codelink-tools/Parser": "deserializeParser"
  },
  "activationHooks": [
    "source.codelink:root-scope-used"
  ],
  "activationCommands": {
    "atom-workspace": "codelink-tools:toggle"
  }
}
```
