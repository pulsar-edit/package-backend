module.exports = {
  schema: {
    description: "A 'Package Object Full' of a package on the PPR.",
    type: "object",
    required: [
      "name", "readme", "metadata", "releases", "versions",
      "repository", "creation_method", "downloads", "stargazers_count", "badges"
    ],
    properties: {
      name: { type: "string" },
      readme: { type: "string" },
      metadata: { type: "object" },
      releases: { type: "object" },
      versions: { type: "object" },
      repository: { type: "object" },
      creation_method: { type: "string" },
      downloads: { type: "string" },
      stargazers_count: { type: "string" },
      badges: { type: "array" }
    }
  },
  example: {
    // This is nearly the full return of `language-powershell-revised`
    name: "language-powershell-revised",
    readme: "This is the full content of a readme file!",
    metadata: {
      // The metadata field is the `package.json` of the most recent version
      // With the `dist` object added
      dist: {
        sha: "604a047247ded9df50e7325345405c93871868e5",
        tarball: "https://api.github.com/repos/confused-Techie/language-powershell-revised/tarball/refs/tags/v1.0.0"
      },
      name: "language-powershell-revised",
      engines: {
        atom: ">=1.0.0 <2.0.0"
      },
      license: "MIT",
      version: "1.0.0",
      keywords: [],
      // This may be a repository object
      repository: "https://github.com/confused-Techie/language-powershell-revised",
      description: "Updated, revised PowerShell Syntax Highlighting Support in Pulsar."
    },
    releases: {
      latest: "1.0.0"
    },
    versions: {
      "1.0.0": {
        // This is the `package.json` of every version
        // With a `dist` key added
        dist: {
          tarball: "https://api.pulsar-edit.dev/api/packages/language-powershell-revised/versions/1.0.0/tarball"
        },
        name: "language-powershell-revised",
        engines: {
          atom: ">=1.0.0 <2.0.0"
        },
        license: "MIT",
        version: "1.0.0",
        keywords: [],
        repository: "https://github.com/confsued-Techie/language-powershell-revised",
        description: "Updated, revised PowerShell Syntax Highlighting Support in Pulsar"
      }
    },
    repository: {
      // This is the repo object for the VCS Service
      url: "https://github.com/confsued-Techie/langauge-powershell-revised",
      type: "git"
    },
    // This can be either `User Made Package` or `Migrated Package`
    creation_method: "User Made Package",
    // Note how some fields here are strings not numbers
    downloads: "54",
    stargazers_count: "0",
    badges: [
      // Some badges are baked in, some are applied at render time.
      {
        title: "Made for Pulsar!",
        type: "success"
      }
    ]
  },
  test:
    Joi.object({
      name: Joi.string().required(),
      readme: Joi.string().required(),
      metadata: Joi.object().required(),
      releases: Joi.object({
        latest: Joi.string().required()
      }).required(),
      versions: Joi.object().required(),
      repository: Joi.object({
        url: Joi.string().required(),
        type: Joi.string().valid(
          "git",
          "bit",
          "sfr",
          "lab",
          "berg",
          "unknown",
          "na"
        ).required()
      }).required(),
      creation_method: Joi.string().valid(
        "User Made Package",
        "Migrated from Atom.io",
        "Test Package" // Should only be used during tests
      ).required(),
      downloads: Joi.string().pattern(/^[0-9]+$/).required(),
      stargazers_count: Joi.string().pattern(/^[0-9]+$/).required(),
      badges: Joi.array().items(
        Joi.object({
          title: Joi.string().valid(
            "Outdated",
            "Made for Pulsar!",
            "Broken",
            "Archived",
            "Deprecated"
          ).required(),
          type: Joi.string().valid(
            "warn", "info", "success"
          ).required(),
          text: Joi.string(),
          link: Joi.string()
        })
      ).required()
    }).required()
};
