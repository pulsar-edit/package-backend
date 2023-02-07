# Version Control System Providers

The Classes within this folder allow for `vcs.js` to interact with as many VCS services as we can, while ensuring users are able to publish, download, and install the same way from each one.

This is the groundwork to allow us to support not just GitHub for hosting and publishing packages.

> Note: These are quick notes during the development of this feature and may not reflect current usage. Please read while also thoroughly studying the source code or documentation generated from it.

Each VCS Provider Class can use the `git.js` or `Git` Class to assist in structure, and fleshing our some authentication interactions that will happen frequently.

Each VCS provider needs to publicly provide the following capabilities:
  * `ownership` A way to confirm if a user has write permission to a specific package on each VCS Service.
  * `readme` A way to provide the Markdown text of the package's main readme, whatever the equivalent would be on each service.
  * `tags` A way to provide all tags of a package.
  * `packageJSON` A way to provide the `package.json` that this package uses once installed.
  * `exists` A way to confirm if any arbitrary package on the VCS Service exists, and or is publicly available.

Since the majority of the backend does not need deep integration with each VCS Service on it's own, `vcs.js` will export the following capabilities.

  * `ownership` Should essentially redirect to the relevant VCS provider.
  * `newPackageData` The function that should be used during `postPackages` that will provide __All__ data available for an individual package. This includes utilitizing the following:
    - `readme`
    - `tags`
    - `packageJSON`
  * `newVersionData` The function that should be used during `postPackagesVersion` to provide __All__ data available for an individual package with some modifications. Utilizes:
    - `readme`
    - `tags`
    - `packageJSON`
  * `determineProvider` While intended to be used as an internal function, it can reliably determine which VCS service and thus provider is intended to be used for a package.
