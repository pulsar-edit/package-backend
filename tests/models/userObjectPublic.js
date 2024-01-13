module.exports = {
  schema: {
    description: "Publicaly returned information of users on Pulsar.",
    type: "object",
    required: ["username", "avatar", "data", "created_at", "packages"],
    properties: {
      username: {
        type: "string",
      },
      avatar: {
        type: "string",
      },
      data: {
        type: "object",
      },
      created_at: {
        type: "string",
      },
      packages: {
        type: "array",
      },
    },
  },
  example: {
    username: "confused-Techie",
    avatar: "https://avatar.url",
    data: {},
    created_at: "2023-09-16T00:58:36.755Z",
    packages: [],
  },
  test: Joi.object({
    username: Joi.string().required(),
    avatar: Joi.string().required(),
    data: Joi.object().required(),
    created_at: Joi.string().required(),
    packages: Joi.array().required(),
  }),
};
