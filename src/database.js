/**
 * @module database
 * @desc Provides an interface of a large collection of functions to interact
 * with and retrieve data from the cloud hosted database instance.
 */

const fs = require("fs");
const postgres = require("postgres");
const storage = require("./storage.js");
const utils = require("./utils.js");
const logger = require("./logger.js");
const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_DB,
  DB_PORT,
  DB_SSL_CERT,
  paginated_amount,
} = require("./config.js").getConfig();

const defaultEngine = { atom: "*" };
const defaultLicense = "NONE";

let sqlStorage; // SQL object, to interact with the DB.
// It is set after the first call with logical nullish assignment
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_nullish_assignment

/**
 * @function setupSQL
 * @desc Initialize the connection to the PostgreSQL database.
 * In order to avoid the initialization multiple times,
 * the logical nullish assignment (??=) can be used in the caller.
 * Exceptions thrown here should be caught and handled in the caller.
 * @returns {object} PostgreSQL connection object.
 */
function setupSQL() {
  return process.env.PULSAR_STATUS === "dev" && process.env.MOCK_DB !== "false"
    ? postgres({
        host: DB_HOST,
        username: DB_USER,
        database: DB_DB,
        port: DB_PORT,
      })
    : postgres({
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
}

/**
 * @function shutdownSQL
 * @desc Ensures any Database connection is properly, and safely closed before exiting.
 */
async function shutdownSQL() {
  if (sqlStorage !== undefined) {
    sqlStorage.end();
    logger.generic(1, "SQL Server Shutdown!");
  }
}

/**
 * @async
 * @function packageNameAvailability
 * @desc Determines if a name is ready to be used for a new package. Useful in the stage of the publication
 * of a new package where checking if the package exists is not enough because a name could be not
 * available if a deleted package was using it in the past.
 * Useful also to check if a name is available for the renaming of a published package. 
 * This function simply checks if the provided name is present in "names" table.
 * @param {string} name - The candidate name for a new package.
 * @returns {object} A Server Status Object.
 */
async function packageNameAvailability(name) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT name FROM names
      WHERE name = ${name};
    `;

    return command.count === 0
      ? { ok: true, content: `${name} is available to be used for a new package.` }
      : {
          ok: false,
          content: `${name} is not available to be used for a new package.`,
          short: "Not Found",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}


/**
 * @async
 * @function insertNewPackage
 * @desc Insert a new package inside the DB taking a `Server Object Full` as argument.
 * @param {object} pack - The `Server Object Full` package.
 * @returns {object} A Server Status Object.
 */
async function insertNewPackage(pack) {
  sqlStorage ??= setupSQL();

  // Since this operation involves multiple queries, we perform a
  // PostgreSQL transaction executing a callback on begin().
  // All data is committed into the database only if no errors occur.
  return await sqlStorage
    .begin(async (sqlTrans) => {
      const packData = {
        name: pack.name,
        repository: pack.repository,
        readme: pack.readme,
        metadata: pack.metadata,
      };
      const packageType =
        typeof pack.metadata.themes === "string" &&
        pack.metadata.themes.match(/^(?:themes|ui)$/i) !== null
          ? "theme"
          : "package";

      // Populate packages table
      let pointer = null;
      let insertNewPack = {};
      try {
        // No need to specify downloads and stargazers. They default at 0 on creation.
        insertNewPack = await sqlTrans`
          INSERT INTO packages (name, creation_method, data, package_type)
          VALUES (${pack.name}, ${pack.creation_method}, ${packData}, ${packageType})
          RETURNING pointer;
      `;
      } catch (e) {
        throw `A constraint has been violated while inserting ${pack.name} in packages table.`;
      }

      if (!insertNewPack?.count) {
        throw `Cannot insert ${pack.name} in packages table`;
      }

      // Retrieve package pointer
      pointer = insertNewPack[0].pointer;

      // Populate names table
      let insertNewName = {};
      try {
        insertNewName = await sqlTrans`
          INSERT INTO names (name, pointer)
          VALUES (${pack.name}, ${pointer})
          RETURNING name;
      `;
      } catch (e) {
        throw `A constraint has been violated while inserting ${pack.name} in names table`;
      }

      if (!insertNewName?.count) {
        throw `Cannot insert ${pack.name} in names table`;
      }

      // git.createPackage() executed before this function ensures
      // the latest version is correctly selected.
      const latest = pack.releases.latest;

      // Populate versions table
      let versionCount = 0;
      const pv = pack.versions;
      for (const ver of Object.keys(pv)) {
        const status = ver === latest ? "latest" : "published";

        // Since many packages don't define an engine field,
        // we will do it for them if not present,
        // following suit with what Atom internal packages do.
        const engine = pv[ver].engines ?? defaultEngine;

        // It's common practice for packages to not specify license,
        // therefore set it as NONE if undefined.
        const license = pv[ver].license ?? defaultLicense;

        let insertNewVersion = {};
        try {
          insertNewVersion = await sqlTrans`
            INSERT INTO versions (package, status, semver, license, engine, meta)
            VALUES (${pointer}, ${status}, ${ver}, ${license}, ${engine}, ${pv[ver]})
            RETURNING id;
        `;
        } catch (e) {
          throw `A constraint is violated while inserting ${ver} version for ${pack.name} in versions table`;
        }

        if (!insertNewVersion?.count) {
          throw `Cannot insert ${ver} version for ${pack.name} package in versions table`;
        }
        versionCount++;
      }

      if (versionCount === 0) {
        throw `${pack.name} package does not contain any version.`;
      }

      return { ok: true, content: pointer };
    })
    .catch((err) => {
      return typeof err === "string"
        ? { ok: false, content: err, short: "Server Error" }
        : {
            ok: false,
            content: `A generic error occurred while inserting ${pack.name} package`,
            short: "Server Error",
            error: err,
          };
    });
}

/**
 * @async
 * @function insertNewPackageVersion
 * @desc Adds a new package version to the db.
 * @param {object} packJSON - A full `package.json` file for the wanted version.
 * @param {string|null} oldName - If provided, the old name to be replaced for the renaming of the package.
 * @returns {object} A server status object.
 */
async function insertNewPackageVersion(packJSON, packageData, oldName = null) {
  sqlStorage ??= setupSQL();

  // We are expected to receive a standard `package.json` file.
  // Note that, if oldName is provided, here we can be sure oldName !== packJSON.name
  // because the comparison has been already done in postPackagesVersion()
  return await sqlStorage
    .begin(async (sqlTrans) => {
      const rename = typeof oldName === "string";

      // On renaming, search the package pointer using the oldName,
      // otherwise use the name in the package object directly.
      let packName = rename ? oldName : packJSON.name;

      const packID = await getPackageByNameSimple(packName);

      if (!packID.ok) {
        return packID;
      }

      const pointer = packID.content.pointer;

      if (rename) {
        // The flow for renaming the package.
        // Before inserting the new name, we try to update it into the `packages` table
        // since we want that column to contain the current name.
        let updateNewName = {};
        try {
          updateNewName = await sqlTrans`
            UPDATE packages
            SET name = ${packJSON.name}
            WHERE pointer = ${pointer}
            RETURNING name;
          `;
        } catch (e) {
          throw `Unable to update the package name. ${packJSON.name} is already used by another package.`;
        }

        if (!updateNewName?.count) {
          throw `Unable to update the package name.`;
        }

        // Now we can finally insert the new name inside the `names` table.
        let newInsertedName = {};
        try {
          newInsertedName = await sqlTrans`
            INSERT INTO names
            (name, pointer) VALUES
            (${packJSON.name}, ${pointer})
            RETURNING name;
          `;
        } catch (e) {
          throw `Unable to add the new name: ${packJSON.name} is already used.`;
        }

        if (!newInsertedName?.count) {
          throw `Unable to add the new name: ${packJSON.name}`;
        }

        // After renaming, we can use packJSON.name as the package name.
        packName = packJSON.name;
      }

      // Here we need to check if the current latest version is lower than the new one
      // which we want to publish.
      const latestVersion = await sqlTrans`
        SELECT id, status, semver
        FROM versions
        WHERE package = ${pointer} AND status = 'latest';
      `;

      if (latestVersion.count === 0) {
        throw `There is no current latest version for ${packName}. The package is broken.`;
      }

      const higherSemver = utils.semverGt(
        utils.semverArray(packJSON.version),
        utils.semverArray(latestVersion[0].semver)
      );
      if (!higherSemver) {
        throw `Cannot publish a new version with semver lower or equal than the current latest one.`;
      }

      // The new version can be published. First switch the current "latest" to "published".
      const updateLastVer = await sqlTrans`
        UPDATE versions
        SET status = 'published'
        WHERE id = ${latestVersion[0].id}
        RETURNING semver, status;
      `;

      if (updateLastVer.count === 0) {
        throw `Unable to modify last published version ${packName}`;
      }

      // Then update the package object in the related column of packages table.
      const updatePackageData = await sqlTrans`
        UPDATE packages
        SET data = ${packageData}
        WHERE pointer = ${pointer}
        RETURNING name;
      `;

      if (updatePackageData.count === 0) {
        throw `Unable to update the full package object of the new version ${packName}`;
      }

      // We can finally insert the new latest version.
      const license = packJSON.license ?? defaultLicense;
      const engine = packJSON.engines ?? defaultEngine;

      let addVer = {};
      try {
        addVer = await sqlTrans`
          INSERT INTO versions (package, status, semver, license, engine, meta)
          VALUES(${pointer}, 'latest', ${packJSON.version}, ${license}, ${engine}, ${packJSON})
          RETURNING semver, status;
        `;
      } catch (e) {
        // This occurs when the (package, semver_vx) unique constraint is violated.
        throw `Not allowed to publish a version previously deleted for ${packName}`;
      }

      if (!addVer?.count) {
        throw `Unable to create a new version for ${packName}`;
      }

      return {
        ok: true,
        content: `Successfully added new version: ${packName}@${packJSON.version}`,
      };
    })
    .catch((err) => {
      return typeof err === "string"
        ? { ok: false, content: err, short: "Server Error" }
        : {
            ok: false,
            content: `A generic error occured while inserting the new package version ${packJSON.name}`,
            short: "Server Error",
            error: err,
          };
    });
}

/**
 * @async
 * @function insertNewPackageName
 * @desc Insert a new package name with the same pointer as the old name.
 * This essentially renames an existing package.
 * @param {string} newName - The new name to create in the DB.
 * @param {string} oldName - The original name of which to use the pointer of.
 * @returns {object} A server status object.
 * @todo This function has been left only for testing purpose since it has been integrated
 * inside insertNewPackageVersion, so it should be removed when we can test the rename process
 * directly on the endpoint.
 */
async function insertNewPackageName(newName, oldName) {
  sqlStorage ??= setupSQL();

  return await sqlStorage
    .begin(async (sqlTrans) => {
      // Retrieve the package pointer
      const packID = await getPackageByNameSimple(oldName);

      if (!packID.ok) {
        // Return Not Found
        return {
          ok: false,
          content: `Unable to find the original pointer of ${oldName}`,
          short: "Not Found",
        };
      }

      const pointer = packID.content.pointer;

      // Before inserting the new name, we try to update it into the `packages` table
      // since we want that column to contain the current name.
      try {
        const updateNewName = await sqlTrans`
          UPDATE packages
          SET name = ${newName}
          WHERE pointer = ${pointer}
          RETURNING name;
        `;

        if (updateNewName.count === 0) {
          throw `Unable to update the package name.`;
        }
      } catch (e) {
        throw `Unable to update the package name. ${newName} is already used by another package.`;
      }

      // Now we can finally insert the new name inside the `names` table.
      try {
        const newInsertedName = await sqlTrans`
          INSERT INTO names
          (name, pointer) VALUES
          (${newName}, ${pointer})
          RETURNING name;
        `;

        if (newInsertedName.count === 0) {
          throw `Unable to add the new name: ${newName}`;
        }
      } catch (e) {
        throw `Unable to add the new name: ${newName} is already used.`;
      }

      return { ok: true, content: `Successfully inserted ${newName}.` };
    })
    .catch((err) => {
      return typeof err === "string"
        ? { ok: false, content: err, short: "Server Error" }
        : {
            ok: false,
            content: `A generic error occurred while inserting the new package name ${newName}`,
            short: "Server Error",
            error: err,
          };
    });
}

/**
 * @async
 * @function insertNewUser
 * @desc Insert a new user into the database.
 * @param {string} username - Username of the user.
 * @param {object} id - Identifier code of the user.
 * @param {object} avatar - The avatar of the user.
 * @returns {object} A server status object.
 */
async function insertNewUser(username, id, avatar) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      INSERT INTO users (username, node_id, avatar)
      VALUES (${username}, ${id}, ${avatar})
      RETURNING *;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to create user: ${user}`,
          short: "Server Error",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function getPackageByName
 * @desc Takes a package name and returns the raw SQL package with all its versions.
 * This module is also used to get the data to be sent to utils.constructPackageObjectFull()
 * in order to convert the query result in Package Object Full format.
 * In that case it's recommended to set the user flag as true for security reasons.
 * @param {string} name - The name of the package.
 * @param {bool} user - Whether the packages has to be exposed outside or not.
 * If true, all sensitive data like primary and foreign keys are not selected.
 * Even if the keys are ignored by utils.constructPackageObjectFull(), it's still
 * safe to not inclue them in case, by mistake, we publish the return of this module.
 * @returns {object} A server status object.
 */
async function getPackageByName(name, user = false) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT
        ${
          user ? sqlStorage`` : sqlStorage`p.pointer,`
        } p.name, p.created, p.updated, p.creation_method, p.downloads,
        (p.stargazers_count + p.original_stargazers) AS stargazers_count, p.data,
        JSONB_AGG(
          JSON_BUILD_OBJECT(
            ${
              user
                ? sqlStorage``
                : sqlStorage`'id', v.id, 'package', v.package,`
            } 'status', v.status, 'semver', v.semver,
            'license', v.license, 'engine', v.engine, 'meta', v.meta
          )
          ORDER BY v.semver_v1 DESC, v.semver_v2 DESC, v.semver_v3 DESC
        ) AS versions
      FROM packages p
        INNER JOIN names n ON (p.pointer = n.pointer AND n.name = ${name})
        INNER JOIN versions v ON (p.pointer = v.package AND v.status != 'removed')
      GROUP BY p.pointer, v.package;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `package ${name} not found.`,
          short: "Not Found",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function getPackageByNameSimple
 * @desc Internal util used by other functions in this module to get the package row by the given name.
 * It's like getPackageByName(), but with a simple and faster query.
 * @param {string} name - The name of the package.
 * @returns {object} A server status object.
 */
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
          content: `Package ${name} not found.`,
          short: "Not Found",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function getPackageVersionByNameAndVersion
 * @desc Uses the name of a package and it's version to return the version info.
 * @param {string} name - The name of the package to query.
 * @param {string} version - The version of the package to query.
 * @returns {object} A server status object.
 */
async function getPackageVersionByNameAndVersion(name, version) {
  try {
    sqlStorage ??= setupSQL();

    // We are permissive on the right side of the semver, so if it's stored with an extension
    // we can still get it retrieving the semverArray and looking by semver_vx generated columns.
    const svArr = utils.semverArray(version);
    if (svArr === null) {
      return {
        ok: false,
        content: `Provided version ${version} is not a valid semver.`,
        short: "Not Found",
      };
    }

    const command = await sqlStorage`
      SELECT v.semver, v.status, v.license, v.engine, v.meta
      FROM packages p
        INNER JOIN names n ON (p.pointer = n.pointer AND n.name = ${name})
        INNER JOIN versions v ON (p.pointer = v.package AND v.semver_v1 = ${svArr[0]} AND
          v.semver_v2 = ${svArr[1]} AND v.semver_v3 = ${svArr[2]} AND v.status != 'removed');
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Package ${name} and Version ${version} not found.`,
          short: "Not Found",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function getPackageCollectionByName
 * @desc Takes a package name array, and returns an array of the package objects.
 * You must ensure that the packArray passed is compatible. This function does not coerce compatibility.
 * @param {string[]} packArray - An array of package name strings.
 * @returns {object} A server status object.
 */
async function getPackageCollectionByName(packArray) {
  try {
    sqlStorage ??= setupSQL();

    // Since this function is invoked by getFeaturedThemes and getFeaturedPackages
    // which process the returned content with constructPackageObjectShort(),
    // we select only the needed columns.
    const command = await sqlStorage`
      SELECT p.data, p.downloads, (p.stargazers_count + p.original_stargazers) AS stargazers_count, v.semver
      FROM packages p
        INNER JOIN names n ON (p.pointer = n.pointer AND n.name IN ${sqlStorage(
          packArray
        )})
        INNER JOIN versions v ON (p.pointer = v.package AND v.status = 'latest');
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : { ok: false, content: "No packages found.", short: "Not Found" };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function getPackageCollectionByID
 * @desc Takes a package pointer array, and returns an array of the package objects.
 * @param {int[]} packArray - An array of package id.
 * @returns {object} A server status object.
 */
async function getPackageCollectionByID(packArray) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT data
      FROM packages AS p
        INNER JOIN versions AS v ON (p.pointer = v.package AND v.status = 'latest')
      WHERE pointer IN ${sqlStorage(packArray)}
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : { ok: false, content: "No packages found.", short: "Not Found" };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function updatePackageStargazers
 * @description Uses the package name (or pointer if provided) to update its stargazers count.
 * @param {string} name - The package name.
 * @param {string} pointer - The package id (if given, the search by name is skipped).
 * @returns {object} The effected server status object.
 */
async function updatePackageStargazers(name, pointer = null) {
  try {
    sqlStorage ??= setupSQL();

    if (pointer === null) {
      const packID = await getPackageByNameSimple(name);

      if (!packID.ok) {
        return packID;
      }

      pointer = packID.content.pointer;
    }

    const countStars = await sqlStorage`
      SELECT COUNT(*) AS stars
      FROM stars
      WHERE package = ${pointer};
    `;

    const starCount = countStars.count !== 0 ? countStars[0].stars : 0;

    const updateStar = await sqlStorage`
      UPDATE packages
      SET stargazers_count = ${starCount}
      WHERE pointer = ${pointer}
      RETURNING name, downloads, (stargazers_count + original_stargazers) AS stargazers_count, data;
    `;

    return updateStar.count !== 0
      ? { ok: true, content: updateStar[0] }
      : {
          ok: false,
          content: "Unable to Update Package Stargazers",
          short: "Server Error",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function updatePackageIncrementDownloadByName
 * @description Uses the package name to increment the download count by one.
 * @param {string} name - The package name.
 * @returns {object} The modified server status object.
 */
async function updatePackageIncrementDownloadByName(name) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      UPDATE packages p
      SET downloads = p.downloads + 1
      FROM names n
      WHERE n.pointer = p.pointer AND n.name = ${name}
      RETURNING p.name, p.downloads, p.data;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: "Unable to Update Package Download",
          short: "Server Error",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function updatePackageDecrementDownloadByName
 * @description Uses the package name to decrement the download count by one.
 * @param {string} name - The package name.
 * @returns {object} The modified server status object.
 */
async function updatePackageDecrementDownloadByName(name) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      UPDATE packages p
      SET downloads = GREATEST(p.downloads - 1, 0)
      FROM names n
      WHERE n.pointer = p.pointer AND n.name = ${name}
      RETURNING p.name, p.downloads, p.data;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: "Unable to decrement Package Download Count",
          short: "Server Error",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function removePackageByName
 * @description Given a package name, removes its record alongside its names, versions, stars.
 * @param {string} name - The package name.
 * @returns {object} A server status object.
 */
async function removePackageByName(name) {
  sqlStorage ??= setupSQL();

  return await sqlStorage
    .begin(async (sqlTrans) => {
      // Retrieve the package pointer
      const packID = await getPackageByNameSimple(name);

      if (!packID.ok) {
        // The package does not exists, but we return ok since it's like
        // it has been deleted.
        return { ok: true, content: `${name} package does not exists.` };
      }

      const pointer = packID.content.pointer;

      // Remove versions of the package
      const commandVers = await sqlTrans`
        DELETE FROM versions
        WHERE package = ${pointer}
        RETURNING semver;
      `;

      if (commandVers.count === 0) {
        throw `Failed to delete any versions for: ${name}`;
      }

      // Remove stars assigned to the package
      await sqlTrans`
        DELETE FROM stars
        WHERE package = ${pointer}
        RETURNING userid;
      `;

      /*if (commandStar.count === 0) {
        // No check on deleted stars because the package could also have 0 stars.
      }*/

      // Remove names related to the package
      const commandName = await sqlTrans`
        DELETE FROM names
        WHERE pointer = ${pointer}
        RETURNING name;
      `;

      if (commandName.count === 0) {
        throw `Failed to delete names for: ${name}`;
      }

      const commandPack = await sqlTrans`
        DELETE FROM packages
        WHERE pointer = ${pointer}
        RETURNING name;
      `;

      if (commandPack.count === 0) {
        // nothing was returning, the delete probably failed
        throw `Failed to Delete Package for: ${name}`;
      }

      if (commandPack[0].name !== name) {
        throw `Attempted to delete ${commandPack[0].name} rather than ${name}`;
      }

      return { ok: true, content: `Successfully Deleted Package: ${name}` };
    })
    .catch((err) => {
      return typeof err === "string"
        ? { ok: false, content: err, short: "Server Error" }
        : {
            ok: false,
            content: `A generic error occurred while inserting ${pack.name} package`,
            short: "Server Error",
            error: err,
          };
    });
}

/**
 * @async
 * @function removePackageVersion
 * @description Mark a version of a specific package as removed. This does not delete the record,
 * just mark the status as removed, but only if one published version remain available.
 * This also makes sure that a new latest version is selected in case the previous one is removed.
 * @param {string} packName - The package name.
 * @param {string} semVer - The version to remove.
 * @returns {object} A server status object.
 */
async function removePackageVersion(packName, semVer) {
  sqlStorage ??= setupSQL();

  return await sqlStorage
    .begin(async (sqlTrans) => {
      // Retrieve the package pointer
      const packID = await getPackageByNameSimple(packName);

      if (!packID.ok) {
        // Return Not Found
        return {
          ok: false,
          content: `Unable to find the pointer of ${packName}`,
          short: "Not Found",
        };
      }

      const pointer = packID.content.pointer;

      const svArr = utils.semverArray(semVer);
      if (svArr === null) {
        return {
          ok: false,
          content: `Provided version ${version} is not a valid semver.`,
          short: "Not Found",
        };
      }

      // Retrieve all non-removed versions sorted from latest to older
      const getVersions = await sqlTrans`
        SELECT id, semver, semver_v1, semver_v2, semver_v3, status
        FROM versions
        WHERE package = ${pointer} AND status != 'removed'
        ORDER BY semver_v1 DESC, semver_v2 DESC, semver_v3 DESC;
      `;

      const versionCount = getVersions.count;
      if (versionCount === 0) {
        throw `No published version available for ${packName} package`;
      }

      // Having all versions, we loop them to find:
      // - the id of the version to remove
      // - if its status is "latest"
      let removeLatest = false;
      let versionId = null;
      for (const v of getVersions) {
        // Type coercion on the following comparisons because semverArray contains strings
        // while PostgreSQL returns versions as integer.
        if (
          v.semver_v1 == svArr[0] &&
          v.semver_v2 == svArr[1] &&
          v.semver_v3 == svArr[2]
        ) {
          versionId = v.id;
          removeLatest = v.status === "latest";
          break;
        }
      }

      if (versionId === null) {
        // Do not use throw here because we specify Not Found reason.
        return {
          ok: false,
          content: `There's no version ${semVer} to remove for ${packName} package`,
          short: "Not Found",
        };
      }

      // We have the version to remove, but for the package integrity we have to make sure that
      // at least one published version is still available after the removal.
      // This is not possible if the version count is only 1.
      if (versionCount === 1) {
        throw `It's not possible to leave the ${packName} without at least one published version`;
      }

      // The package will have published versions, so we can remove the targeted semVer.
      const updateRemovedStatus = await sqlTrans`
        UPDATE versions
        SET status = 'removed'
        WHERE id = ${versionId}
        RETURNING id;
      `;

      if (updateRemovedStatus.count === 0) {
        // Do not use throw here because we specify Not Found reason.
        return {
          ok: false,
          content: `Unable to remove ${semVer} version of ${packName} package.`,
          short: "Not Found",
        };
      }

      if (!removeLatest) {
        // We have removed a published versions and the latest one is still available.
        return {
          ok: true,
          content: `Successfully removed ${semVer} version of ${packName} package.`,
        };
      }

      // We have removed the version with the "latest" status, so now we have to select
      // a new version between the remaining ones which will obtain "latest" status.
      // No need to compare versions here. We have an array ordered from latest to older,
      // just pick the first one not equal to semVer
      let latestVersionId = null;
      let latestSemver = null;
      for (const v of getVersions) {
        if (v.id === versionId) {
          // Skip the removed version
          continue;
        }
        latestVersionId = v.id;
        latestSemver = v.semver;
      }

      if (latestVersionId === null) {
        throw `An error occurred while selecting the highest versions of ${packName}`;
      }

      // Mark the targeted highest version as latest.
      const commandLatest = await sqlTrans`
        UPDATE versions
        SET status = 'latest'
        WHERE id = ${latestVersionId}
        RETURNING id, meta;
      `;

      if (commandLatest.count === 0) {
        return {
          ok: false,
          content: `Unable to remove ${semVer} version of ${packName} package.`,
          short: "Not Found",
        };
      }

      // Let's save the meta data object of the new latest version so
      // we can update it inside the packages table since we use the
      // packages.data column to report the full object of the lastest version.
      const latestDataObject = commandLatest[0].meta;

      const updatePackageData = await sqlTrans`
        UPDATE packages
        SET data = ${latestDataObject}
        WHERE pointer = ${pointer}
        RETURNING name;
      `;

      if (updatePackageData.count === 0) {
        throw `Unable to update the full package object of the new version ${latestSemver}`;
      }

      return {
        ok: true,
        content: `Removed ${semVer} of ${packName} and ${latestSemver} is the new latest version.`,
      };
    })
    .catch((err) => {
      return typeof err === "string"
        ? { ok: false, content: err, short: "Server Error" }
        : {
            ok: false,
            content: `A generic error occurred while inserting ${packName} package`,
            short: "Server Error",
            error: err,
          };
    });
}

/**
 * @async
 * @function getFeaturedPackages
 * @desc Collects the hardcoded featured packages array from the storage.js
 * module. Then uses this.getPackageCollectionByName to retrieve details of the
 * package.
 * @returns {object} A server status object.
 */
async function getFeaturedPackages() {
  let featuredArray = await storage.getFeaturedPackages();

  if (!featuredArray.ok) {
    return featuredArray;
  }

  return await getPackageCollectionByName(featuredArray.content);
}

/**
 * @async
 * @function getFeaturedThemes
 * @desc Collects the hardcoded featured themes array from the storage.js module.
 * Then uses this.getPackageCollectionByName to retrieve details of the package.
 * @returns {object} A server status object.
 */
async function getFeaturedThemes() {
  let featuredThemeArray = await storage.getFeaturedThemes();

  if (!featuredThemeArray.ok) {
    return featuredThemeArray;
  }

  return await getPackageCollectionByName(featuredThemeArray.content);
}

/**
 * @async
 * @function getUserByName
 * @description Get a users details providing their username.
 * @param {string} username - User name string.
 * @returns {object} A server status object.
 */
async function getUserByName(username) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT * FROM users
      WHERE username = ${username};
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to query for user: ${username}`,
          short: "Not Found",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function getUserByNodeID
 * @description Get user details providing their Node ID.
 * @param {string} id - Users Node ID.
 * @returns {object} A server status object.
 */
async function getUserByNodeID(id) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT * FROM users
      WHERE node_id = ${id};
    `;

    if (command.count === 0) {
      return {
        ok: false,
        content: `Unable to get User By NODE_ID: ${id}`,
        short: "Not Found",
      };
    }

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to get User By NODE_ID: ${id}`,
          short: "Server Error",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function getUserByID
 * @desc Get user details providing their ID.
 * @param {int} id - User ID
 * @returns {object} A Server status Object.
 */
async function getUserByID(id) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT * FROM users
      WHERE id = ${id};
    `;

    if (command.count === 0) {
      return {
        ok: false,
        content: `Unable to get user by ID: ${id}`,
        short: "Server Error",
      };
    }

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Unable to get user by ID: ${id}`,
          short: "Server Error",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function updateIncrementStar
 * @description Register the star given by a user to a package.
 * @param {int} user - A User Object that should star the package.
 * @param {string} pack - Package name that get the new star.
 * @returns {object} A server status object.
 */
async function updateIncrementStar(user, pack) {
  try {
    sqlStorage ??= setupSQL();

    const packID = await getPackageByNameSimple(pack);

    if (!packID.ok) {
      return {
        ok: false,
        content: `Unable to find package ${pack} to star.`,
        short: "Not Found",
      };
    }

    const pointer = packID.content.pointer;

    try {
      const commandStar = await sqlStorage`
        INSERT INTO stars
        (package, userid) VALUES
        (${pointer}, ${user.id})
        RETURNING *;
      `;

      // Now we expect to get our data right back, and can check the
      // validity to know if this happened successfully or not.
      if (
        pointer !== commandStar[0].package ||
        user.id !== commandStar[0].userid
      ) {
        return {
          ok: false,
          content: `Failed to Star the Package`,
          short: "Server Error",
        };
      }

      // Now update the stargazers count into the packages table
      const updatePack = await updatePackageStargazers(pack, pointer);

      if (!updatePack.ok) {
        return updatePack;
      }

      return {
        ok: true,
        content: `Package Successfully Starred`,
      };
    } catch (e) {
      // Catch the primary key violation on (package, userid),
      // Sinche the package is already starred by the user, we return ok.
      return {
        ok: true,
        content: `Package Already Starred`,
      };
    }
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function updateDecrementStar
 * @description Register the removal of the star on a package by a user.
 * @param {int} user - User Object who remove the star.
 * @param {string} pack - Package name that get the star removed.
 * @returns {object} A server status object.
 */
async function updateDecrementStar(user, pack) {
  try {
    sqlStorage ??= setupSQL();

    const packID = await getPackageByNameSimple(pack);

    if (!packID.ok) {
      return {
        ok: false,
        content: `Unable to find package ${pack} to unstar.`,
        short: "Not Found",
      };
    }

    const pointer = packID.content.pointer;

    const commandUnstar = await sqlStorage`
      DELETE FROM stars
      WHERE (package = ${pointer}) AND (userid = ${user.id})
      RETURNING *;
    `;

    if (commandUnstar.count === 0) {
      // We know user and package exist both, so the fail is because
      // the star was already missing,
      // The user expects its star is not given, so we return ok.
      return {
        ok: true,
        content: "The Star is Already Missing",
      };
    }

    // If the return does not match our input, it failed.
    if (
      user.id !== commandUnstar[0].userid ||
      pointer !== commandUnstar[0].package
    ) {
      return {
        ok: false,
        content: "Failed to Unstar the Package",
        short: "Server Error",
      };
    }

    // Now update the stargazers count into the packages table
    const updatePack = await updatePackageStargazers(pack, pointer);

    if (!updatePack.ok) {
      return updatePack;
    }

    return {
      ok: true,
      content: "Package Successfully Unstarred",
    };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function getStarredPointersByUserID
 * @description Get all packages which the user gave the star.
 * The result of this function should not be returned to the user because it contains pointers UUID.
 * @param {int} userid - ID of the user.
 * @returns {object} A server status object.
 */
async function getStarredPointersByUserID(userid) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT ARRAY (
        SELECT package FROM stars WHERE userid = ${userid}
      );
    `;

    // It is likely safe to assume that if nothing matches the userid,
    // then the user hasn't given any star. So instead of server error
    // here we will non-traditionally return an empty array.
    const packArray =
      command.count !== 0 && Array.isArray(command[0].array)
        ? command[0].array
        : [];

    return { ok: true, content: packArray };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function getStarringUsersByPointer
 * @description Use the pointer of a package to collect all users that have starred it.
 * @param {string} pointer - The ID of the package.
 * @returns {object} A server status object.
 */
async function getStarringUsersByPointer(pointer) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      SELECT ARRAY (
        SELECT userid FROM stars WHERE package = ${pointer.pointer}
      );
    `;

    let userArray = command[0].array;

    if (command.count === 0) {
      // It is likely safe to assume that if nothing matches the packagepointer,
      // then the package pointer has no stars. So instead of server error
      // here we will non-traditionally return an empty array.
      logger.generic(
        3,
        `No Stars for ${pointer} found, assuming 0 star value.`
      );
      userArray = [];
    }

    return { ok: true, content: userArray };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function simpleSearch
 * @description The current Fuzzy-Finder implementation of search. Ideally eventually
 * will use a more advanced search method.
 * @returns {object} A server status object containing the results and the pagination object.
 */
async function simpleSearch(term, page, dir, sort, themes = false) {
  try {
    sqlStorage ??= setupSQL();

    // We obtain the lowercase version of term since names should be in
    // lowercase format (see atom-backend issue #86).
    const lcterm = term.toLowerCase();

    const limit = paginated_amount;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const command = await sqlStorage`
      SELECT p.data, p.downloads, (p.stargazers_count + p.original_stargazers) AS stargazers_count,
        v.semver, COUNT(*) OVER() AS query_result_count
      FROM packages p
        INNER JOIN names n ON (p.pointer = n.pointer AND n.name LIKE ${
          "%" + lcterm + "%"
        })
        INNER JOIN versions AS v ON (p.pointer = v.package AND v.status = 'latest')
      ${
        themes === true
          ? sqlStorage`WHERE p.package_type = 'theme'`
          : sqlStorage``
      }
      ORDER BY ${
        sort === "relevance" ? sqlStorage`downloads` : sqlStorage`${sort}`
      }
      ${dir === "desc" ? sqlStorage`DESC` : sqlStorage`ASC`}
      LIMIT ${limit}
      OFFSET ${offset};
    `;

    if (command.count === 0) {
      return { ok: false, content: "No packages found.", short: "Not Found" };
    }

    const resultCount = command[0].query_result_count;
    const quotient = Math.trunc(resultCount / limit);
    const remainder = resultCount % limit;
    const totalPages = quotient + (remainder > 0 ? 1 : 0);

    return {
      ok: true,
      content: command,
      pagination: {
        count: resultCount,
        page: page < totalPages ? page : totalPages,
        total: totalPages,
        limit,
      },
    };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function getUserCollectionById
 * @description Returns an array of Users and their associated data via the ids.
 * @param {array} ids - The IDs of users to collect the data of.
 * @returns {object} A server status object with the array of users collected.
 */
async function getUserCollectionById(ids) {
  let userArray = [];

  for (let i = 0; i < ids.length; i++) {
    let user = await getUserByID(ids[i]);

    if (!user.ok) {
      logger.generic(3, "Unable to find user id: ", {
        type: "object",
        obj: ids[i],
      });
      logger.generic(3, "Details on Not Found User: ", {
        type: "object",
        obj: user,
      });
      continue;
    }

    userArray.push({ login: user.content.username });
  }

  return { ok: true, content: userArray };
}

/**
 * @async
 * @function getSortedPackages
 * @desc Takes the page, direction, and sort method returning the raw sql package
 * data for each. This monolithic function handles trunication of the packages,
 * and sorting, aiming to provide back the raw data, and allow later functions to
 * then reconstruct the JSON as needed.
 * @param {int} page - Page number.
 * @param {string} dir - String flag for asc/desc order.
 * @param {string} dir - String flag for asc/desc order.
 * @param {string} method - The column name the results have to be sorted by.
 * @param {boolean} [themes=false] - Optional Parameter to specify if this should only return themes.
 * @returns {object} A server status object containing the results and the pagination object.
 */
async function getSortedPackages(page, dir, method, themes = false) {
  // Here will be a monolithic function for returning sortable packages arrays.
  // We must keep in mind that all the endpoint handler knows is the
  // page, sort method, and direction. We must figure out the rest here.
  // only knowing we have a valid sort method provided.

  const limit = paginated_amount;
  const offset = page > 1 ? (page - 1) * limit : 0;

  try {
    sqlStorage ??= setupSQL();

    let orderType = null;

    switch (method) {
      case "downloads":
        orderType = "downloads";
        break;
      case "created_at":
        orderType = "created";
        break;
      case "updated_at":
        orderType = "updated";
        break;
      case "stars":
        orderType = "stargazers_count";
        break;
      default:
        logger.generic(3, `Unrecognized Sorting Method Provided: ${method}`);
        return {
          ok: false,
          content: `Unrecognized Sorting Method Provided: ${method}`,
          short: "Server Error",
        };
    }

    const command = await sqlStorage`
      SELECT p.data, p.downloads, (p.stargazers_count + p.original_stargazers) AS stargazers_count,
        v.semver, COUNT(*) OVER() AS query_result_count
      FROM packages AS p
        INNER JOIN versions AS v ON (p.pointer = v.package AND v.status = 'latest')
      ${
        themes === true
          ? sqlStorage`WHERE package_type = 'theme'`
          : sqlStorage``
      }
      ORDER BY ${orderType} ${
      dir === "desc" ? sqlStorage`DESC` : sqlStorage`ASC`
    }
      LIMIT ${limit}
      OFFSET ${offset};
    `;

    const resultCount = command[0]?.query_result_count ?? 0;
    const quotient = Math.trunc(resultCount / limit);
    const remainder = resultCount % limit;
    const totalPages = quotient + (remainder > 0 ? 1 : 0);

    return {
      ok: true,
      content: command,
      pagination: {
        count: resultCount,
        page: page < totalPages ? page : totalPages,
        total: totalPages,
        limit,
      },
    };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function authStoreStateKey
 * @desc Gets a state key from login process and saves it on the database.
 * @param {string} stateKey - The key code string.
 * @returns {object} A server status object.
 */
async function authStoreStateKey(stateKey) {
  try {
    sqlStorage ??= setupSQL();

    const command = await sqlStorage`
      INSERT INTO authstate (keycode)
      VALUES (${stateKey})
      RETURNING keycode;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0].keycode }
      : {
          ok: false,
          content: `The state key has not been saved on the database.`,
          short: "Server Error",
        };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

