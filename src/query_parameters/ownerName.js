const ownerShared = require("./shared/owner.js");

module.exports = {
  schema: {
    name: "ownerName",
    in: "path",
    schema: {
      type: "string",
    },
    example: "pulsar-edit",
    allowEmptyValue: false,
    required: true,
    description: "Owner of packages to retrieve.",
  },
  logic: (req) => {
    let prov = req.params.ownerName ?? null;

    return ownerShared(prov);
  },
};
