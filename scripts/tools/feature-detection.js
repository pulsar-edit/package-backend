/**
This tool should only ever have to be run once, to act on existing packages,
meanwhile all future packages, will be acted on during publication.

The purpose of this tool is to analyze existing packages to preform feature detection.
That is to look at the code that exists within a package and determine the features within.
With the main features being the following:

  - Is this a Grammar?
    * What File types does this grammar support
    * What kind of grammar is this? (Tree-Sitter, TextMate)
  - Does this package provide static snippets?
  - Is the repository archived?

There are a few reasons we want to have these questions answered:
  - Knowing if a package is a grammar could potentially allow us to filter requests
    that are only looking for a grammar
  - Knowing the file ending of a package would allow us to make searching for
    a grammar much easier, such as when a file is resolved as a text file within
    Pulsar, Pulsar could then search the backend, to automatically find
    a grammar that would be helpful for that file.
  - Knowing the type of grammar would allow us to add badges of this information
  - With snippets we could also then allow easy searching of packages that provide
    snippets.
  - Knowing if a repository is archived would allow us to badge it appropriately.


*/
const AUTH = "REDACTED"; // DO NOT COMMIT
const fs = require("fs");
const postgres = require("postgres");
const superagent = require("superagent");
const cson = require("cson"); // Using this tool requires CSON to be installed globally
const { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT, DB_SSL_CERT } =
  require("../../src/config.js").getConfig();
const featuresFound = require("./features_found.json");

const USER_AGENT =
  "PulsarBot-FeatureDetectionScan;https://github.com/pulsar-edit/package-backend";
let RATE_LIMIT_REMAINING = 201;
const UNUSED_RATE_LIMIT = 200;
let sqlStorage;

async function init(params) {
  sqlStorage ??= setupSQL();

  for (const param of params) {
    if (param.startsWith("repo=")) {
      // Only used for testing
      let repo = param.replace("repo=", "");
      // We only want to search for a single package
      let dataGram = await analyzePackage(repo);
      console.log(dataGram);
      console.log(
        "The above output is for testing purposes and has not been written."
      );
      process.exit(1);
    }
  }

  // Now to do the real work of this tool
  const allPointers = await getPointers();
  const totalPointers = allPointers.length;
  let pointerCount = 0;
  let results = [];
  let archivedPackages = [];
  let brokenPackages = [];

  for await (const pointer of allPointers) {
    try {
      console.log(`Checking: ${pointer.name}::${pointer.pointer}`);
      console.log(`\r[${pointerCount}/${totalPointers}] Packages Checked...`);
      pointerCount++;

      if (RATE_LIMIT_REMAINING < UNUSED_RATE_LIMIT) {
        console.log(
          `Exiting any and all feature checks because we have hit our unused rate limit of ${UNUSED_RATE_LIMIT} with ${RATE_LIMIT_REMAINING} api hits left.`
        );
        break;
      } else {
        console.log(`Rate Limit Remaining: ${RATE_LIMIT_REMAINING}`);
      }

      if (featuresFound.includes(pointer.pointer)) {
        console.log("Package already checked previously...");
        continue;
      }

      if (typeof pointer.name !== "string") {
        console.log(
          `The package ${pointer.name}::${pointer.pointer} is invalid without it's name!`
        );
        results.push(
          `The package ${pointer.name}::${pointer.pointer} is invalid without it's name!`
        );
        continue;
      }
      if (typeof pointer.pointer !== "string") {
        console.log(
          `The package ${pointer.name}::${pointer.pointer} likely has been deleted.`
        );
        results.push(
          `The package ${pointer.name}::${pointer.pointer} likely has been deleted.`
        );
        continue;
      }

      /**
       * 1. We need to get the `repo` to pass to analyzePackage to find all available features.
       * 2. We need to take those features and pass it to applyFeatures along with
       * the featuresObj, package name, and package version.
       * 3. Then start again
       */

      let pack = await getPackageData(pointer.pointer);

      if (!pack.ok) {
        console.log(`Failed to check: ${pointer.name}::${pointer.pointer}`);
        console.log(pack);
        results.push(pack);
        continue;
      }

      let featureObj = await analyzePackage(pack.content.data.repository.url);

      // Since we seem to have more invalid packages than originall thought,
      // we will do a quick validity check here to see if this data exists
      if (typeof pack.content?.data?.metadata?.version === "undefined") {
        brokenPackages.push(`${pointer.name}::${pointer.pointer}`);
        continue;
      }

      console.log(
        `${pointer.name}::${pointer.pointer} v${pack.content.data.metadata.version} feature below:`
      );
      console.log(featureObj);

      if (!featureObj.ok) {
        console.log(
          `Failed to analyze Package: ${pointer.name}::${pointer.pointer}`
        );
        results.push(
          `Failed to analyze Package: ${pointer.name}::${pointer.pointer}`
        );
        results.push(featureObj);
        continue;
      }

      // Since the feature object doesn't apply the archived status we will save it for later
      if (featureObj.isRepoArchived) {
        archivedPackages.push(`${pointer.name}::${pointer.pointer}`);
      }

      let apply = await applyFeatures(
        featureObj.content,
        pointer.name,
        pack.content.data.metadata.version
      );

      if (!apply.ok) {
        console.log("Applying our package data was not okay");
        console.log(apply);
        results.push(apply.content);
        continue;
      }

      results.push(
        `${pointer.name}::${pointer.pointer} Handled features successfully!`
      );

      featuresFound.push(pointer.pointer);
    } catch (err) {
      console.log(err);
      break;
    }
  }

  console.log(results);
  fs.writeFileSync(
    `${__dirname}/features_found.json`,
    JSON.stringify(featuresFound, null, 2)
  );
  fs.writeFileSync(
    `${__dirname}/archived_packages.json`,
    JSON.stringify(archivedPackages, null, 2)
  );
  fs.writeFileSync(
    `${__dirname}/broken_packages.json`,
    JSON.stringify(brokenPackages, null, 2)
  );
  await sqlEnd();
  process.exit(0);
}

