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

module.exports = {
  safe: true,
  exec: async (sql, name) => {
    const command = await sql`
      SELECT name FROM names
      WHERE name = ${name};
    `;

    return command.count === 0
      ? {
          ok: true,
          content: `${name} is available to be used for a new package.`,
        }
      : {
          ok: false,
          content: `${name} is not available to be used for a new package.`,
          short: "not_found",
        };
  },
};
