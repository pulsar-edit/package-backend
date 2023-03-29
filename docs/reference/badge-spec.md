# Pulsar Package's Badges

A badge allows extra information to be communicated to a Pulsar user about a package. Similar to how NPM may warn of errors after installing a package, or how a user is able to receive badges on their GitHub profile.

A badge allows the Pulsar admins to communicate certain information about a package quickly to end users everywhere it may appear.

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
A side note, while there is currently no hard limit for the amount of badges a single package may contain, the current recommendation is to try and stay around 5 badges. This may be later on solidified into a proper part of the schema but currently there is no limit.

Any `badge` object may contain the following properties:

* `title`: This is a **required** property. Specifying the title of the badge. Such as `Deprecated`.
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

# Types of Badges & Why They May be Added

## Outdated

The `Outdated` badge is used to indicate that the version of a package that may exist on the Pulsar Package Registry, may be out of date when compared to the package on GitHub (Or other VCS host).

This badge should only be used when the main functionality of the branch is missing/broken/or otherwise non-functional when installed onto Pulsar as the latest branch, in a supported Pulsar configuration.

That is, if a Pulsar users on a supported platform, indepent of any other issues, installs a package and it immediately does not work, displays severe visual bugs, or causes an error message logged as a notification, and there is a fix available for that package within it's source code, that has not been pushed to Pulsar in a reasonable time, then it is elligble to receive this badge.

This badge would be added on a case by case basis, and would likely only be added if Pulsar users are reporting the error.

As with all other badges this badge may be removed at any time, and if you, as a package maintainer have updated a package and did not see this badge removed automatically, or within a reasonable time, feel free to [create an issue](https://github.com/pulsar-edit/package-backend/issues) asking for it to be removed.
