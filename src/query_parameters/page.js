/**
 * @function page
 * @desc Parser of the Page query parameter. Defaulting to 1.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {number} Returns the valid page provided in the query parameter or 1, as the default.
 */

module.exports = {
  schema: {
    name: "page",
    in: "query",
    schema: {
      type: "number",
      minimum: 1,
      default: 1,
    },
    example: 1,
    allowEmptyValue: true,
    required: false,
    description: "The page of available results to return.",
  },
  logic: (req) => {
    const def = 1;
    const prov = req.query.page;

    switch (typeof prov) {
      case "string": {
        const n = parseInt(prov, 10);
        return isNaN(prov) ? def : n;
      }

      case "number":
        return isNaN(prov) ? def : prov;

      default:
        return def;
    }
  },
};
