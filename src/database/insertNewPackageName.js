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
const getPackageByNameSimple = require("./getPackageByNameSimple.js").exec;

module.exports = {
  safe: false,
  exec: async (sql, newName, oldName) => {
    return await sql
      .begin(async (sqlTrans) => {
        // Retrieve the package pointer
        const packID = await getPackageByNameSimple(sql, oldName);

        if (!packID.ok) {
          // Return Not Found
          return {
            ok: false,
            content: `Unable to find the original pointer of ${oldName}`,
            short: "not_found",
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
              short: "server_error",
              error: err,
            };
      });
  }
};