function setupSQL() {
  try {
    sqlStorage = postgres({
      host: DB_HOST,
      username: DB_USER,
      password: DB_PASS,
      database: DB_DB,
      port: DB_PORT,
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(DB_SSL_CERT).toString(),
      },
    });
    return sqlStorage;
  } catch (err) {
    console.log(err);
    process.exit(100);
  }
}

async function getPointers() {
  sqlStorage ??= setupSQL();

  const command = await sqlStorage`
    SELECT * FROM names;
  `;

  if (command.count === 0) {
    console.log("Failed to get all package pointers.");
    await sqlEnd();
    process.exit(1);
  }
  return command;
}

async function sqlEnd() {
  if (sqlStorage !== undefined) {
    await sqlStorage.end();
    console.log("SQL Server Disconnected!");
  }
  return;
}

async function getPackageData(pointer) {
  sqlStorage ??= setupSQL();

  const command = await sqlStorage`
    SELECT * from packages
    WHERE pointer = ${pointer}
  `;

  if (command.count === 0) {
    return { ok: false, content: `Failed to get package data of ${pointer}` };
  }
  return { ok: true, content: command[0] };
}

async function applyFeatures(featureObj, packName, packVersion) {
  try {
    sqlStorage ??= setupSQL();

    const packID = await getPackageByNameSimple(packName);

    if (!packID.ok) {
      return {
        ok: false,
        content: `Unable to find the pointer of ${packName}`,
        short: "Not Found",
      };
    }

    const pointer = packID.content.pointer;

    if (featureObj.hasSnippets) {
      const addSnippetCommand = await sqlStorage`
        UPDATE versions
        SET has_snippets = TRUE
        WHERE package = ${pointer} AND semver = ${packVersion};
      `;

      if (addSnippetCommand.count === 0) {
        return {
          ok: false,
          content: `Unable to set 'has_snippets' flag to true for ${packName}`,
          short: "Server Error",
        };
      }
    }

    if (featureObj.hasGrammar) {
      const addGrammarCommand = await sqlStorage`
        UPDATE versions
        SET has_grammar = TRUE
        WHERE package = ${pointer} AND semver = ${packVersion}
      `;

      if (addGrammarCommand.count === 0) {
        return {
          ok: false,
          content: `Unable to set 'has_grammar' flag to true for ${packName}`,
          short: "Server Error",
        };
      }
    }

    if (
      Array.isArray(featureObj.supportedLanguages) &&
      featureObj.supportedLanguages.length > 0
    ) {
      const addLangCommand = await sqlStorage`
        UPDATE versions
        SET supported_languages = ${featureObj.supportedLanguages}
        WHERE package = ${pointer} AND semver = ${packVersion};
      `;

      if (addLangCommand.count === 0) {
        return {
          ok: false,
          content: `Unable to add supportedLanguages to ${packName}`,
          short: "Server Error",
        };
      }
    }
    console.log(`Applied changes to ${packName}`);
    return {
      ok: true,
    };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err.toString(),
    };
  }
}

