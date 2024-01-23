module.exports = {
  schema: {
    description: "The `package.json` of a package with an added `dist.tarball` object.",
    type: "object",
    required: [
      "name",
      "version",
      "engines",
      "dist"
    ],
    properties: {
      name: { type: "string" },
      version: { type: "object" },
      engines: { type: "object" },
      dist: { type: "object" }
    }
  },
  example: {
    // This is the full return of `language-robots-txt`
    // Notice how some extra information may exist, that is present in the package's
    // `package.json`, the schema and test only references required fields
    name: "language-robots-txt",
    author: "confused-Techie",
    license: "MIT",
    scripts: {
      test: "pulsar --test spec"
    },
    version: "1.0.8",
    keywords: [ "text-mate", "pulsar-package", "pulsar-edit" ],
    repository: "https://github.com/confused-Techei/language-robots-txt",
    description: "Robots.txt Syntax Highlighting in Pulsar",
    dist: {
      tarball: "https://api.pulsar-edit.dev/api/packages/language-robots-txt/versions/1.0.8/tarball"
    }
  },
  test: Joi.object({
    name: Joi.string().required(),
    version: Joi.string().required(),
    engines: Joi.object({
      atom: Joi.string().required()
    }).required(),
    dist: Joi.object({
      tarball: Joi.string().required()
    }).required(),
  }).required(),
};