/**
 * @async
 * @function authCheckAndDeleteStateKey
 * @desc Gets a state key from oauth process and delete it from the database.
 * It's used to verify if the request for the authentication is valid. The code should be first generated in the
 * initial stage of the login and then deleted by this function.
 * If the deletion is successful, the returned record is used to retrieve the created timestamp of the state key
 * and check if it's not expired (considering a specific timeout).
 * A custom timestamp can be passed as argument for testing purpose, otherwise the current timestamp is considered.
 * @param {string} stateKey - The key code string to delete.
 * @param {string} timestamp - A string in SQL timestamp format to check against the created timestamp of the
 * given state key. If not provided, the current UNIX timestamp is used.
 * @returns {object} A server status object.
 */
async function authCheckAndDeleteStateKey(stateKey, timestamp = null) {
  try {
    sqlStorage ??= setupSQL();

    // We need to compare the created timestamp with Date.now() timestamp which
    // is returned in milliseconds.
    // We convert the created SQL timestamp to UNIX timestamp which has an
    // high resolution up to microseconds, but it's returned in seconds with a
    // fractional part.
    // So we first convert it to milliseconds, then cast to BIGINT to remove the
    // unneeded remaining fractional part.
    // BIGINT has to be used because ms UNIX timestamp does not fit into
    // PostgreSQL INT type.
    const command = await sqlStorage`
      DELETE FROM authstate
      WHERE keycode = ${stateKey}
      RETURNING keycode, CAST(extract(epoch from created) * 1000 AS BIGINT) AS created;
    `;

    if (command.count === 0) {
      return {
        ok: false,
        content: "The provided state key was not set for the auth login.",
        short: "Not Found",
      };
    }

    const created = BigInt(command[0].created);
    const timeout = 600000n; // 10*60*1000 => 10 minutes in ms
    const now = timestamp ?? Date.now();

    if (now > created + timeout) {
      return {
        ok: false,
        content: "The provided state key is expired for the auth login.",
        short: "Not Found",
      };
    }

    return { ok: true, content: command[0].keycode };
  } catch (err) {
    return {
      ok: false,
      content: "Generic Error",
      short: "Server Error",
      error: err,
    };
  }
}

module.exports = {
  shutdownSQL,
  packageNameAvailability,
  insertNewPackage,
  getPackageByName,
  getPackageCollectionByName,
  getPackageCollectionByID,
  removePackageByName,
  removePackageVersion,
  getFeaturedPackages,
  getSortedPackages,
  getUserByName,
  getUserByNodeID,
  getUserByID,
  getStarredPointersByUserID,
  getStarringUsersByPointer,
  getUserCollectionById,
  getPackageVersionByNameAndVersion,
  updatePackageIncrementDownloadByName,
  updatePackageDecrementDownloadByName,
  updatePackageStargazers,
  getFeaturedThemes,
  simpleSearch,
  updateIncrementStar,
  updateDecrementStar,
  insertNewUser,
  insertNewPackageName,
  insertNewPackageVersion,
  authStoreStateKey,
  authCheckAndDeleteStateKey,
};
