module.exports = {
  schema: {
    description: "Privately returned information of users on Pulsar.",
    type: "object",
    required: [
      "username", "avatar", "data", "created_at", "packages"
    ],
    properties: {
      username: {
        type: "string"
      },
      avatar: {
        type: "string"
      },
      data: {
        type: "object"
      },
      node_id: {
        type: "string"
      },
      token: {
        type: "string"
      },
      created_at: {
        type: "string"
      },
      packages: {
        type: "array"
      }
    }
  },
  example: {
    username: "confused-Techie",
    avatar: "https://avatar.url",
    data: {},
    node_id: "users-node-id",
    token: "user-api-token",
    created_at: "2023-09-16T00:58:36.755Z",
    packages: []
  },
  test: {
    username: expect.toBeTypeof("string"),
    avatar: expect.toBeTypeof("string"),
    data: {},
    node_id: expect.toBeTypeof("string"),
    token: expect.toBeTypeof("string"),
    created_at: expect.toBeTypeof("string"),
    packages: expect.toBeArray()
  }
};
