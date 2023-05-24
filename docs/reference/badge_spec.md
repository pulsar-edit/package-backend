# Pulsar Package's Badges

Badges communicate additional information to you about a package.
Pulsar Maintainers communicate details about packages via badges when a community package maintainer can't or wont't, in the hope of making the usage of the [Pulsar Package Registry (PPR)](./glossary.md) as simple and easy as possible. Think of Pulsar Package Badges being similar to how NPM emits warnings when installing certain packages, or how users on GitHub can receive badges on their GitHub profile.

Below is the specification for a badge, the data it may contain, the valid values that may be placed in an enum, and what should be done with it.

## Schema

The following schema is required of any `generic` badge type:

```json
"badges": [
  {
    "type": "<type_enum>",
    "title": "<string>",
    "text": "<string>",
    "link": "<string>"
  }
]
```

As you can see `badges` is an array of a valid `badge` object.
A side note, while there is currently no limit for the amount of badges a single package may contain, the current recommendation is to try and stay around 5 badges or less. This may be later on solidified into a proper part of the schema if required.

Any `badge` object may contain the following properties:

* `title`: This is a **required** property. Specifying the title of the badge. Such as `Deprecated`. This value is a strict enum, with only the values specified below being allowed.
* `text`: This is an **optional** property. Specifying further information about this badge. That may be hidden either based on a user setting or by context.
* `link`: This is an **optional** property. Providing a link for the user to be directed to, that may contain further information about the badge.
* `type`: This is a **required** property. Instructing what type of badge this is. The type of badge should be used to determine any icons used alongside the badge, as well as any color or styling the badge will receive when displayed by the client. The valid `type`s currently available are as follows:
  - `warn`: This should be used to indicate something that the user **must** be aware of.
  - `info`: This should be used to point out information that is neutral in the user receiving.
  - `success`: Should be used to indicate something good about the badge, that the user would be delighted to know about.
  - A note about `type`: It's highly recommended for your client to support default styling of badges, in the event new types are added before your client has support for this type. Default styling will ensure badges will always appear.

The following are some valid examples of badges:

```json
"badges": [
  {
    "type": "warn",
    "title": "Deprecated",
    "text": "This package is out of date and should not be used.",
    "link": "https://github.com/pulsar-edit/pulsar/issues/1"
  },
  {
    "type": "info",
    "title": "Looking for Maintainers"
  },
  {
    "type": "success",
    "title": "Made for Pulsar!",
    "link": "https://github.com/pulsar-edit/pulsar"
  }
]
```

## Types of Badges & Why They May be Added

### Outdated

The `Outdated` badge is used to indicate that the version of a package that may exist on the PPR, may be out of date when compared to the package on GitHub (Or other VCS host).

This badge should only be used when the main functionality of the package is missing/broken/or otherwise non-functional when installed onto Pulsar, in a supported Pulsar configuration.

That is, if a Pulsar user on a supported platform, indepent of any other issues, installs a package and it immediately does not work, displays severe visual bugs, or causes an error message logged as a notification, and there is a fix available for that package within it's source code, that has not been pushed to Pulsar in a reasonable time, then it is eligible to receive this badge.

This badge would be added on a case by case basis, and would likely only be added if Pulsar users are reporting the error.

As with all other badges this badge may be removed at any time, and if you, as a package maintainer have updated a package and did not see this badge removed automatically, or within a reasonable time, feel free to [create an issue](https://github.com/pulsar-edit/package-backend/issues) asking for it to be removed.

### Made for Pulsar!

The `Made for Pulsar!` badge is automatically applied to any community packages that have been published to Pulsar through the PPR. Unlike most other badges, which are applied to the package itself and thus saved in the PPR Database, the `Made for Pulsar!` badge is applied dynamically at the time it is requested from the PPR. Since this badge is applied dynamically there is no real way, currently, to opt out of its usage if a community package maintainer wished to do so.

The `Made for Pulsar!` badge is meant to be a badge of acheivment, showing that your package is more likely to work as expected, and be under active maintainance.

### Broken

The `Broken` badge is used to indicate that the package available on the PPR does not work at all in it's current form, on any supported platform. Either requiring manual changes to the source code, or otherwise being unrealistic to fix from the users perspective.

This package likely emits warnings immediatly, or may even cause the editor to crash as a whole. Installation of these packages is not recommended by the Pulsar team, and instead it is encouraged to work with the original maintainer to get these packages working, or otherwise the community is encouraged to maintain and manage a fork of said package.

If a community member does decide to maintain a fork of a package with a `Broken` badge, it's recommended to make the Pulsar team or Pulsar Backend team (such as by opening an issue on this repo) aware of this, so any warnings and links on the original package can be changed to recommend installation of your functional fork.

### Archived

The `Archived` badge is used to indicate that this package has been archived on GitHub (Or other VCS host). This does not mean that the package doesn't work, or has any kind of issue, it only means that if there does become issues with this package then support is most likely not going to exist.

The `Archived` badge should only be used as a neutral badge, to not cause any kind of concern beyond informing the user of what might be expected, and to avoid any assumptions for this package relating to:

  * Bugs being fixed.
  * New features being added.
  * Support of any kind from the package maintainer.
