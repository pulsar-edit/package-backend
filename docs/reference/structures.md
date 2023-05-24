# Mysterious Object Structures

This document takes a short look at some of the structures that are vital to the functionality of the backend, but are not defined elsewhere, or have no simple means of identifying. Since many of the data structures can only be infferred from the source code, and the lifecycle of any given object within the codebase, this document hopes to take some of the mystery out of these values.

## SQL DB Table `packages`

This table holds the reference to every single community package. While many fields within it are simple, such as `downloads` and `creation_method` one such column `data` is not clearly defined in any one location. So the below example demonstrates the type of data that would be expected within this column:

```json
{
  "name": "Package's Title",
  "readme": "The package's readme at the time of it's most recent version publish.",
  "metadata": {
    ... This field then contains the contents of the `package.json` of the `latest` version publish
  },
  "repository": {
    "url": "Full URL",
    "type": "The VCS Service Type. As determined by VCS.js"
  }
}
```

As you can see above, the majority of the data this column will contain is the full, unaltered `package.json` of the most recent package version publish.

The most important fields within this column are detailed below:

  * `name`: This is presented as the conanical name of the package. Used within the codebase where needed.
  * `readme`: This is the only location within the backend that stores a package's `README.md`.
  * `repository`: This object is what's actually used to preform any future owner checks during a package's version publication.

## SQL DB Table `versions`

Just like mentioned above, the majority of these columns are easy to identify the data within. One such column that isn't as clear though is `meta`. Arguably, the most important column within this table, as it holds all information of the package version, as well as the information needed to install this package's version. An example set of data for this column is below:

```json
{
  "sha": "4fd4a4942dc0136c982277cdd59351bb71eb776d",
  "dist": {
    "tarball": "https://www.atom.io/api/packages/codelink-tools/versions/0.14.0/tarball"
  },
  "tarball_url": "https://api.github.com/repos/j-woudenberg/codelink-tools/tarball/refs/tags/v0.14.0",
  ... The rest of this column is the full `package.json` of this version
}
```

As seen here, there are a few critical fields within this entry that are very important to the successful functionality of the backend, which are detailed below:

  * `sha`: While this field isn't currently used, the hope is this can be utilized in some way to ensure a secure download of the package's version.
  * `dist.tarball`: This field is what's used to inform any clients of where to go to install this package version, within the backend. As you can see in this example, it's pointing to `atom.io`, this will be true for any migrated packages, and during the time of a package being built to be delivered to clients we check this field for pointing to `atom.io` and if it does, we update it instead to point to the respective URL within `api.pulsar-edit.dev`. Any new package's being published will already point to `api.pulsar-edit.dev`.
  * `tarball_url`: This is the URL that's used to redirect clients when the request a download of this package version.
