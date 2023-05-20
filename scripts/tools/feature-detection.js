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
const { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT, DB_SSL_CERT } = require("../../src/config.js").getConfig();

const USER_AGENT = "PulsarBot-FeatureDetectionScan;https://github.com/pulsar-edit/package-backend";
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
      console.log("The above output is for testing purposes and has not been written.");
    }
  }
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
        ca: fs.readFileSync(DB_SSL_CERT).toString()
      }
    });
    return sqlStorage;
  } catch(err) {
    console.log(err);
    process.exit(100);
  }
}

async function analyzePackage(repo) {
  // This function preforms the actual checking on any given github repository
  let ownerRepo = findOwnerRepo(repo);

  if (!ownerRepo.ok) {
    console.log(ownerRepo);
    process.exit(1); // TODO this shouldn't crash everything
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
      supportedLanguages: [],
      tech: 'text-mate'|'tree-sitter'
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

  if (grammars.ok && grammars.content.supportedLanguages.length > 0) {
    dataGram.supportedLanguages = grammars.content.supportedLanguages;
  }

  if (grammars.ok && typeof grammars.content.tech === "string" && grammars.content.tech.length > 0) {
    dataGram.grammarTech = grammars.content.tech;
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
    grammarTech: "",
    standard: true // This last item will only appear, if zero other features exist
  }

  Where if one of those is false, or empty, the key will not exist.
  */

  return dataGram;
}

async function isRepoArchived(ownerRepo) {
  try {
    const res = await superagent
      .get(`https://api.github.com/repos/${ownerRepo}`)
      .set({ Authorization: `Bearer ${AUTH}`})
      .set({ "User-Agent": USER_AGENT });

    if (res.status !== 200) {
      return {
        ok: false,
        content: res.status
      };
    }
    if (res.body.archived) {
      return {
        ok: true,
        content: true
      };
    } else {
      return {
        ok: true,
        content: false
      };
    }
  } catch(err) {
    return {
      ok: false,
      content: err
    };
  }
}

async function providesSnippets(ownerRepo) {
  try {
    const res = await superagent
      .get(`https://api.github.com/repos/${ownerRepo}/contents/snippets`)
      .set({ Authorization: `Bearer ${AUTH}`})
      .set({ "User-Agent": USER_AGENT });

    if (res.status === 404) {
      return {
        ok: true,
        content: {
          hasSnippets: false
        }
      };
    }
    if (res.status !== 200) {
      return {
        ok: false,
        content: res.status
      };
    }

    return {
      ok: true,
      content: {
        hasSnippets: true
      }
    };

  } catch(err) {
    return {
      ok: false,
      content: err
    };
  }
}

async function getGrammars(ownerRepo) {
  try {
    const res = await superagent
      .get(`https://api.github.com/repos/${ownerRepo}/contents/grammars`)
      .set({ Authorization: `Bearer ${AUTH}`})
      .set({ "User-Agent": USER_AGENT });

    if (res.status === 404) {
      return {
        ok: true,
        content: {
          hasGrammar: false
        }
      };
    }
    if (res.status !== 200) {
      return {
        ok: false,
        content: res.status
      };
    }

    // If this resolved this means the `grammars` folder does exist.
    // We then have an array of objects to look at for file names
    let supportedLanguages = [];
    let tech;

    for (let i = 0; i < res.body.length; i++) {
      const resInner = await superagent
        .get(`https://api.github.com/repos/${ownerRepo}/contents/grammars/${res.body[i].name}`)
        .set({ Authorization: `Bearer ${AUTH}`})
        .set({ "User-Agent": USER_AGENT });

      if (resInner.status !== 200) {
        continue;
      }

      // Otherwise we should hopefully have a base64 encoded file
      if (typeof resInner.body.encoding !== "string") {
        continue;
      }

      let file = Buffer.from(resInner.body.content, resInner.body.encoding).toString();
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

      if (typeof data?.type === "string" && data?.type === "tree-sitter") {
        tech = "tree-sitter";
      } else {
        tech = "text-mate";
      }
    }

    return {
      ok: true,
      content: {
        hasGrammar: true,
        supportedLanguages: supportedLanguages,
        tech: tech
      }
    };

  } catch(err) {
    return {
      ok: false,
      content: err
    };
  }
}

function findOwnerRepo(repo) {
  const reg = /(?=(https:\/\/(?:www\.)?github\.com\/|git@github\.com:))\1(?=((?:[\w\-\.]+)\/(?:[\w\-\.]+)))\2/;
  const res = repo.match(reg);

  if (res === null || res?.length !== 3) {
    return {
      ok: false
    };
  }

  return {
    ok: true,
    content: res[2].replace(/\.git$/, "")
  };
}

init(process.argv.slice(2));
