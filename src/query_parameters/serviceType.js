/**
 * @function serviceType
 * @desc Returns the service type being requested.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string|boolean} Returns false if the provided value is invalid, or
 * nonexistent. Returns `providedServices` if the query is `provided` or returns
 * `consumedServices` if the query is `consumed`
 */

module.exports = {
  schema: {
    name: "serviceType",
    in: "query",
    schema: {
      type: "string",
      enum: ["consumed", "provided"],
    },
    example: "consumed",
    allowEmptyValue: true,
    deescription:
      "Choose whether to display 'consumer' or 'providers' of the specified service.",
  },
  logic: (req) => {
    // TODO determine if there's a way to indicate this is a required
    // field moo
    const prov = req.query.serviceType;

    if (prov === undefined) {
      return false;
    }

    if (prov === "provided") {
      return "providedServices";
    }

    if (prov === "consumed") {
      return "consumedServices";
    }

    return false; // fallback
  },
};
