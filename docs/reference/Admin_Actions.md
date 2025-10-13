# Admin Actions

When you consider that most backend services are a black box of code and decision making, the Pulsar Backend aims to change this. Aims to be as open and transparent as possible.

With that said this document will serve as the ongoing history of administrative actions that must be taken against the backend.

## 2025 - October 12

### autocomplete-unity

The community package [`autocomplete-unity`](https://packages.pulsar-edit.dev/packages/autocomplete-unity) has been reported as being Archived.

As such `autocomplete-unity` will receive the `Archived` badge.

### ide-csharp

The community package [`ide-csharp`](https://packages.pulsar-edit.dev/packages/ide-csharp) has been reported as being Archived.

As such `ide-csharp` will receive the `Archived` badge.

### ide-python

The community package [`ide-python`](https://packages.pulsar-edit.dev/packages/ide-python) has been reported as being broken on later Atom versions and all Pulsar versions. But the community has stepped in to create [`pulsar-ide-python`](https://packages.pulsar-edit.dev/packages/pulsar-ide-python) as a direct replacement to this package.

As such `ide-python` will receive a `Broken` and `Deprecated` badge; we'll recommend that the user install `pulsar-ide-python` instead.

### ide-typescript

The community package [`ide-typescript`](https://packages.pulsar-edit.dev/packages/ide-typescript) has been [reported](https://github.com/pulsar-edit/package-backend/issues/258) as archived.
On investigation, this package while originally published by the Atom team is now archived along with all their other work. And the Pulsar team has not made efforts to continue supporting non-core packages from the Atom organization at this time.

As such, this package will receive the `Archived` badge to indicate support may be non-existent but that the package may still be perfectly functional.

But, [`pulsar-ide-typescript`](https://packages.pulsar-edit.dev/packages/pulsar-ide-typescript) has been suggested and seems to be a perfectly valid and safe alternative to the original `ide-typscript`.

So along with the `Archived` badge `ide-typescript` will list `pulsar-ide-typescript` as an alternative package to install.

### linter-ui-plus

The community package [`linter-ui-plus`](https://packages.pulsar-edit.dev/packages/linter-ui-plus) has been [reported](https://github.com/pulsar-edit/package-backend/issues/274) as being archived.

As such this package will receive the `Archived` badge. As always this doesn't mean the package is broken or non-functional, what it does mean is that if you use it you should understand that you may receive no support for the original author in the behavior, functionality, or updating of the package.

### minimap

The community package [`minimap`](https://packages.pulsar-edit.dev/packages/minimap) has been reporting as having more up to date code on GitHub than on the Pulsar Package Registry, as the original author is making changes without pushing them to Pulsar.

As such, the package will receive the `Outdated` badge, indicating they should be installed via GitHub with the following command:

```shell
pulsar -p install https://github.com/atom-minimap/minimap
```

### blocky

The community package `blocky` was [reported](https://github.com/pulsar-edit/package-backend/issues/278) as being broken.
On investigation it was determined this package has been removed from GitHub, meaning the package is no longer downloadable.

As this package is broken in such a way that it cannot be fixed, it will be removed from the Pulsar Package Registry while keeping the reserved name to avoid any Supply Chain Attacks targeting this package.

As such, this package will be removed the Pulsar Package Registry.

### JunoLab Packages

The community packages:
* [`ink`](https://packages.pulsar-edit.dev/packages/ink)
* [`uber-juno`](https://packages.pulsar-edit.dev/packages/uber-juno)

Have been reported as having more up to date code on GitHub than the Pulsar Package Registry as the original author
is making changes without pushing them to Pulsar. As such the packages available on Pulsar are now outdated.

As such, both packages will receive the `Outdated` badge, indicating they should be installed via GitHub with the following commands:

```shell
pulsar -p install https://github.com/JunoLab/atom-ink
pulsar -p install https://github.com/JunoLab/uber-juno
```

## 2024 - July 22

### react

The community package [`react`](https://web.pulsar-edit.dev/packages/react) has been reported to have a bug preventing it successfully running. While the package is not archived the maintainer has noted in the README "This project is no longer mantained" so it's safe to assume the bug will not be fixed.

This bug arose when breaking changes occurred in Pulsar's migration to `second-mate`, while the API that changed wasn't public or intended to be consumed by packages, it was used by `react` who no longer is compatible.

As such `react` will receive the `Broken` badge.

### asciidoctor Packages

The community packages:
* [`asciidoc-preview`](https://web.pulsar-edit.dev/packages/asciidoc-preview)
* [`language-asciidoc`](https://web.pulsar-edit.dev/packages/language-asciidoc)
* [`autocomplete-asciidoc`](https://web.pulsar-edit.dev/packages/autocomplete-asciidoc)
* [`asciidoc-image-helper`](https://web.pulsar-edit.dev/packages/asciidoc-image-helper)
* [`asciidoc-assistant`](https://web.pulsar-edit.dev/packages/asciidoc-assistant)

Via a [report](https://github.com/pulsar-edit/package-backend/issues/262) and further investigation it's been discovered that many of the packages published by the user `asciidoctor` have been archived.

As such, the `Archived` badge will be added to these packages.

### platformio Packages

The community packages:
* [`platformio-ide`](https://web.pulsar-edit.dev/packages/platformio-ide)
* [`platformio-ide-terminal`](https://web.pulsar-edit.dev/packages/platformio-ide-terminal)
* [`platformio-ide-debugger`](https://web.pulsar-edit.dev/packages/platformio-ide-debugger)

Via a [report](https://github.com/pulsar-edit/package-backend/issues/261) and further investigation it's been discovered that some of the packages published by the user `platformio` have been archived.

As such, the `Archived` badge will be added to these packages.

## 2024 - March 27

### AtomLinter Packages

Due to a [report](https://github.com/pulsar-edit/package-backend/issues/244) the following community packages have been inspected:
* [`linter-eslint`](https://web.pulsar-edit.dev/packages/linter-eslint)
* [`linter-eslint-node`](https://web.pulsar-edit.dev/packages/linter-eslint-node)
* [`linter-jshint`](https://web.pulsar-edit.dev/packages/linter-jshint)
* [`linter-gcc`](https://web.pulsar-edit.dev/packages/linter-gcc)
* [`linter-php`](https://web.pulsar-edit.dev/packages/linter-php)
* [`linter-flake8`](https://web.pulsar-edit.dev/packages/linter-flake8)
* [`linter-csslint`](https://web.pulsar-edit.dev/packages/linter-csslint)
* [`linter-htmlhint`](https://web.pulsar-edit.dev/packages/linter-htmlhint)
* [`linter-rubocop`](https://web.pulsar-edit.dev/packages/linter-rubocop)
* [`linter-sass-lint`](https://web.pulsar-edit.dev/packages/linter-sass-lint)
* [`linter-pycodestyle`](https://web.pulsar-edit.dev/packages/linter-pycodestyle)
* [`linter-jscs`](https://web.pulsar-edit.dev/packages/linter-jscs)
* [`linter-tslint`](https://web.pulsar-edit.dev/packages/linter-tslint)
* [`linter-pylint`](https://web.pulsar-edit.dev/packages/linter-pylint)
* [`minimap-linter`](https://web.pulsar-edit.dev/packages/minimap-linter)
* [`linter-js-yaml`](https://web.pulsar-edit.dev/packages/linter-js-yaml)
* [`linter-scss-lint`](https://web.pulsar-edit.dev/packages/linter-scss-lint)
* [`linter-ruby`](https://web.pulsar-edit.dev/packages/linter-ruby)
* [`linter-clang`](https://web.pulsar-edit.dev/packages/linter-clang)
* [`linter-tidy`](https://web.pulsar-edit.dev/packages/linter-tidy)
* [`linter-phpcs`](https://web.pulsar-edit.dev/packages/linter-phpcs)
* [`linter-jsonlint`](https://web.pulsar-edit.dev/packages/linter-jsonlint)
* [`linter-markdown`](https://web.pulsar-edit.dev/packages/linter-markdown)
* [`linter-rust`](https://web.pulsar-edit.dev/packages/linter-rust)
* [`linter-javac`](https://web.pulsar-edit.dev/packages/linter-javac)
* [`linter-coffeelint`](https://web.pulsar-edit.dev/packages/linter-coffeelint)
* [`linter-spell`](https://web.pulsar-edit.dev/packages/linter-spell)
* [`linter-docker`](https://web.pulsar-edit.dev/packages/linter-docker)
* [`linter-pylama`](https://web.pulsar-edit.dev/packages/linter-pylama)
* [`linter-erb`](https://web.pulsar-edit.dev/packages/linter-erb)
* [`linter-xmllint`](https://web.pulsar-edit.dev/packages/linter-xmllint)
* [`linter-phpmd`](https://web.pulsar-edit.dev/packages/linter-phpmd)
* [`linter-write-good`](https://web.pulsar-edit.dev/packages/linter-write-good)
* [`linter-bootlint`](https://web.pulsar-edit.dev/packages/linter-bootlint)
* [`linter-puppet-lint`](https://web.pulsar-edit.dev/packages/linter-puppet-lint)
* [`linter-flow`](https://web.pulsar-edit.dev/packages/linter-flow)
* [`linter-lua`](https://web.pulsar-edit.dev/packages/linter-lua)
* [`linter-golinter`](https://web.pulsar-edit.dev/packages/linter-golinter)
* [`linter-haml`](https://web.pulsar-edit.dev/packages/linter-haml)
* [`linter-spell-html`](https://web.pulsar-edit.dev/packages/linter-spell-html)
* [`linter-elixirc`](https://web.pulsar-edit.dev/packages/linter-elixirc)
* [`linter-cpplint`](https://web.pulsar-edit.dev/packages/linter-cpplint)
* [`linter-scalac`](https://web.pulsar-edit.dev/packages/linter-scalac)
* [`linter-swagger`](https://web.pulsar-edit.dev/packages/linter-swagger)
* [`linter-spell-latex`](https://web.pulsar-edit.dev/packages/linter-spell-latex)
* [`linter-spell-javascript`](https://web.pulsar-edit.dev/packages/linter-spell-javascript)
* [`linter-pyflakes`](https://web.pulsar-edit.dev/packages/linter-pyflakes)
* [`linter-htmllint`](https://web.pulsar-edit.dev/packages/linter-htmllint)
* [`linter-pydocstyle`](https://web.pulsar-edit.dev/packages/linter-pydocstyle)
* [`linter-julia`](https://web.pulsar-edit.dev/packages/linter-julia)
* [`linter-hlint`](https://web.pulsar-edit.dev/packages/linter-hlint)
* [`linter-pug`](https://web.pulsar-edit.dev/packages/linter-pug)
* [`linter-perl`](https://web.pulsar-edit.dev/packages/linter-perl)
* [`linter-clojure`](https://web.pulsar-edit.dev/packages/linter-clojure)
* [`linter-glsl`](https://web.pulsar-edit.dev/packages/linter-glsl)
* [`linter-gfortran`](https://web.pulsar-edit.dev/packages/linter-gfortran)
* [`linter-stylint`](https://web.pulsar-edit.dev/packages/linter-stylint)
* [`linter-lintr`](https://web.pulsar-edit.dev/packages/linter-lintr)
* [`linter-luacheck`](https://web.pulsar-edit.dev/packages/linter-luacheck)
* [`linter-foodcritic`](https://web.pulsar-edit.dev/packages/linter-foodcritic)
* [`linter-gjslint`](https://web.pulsar-edit.dev/packages/linter-gjslint)
* [`linter-swiftc`](https://web.pulsar-edit.dev/packages/linter-swiftc)
* [`linter-perlcritic`](https://web.pulsar-edit.dev/packages/linter-perlcritic)
* [`linter-slim`](https://web.pulsar-edit.dev/packages/linter-slim)
* [`linter-swiftlint`](https://web.pulsar-edit.dev/packages/linter-swiftlint)
* [`linter-dartanalyzer`](https://web.pulsar-edit.dev/packages/linter-dartanalyzer)
* [`linter-lsc`](https://web.pulsar-edit.dev/packages/linter-lsc)
* [`linter-reek`](https://web.pulsar-edit.dev/packages/linter-reek)
* [`linter-spell-ruby`](https://web.pulsar-edit.dev/packages/linter-spell-ruby)
* [`linter-harbour`](https://web.pulsar-edit.dev/packages/linter-harbour)
* [`linter-govet`](https://web.pulsar-edit.dev/packages/linter-govet)
* [`linter-processing-java`](https://web.pulsar-edit.dev/packages/linter-processing-java)
* [`linter-proselint`](https://web.pulsar-edit.dev/packages/linter-proselint)
* [`linter-rst`](https://web.pulsar-edit.dev/packages/linter-rst)
* [`linter-gotype`](https://web.pulsar-edit.dev/packages/linter-gotype)
* [`linter-codeclimate`](https://web.pulsar-edit.dev/packages/linter-codeclimate)
* [`linter-phplint`](https://web.pulsar-edit.dev/packages/linter-phplint)
* [`atom-linter-phpstan`](https://web.pulsar-edit.dev/packages/atom-linter-phpstan)
* [`linter-erlc`](https://web.pulsar-edit.dev/packages/linter-erlc)
* [`linter-moonscript`](https://web.pulsar-edit.dev/packages/linter-moonscript)
* [`linter-hadolint`](https://web.pulsar-edit.dev/packages/linter-hadolint)
* [`linter-spell-project`](https://web.pulsar-edit.dev/packages/linter-spell-project)
* [`linter-flint`](https://web.pulsar-edit.dev/packages/linter-flint)
* [`linter-flexpmd`](https://web.pulsar-edit.dev/packages/linter-flexpmd)
* [`linter-roodi`](https://web.pulsar-edit.dev/packages/linter-roodi)
* [`linter-bailey`](https://web.pulsar-edit.dev/packages/linter-bailey)

Since these packages are all archived on GitHub, they will receive the `Archived` badge to reflect this status.

### atom-ide-dark-syntax

The community package `atom-ide-dark-syntax` has been found to have been removed from GitHub, meaning the package is no longer downloadable.

As this package is broken in such a way that it cannot be fixed, it will be removed from the backend while keeping the reserved name to avoid any Supply Chain Attacks targeting this package.

### atom-ide-go

During the below investigation of Facebook Nuclide Packages, the [`atom-ide-go`](https://web.pulsar-edit.dev/packages/atom-ide-go) package was discovered to be archived, as mentioned below. But on the readme of the package itself, it recommended installation of a different package, [`ide-gopls`](https://web.pulsar-edit.dev/packages/ide-gopls).

As such, we will also add the `Deprecated` badge, instead suggesting installation of this other package.

### Facebook Nuclide Packages

The community packages:
* [`atom-ide-debugger-node`](https://web.pulsar-edit.dev/packages/atom-ide-debugger-node)
* [`atom-ide-debugger-python`](https://web.pulsar-edit.dev/packages/atom-ide-debugger-python)
* [`atom-ide-debugger-native-gdb`](https://web.pulsar-edit.dev/packages/atom-ide-debugger-native-gdb)
* [`atom-ide-debugger-react-native`](https://web.pulsar-edit.dev/packages/atom-ide-debugger-react-native)
* [`atom-ide-debugger-ocaml`](https://web.pulsar-edit.dev/packages/atom-ide-debugger-ocaml)
* [`atom-ide-ui`](https://web.pulsar-edit.dev/packages/atom-ide-ui)
* [`atom-ide-go`](https://web.pulsar-edit.dev/packages/atom-ide-go)
* [`go-plus`](https://web.pulsar-edit.dev/packages/go-plus)
* [`atom-idea`](https://web.pulsar-edit.dev/packages/atom-idea)
* [`hyperclick`](https://web.pulsar-edit.dev/packages/hyperclick)
* [`nuclide-format-js`](https://web.pulsar-edit.dev/packages/nuclide-format-js)

Via a [report](https://github.com/pulsar-edit/package-backend/issues/245) and further investigation was pointed out as having been archived.

As such, the `Archived` badge will be added to this package.

### autocomplete-javascript

The community package [`autocomplete-javascript`](https://web.pulsar-edit.dev/packages/autocomplete-javascript) was [reported](https://github.com/pulsar-edit/package-backend/issues/248) to be broken. On further investigation it essentially seems to have been name squatted, offering no functionality to the user beyond the default package generator behavior.

As such, and as it has not been updated in 7 years, this package will be marked as `Broken` to avoid confusion.

## 2024 - February 10

### auto-save-on-idle

The community package [`auto-save-on-idle`](https://web.pulsar-edit.dev/packages/auto-save-on-idle) was discovered to have malformed data on the PPR database, rendering its most recent version uninstallable. This was discovered via automatic error reporting on the backend.

This package was one of the original packages from Atom that was migrated over to the new system, and it seems that their last publication in 2017 was published under the GitHub tag of `v1.2.2` meanwhile, the `package.json` still had the incorrect version of `1.2.1`.

What this means is that during migration we attempted to find the data for this package's tag `v1.2.1` which doesn't exist, which meant that no data was ever saved for how to install this package, which, in tern, made it uninstallable.

Considering this package has `42,347` downloads under its belt, it seems safe to assume that this disconnect, something no longer allowed on the PPR, was something allowed on the original Atom backend.

In prioritizing keeping packages working, this package has had its version `1.2.1` data updated to include installable location data to its GitHub tag of `v1.2.2`, as well as updating its SHA information for that tag.

These changes ensure the package is installable for all users.

## 2024 - January 30

### linter-shellcheck

The community package `linter-shellcheck` has been discovered to be broken. The source code contains an [error](https://github.com/AtomLinter/linter-shellcheck/issues/160). This package's source code has since been archived as of August 7, 2023. So it is now impossible for this package to ever receive an update to resolve its issue.

But the package has been forked to the [`pulsar-cooperative`](https://github.com/pulsar-cooperative) organization. This forked package is now recommended to download.

As this package is now permanently broken, and archived, it'll receive the [`Archived`](./badge-spec.md#archived), [`Broken`](./badge-spec.md#broken) and [`Deprecated`](./badge-spec.md#deprecated) badges to reflect its status, with installation of [`linter-shellcheck-pulsar`](https://web.pulsar-edit.dev/packages/linter-shellcheck-pulsar) instead recommended.

### linter-remark

The community package `linter-remark` has been discovered to be broken. The source code contains an [error](https://github.com/pulsar-edit/package-backend/issues/212). This package's source code has since been archived as of June 18, 2022. So it is now impossible for this package to ever receive an update to resolve its issue.

As this package is now permanently broken, and archived, it'll receive both the [`Archived`](./badge-spec.md#archived) and [`Broken`](./badge-spec.md#broken) badges to reflect its status.

### atom-ternjs

The community package [`atom-ternjs`](https://web.pulsar-edit.dev/packages/atom-ternjs) has been reported to be broken.

This package was the first to be ported the [`pulsar-cooperative`](https://github.com/pulsar-cooperative) organization, in the effort to help alleviate the ownership burden of broken community packages.

This forked package is now recommended to download.

So this package will receive the [`Deprecated`](./badge-spec.md#deprecated) badge, with installation of [`pulsar-ternjs`](https://web.pulsar-edit.dev/packages/pulsar-ternjs) instead recommended.

### compare-files

The community package `compare-files` has been discovered to be broken. The source code contains an [error](https://github.com/atom-compare-files/atom-compare-files/issues) that was originally reported before Pulsar had ever been created. This package's source code has since been archived as of January 21, 2019. So it is now impossible for this package to ever receive an update to resolve its issue.

As this package is now permanently broken, and archived, it'll receive both the [`Archived`](./badge-spec.md#archived) and [`Broken`](./badge-spec.md#broken) badges to reflect its status.

### deep-purple-syntax

The community package `deep-purple-syntax` has been found to have been removed from GitHub, meaning the package is no longer downloadable.

As this package is broken in such a way that it cannot be fixed, it will be removed from the backend while keeping the reserved name to avoid any Supply Chain Attacks targeting this package.

### darcula-darker-syntax

Much like our previous entry of `pulsar-gpp-compiler` the maintainer of `darcula-darker-syntax` while working on their package had accidentally deleted the entire package. At this point in time they did request to have the name unreserved so that they could republish their package under the same name.

Keeping in line with the same requirements, to avoid any kind of Supply Chain Vulnerability being available to our users we had to ensure that there were **zero** ever downloads of this package. Since this package was publishing originally within 30 days, we were able to do this via the server logs. The following was determined absolutely:

1. The user requesting this service had sufficient permission to the effected repository.
2. No major, malicious changes had occurred in the codebase, which could signal a GitHub user's account had been compromised.
3. That absolutely 0 downloads have ever occurred of this package.

After confirming the above details without a shadow of a doubt, we were able to unreserve the package name to allow the author to publish their package under that name again.

## 2023 - September 4

### pulsar-gpp-compiler

The maintainers of the community package `pulsar-gpp-compiler` during the course of maintaining their package, had accidentally completely unpublished the package, rather than unpublishing a specific version.

These maintainers had wanted to retain the same package name during a republication, but the backend reserves all package names after unpublishing to help keep users safe from a potential [Supply Chain Vulnerability](https://en.wikipedia.org/wiki/Supply_chain_attack).

At the request of this package's maintainers we investigated any way to allow the same name to be published, while keeping our users safe.

Since the nature of a Supply Chain Vulnerability relies on users having previously installed the potential package, and due to the young age of the package, we realized that if we can confirm with 100% certainty that absolutely 0 users had installed this package, nobody could be affected by a supply chain vulnerability, and it could be safe to the overall community to allow republication.

An important note about confirming the download count: Because when a package is unpublished, the download count is permanently deleted from the Pulsar Package Repository, we have to rely on the logs of the backend. These logs only go back 30 days, meaning that if a package was published more than 30 days ago, it would **never** be eligible for allowing republication of a reserved name.

Beyond that we had to confirm the following details:

1. The user requesting this service had sufficient permission to the affected repository.
2. No major, malicious changes had occurred in the codebase, which could signal a GitHub user's account had been compromised.
3. That absolutely 0 downloads have ever occurred of this package.

To confirm the above:

1. The user was asked to create a branch of the affected repo named `allow-pulsar-un-reserving`
2. The diffs between all published tags on the GitHub repository were carefully inspected.
3. More on that in the below investigation of server logs.

To help ensure any community members that may be reading this, below is the full investigative work done for all network requests to the backend, that relate to this package, the owner of this package's IP address, and unique UserAgent.

The first ever hit in the logs for `pulsar-gpp-compiler` occurred at `2023-09-03 05:16:53.577 PDT`. This was an initial search for the package. Likely to determine if the name was available, this search did not return any results.

Very shortly after at `06:22:48.956 PDT` a direct request via the Pulsar Frontend was made for this package's data. This page returned a `404` confirming that no package by this name had existed.

At `06:22:49.408` the package was initially published. With only a second later the first version being published. It was then at `2023-09-03 06:33:28.314` that the request to delete the package was successfully processed.

In between the time of initial publish, and uninstallation, the following are the only unique URLs to have been hit (in relation to this package):

* `https://image.pulsar-edit.dev/packages/pulsar-gpp-compiler?image_kind=default`: This comes from our `image` microservice, which displays social cards of a package. These social cards are automatically linked to our community Discord on any package publication.
* `/api/packages/pulsar-gpp-compiler?image_kind=default`: This is a request from the `image` microservice for information of the package. We are able to tell since the IP address comes from the `image` microservice, and the query parameters have been passed through as we expect.
* `/packages/pulsar-gpp-compiler`: This URL originates from the Pulsar Frontend.
* `/api/packages/pulsar-gpp-compiler`: This URL is the backend being asked for data of the package. Which would be triggered anytime the frontend is hit.

This is the full list of unique endpoints hit in relation to this package, since the time of it's publication, and it's unpublishing. As you can see there were zero requests to download this package, so we are able to confirm beyond a shadow of a doubt, that **0** installs had ever occurred. Meaning we can allow republication of this reserved name, while keeping our community safe.

As such, with all the above details, the name `pulsar-gpp-compiler` will be unreserved from the package backend. The name will be reserved just as normal once the package is republished, and even once this same package is unpublished, the name will be reserved just as we expect.

## 2023 - August 16

### appcelerator-titanium && titanium

When the developers of `appcelerator-titanium` wanted to rebrand their package to `titanium` it seemed the backend was encountering errors attempting to do so. The developers then went ahead to create a brand new package `titanium` and continue development there. Unfortunately, also encountering errors when attempting to delete the now defunct package `appcelerator-titanium`. The developers had then [reached out](https://github.com/pulsar-edit/package-backend/issues/190) to the Pulsar Backend team for assistance.

Since none of these issues were the fault of the developers and seem to fully fall on the backend itself, the request was happy to be met, which attempted to do the following:

* Remove `appcelerator-titanium`
* Transfer what data possible over to `titanium`

To keep with this request, the following actions have been made:

* `appcelerator-titanium` has been deleted from the PPR, leaving the name reserved to avoid Supply Chain Attacks
* `appcelerator-titanium`s 6 `original_stargazers` (That is unindexed stargazers transferred from Atom) have been added to `titanium`s 0 `original_stargazers`
* `appcelerator-titanium`s 11,652 `downloads` have been added to `titanium`s 114 `downloads`. Resulting in a new value of `11,766` downloads for the `titanium` package.

### atom-oss-license

The community package [`atom-oss-license`](https://web.pulsar-edit.dev/packages/atom-oss-license) ([repo](https://github.com/mmk2410/atom-oss-license)), has been archived on March 9, 2019.

In an effort to make information like this more easily available to users of Pulsar, we do intend to mark any packages that originate from an archived repo.

As such this package was [requested](https://github.com/pulsar-edit/package-backend/issues/173) to be given the badge [`Archived`](./badge-spec.md#archived).

### omnisharp-atom

The community package [`omnisharp-atom`](https://web.pulsar-edit.dev/packages/omnisharp-atom) is unable to function without editing the source code of the package. The repository has not received any updates since this issue was originally reported, which was 4 years ago.

As such the package will receive the [`Broken`](./badge-spec.md#broken) badge, to make this fact obvious.
But if the package is truly wanted, there seems to be some possible [workarounds](https://github.com/OmniSharp/omnisharp-atom/issues/1037) that may restore the desired functionality.

### jupyter-notebook

The community package [`jupyter-notebook`](https://web.pulsar-edit.dev/packages/jupyter-notebook) has been [reported](https://github.com/jupyter/atom-notebook/issues/58) as unmaintained since 2017, and prior to the Atom sunset had broken completely with many reports of invalid syntax errors causing the package to crash.

Due to this, the package will receive the [`Broken`](./badge-spec.md#broken) badge.

### atom-elixir-formatter

The community package [`atom-elixir-formatter`](https://web.pulsar-edit.dev/packages/atom-elixir-formatter) has been [reported](https://github.com/pulsar-edit/pulsar/issues/133) to be broken. This stems from now invalid JavaScript within Pulsar, after our NodeJS and Electron bumps.

Amazingly, the community has stepped up to publish a functioning fork of this package, which is instead recommended to download.

So this package will receive the [`Deprecated`](./badge-spec.md#deprecated) badge, with installation of [`atom-elixir-formatter-pulsar`](https://web.pulsar-edit.dev/packages/atom-elixir-formatter-pulsar) instead recommended.

## 2023 - August 14

### linter-stylelint

The community package `linter-stylelint` has been discovered to be broken. The source code contains an [error](https://github.com/AtomLinter/linter-stylelint/issues/610) that was originally reported before Pulsar had ever been created. This package's source code has since been archived as of August 7th, 2023. So it is now impossible for this package to ever receive an update to resolve it's issue.

As this package is now permanently broken, and archived, it'll receive both the [`Archived`](./badge-spec.md#archived) and [`Broken`](./badge-spec.md#broken) badges to reflect it's status.

### busy-signal

The community package `busy-signal` has [received updates](https://github.com/steelbrain/busy-signal/pull/95) with some help of the Pulsar team to remove deprecations from it's source code. But unfortunately, those changes are no longer being published to the Pulsar Package Registry.

This means the GitHub source of the package is more up to date and functional than what exists with Pulsar and special steps should be taken to install it.

To reflect this status, `busy-signal` will additionally receive the [`Outdated`](./badge-spec#outdated) badge.

To install `busy-signal` for end users, it's recommended to run the following command:

```shell
pulsar -p install https://github.com/steelbrain/busy-signal
```

## 2023 - April 22

The community package `language-nasmx86` has been found to have been removed from GitHub, meaning the package is no longer downloadable.

As this package is broken in such a way that it cannot be fixed, it will be removed from the backend while keeping the reserved name to avoid any Supply Chain Attacks targeting this package.

## 2023 - March 29

Allowed for a seamless takeover of the `language-pegjs` name.
Since this was a package originally published by Atom, and is now being updated and maintained by Pulsar, we will manually allow a takeover of the unique name on the registry.

By changing the `repository.url` object of the top level `language-pegjs` `package` entry, to point to the `pulsar-edit` GitHub organization, we can allow our newer versions to be published, while keeping Atom's old versions available as is.

## 2023 - March 28

The following packages will receive the Outdated Badge:

### Hydrogen

The Hydrogen package has a bug where it will fallback to using incorrect old Atom API's when interacting with Pulsar.

One of the Pulsar devs had submitted a fix for this bug [`nteract/hydrogen#2162`](https://github.com/nteract/hydrogen/pull/2162) and that was accepted into the package. Additionally, the package maintainers released a new version [`v2.16.5`](https://github.com/nteract/hydrogen/releases/tag/v2.16.5) containing this fix. But this fix has **not** been published to the Pulsar Package Registry.

It is for this reason it is recommended to install the `hydrogen` package with the following command:

```bash
pulsar -p install https://github.com/nteract/hydrogen -t v2.16.5
```

With the above said, `hydrogen` will receive an [`outdated`](./badge-spec.md#outdated) badge.

Added: August 16, 2023

In some instances it may also be necessary to run the following to build all native modules within `Hydrogen` properly:

```bash
cd ~/.pulsar/packages/hydrogen # or the equivalent on windows
npx electron-rebuild -v 12.2.3
```

[Source](https://github.com/pulsar-edit/pulsar/issues/359)

### Glacier-Darkula-UI

The Glacier-Darkula-UI package uses an old, no longer supported CSS selector when styling the scrollbar. Resulting in the scrollbar taking on OS Native styling when used within Pulsar.

One of the Pulsar devs had submitted a fix for this bug [`pit00/glacier-darkula-ui#1`](https://github.com/pit00/glacier-darkula-ui/pull/1) and that was accepted into the package. But this fix has **not** been published to the Pulsar Package Registry, or added to any tagged release of the package.

It is for this reason it is recommended to install the `glacier-darkula-ui` package with the following command:

```bash
pulsar -p install https://github.com/pit00/glacier-darkula-ui -t 34c5f677527310463f6930967fdf55f502a818c2
```

With the above said, `glacier-darkula-ui` will receive an [`outdated`](./badge-spec.md#outdated) badge.

## 2023 - March 25

For a period of time there was a bug on the backend that, when a package author would publish a new version of their package, the package's main `data` field would be saved improperly. Resulting in the package becoming corrupt and un-downloadable. Some package authors were effected by this.

One of which was the package author @manngo. Who helpfully pointed out that their package was corrupt on a [GitHub Issue](https://github.com/pulsar-edit/package-backend/issues/125).

So their package was manually modified on the database to fix this corruption:

* [`web-developer-tools`](https://github.com/manngo/atom-web-tools/tree/master)
  - Removed version `0.4.4` from the backend.
  - Reset version `0.4.0` as the `latest`.
  - Fixed the packages `data` field to be valid, and contain the data needed.

## 2023 - March 24

For the uninitiated, during the last month or so of the old Atom Package Registry days there was significant amounts of spam packages being generated.

After the initial migration of packages from Atom we had to sift through everything to remove any of this spam we could find.

Some of the common factors:
* The package included nothing beyond template or `package-generator` files.
* The package advertised online gambling.
* The package's major language was always Indonesian.

Considering the above commonalities of the hundreds of spam packages Atom saw in the last days we continue to remain vigilant to these appearing within our database, and remove it once found. And in that effort:

We removed the following packages due to suspected spam:

* [`slot-depo-pulsa`](https://github.com/Star-Grey/slot-depo-pulsa)
* [`togel-sdy`](https://github.com/Star-Grey/togel-sdy)

## 2023 - March 18

Removed some community packages during our effort to ensure we only keep packages with licenses that allow for redistribution. The packages listed below either had licenses that outright prohibited redistribution or were otherwise unclear, and after a thorough attempt to contact the publishers we decided to remove the packages. More information on this topic is available on the [Pulsar Blog](https://pulsar-edit.dev/blog/20230319-confused-Techie-HowLicenseNoneDeletedPackages.html)

* [`bemhtml`](https://github.com/jchouse/bemhtml)
* [`github-user-datatip`](https://github.com/jgebhardt/atom-github-user-datatip)
* [`atom-arma-language`](https://github.com/DevZupa/Atom-Arma-Language)
* [`go-hyperclick`](https://github.com/zheng1/go-hyperclick)
* [`language-dm`](https://github.com/stuicey/language-dm)
* [`egg`](https://github.com/chow-xiang/atom-egg)
* [`next-dark`](https://github.com/casesandberg/next-dark-ui)
* [`language-multiverse`](https://github.com/drewctaylor/language-multiverse)
* [`autoclose-editors`](https://github.com/pvienneau/atom-clear-deleted-editors)
* [`scheme-syntax`](https://github.com/rogerbutt/scheme-syntax)
* [`atom-itunes`](https://github.com/OskarPersson/atom-itunes)
* [`woah-there-mousewheel`](https://github.com/rzhw/woah-there-mousewheel)
* [`orgfld`](https://github.com/ukdor/orgfld)
* [`language-bgscript`](https://github.com/gwillz/language-bgscript)
* [`quilt-completions`](https://github.com/lemonmade/quilt-completions)
* [`next-dark-ui`](https://github.com/casesandberg/next-dark-ui)
* [`atom-selenium-autocomplete`](https://github.com/ibhubs/atom-selenium-autocomplete)
* [`atom-monokai-one-dark`](https://github.com/AntonioDeCasper/atom-monokai-one-dark)
* [`linter-flexible-survival`](https://github.com/HelicalLove/linter-flexible-survival)
* [`single-ut`](https://github.com/lawrencebla/single-ut-atom)
* [`language-tree-test`](https://github.com/Aerijo/language-tree-test)
* [`punchclock`](https://github.com/queenp/punchclock)
* [`multiverse-syntax`](https://github.com/drewctaylor/multiverse-syntax)
* [`mura-snippets`](https://github.com/rwatts3/atom-mura-snippets)
* [`haskell-tools`](https://github.com/nboldi/haskell-tools-atom)
* [`language-todotxt-plus`](https://github.com/LerBigDev/language-todotxt-plus)
* [`autocomplete-webgl`](https://github.com/hughsk/autocomplete-webgl)
* [`emp-frontend-devtool`](https://github.com/RYTong/emp-frontend-devtool)
* [`language-t8-assembly`](https://github.com/pjht/language-t8-assembly)
* [`language-topas`](https://github.com/joostverburg/language-topas)
* [`itunes`](https://github.com/reduxd/atom-itunes)
* [`execute-command`](https://github.com/retroverse/execute-command)
* [`language-antimony`](https://github.com/0u812/language-antimony)
* [`smilebin`](https://github.com/tdenovan/smilebin-atom-package)
* [`sandstorm-syntax`](https://github.com/bardleware/sandstorm-atom-syntax)
* [`swinsian`](https://github.com/tgrrtt/atom-swinsian)
* [`language-maxlang`](https://github.com/bascouch/language-maxlang)
* [`export-project-html`](https://github.com/emendir/Export-Project-to-HTML---Atom-Plugin)
* [`language-sqf`](https://github.com/mgoodings/language-sqf)
* [`goproof`](https://github.com/mitchr/goproof)
* [`find-dependencies`](https://github.com/nikitabulatov/find-dependencies)
* [`aural-coding`](https://github.com/probablycorey/aural-coding)
* [`neolao`](https://github.com/neolao/atom-package-neolao)
* [`insert-require`](https://github.com/vjeux/insert-require)
* [`mdfld`](https://github.com/quackingduck/mdfld)
* [`language-alt-pfm`](https://github.com/andraus/language-alt-pfm)
* [`atomkit`](https://github.com/almonk/atomkit)
* [`sandstorm-ui`](https://github.com/bardleware/sandstorm-atom-ui)
* [`snippr-io-editors-atom`](https://github.com/snippr-io/snippr-io-editors-atom)
* [`atom-grok-highlighter`](https://github.com/nickStefanko/atom-grok-highlighter)
* [`atom-expressionengine`](https://github.com/mindpixel-labs/atom-expressionengine)
* [`cga-4bit-syntax`](https://github.com/DutChen18/cga-4bit)
* [`darker-one-dark-syntax`](https://github.com/SenTisso/darker-one-dark-syntax)
* [`language-cwl-atom`](https://github.com/SolomonShorser-OICR/language-cwl-atom)
* [`language-structured-text`](https://github.com/E-Renshaw/language-structured-text)
* [`atom-nonmem`](https://github.com/dpastoor/atom-nonmem)
* [`hello-world`](https://github.com/distalx/hello-world-atom)
* [`language-fhem`](https://github.com/Fankserver/atom-language-fhem)
* [`cwl-solarized-dark`](https://github.com/SolomonShorser-OICR/cwl-solarized-dark)
* [`thedaniel-test-package-2`](https://github.com/thedaniel/test-package-2)
* [`kobble`](https://github.com/kobble-git/kobble-package)
* [`atom-video-game-name-generator`](https://github.com/lewismoten/atom-video-game-name-generator)
* [`irene-emojify`](https://github.com/prymnumber/emojify)
* [`devfactory-language-client`](https://github.com/mizzlr/Atom-Language-Client)
* [`language-category-compiler`](https://github.com/jack-willturner/language-category-compiler)
* [`language-gpp`](https://github.com/Milys/language-gpp)
* [`language-tesp`](https://github.com/aleixpinardell/language-tesp)
* [`continuum-atom`](https://github.com/dualmoon/continuum-atom)
* [`cut-line`](https://github.com/tekkub/cut-line)
* [`nitrogen`](https://github.com/petejkim/nitrogen-dist)
* [`luser-interface-ui`](https://github.com/elifoster/luser-interface)
* [`made-of-code-atom`](https://github.com/mkdynamic/made-of-code-atom)
* [`keystrokes`](https://github.com/lilyszhang/keystrokes)
* [`seti-super-compact-ui`](https://github.com/mdonnalley/seti-super-compact-ui)
* [`language-jsil`](https://github.com/tompntn/language-jsil)
* [`language-ivan`](https://github.com/perficientautomation/atom-language-ivan)
* [`monokai-soft`](https://github.com/nikteg/atom-monokai-soft)
* [`foldingtext-for-atom`](https://github.com/jessegrosjean/foldingtext-for-atom)

## 2023 - March 17

Removed some community packages during our effort to ensure we only keep packages with Licenses that allow for redistribution. The packages listed below either had licenses that outright prohibited redistribution or were otherwise unclear, and after a thorough attempt to contact the publishers we had resolved to remove the packages.

* [`mstest2`](https://github.com/mstest1/mstest2)
* [`latex-online`](https://github.com/Spijkervet/atom-latex-online)
* [`language-wex5`](https://github.com/ranforce/language-wex5)
* [`hotdog-tabs`](https://github.com/kmh11/hotdog-tabs)

## 2023 - March 10

The community package `simplified-russian-menu` was reported by a user of Pulsar as being uninstallable.

The repository it was linked to had been deleted or made private on GitHub.
As well as using Web Archive it was discovered the user had changed their account name, and had removed the package entirely from their account.

After confirming this behavior wasn't because of a technical error the package was removed from the Pulsar Package Registry.

- `LexBacker/simplified-russian-menu:cffefb9f-e11a-4447-9f79-ce93a62f35c9`

## 2022 - December 14

### Blocked Access to a specific Set of IP Addresses

After it came to our attention that a specific user was hammering our servers on a specific couple of endpoints we had to block their access to the backend.

This user had requested the two endpoints over 6,000 times over 4 days. This behavior had not been observed by any other users, and considering the server hosting costs are handled entirely by the Pulsar Team and community donations, this simply wasn't an expense that could be afforded.

Considering this their access was completely cut off from the backend, to prevent this abuse of our systems.

## 2022 - December 9

Modified some packages data on the backend database, due to incompatibility with the new database constraints.

- `totaljs/atom-syntax` - Removed `v0.1.2`
- `pkrll/doc-green-syntax` - Removed `1.0`
- `Cronos87/atom-laravel` - Removed `0.1`
- `ReeSilva/atom-homestead` - Removed `v0.10.0`
- `kraih/atom-perltidy` - Removed `0.1`, `0.2`, `0.3`
- `swdotcom/swdc-atom` - Removed Package

## Pre-Backend

In the time before the backend was actually created, when the Pulsar team had archived all existing packages from the Atom Package Registry, there were two steps taken that resulted in some packages not making it past the initial migration, and being excluded from the Pulsar Package Registry. Those steps are detailed below.

### Database Migration

During the initial migration of packages to the database, it's possible some packages would break some rules that had been configured within the schema of this new database. The script and full logs of this process are available at [`confused-Techie/atom-package-migrator-to-db-2`](https://github.com/confused-Techie/atom-package-migrator-to-db-2/tree/main). Below are the packages that failed to migrate during this process:

* `code-time`: Failed to migrate several versions due to the length of the license field being longer than what was allowed on the Database Schema. Since this was the only package to encounter this limit, we thought it best to contact the maintainers, rather than modify the database schema. An [issue](https://github.com/swdotcom/swdc-atom/issues/96) was created on `swdotcom/swdc-atom` to address this. But without response the package wasn't included as every version published encountered this issue.

### Health Checks / Repackaging

Before any archived packages were migrated, they were first put through several health checks to ensure we only transfered over valid packages. The code used to run these health checks, and convert the archived data into usable package data is available at [`confused-Techie/atom-package-migrator`](https://github.com/confused-Techie/atom-package-migrator). The full logs and data created from this process is also available at [`confused-Techie/atom-package-collection`](https://github.com/confused-Techie/atom-package-collection/tree/main). Below will list all of the packages that failed these health checks.

### Non-URL Safe Name

Packages were excluded from the repackaging process if they contained a name that was not URL Safe.

The below packages were never repackaged due to this:

* ☃
* itunes for atom
* itunes for atom
* panic-palette-syntax@0.2.5
* undefined

### Package's GitHub repository is not available

Package's were excluded from the repackaging process if the repository they pointed to wasn't accessible. This implies that the repository or user has since been deleted, or the repository has since become privated.

The below packages were never repackaged due to this:

* 0x0f0f0f-black-syntax
* 1984-dark-theme
* 42-nightsquad-package
* 42-nightsquad-syntax
* 42-nightsquad-ui
* a10-networks-aflex
* a10-networks-snippets
* a10-networks-syntax
* about-elastic
* about-test
* abstract-machine-mips
* abyss-syntax
* accessible-snippets
* acpp
* activate-hotdog-mode
* acute-syntax
* adam-dev-syntax
* adisorganizedandmispeledmess-ui
* adobe-publisher
* adventurous-ui
* aegis-language-support
* aegooby-syntax
* aemi-dark-syntax
* aemi-dark-ui
* aemi-light-syntax
* aemi-light-ui
* aki-likes-to-whine-angular2-component-generator
* akrillia-syntax
* akun-demo-slot
* aligner-typescript
* alpha-light-syntax
* alt-underscore_mjs
* always-up
* aml-workbench
* an-color-picker
* ancient-syntax
* <REDACTED>-amazingly-non-dysfunctional-package (Note PPI has been removed and replaced with 'REDACTED' for this package.)
* <REDACTED>-awesome-word-count-package (Note PPI has been removed and replaced with 'REDACTED' for this package.)
* angular2-webpack-component-generator
* animate-css
* anuny-dark-syntax
* apchina
* apex-muted-ui
* apex-snippet-master-pack
* apex-superfish-menu
* api-notation
* api-workbench
* apiary-highlighter
* arc-darker-ui
* arcadian-meow-syntax
* arma-atom
* ash-language-atom
* asm2
* asteroids-syntax
* astro
* atml3-ide-grammar
* atml3-ide-prettifier
* atml3-ide-rendertool
* atml3-ide-syntax-theme
* atml3-ide-trainingdbconnector
* atom-achieve
* atom-adapt-visualstudio-csharp-regions
* atom-angular-snippets
* atom-autocomplete-openresty
* atom-autocomplete-python
* atom-babel-compiler
* atom-backbone
* atom-bagguo
* atom-bash-snips
* atom-bjartmar
* atom-black-syntax
* atom-black-ui
* atom-block
* atom-blue-chat
* atom-bold-syntax
* atom-bwam
* atom-city
* atom-clang
* atom-coati
* atom-code-assistance
* atom-copy-with-line-numbers
* atom-dart
* atom-dc-ui
* atom-delete-debugger
* atom-devrant
* atom-dracula-black
* atom-dracula-syntax
* atom-drf
* atom-elementui
* atom-emacs-command
* atom-email-snippets
* atom-es6-standard
* atom-faker
* atom-finess-syntax
* atom-flow-ts-switcher
* atom-format
* atom-github
* atom-glamorous
* atom-graphql
* atom-habit
* atom-hacker-ui
* atom-howdoi
* atom-htmlizer
* atom-hydrangea-syntax
* atom-ice-cold-ui
* atom-ide-terminal
* atom-iviewui
* atom-japanese-dummytext
* atom-javascript-console-snippets
* atom-jedi
* atom-js-hyperx
* atom-js-scratch
* atom-kickstart-snips
* atom-klip
* atom-knockout
* atom-language-scilab
* atom-low-contrast-ui
* atom-lunatic-syntax
* atom-lunatic-ui
* atom-make
* atom-mapfile
* atom-mario-snippets
* atom-markdown-auto-preview
* atom-mb-syntax
* atom-mdn
* atom-mechanical-plumbus
* atom-message-panel-service
* atom-meteor-snippets
* atom-min-ui
* atom-monokai-php
* atom-muffin-snippets
* atom-netrelay
* atom-nice-index
* atom-no-syntax
* atom-node-debugger
* atom-npm-task-starter
* atom-pair-less
* atom-pastebin
* atom-polaris
* atom-polyfills
* atom-powersnap
* atom-prettier-standard
* atom-prettydiff
* atom-pusher
* atom-quick-class
* atom-quoter
* atom-rable-language
* atom-radiant-player
* atom-rainbow-syntax
* atom-reactjs-snippets
* atom-realtime-collaboration
* atom-rtags
* atom-rust
* atom-scripts
* atom-scrolloff
* atom-setup-manager-package
* atom-shortcuts-windows
* atom-siml-plugin
* atom-simplified-chinese
* atom-smart-tabnames
* atom-sobornost-ui
* atom-soft-green-ui
* atom-sonic-pi
* atom-sort-projects
* atom-spectrum-syntax
* atom-spring-green-syntax
* atom-spring-green-ui
* atom-standard-snippet
* atom-stories
* atom-storm-ui
* atom-surround
* atom-swift-syntax
* atom-sync-packages
* atom-tandem-extension
* atom-telegram
* atom-text-crosser
* atom-thepastebin
* atom-thinkphp-snippets
* atom-to-codepen
* atom-together
* atom-touchbar
* atom-toychest
* atom-tt
* atom-tutor
* atom-ui-syntax
* atom-unquoter
* atom-vme
* atom-webstorm
* atom-will-o-wisp-syntax
* atom-word-counter
* atom-wpy
* atom-wxml
* atom-x
* atom-zcms-helper
* atomic-delight-syntax
* atomic-sorter
* atomic-sync
* atomic-ui
* atomistic-syntax
* atomizer
* atomries
* atomsphere
* atom_package_leo
* ats-atom
* ats-syntax
* ats_atom
* attributes-asciidoc
* atwork-qdt
* audio
* aui-sass-formatter
* authenticated-authorship
* auto-convert-to-utf8
* auto-project
* auto-softwrap
* auto-text
* autobot-syntax-theme
* autocomplete-fivem
* autocomplete-haxe
* autocomplete-ionic2-framework
* autocomplete-plus-async
* autocomplete-plus-clang
* autocomplete-tailwind
* autocomplete-yamlprovider
* autumn-breeze-syntax
* available-snippets
* awesome-dark-syntax
* awesome-seti-syntax
* awesomely-purple-ui
* awesomeness-ui
* ayo-seti-syntax
* ayozint-seti-syntax
* azurite-blue-syntax
* background-quotes
* background-tips-fortune-literature
* bacon
* balloon-syntax
* bandit-lint
* base-16-mexico-light-syntax-theme
* base-n
* base16-atelierlakeside-dark-theme
* base16-dark-syntax
* base16-dimmed-syntax
* base16-light-syntax
* base16-roman-dark-theme
* base16-tomorrow-night-eighties-syntax
* basicdark-syntax
* beige-syntax
* bemjson-snippets
* benny-syntax
* benny-ui-theme
* benny-ui
* benny
* bennyfinal
* bennyuserinterfaceui
* bespin-syntax
* best-rap-horn
* better-language-dart
* birds-obsidian
* bitcoder-syntax
* black-corail-ui
* black-sun-syntax
* blackhole-syntax
* blackrain
* bless
* blob-ui
* block-select
* bloginatom
* blue-gray-syntax
* blue-mono-syntax
* blue-sea-syntax
* blueish-syntax
* bo-slot-gacor
* bocoran-admin-jarwo
* bocoran-admin-riki
* bold-dark-syntax
* boni-roni
* bonsoir-syntax
* bonus-new-member-100-slot-game
* bonus-new-member-100
* bootstrap-3-snippetset
* bootstrap3-plus
* boreal-dark-syntax
* boreal-syntax
* boreal-ui
* born-daily
* bower-install
* br4ckets-dark
* br4ckets-light
* braavo-syntax
* breadcrumbs
* breeze-dark-syntax
* breeze-dark-ui-edge
* breeze-dark-ui
* breeze-light-syntax
* brewers-syntax
* browse-pane
* brugui-syntax
* buddy-test-runner
* butterfly
* candy-light-syntax
* cautious-octo-broccoli
* ceed-atom
* ceru-syntax
* ceru-ui
* chalked
* challenger-deep-ui
* challenger
* chaps-angular-snippets
* chaps-angular2-snippets
* chary-tree-view
* cheeky-semi
* cheesecake-syntax
* chelevra-syntax-atom
* chelevra-syntax
* chihiro-syntax
* ching-ui
* ching
* choco
* chocolate-syntax
* chriscarpenter12-railscast-theme
* circleci-yaml-linter
* civic-syntax
* close-all
* co-reviver
* cobolt-atom-theme
* code-completion
* code-folder
* code-switch
* codecademy-syntax
* codelab
* codenow
* codestats
* coffeedocs
* coffeescript-build
* cold-syntax
* cold-ui
* collab
* collaboreditor
* collabrio
* colorful-coding-atom-syntax
* colorwheel-syntax
* commands-composition
* commentariat
* comments-to-html
* compass
* confectio-dark-syntax
* conflent-atom-plugin
* conifer-dark-syntax
* coniferneue-dark-syntax
* console-panel-elastic
* contao-custom-elements-snippets
* control-underscore
* convert-term-case
* cool-syntax
* cooldark-syntax
* copy-filepath-with-line-numbers
* copy-reference
* copyline
* coq-grammar
* crankshaft-completions
* cross-doc
* cs-config-package
* cs30-p5js-toolbar
* cssboilerplate
* csveditor
* cuddly-tatertot-syntax
* curly-squeegee-syntax
* custom-darcula-syntax
* custom-minimap-titles
* cwpcomponent
* dace-finder
* daftar-slot
* dark--atom--cp-syntax
* dark-cand-syntax
* dark-core-syntax
* dark-nebula-syntax
* dark-sister-syntax
* dark-sister-ui
* dark-space-syntax
* dark-stream-ui
* dark-syntax-theme
* darkly-syntax
* darkmate
* dart-syntax
* data-class
* dave-syntax
* daverona-laravel-syntax
* daverona-mellow-syntax
* daverona-slime-syntax
* db-migrate-snippets
* dbg-gdb-esp32
* dbg2
* debugger-lines
* deep-black-syntax
* deep-c-syntax
* dertyp7214-web-search
* dev-tools-dark
* dgms
* dictme
* diff-pane
* dimmed-base16-syntax
* ding
* direct-flat-ui
* dirtysprite-syntax
* discordbot
* display-keystroke-bindings
* draw-centered
* dreamweaver-syntax
* druid
* duanes-ui
* duotone-dank-green-syntax
* duotone-dark-red-syntax
* duotone-dark-space-muted-syntax
* duotone-swordart-syntax
* duotone-tealtone
* dylon-syntax
* earthsung-by-jackson-syntax
* eclectic-indent-guide-variation
* eclectic-theme-variation
* eclim-atom
* editplus-syntax
* eez-studio
* eferet-atom-active-editor-info
* elastic-devtools
* electric-syntax
* electric-terminal
* electric-ui
* electric
* electronlauncher
* elementary-light-ui
* elesmerian-syntax
* elesmerian-theme-syntax
* elesmerian
* eliptical-syntax
* elly-syntax
* elm
* eluna-simplifier
* emojiblast
* engelfrost-syntax
* ensime
* epitech-atom
* epitech-mr-clean
* epitech-norm-linter
* erational-syntax
* es-snippets
* eschillus-syntax
* eupho-syntax
* eval-javascript
* evening-syntax
* evening-ui
* eventtus-atom
* ex-mode-hb
* execute-as-perl
* explicit-reload
* explorer-shortcut
* facebook-syntax
* fade-folded-lines
* fascination-syntax
* fatihyolcu-wordcount
* fb-atom-snippets
* fei-dark-syntax
* fei-light-syntax
* file-icons-logo
* filecolor-white
* find-gem
* firattest
* firefox-dev-dark-muted-syntax
* flaming-syntax
* flaretype
* flat-fizzy
* flat-syntax
* flatify-light-ui
* flatland
* flatty-syntax
* flatty-ui
* fleme-ui
* flint-atom
* flynt-atom-helpers
* flynt-atom-snippets
* fold-search-results
* font-awesome-snippetset
* fontawesome5-ui
* fontsearch
* force-text-direction
* forcefetch
* forestry-syntax
* foretold-ui
* foretold
* format-actionscript
* foundation5-package
* fox-ui-helper
* fresh-syntax
* friday-night-lights
* frosting-syntax
* func-static-checker
* fwd-back
* fz-atom-react-snippet
* fz-docs-helper
* gacor-slot
* gagarin-syntax
* gamma-ray-syntax
* gandaldf-dark-ui
* gaslight-syntax
* gbkconfig
* genesis-snippets
* gently-syntax
* getter-and-setter
* giga-atom-ui
* ginkgo-and-gomega-snippets
* git-tree
* gitee
* gitflow
* github-2016-syntax-theme
* github-authoring
* github-nasa-ui
* glamorous-snippets
* glamorous-snips
* gloom-for-nord
* glowscript-syntax
* gnippets
* gnlib-snippets-atom
* go-impl
* goede-syntax
* goede-ui
* goldfish-dark-ui
* good-morning-dark-syntax
* google-search
* gopher
* gray-syntax
* grayscale-syntax
* gulp-control-extra
* gulp-watcher
* h-ybridd-syntax
* hackerrank-atom-plugin
* halflife-syntax
* hannah-theme
* harvest-time-tracker
* hash-n
* hashrocket
* haskr-syntax
* hazel-dark-syntax
* header-codam
* heading-commenter
* herify
* hex8-asm
* hide-comments
* hide_comments
* higgs-boson-syntax
* highlight-after-col
* highlight-css-color
* hipsum
* history-project-manager
* html-class-definition
* html-fetcher
* html-uglifier
* html-wrapper
* html2haml
* htmlbars-beautify
* huddlespith-theme-ui
* i18n-brackets
* ian000-custom-ui
* ian000-seti-ui
* ice-cold-syntax
* ide-jhipster
* ide-laravel
* ide-storyscript
* idle-atom-syntax
* idle-theme
* ilnter-gcc-with-avr
* imdone-atom-harbour
* img-uploader-sm
* immaculate-syntax
* immaculate-ui
* immense-project-syntax
* immense-project-ui
* imp-language-sass
* impeccable-syntax
* improved-dusk-syntax
* improved-html-asp
* init-react-code
* ink-dark-syntax
* ink-syntax
* insert-hello-world
* inspire-syntax
* instant-docs
* iojs-debugger
* iomed-syntax
* ionide-yeoman
* ios
* iplastic-syntax
* iridium
* iris-ui
* itg-dark-syntax
* itg-light-syntax
* itibia_semanblock
* ivern-comment
* jade-bootstrap3-snippets
* jade-snippets
* japanese-contract-md-syntax
* japanese-contract-md
* jarle-active-editor-info
* javascript-object-snippets
* jc-nest
* jedi-python
* jeremy-syntax
* jesus-case
* jextious-syntax
* jfs-ascii-art
* jfs-word-count
* jibo-sdk
* jira-issue-search
* jist
* jordanbtucker-apm-test
* josh-mosh-syntax
* jsb-black-theme
* jsb-brown-theme
* jsb-orange-theme
* juicebox-syntax
* jurassicsystems-ui
* jvpr-dark-syntax
* kabryan-syntax
* kara-custom-syntax
* kary-foundation-dark
* kato-test-pkg
* kd-parser
* kerbstomps-syntax
* kerbstomps-ui
* kernel-lights-syntax
* keshway-syntax
* kevin-syntax
* key-motion
* keys-typed-tracker
* kirby-snippets
* kite
* kiwi-ui
* knightrider-syntax
* koala
* kokaubeam-syntax
* kraken-ui
* ksp-config-grammar
* kuroir
* kyaho-dark-syntax
* kyaho-syntax
* kyopro-copy
* label-a-tom
* lancelot-language-hdl
* lang-pug
* language-6502-asm
* language-ada
* language-alang3
* language-amber
* language-amxxpawn
* language-arma-atom-mapbuilder
* language-arturo
* language-ash
* language-assembly-avr
* language-assembly-icmc
* language-befunge98
* language-better-junos
* language-bnd
* language-book-sync
* language-botl
* language-bst
* language-c3type
* language-calclang
* language-chapters
* language-chat-script
* language-chip8asm
* language-citrus
* language-cobalt
* language-computercraft
* language-condor
* language-coq
* language-crystal-esz
* language-deltinscript
* language-demi
* language-dimensional
* language-disco
* language-dlv
* language-docker-erb
* language-docker-l
* language-doe2
* language-doki-script
* language-dotjs
* language-dql
* language-drift
* language-dtl
* language-dtql
* language-dymond
* language-efront
* language-eiffel
* language-elastic
* language-elyse
* language-ember
* language-eoalatex
* language-fastbuild
* language-few
* language-fidl
* language-flake
* language-fpl
* language-fs-ionide
* language-gherkin-german
* language-gnuplot
* language-growl
* language-gsc
* language-ham
* language-hamlbars
* language-huawei-config
* language-hx
* language-ice
* language-iced-coffeescript
* language-image
* language-ini-inlinecomments
* language-ink
* language-io
* language-irite
* language-juooga
* language-kos
* language-ksp
* language-latex-eoa
* language-let
* language-lex-flex
* language-lexers
* language-linescript
* language-linuxcnc-gcode
* language-lolcode
* language-macro11
* language-mapl
* language-mcfunction
* language-minecraft
* language-mineral
* language-mml-nrtdrv
* language-mochi
* language-mscript
* language-multiclet-asm
* language-mumps
* language-muon
* language-muse
* language-ncf
* language-numl
* language-ocaml
* language-odedsl
* language-ohm-golf
* language-oracul
* language-orfeo
* language-osp-m
* language-ovalescript
* language-patch
* language-pflotran
* language-phonix
* language-pig
* language-plpgsql
* language-pseudo
* language-psl
* language-python3
* language-qsharp-2
* language-quik
* language-rant
* language-raxe
* language-redprl
* language-rhapscript
* language-saurus
* language-savestuff
* language-scout
* language-script
* language-scss
* language-sein
* language-simpl
* language-simple-risc
* language-smartassembly
* language-soat
* language-source-cfg
* language-spass
* language-stripes
* language-swift-extended
* language-swift
* language-swigjs
* language-sxhkdrc
* language-teraterm-macro
* language-thinscript
* language-tick
* language-todofile-plus
* language-todos
* language-toy-assembly
* language-trainz-script
* language-tt2
* language-twee2
* language-unrealscript-ue2
* language-varuna
* language-vue-interpolation
* language-web-component
* language-whiskey
* language-wpy
* language-wren
* language-xharbour
* language-yoptascript
* language-zepto
* languageserver-php
* laravel-documentation-theme
* laravel-ide
* latex-shortcut
* lavender-syntax
* lavender-ui
* laxis-atom-syntax
* lazade-word-count
* lebab-convert
* let
* libra-syntax
* libra-ui
* license-plus
* light-idle
* light-wave-syntax
* light-waves-syntax
* lihuwordcount
* linearize
* linescript-grammar
* linkify
* linkto-atom-helper
* linter-christen
* linter-deepscan
* linter-ember-template
* linter-ggstyle
* linter-js-tenx
* linter-py
* linter-stylelint-fork
* liquid-syntax
* liquid-ui
* lisboa-syntax
* literal-syntax
* litus
* live-reload-sass
* lloyd-flanagan-word-count
* louis-material-syntax-light
* louis-material-syntax
* love-dark-syntax
* love-dark-ui
* love-light-syntax
* love-light-ui
* low-contrast-syntax
* lowerdev-snippets
* lucid-syntax
* lucius-dark-syntax
* lucius-light-syntax
* lunaxy-netease-music
* lunaxy-wechat
* mac-move-and-select
* maersu-blue-syntax
* maersu-nemo-syntax
* maersu-syntax
* mak-test-package
* make-runner-panel
* maker-ide-atom
* makro
* malachite-syntax
* mamutal91-jackhammer-syntax
* mamutal91-mysyntaxtheme
* mamutal91-one-dark-ui
* mandarin-syntax
* mannsfeld
* manyang-manyang-ui
* markbooks
* markdown-badges-snippets
* markdown-formatter
* markdown-table-calc
* markup-kombat
* matcha-syntax
* mate-subword-navigation
* material-beta-syntax
* material-file-icons
* material-night-eighties-syntax
* matom-word-count
* mavensmate-atom
* maya
* mcale-word-count
* mcfunction
* mcs2
* md5
* mdbg-snippets
* mdn
* mdtkit-lint
* mecedor-syntax
* meld-diff
* mellow-contrast-syntax
* melonsoda-syntax
* merqurio-syntax
* metasota-package-1
* meteor-spacebars
* metricks
* meu-teste
* mhcc-code-academy
* mhvng-syntax-ui
* mhvng-syntax
* mhvng_syntax
* mi-snippets
* min-syntax
* minifier
* minim-syntax
* minimal-light-syntax
* minimum-ui
* minorium-ui
* minory-syntax
* minotaur-syntax
* mint-ui
* mistjay-syntax
* mockingbird-syntax
* modal-keybindings
* modded-spacegray-dark-syntax
* modeline
* moke-word-count
* monochrome-syntax
* monokai-arc
* monokai-basic-syntax
* monokai-black
* monokai-corail-syntax
* monokai-darker
* monokai-jooj-syntax
* monokai-modified
* monokai-neon
* monokai-neue-syntax
* monokai-real
* monokai-seti-ray
* monokai-sharp
* monokai-suus
* moso-atom-snippets
* mq-one-dark-syntax
* mq-theme-syntax
* msmeeves-pastels-syntax
* mstest1
* multiple-keymaps
* my-liquid
* my-muse-test-package-one
* my-package-fernan68-test
* my-package-words-count
* my-package
* my-syntax-theme
* mycruell-dark-ui
* mykai
* mylittlepackage
* mzlp-language-jinie
* nativebase-snippets
* nearblack-ui
* necro-syntax
* nei-helper
* neon-moon-ui
* neuelabs-ui
* neutral-colourful-syntax
* neutral-colourful
* nhocki-rspec-snippets
* nicktheme-syntax
* niftyco-snippets
* nobber-syntax
* node-open-dependencies
* node-snippets
* nodemcu-ide
* nodemon-generator
* norg
* notebook
* nuclide-esformatter
* nyan-syntax
* oc-tools
* oceanic-dark-syntax
* oceanic-next-dark
* oceanide-ui
* oceanline-ui
* oceans16-atomui
* oceans16-bright-syntax
* octocat-syntax
* olympus-slot-kakek-zeus
* on-the-rocks
* one-dark-matte-syntax
* one-dark-monokai-syntax
* one-dark-red-ui
* one-dark-syntax-adam
* one-dark-vertical-tabs-lighter-background-2-ui
* one-dark-vertical-tabs-lighter-background-ui
* one-liner
* one-snazzy-syntax
* one-spacegrey-syntax
* one-xcode-syntax
* onset-snippets
* open-file-under-cursor
* open-in-atom-plus
* open-in-web-browser
* open-php-in-browser
* open-similar
* open-simliar
* opened-files-updated
* openjml-esc
* open_in_cmder
* opzio
* orp-iakonom
* outdoor-theme
* overwatch-dark-syntax
* pack
* package-foreman
* package-sync-plus
* panache
* pandemics
* pane-jump
* panic-palette-dark
* paper-syntax
* paperless-atom
* paradise-city-syntax
* paradise-light-syntax
* paradox-syntax
* paradox-ui
* parkroocom-path-tracer
* party-hard
* paste-line-to-line
* pastel-metal-syntax
* pastel-tron-syntax
* path-switcher
* pathfinder
* payment-time
* peanut-syntax-theme
* peterbumsflocke-dark-ui
* peterbumsflocke-syntax
* phnx-snippets
* phoenix-epitech-headers
* php-getters-setters-improved
* php-method-extractor
* php-new-csr
* phpdocfr
* piatto-light
* pink-fluffy-atom-ui
* placehold-atom-snippet
* plasma
* pochinki-syntax
* pod-dark
* polychrome-ui-breezydark
* polymerjs-snippets
* poolade-ui
* porth
* poseidon-syntax
* post-qiita-team
* practical-tabs
* prayertimes
* premium-syntax
* presta-snippets
* prettifier
* programmer-syntax
* project-environment
* propel-snippets
* proton-kai-for-one-dark
* pudb-friend
* pugify
* puppet-module-generator
* purify-syntax
* purple-pills-ui
* purple-sky-syntax
* purple-sky-ui
* pysearch
* python-idle-syntax
* python-jedi
* qcloud-markdown
* quadro-sea-syntax
* quantum-entanglement
* quick-class
* quick-generator
* quick-lodash
* quick-module
* quick-q-a
* r-darcula-syntax
* r0ten-atom-html-to-string
* r0ten-comments
* rails-model-schema
* railscast-atom-theme
* railscast-theme-ng
* rainy-night-city-syntax
* rainy-night-city
* rajin-atom-pastebin
* rant
* rap-horn-unlocked-3
* rashadkai-syntax
* rawn-theme
* rbx-uploader
* rc-easynet-ide
* re-toxin-syntax
* react-bloomer-snippets
* react-datum
* react-es6-snippets
* react-native-snippets-youngjuning
* react-native-typescript-snippets
* react-nextjs-snippets
* react-quick-component
* react-redux-component-snippets
* react-snippets-for-atom
* react-standard-snippets
* redux
* reindent-line
* release-notes-autocompletion
* rem-to-px
* remove-all-project-folders
* remove-trailing-range
* render-android-log
* repl-console
* restartatom
* retro-gruvbox
* reverse-selection
* revoid-syntax
* rit
* rmrf
* robin-language-php
* rotsix-syntax
* rpgsheetz
* rtp-live
* rubiks-syntax
* ruby-grammar
* rumble
* run-code
* run-file
* rust-syntax
* ruxit-liquid-linter
* sa-core
* sagan-dark-syntax
* sagan-dark-ui
* salmon-on-ice-syntax
* saml-test-spec-editor
* sant-ui
* sass-comment
* sass-syntax-highlight
* saturated-dark
* save-code-foldings
* sb-upload
* scala-worksheet
* scilab
* scratchpad
* scy-test
* seafoam-pastel-dark
* secure-copy
* selly-ui
* semaphore
* sensible-tab
* sentence-splitter
* seoul-dark-syntax
* seoul-light-syntax
* serenity-syntax
* serenity-ui
* serenity
* seti-brahalla-syntax
* setrobot-bundle
* sf-custom-tools
* sftp-upload-on-change
* shlisp-atom
* shm-syntax
* shortwords
* shoutpoint-ccml
* siberia-syntax
* simple-toolbar
* simplewordcount
* sims-react-snippets
* sims-snippets-react
* sir0xb
* situs-judi-slot-online-gampang-menang
* sky-dark-syntax
* skyscape-syntax
* slack-atom
* slack-ui-alter
* sloppy-code-snip
* slot-4d
* slot-bonus-200-di-depan
* slot-bonus-new-member-100-slot-games
* slot-bonus-new-member-100
* slot-deposit-dana-10000
* slot-deposit-pulsa-tanpa-potongan
* slot-gacor-hari-ini-2022
* slot-gacor
* slot-gampang-menang
* slot-online--j-p789
* slot-online-terpercaya
* slot-online
* slot-pulsa-10000-tanpa-potongan
* slot
* slut-syntax
* slut-ui
* smart-build-server
* smart-data-link
* smart-link
* smooth-operator-navy
* smooth-operator
* smoothie-syntax
* snazzy-nebula-ui
* snippet-collections-xiaolai
* snippet-lib
* snippets-collection
* snippets-syndicate
* snippetsigniter-atom
* snow-dark-material-syntax
* snow-dark-syntax
* soft-era
* solar-sooty-syntax
* solarized-black-syntax
* solarized-code-syntax
* solarized-one-dark-syntax
* solarized-seti-ui
* solarized-white-syntax
* solid-execut0r
* someones-syntax
* sonarlint-dummy
* soy-syntax
* soy-ui
* spaceblade-syntax
* spacecase
* spark-beta
* spass-helper
* specialer-board
* spectral-selection
* spelling
* spike-atom-package
* spk-ap
* split-into-lines
* sprite-generator
* srcery-syntax
* ss-syntax-theme
* standard-angularjs-snippets
* stardust-syntax
* status-bar-stats
* statwolf-atom-configuration
* statwolf-console-plugin
* statwolf-debugger
* statwolf-installer
* statwolf-logger
* statwolf-new-component-plugin
* statwolf-push-plugin
* stellar-dark-theme
* sticky-select-all
* stylus-language
* stylus-snippets
* sublime-js-syntax
* sublime-ui-dark
* sublime-ui-light
* subtitle-utils
* sundried-syntax
* super-swag-syntax
* surale-syntax
* surale-theme
* swackets
* swag-asteriks
* sweet-dark-syntax
* sweet-syntax
* swift-autocomplete-snippets
* swiq
* symfony-trans-replacer
* synders-toolkit
* syntagma-ui
* syntax-obsidian
* syntax-tree
* system-font-snippets
* t2
* t808-syntax
* tabclick
* tailwind-dark-syntax
* tailwind-light-syntax
* take-a-note-syntax
* talk-like-a-pirate
* tapplint
* tarocchi-coffee
* teran-ui
* termal-syntax
* termal-ui
* tern-j-s
* ternjs
* terraform-lookup
* test-package-1
* test-rename-1
* test-status
* testpackage1
* testrepo
* the-grid
* thf-snippets
* thinkphp5-snippets
* time-status
* timekeeper
* tochelet-ui
* todo-panel
* toma-syntax
* toma-theme
* tomorrow-night-blue-syntax
* tomorrow-night-bright-syntax
* tomorrow-night-saturated-syntax
* tomorrow-syntax
* tool-bar-basic
* tool-bar-noderat
* tool-bar-rawn
* toolbar-cmake-shell
* toothpaste_2_syntax
* translation-helper
* transmit
* travis-ci-status
* tree-lines
* tree-view-bundler
* tree-view-no-drag
* tree-view-remote
* treeview-file-highlight
* trendy-dark-syntax
* trendy-light-ui
* tron-legacy-syntax-cp
* tron-legacy-syntax
* tron-legacy-ui
* true-emoticons
* try-catch-wrapper
* ts-angular-styleguide
* tsubaki-syntax
* tutors-lessons-syntax
* twilight-textmate-syntax-refined
* two-dark-ui
* two-light-ui
* two-syntax
* typingeffect
* ui-minory
* uikit-jade
* ukuhlanekezela
* ultra-snazzy-syntax
* ultra-snazzy
* ultra-syntax
* ultra
* umsl-toolbar
* underscore
* underscorecase
* underscorejs-snippets-no-semicolon
* unis
* untime-syntax
* update-package-dependencies-elastic
* urlrequest
* userlite-link
* userlite-snippets
* userlite-utilities
* v-code
* vacuous-syntax
* valhalla
* vemv-autocomplete
* venus-runner
* veryspecial-syntax
* vibranium-syntax
* vim-like-syntax
* vim-mode-plus-keymaps-for-git
* vim-mode-plus-keymaps-for-tree-view
* voz-living-dev-tool
* vs2015-dark-syntax
* vsc-dark-syntax
* vue-autocomplete
* vue-snippets
* vue2-autocomplete
* vuetify-atom
* w-atom-snippet
* wakanda-syntax
* warbp-3r-syntax
* warmth-syntax
* web-developer-light-syntax
* webbox-color
* willyelm-test2
* willyelm-test4
* wilmersdorf-syntax
* wl-jshinter
* words
* wtf-preview
* wynnscript-atom
* x-tools
* xavil-syntax
* xcode-bracket-matcher
* xcode-midnight-dark-syntax
* xiaolais-atom-snippets
* xkcd-comics
* xmc-workspace
* xolotl
* yjy-syntax
* yoceanic-next-syntax
* yolo-wallhack-syntax
* yongky-atom-theme
* yosemite-ui
* youngjuning-snippets
* yuma-sintax
* yuno-syntax
* z3editor
* zan-language-ruby
* zaraa
* zc-dark-syntax
* zen-monk
* zenburnesque
* zenchat-snippets
* ziv-syntax

### Name is Banned

Due to the severe amount of spam the Atom Package Registry started to see in the last days, a ban list of names was created to prevent spam or malicious packages from being migrated over. Luckily the majority of spam packages were created in the following days after the initial migration was made, but still some packages had to be prevented from being repacked, which are listed below:

* demo-slot-joker-gacor
* slot-bonus-new-member
* slot-dana
* slot-deposit-pulsa
* slot-gacor-hari-ini
* slot-hoki
* slot-paling-gacor-setiap-hari
* slot-pulsa
* slot88
* slothoki
