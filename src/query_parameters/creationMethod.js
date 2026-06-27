/**
 * @function creationMethod
*/
module.exports = {
  schema: {
    name: "creationMethod",
    in: "query",
    schema: {
      type: "string",
      enum: ["any", "pulsar", "atom"],
      default: "any"
    },
    example: "pulsar",
    allowEmptyValue: true,
    description: "Return only packages with the specified creation method."
  },
  logic: (req) => {
    const def = "any";
    const valid = ["pulsar", "atom"];

    const prov = req.query.creationMethod;

    return valid.includes(prov) ? prov : def;
  }
};
