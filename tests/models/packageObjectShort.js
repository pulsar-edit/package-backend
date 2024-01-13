module.exports = {
  schema: {
    description: "A 'Package Object Short' of a package on the PPR.",
    type: "object",
    required: [
      "name",
      "readme",
      "metadata",
      "repository",
      "downloads",
      "stargazers_count",
      "releases",
      "badges",
      "owner",
    ],
    properties: {
      name: { type: "string" },
      readme: { type: "string" },
      metadata: { type: "object" },
      repository: { type: "object" },
      creation_method: { type: "string" },
      downloads: { type: "string" },
      stargazers_count: { type: "string" },
      releases: { type: "object" },
      badges: { type: "array" },
      owner: { type: "string" },
    },
  },
  example: {
    // Example taken from `platformio-ide-terminal`
    name: "platformio-ide-terminal",
    readme: "This is the full content of a readme file!",
    owner: "platformio",
    metadata: {
      main: "./lib/plaformio-ide-terminal",
      name: "platformio-ide-terminal",
      // This could be an author object
      author: "Jeremy Ebneyamin",
      engines: {
        atom: ">=1.12.2 <2.0.0",
      },
      license: "MIT",
      version: "2.10.1",
      homepage: "https://atom.io/packages/platformio=ide-terminal",
      keywords: ["PlatformIO", "terminal-plus", "terminal"],
      repository: "https://github.com/platformio/platformio-iatom-ide-terminal",
      description:
        "A terminal package for Atom, complete with themes, API and more for PlatformIO IDE. Fork of terminal-plus.",
      contributors: [
        {
          url: "http://platformio.org",
          name: "Ivan Kravets",
          email: "me@kravets.com",
        },
      ],
      dependencies: {
        "term.js": "https://github.com/jeremyramin/term.js/tarball/master",
        underscore: "^1.8.3",
        "atom-psace-pen-views": "^2.2.0",
        "node-pty-prebuilt-multiarch": "^0.9.0",
      },
      activationHooks: ["core:loaded-shell-encironmnet"],
      consumedServices: {
        "status-bar": {
          versions: {
            "^1.0.0": "consumeStatusBar",
          },
        },
      },
      providedServices: {
        runInTerminal: {
          versions: {
            "0.14.5": "provideRunInTerminal",
          },
          description: "Deprecated API for PlatformIO IDE 1.0",
        },
      },
    },
    repository: {
      url: "https://github.com/platformio/platformio-atom-ide-terminal",
      type: "git",
    },
    creation_method: "User Made Package",
    downloads: "16997915",
    stargazers_count: "1114",
    releases: {
      latest: "2.10.1",
    },
    badges: [],
  },
  test: Joi.object({
    name: Joi.string().required(),
    readme: Joi.string().required(),
    metadata: Joi.object().required(),
    releases: Joi.object({
      latest: Joi.string().required(),
    }).required(),
    owner: Joi.string().required(),
    repository: Joi.object({
      url: Joi.string().required(),
      type: Joi.string()
        .valid("git", "bit", "sfr", "lab", "berg", "unknown", "na")
        .required(),
    }).required(),
    creation_method: Joi.string()
      .valid(
        "User Made Package",
        "Migrated from Atom.io",
        "Test Package" // Should only be used during tests
      )
      .required(),
    downloads: Joi.string()
      .pattern(/^[0-9]+$/)
      .required(),
    stargazers_count: Joi.string()
      .pattern(/^[0-9]+$/)
      .required(),
    badges: Joi.array()
      .items(
        Joi.object({
          title: Joi.string()
            .valid(
              "Outdated",
              "Made for Pulsar!",
              "Broken",
              "Archived",
              "Deprecated"
            )
            .required(),
          type: Joi.string().valid("warn", "info", "success").required(),
          text: Joi.string(),
          link: Joi.string(),
        })
      )
      .required(),
  }).required(),
};