async function getPackageByNameSimple(name) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT pointer FROM names
      WHERE name = ${name};
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Package ${name} not found`,
          short: "Not Found",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err.toString(),
    };
  }
}

async function analyzePackage(repo) {
  // This function preforms the actual checking on any given github repository

  if (typeof repo !== "string") {
    return {
      ok: false,
      content: "repo is not a string",
    };
  }
  let ownerRepo = findOwnerRepo(repo);

  if (!ownerRepo.ok) {
    return {
      ok: false,
      content: ownerRepo,
    };
  }

  let archivedRepo = await isRepoArchived(ownerRepo.content);
  // archivedRepo is a simple true or false
  let grammars = await getGrammars(ownerRepo.content);
  /*
  The Grammars data returned will look like:
  {
    ok: true,
    content: {
      hasGrammar: true|false,
      supportedLanguages: []
    }
  }
  */

  let snippets = await providesSnippets(ownerRepo.content);
  /*
  The snippets data returned will look like:
  {
    ok: true|false,
    content: {
      hasSnippets: true|false
    }
  }
  */

  let dataGram = {};

  if (snippets.ok && snippets.content.hasSnippets) {
    dataGram.hasSnippets = true;
  }

  if (grammars.ok && grammars.content.hasGrammar) {
    dataGram.hasGrammar = true;
  }

  if (
    grammars.ok &&
    grammars.content.hasGrammar &&
    grammars.content?.supportedLanguages.length > 0
  ) {
    dataGram.supportedLanguages = grammars.content.supportedLanguages;
  }

  if (archivedRepo.ok && archivedRepo.content) {
    dataGram.isRepoArchived = true;
  }

  // Keep at last position
  if (Object.keys(dataGram).length === 0) {
    dataGram.standard = true;
    // We only apply the standard variable, if this package contains zero other features
  }

  /*
  Now dataGram contains all data we care about for this package.
  Only including the fields for which it has valid data.
  In the following format:
  {
    hasSnippets: true,
    hasGrammar: true,
    isRepoArchived: true,
    supportedLanguages: [],
    standard: true // This last item will only appear, if zero other features exist
  }

  Where if one of those is false, or empty, the key will not exist.
  */

  return {
    ok: true,
    content: dataGram,
  };
}

async function contactGitHub(url) {
  try {
    const acceptableStatusCodes = [200, 404];
    console.log(`Pinging: ${url}`);
    const res = await superagent
      .get(url)
      .set({ Authorization: `Bearer ${AUTH}` })
      .set({ "User-Agent": USER_AGENT })
      .ok((res) => acceptableStatusCodes.includes(res.status));

    RATE_LIMIT_REMAINING = parseInt(res.headers["x-ratelimit-remaining"]);

    return res;
  } catch (err) {
    console.log(err);
    process.exit(0);
  }
}

async function isRepoArchived(ownerRepo) {
  try {
    const res = await contactGitHub(
      `https://api.github.com/repos/${ownerRepo}`
    );

    if (res.status !== 200) {
      return {
        ok: false,
        content: res.status,
      };
    }
    if (res.body.archived) {
      return {
        ok: true,
        content: true,
      };
    } else {
      return {
        ok: true,
        content: false,
      };
    }
  } catch (err) {
    return {
      ok: false,
      content: err,
    };
  }
}

async function providesSnippets(ownerRepo) {
  try {
    const res = await contactGitHub(
      `https://api.github.com/repos/${ownerRepo}/contents/snippets`
    );

    if (res.status === 404) {
      return {
        ok: true,
        content: {
          hasSnippets: false,
        },
      };
    }
    if (res.status !== 200) {
      return {
        ok: false,
        content: res.status,
      };
    }

    return {
      ok: true,
      content: {
        hasSnippets: true,
      },
    };
  } catch (err) {
    return {
      ok: false,
      content: err,
    };
  }
}

async function getGrammars(ownerRepo) {
  try {
    const res = await contactGitHub(
      `https://api.github.com/repos/${ownerRepo}/contents/grammars`
    );

    if (res.status === 404) {
      return {
        ok: true,
        content: {
          hasGrammar: false,
        },
      };
    }
    if (res.status !== 200) {
      return {
        ok: false,
        content: res.status,
      };
    }

    // If this resolved this means the `grammars` folder does exist.
    // We then have an array of objects to look at for file names
    let supportedLanguages = [];

    for (let i = 0; i < res.body.length; i++) {
      const resInner = await contactGitHub(
        `https://api.github.com/repos/${ownerRepo}/contents/grammars/${encodeURIComponent(
          res.body[i].name
        )}`
      );

      if (resInner.status !== 200) {
        continue;
      }

      // Otherwise we should hopefully have a base64 encoded file
      if (typeof resInner.body.encoding !== "string") {
        continue;
      }

      let file = Buffer.from(
        resInner.body.content,
        resInner.body.encoding
      ).toString();
      let data;

      if (resInner.body.name.endsWith(".json")) {
        data = JSON.parse(file);
      } else if (resInner.body.name.endsWith(".cson")) {
        data = cson.parseCSONString(file);
      }

      if (Array.isArray(data.fileTypes)) {
        for (let i = 0; i < data.fileTypes.length; i++) {
          supportedLanguages.push(data.fileTypes[i]);
        }
      }
    }

    return {
      ok: true,
      content: {
        hasGrammar: true,
        supportedLanguages: supportedLanguages,
      },
    };
  } catch (err) {
    return {
      ok: false,
      content: err,
    };
  }
}

function findOwnerRepo(repo) {
  const reg =
    /(?=(https:\/\/(?:www\.)?github\.com\/|git@github\.com:))\1(?=((?:[\w\-\.]+)\/(?:[\w\-\.]+)))\2/;
  const res = repo.match(reg);

  if (res === null || res?.length !== 3) {
    return {
      ok: false,
    };
  }

  return {
    ok: true,
    content: res[2].replace(/\.git$/, ""),
  };
}

init(process.argv.slice(2));
