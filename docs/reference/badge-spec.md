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

As you can see `badges` is an array of a valid `badge` objects.

Any `badge` object may contain the following properties:

* `title`: This is a **required** property. Specifying the title of the badge. Such as `Deprecated`.
* `text`: This is an **optional** property. Specifying further information about this badge. That may be hidden either based on a user setting or by context.
* `link`: This is an **optional** property. Providing a link for the user to be directed to, that may contain further information about the badge.
* `type`: This is a **required** property. Instructing what type of badge this is. The type of badge should be used to determine any icons used alongside the badge, as well as any colour or styling the badge will receive when displayed by the client. The valid `type`s currently available are as follows:
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
