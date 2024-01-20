/**
 * @async
 * @function removePackageByName
 * @description Given a package name, removes its record alongside its names, versions, stars.
 * @param {string} name - The package name.
 * @param {boolean} exterminate - A flag that if true will totally remove the package.
 * Including the normally reserved name. Should never be used in production, enables
 * a supply chain vulnerability.
 * @returns {object} A server status object.
 */

const getPackageByNameSimple = require("./getPackageByNameSimple.js").exec;

module.exports = {
  safe: false,
  exec: async (sql, name, exterminate = false) => {
     return await sql
       .begin(async (sqlTrans) => {
         // Retrieve the package pointer
         const packID = await getPackageByNameSimple(sql, name);

         if (!packID.ok) {
           // The package does not exist, but we return ok since it's like
           // it has been deleted.
           return { ok: true, content: `${name} package does not exist.` };
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

         if (exterminate) {
           const commandName = await sqlTrans`
             DELETE FROM names
             WHERE pointer = ${pointer}
           `; // We can't return name here, since it's set to null on package deletion
         }

         return { ok: true, content: `Successfully Deleted Package: ${name}` };
       })
       .catch((err) => {
         return typeof err === "string"
           ? { ok: false, content: err, short: "server_error" }
           : {
               ok: false,
               content: `A generic error occurred while inserting ${name} package`,
               short: "server_error",
               error: err,
             };
       });
  }
};
