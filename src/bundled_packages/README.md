# Bundled Packages

Originally packages that were bundled within the Pulsar editor (Atom at the time) were available to install on the backend. As such those same packages were originally migrated along with community packages.

Under Pulsar, bundled packages no longer actually exist on the community package database, and instead are manually handled here.

This avoids having to store data about bundled packages, and avoids having to update information in the database, where instead it can now be updated as JSON in code.

Each file here represents a package that's included in the Pulsar Editor by default and has an important schema to adhere to:

* Each file should be have the exact same name as a bundled package, ending in `.json`
* Each file must have a top level property `readme` that contains the `README.md` of the package.
* Each file must have a top level property `metadata` that contains the important bits of the `package.json`.

## Metadata

This portion of the file is what provides the specific details about each individual package. This could mean only needing three keys (`name`, `description`, and `version`) but may mean many more.

Essentially these keys will be used to overwrite the generic `package.json` that will be returned by the backend for bundled packages, with only the above listed three keys required for this process. But if the package needs to overwrite any details or add new ones, it'd do so here.

### Required Keys

* `name`: The name of the package.
* `description`: The description of the package as shown in its `package.json`
* `version`: The version of the package to show.

### Supported Optional Keys

* `repository`: If this key is set in the package, it will automatically be propagated to every other required location.

### Suggested Overwritable Keys

If a particular bundled package has keys that don't match the listed defaults, it's recommended to list them to ensure accuracy.

* `license`: Default: `MIT`
* `engines`: Default: `{ atom: "*" }` (Not generally needed to be overwritten)

### Other Keys

If your package has other important keys to include, such as services it consumes or provides those can be added in and should automatically show up as expected.

## Added a new Bundled Package

If Pulsar has gained a new bundled package, ensure to add it to the following locations:

* Add its name to `BUNDLED_PACKAGES` in `_index.js`
* Add its JSON file to this directory.
