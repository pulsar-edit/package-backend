/**
 * @async
 * @function insertNewPackageVersion
 * @desc Adds a new package version to the db.
 * @param {object} packJSON - A full `package.json` file for the wanted version.
 * @param {string|null} oldName - If provided, the old name to be replaced for the renaming of the package.
 * @returns {object} A server status object.
 */

const _constants = require("./_constants.js");
const getPackageByName = require("./getPackageByName.js").exec;

module.exports = {
  safe: false,
  exec: async (sql, packJSON, oldName = null) => {
    // We are expected to receive a standard `package.json` file.
    // Note that, if oldName is provided, here we can be sure oldName !== packJSON.name
    // because the comparison has been already done in postPackagesVersion()
    return await sql
      .begin(async (sqlTrans) => {
        const rename = typeof oldName === "string";

        // On renaming, search the package pointer using the oldName,
        // otherwise use the name in the package object directly.
        let packName = rename ? oldName : packJSON.name;

        const pack = await getPackageByName(sql, packName);

        if (!pack.ok) {
          return pack;
        }

        const pointer = pack.content.pointer;

        if (packJSON.owner !== pack.owner) {
          // The package owner has changed. Whether or not this is plausible in
          // the real world, it's a good idea to handle it here.
          let updateOwner = {};
          let ownerUpdateFailed = false;
          try {
            updateOwner = await sqlTrans`
              UPDATE PACKAGES
              SET owner = ${packJSON.owner}
              WHERE pointer = ${pointer}
              RETURNING owner;
            `;
          } catch (e) {
            // There aren't constraints on the `owner` field, so if this were to
            // fail, it wouldn't be clear why. But we're handling it anyway!
            ownerUpdateFailed = true;
          }
          if (!updateOwner?.count || ownerUpdateFailed) {
            throw `Unable to update the package owner to ${packJSON.owner}.`;
          }
        }

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

        // We used to check if the new version was higher than the latest, but this is
        // too cumbersome to do and the publisher has the responsibility to push an
        // higher version to be signaled in Pulsar for the update, so we just try to
        // insert whatever we got.
        // The only requirement is that the provided semver is not already present
        // in the database for the targeted package.

        const license = packJSON.metadata.license ?? _constants.defaults.license;
        const engine = packJSON.metadata.engines ?? _constants.defaults.engine;

        let addVer = {};
        try {
          // TODO: status column deprecated; to be removed
          addVer = await sqlTrans`
            INSERT INTO versions (package, status, semver, license, engine, meta)
            VALUES(${pointer}, 'published', ${packJSON.metadata.version}, ${license}, ${engine}, ${packJSON.metadata})
            RETURNING semver, status;
          `;
        } catch (e) {
          // This occurs when the (package, semver) unique constraint is violated.
          throw `Not allowed to publish a version already present for ${packName}`;
        }

        if (!addVer?.count) {
          throw `Unable to create a new version for ${packName}`;
        }

        // Now to update the data field for the package, to update the readme and
        // latest version
        let addPackMeta = {};
        try {
          addPackMeta = await sqlTrans`
            UPDATE packages
            SET data = ${packJSON}
            WHERE pointer = ${pointer}
            RETURNING name;
          `;
        } catch (e) {
          throw `Unable to update the package's metadata for ${packName}`;
        }

        if (!addPackMeta?.count) {
          throw `Failed to update the package's metadata for ${packName}`;
        }

        return {
          ok: true,
          content: `Successfully added new version: ${packName}@${packJSON.metadata.version}`,
        };
      })
      .catch((err) => {
        return typeof err === "string"
          ? { ok: false, content: err, short: "server_error" }
          : {
              ok: false,
              content: `A generic error occured while inserting the new package version ${packJSON.name}`,
              short: "server_error",
              error: err,
            };
      });
  }
};
