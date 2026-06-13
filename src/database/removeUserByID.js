/**
  * @async
  * @function removeUserByID
  * @desc Remove a user from the database providing their ID.
  * @param {int} id - User ID
  * @returns {object} A Server status Object.
*/

module.exports = {
  safe: true,
  exec: async (sql, id) => {
    return await sql
      .begin(async (sqlTrans) => {

        const command = await sqlTrans`
          DELETE FROM users
          WHERE id = ${id}
        `;

        if (command.count === 0) {
          throw "Failed to delete user";
        }

        return { ok: true, content: "Successfully delete user." };
      })
      .catch((err) => {
        return typeof err === "string"
          ? { ok: false, content: err, short: "server_error" }
          : {
              ok: false,
              content: "A generic error occurred while deleting the user.",
              short: "server_error",
              error: err
          };
      });
  },
};
