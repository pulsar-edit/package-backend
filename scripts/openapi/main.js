// This script will be used in order to update the Open API spec according to whatever changes may exist within the codebase.
// We will accomplish this by:
//  - Collecting our constant values
//  - Collecting all endpoints we are concerned with

// TODO
//  - Get all endpoints updated with this information
//  - find way to provide parameters for raw endpoint objects
//  - determine how we want to better provide for the api key info
//  - add options to endpoints
//  - add rate limit info

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const packageJSON = require("../../package.json");
const endpoints = require("../../src/controllers/endpoints.js");
const queryParameters = require("../../src/query_parameters/index.js");
const MODEL_DIR = "tests/models";
const MODEL_DIR_FS = `./${MODEL_DIR}`;
const MODEL_DIR_REQUIRE = `../../${MODEL_DIR}`;
const SPEC_LOC = "./docs/swagger/openapi3_def.yaml";

// This is the object that will actually hold our specification until it's written
const spec = {
  openapi: "3.1.0",
  info: {
    version: packageJSON.version,
    title: "Pulsar", // Could use the packageJSON.title
    description: "Allows for the management, viewing, and downloading of packages and themes for use within the Pulsar editor.",
    // ^^ Could use packageJSON.description
    license: {
      name: "MIT",
      identifier: "MIT"
    }
  },
  servers: [
    {
      url: "https://api.pulsar-edit.dev",
      description: "Production Server"
    },
    {
      url: "http://localhost:8080",
      description: "Locally hosted development server"
    }
  ],
};

// With our initial setup done, lets add our paths onto the schema
spec.paths = {};
constructAndAddPaths();

// Now to add our components
spec.components = {};
// Starting with parameters
spec.components.parameters = {};
constructAndAddParameters();
// Finally add our schemas
spec.components.schemas = {};
constructAndAddSchemas();

// Now to write out file
const specFile = yaml.dump(spec, {
  noRefs: true,
  sortKeys: true
});

fs.writeFileSync(SPEC_LOC, specFile, { encoding: "utf8" });

function constructAndAddPaths() {
  for (const node of endpoints) {
    for (const ePath of node.endpoint.paths) {

      spec.paths[createPathString(ePath)] = {
        [node.endpoint.method.toLowerCase()]: {
          ...( typeof node.docs.summary === "string" && { summary: node.docs.summary } ),
          ...( typeof node.docs.description === "string" && { description: node.docs.description } ),
          ...( node.docs.deprecated && { deprecated: true } ),
          responses: craftResponsesFromObject(node),
          parameters: craftParametersFromObject(node)
        } // TODO Add Options returns here, once I read up on the response schema enough to include it
      };

    }
  }
}

function createPathString(ePath) {
  // Here we take a path like `/api/packages/:packageName` => `/api/packages/{packageName}`
  let original = ePath;
  let output = "";

  let hangingBracket = false;

  for (let i = 0; i < original.length; i++) {
    let char = original.charAt(i);

    if (char === ":") {
      output += "{";
      hangingBracket = true;
    } else if (i === original.length - 1) {
      // we are at the end
      if (hangingBracket) {
        output += char;
        output += "}";
        hangingBracket = false;
      } else {
        output += char;
      }
    } else if (char === "/") {
      if (hangingBracket) {
        output += "}";
        output += char;
        hangingBracket = false;
      } else {
        output += char;
      }
    } else {
      output += char;
    }
  }

  return output;
}

function craftResponsesFromObject(node) {
  // Takes a single endpoint node, and returns an object of responses
  const responses = {};

  for (const response in node.docs.responses) {
    responses[response] = node.docs.responses[response];

    // We just append the whole object since the schema is nearly identical
    // Except we need to handle any replacements of the content types
    if (responses[response].content) {
      for (const format in responses[response].content) {

        if (typeof responses[response].content[format] === "string" && responses[response].content[format].startsWith("$")) {
          // The string value of the format entry begins with "$" so we will want to replace
          // it's content with either a reference to the object schema, or directly with the schema
          responses[response].content[format] = { schema: { "$ref": `#/components/schemas/${responses[response].content[format].replace("$", "")}`}};
        }
      }
    }
  }

  return responses;
}

function craftParametersFromObject(node) {
  // Takes a single endpoint node and returns an object of the parameters
  const params = [];

  for (const param in node.params) {
    params.push({
      "$ref": `#/components/parameters/${param}`
    });
  }

  for (const param in node.manualParams) {
    params.push({
      [param]: node.manualParams[param]
    });
  }

  return params;
}

function constructAndAddParameters() {
  for (const param in queryParameters.schema) {
    spec.components.parameters[queryParameters.schema[param].name] = queryParameters.schema[param];
  }
}

function constructAndAddSchemas() {
  let files = fs.readdirSync(MODEL_DIR_FS);

  // The schemas expect Joi to be globally defined for their test usage.
  // We don't need it here, but we don't want them to error out
  const Joi = require("joi");
  global.Joi = Joi;

  for (const file of files) {
    const content = require(path.join(MODEL_DIR_REQUIRE, file));
    spec.components.schemas[file.replace(".js", "")] = content.schema;
  }
}
