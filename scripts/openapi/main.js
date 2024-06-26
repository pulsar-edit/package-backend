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
const HEADER_MAP = require("./header-map.js");
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
    description:
      "Allows for the management, viewing, and downloading of packages and themes for use within the Pulsar editor.",
    // ^^ Could use packageJSON.description
    license: {
      name: "MIT",
      identifier: "MIT",
    },
  },
  servers: [
    {
      url: "https://api.pulsar-edit.dev",
      description: "Production Server",
    },
    {
      url: "http://localhost:8080",
      description: "Locally hosted development server",
    },
  ],
};

// With our initial setup done, let's add our paths onto the schema
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
  sortKeys: true,
});

fs.writeFileSync(SPEC_LOC, specFile, { encoding: "utf8" });

function constructAndAddPaths() {
  for (const node of endpoints) {
    for (const ePath of node.endpoint.paths) {
      spec.paths[createPathString(ePath)] = {
        [node.endpoint.method.toLowerCase()]: {
          ...(typeof node.docs.summary === "string" && {
            summary: node.docs.summary,
          }),
          ...(typeof node.docs.description === "string" && {
            description: node.docs.description,
          }),
          ...(node.docs.deprecated && { deprecated: true }),
          responses: craftResponsesFromObject(node),
          parameters: craftParametersFromObject(node),
        },
      };

      // Now with the path added, lets add our options info
      spec.paths[createPathString(ePath, { noClobber: false })].options = {
        responses: {
          204: {
            description: "The options response for this endpoint.",
            headers: craftHeadersFromObject(node.endpoint.options),
          },
        },
      };
    }
  }
}

function createPathString(ePath, { noClobber = true } = {}) {
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

  if (spec.paths[output] && noClobber) {
    // Since some endpoints use the same URl with different methods
    // when we add them to an object like this the last one added will overwrite
    // the others sharing the same path.
    // So we will add whitespace to the end of the path here if we find that
    // the path has already been added.

    // We will add a whitespace here over and over to ensure we don't clobber
    // any existing paths
    while (spec.paths[output]) {
      console.log(`Added non-clobbering whitespace to: '${output}'`);
      output += " ";
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
        if (
          typeof responses[response].content[format] === "string" &&
          responses[response].content[format].startsWith("$")
        ) {
          // The string value of the format entry begins with "$" so we will want to replace
          // it's content with either a reference to the object schema, or directly with the schema
          responses[response].content[format] = {
            schema: {
              $ref: `#/components/schemas/${responses[response].content[
                format
              ].replace("$", "")}`,
            },
          };
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
      $ref: `#/components/parameters/${param}`,
    });
  }

  for (const param in node.manualParams) {
    params.push(node.manualParams[param]);
  }

  return params;
}

function craftHeadersFromObject(obj) {
  // Unlike most other craft functions, we are directly handed the `options` obj
  // from the endpoint. Meaning we just have a list of objects that we want to
  // return information for.

  let headers = {};

  for (const opt in obj) {
    headers[opt] = {
      description: getDataForHeader("desc", opt),
      schema: {
        type: getDataForHeader("schema", opt),
      },
    };
  }

  return headers;
}

function constructAndAddParameters() {
  for (const param in queryParameters.schema) {
    spec.components.parameters[param] = queryParameters.schema[param];
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

function getDataForHeader(type, header) {
  // This function simply returns string values for the 'type' of info requested.

  if (type !== "schema" && type !== "desc") {
    console.log(`getDataForHeader() Called with invalid type: '${type}'`);
    return "";
  }

  let returnInfo = HEADER_MAP[header]?.[type] ?? "";

  if (returnInfo.length === 0) {
    console.log(`Empty header supplied: Header: '${header}' ; Type: '${type}'`);
  }

  return returnInfo;
}
