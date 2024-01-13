/**
 * @function sort
 * @desc Parser for the 'sort' query parameter. Defaulting usually to downloads.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {string} [def="downloads"] - The default provided for sort. Allowing
 * The search function to use "relevance" instead of the default "downloads".
 * @returns {string} Either the user provided 'sort' query parameter, or the default specified.
 */

module.exports = {
  schema: {
    name: "sort",
    in: "query",
    schema: {
      type: "string",
      enum: [
        "downloads",
        "created_at",
        "updated_at",
        "stars",
        "relevance"
      ],
      default: "downloads"
    },
    example: "downloads",
    required: false,
    allowEmptyValue: false,
    description: "Value to sort search results by."
  },
  logic: (req, def = "downloads") => {
    // TODO: Determine if allowing `def` value here makes any sense still
    // using sort with a default def value of downloads, means when using the generic sort parameter
    // it will default to downloads, but if we pass the default, such as during search we can provide
    // the default relevance
    const valid = ["downloads", "created_at", "updated_at", "stars", "relevance"];

    const prov = req.query.sort ?? def;

    return valid.includes(prov) ? prov : def;
  }
};
