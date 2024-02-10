const ownerShared = require("./shared/owner.js");

module.exports = {
  schema: {
    name: "owner",
    in: "query",
    schema: {
      type: "string",
    },
    example: "pulsar-edit",
    allowEmptyValue: false,
    required: false,
    description: "Owner to filter results by.",
  },
  logic: (req) => {
    let prov = req.query.owner ?? null;

    return ownerShared(prov);
  },
};
