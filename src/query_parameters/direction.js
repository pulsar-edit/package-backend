/**
 * @function direction
 * @desc Parser for either 'direction' or 'order' query parameter, prioritizing
 * 'direction'.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} The valid direction value from the 'direction' or 'order'
 * query parameter.
 */
module.exports = {
  schema: {
    name: "direction",
    in: "query",
    schema: {
      type: "string",
      enum: ["desc", "asc"],
      default: "desc",
    },
    example: "desc",
    allowEmptyValue: true,
    description: "Direction to list search results. Also accepts 'order' for backwards compatibility.",
  },
  logic: (req) => {
    const def = "desc";
    const valid = ["asc", "desc"];

    // Seems that the autolink headers use order, while documentation uses direction.
    // Since we are not sure where in the codebase it uses the other, we will just accept both.
    const prov = req.query.direction ?? req.query.order ?? def;

    return valid.includes(prov) ? prov : def;
  },
};
