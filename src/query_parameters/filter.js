module.exports = {
  schema: {
    name: "filter",
    in: "query",
    schema: {
      type: "string",
      enum: ["package", "theme"],
      default: "pacakge",
    },
    required: false,
    allowEmptyValue: false,
    example: "package",
    description:
      "Deprecated method to display packages or themes. Use `/api/themes/search` or `/api/packages/search` instead.",
  },
  logic: (req) => {
    const def = "package";
    const valid = ["theme", "package"];

    const prov = req.query.filter;

    if (typeof prov !== "string") {
      return def;
    }

    if (!valid.includes(prov)) {
      return def;
    }

    return prov;
  },
};
