/**
 * @async
 * @function insertNewPackage
 * @desc Insert a new package inside the DB taking a `Server Object Full` as argument.
 * @param {object} pack - The `Server Object Full` package.
 * @returns {object} A Server Status Object.
 */
const _constants = require("./_constants.js");

module.exports = {
  safe: false,
  exec: async (sql, pack) => {
    // Since this operation involves multiple queries, we perform a
    // PostgreSQL transaction executing a callback on begin().
    // All data is committed into the database only if no errors occur.
    return await sql
      .begin(async (sqlTrans) => {
        const packageType =
          typeof pack.metadata.theme === "string" &&
          pack.metadata.theme.match(/^(?:syntax|ui)$/i) !== null
            ? "theme"
            : "package";

        // Populate packages table
        let pointer = null;
        let insertNewPack = {};
        try {
          // No need to specify downloads and stargazers. They default at 0 on creation.
          // TODO: data column deprecated; to be removed
          insertNewPack = await sqlTrans`
            INSERT INTO packages (name, creation_method, data, package_type, owner)
            VALUES (${pack.name}, ${pack.creation_method}, ${pack}, ${packageType}, ${pack.owner})
            RETURNING pointer;
        `;
        } catch (e) {
          throw `A constraint has been violated while inserting ${
            pack.name
          } in packages table: ${e.toString()}`;
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

        // Populate versions table
        let versionCount = 0;
        const pv = pack.versions;
        // TODO: status column deprecated; to be removed.
        const status = "published";
        for (const ver of Object.keys(pv)) {
          // Since many packages don't define an engine field,
          // we will do it for them if not present,
          // following suit with what Atom internal packages do.
          const engine = pv[ver].engines ?? _constants.defaults.engine;

          // It's common practice for packages to not specify license,
          // therefore set it as NONE if undefined.
          const license = pv[ver].license ?? _constants.defaults.license;

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
          ? { ok: false, content: err, short: "server_error" }
          : {
              ok: false,
              content: `A generic error occurred while inserting ${pack.name} package`,
              short: "server_error",
              error: err,
            };
      });
  },
};
