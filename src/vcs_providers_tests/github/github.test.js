const GitHub = require("../../vcs_providers/github.js");

const webRequestMockHelper = (data) => {
  const tmpMock = jest
    .spyOn(GitHub.prototype, "_webRequestAuth")
    .mockImplementation(() => {
      return data;
    });
  return tmpMock;
};

describe("vcs_providers/github.doesUserHaveRepo() MOCK", () => {
  test("Returns No ownership with bad auth return of server", async () => {
    const mockData = {
      ok: false,
      short: "Failed Request",
      content: {
        status: 401,
      },
    };
    const tmpMock = webRequestMockHelper(mockData);

    const userData = {
      token: "123",
      node_id: "456",
    };

    let tmp = new GitHub();
    let res = await tmp.doesUserHaveRepo(userData, "owner/repo");
    tmpMock.mockClear();

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Auth");
  });
  test("Returns Successful Ownership", async () => {
    const mockData = {
      ok: true,
      content: {
        status: 200,
        body: [
          {
            node_id: "456",
            permissions: {
              admin: true,
            },
            role_name: "admin",
          },
        ],
      },
    };
    const tmpMock = webRequestMockHelper(mockData);
    const userData = {
      token: "123",
      node_id: "456",
    };

    let tmp = new GitHub();
    let res = await tmp.doesUserHaveRepo(userData, "pulsar-edit/pulsar");
    tmpMock.mockClear();

    expect(res.ok).toBe(true);
    expect(res.content).toBe("admin");
  });
  test("Returns No Access when the user isn't listed on a repo", async () => {
    const mockData = {
      ok: true,
      content: {
        status: 200,
        headers: {
          link: "",
        },
        body: [
          {
            node_id: "789",
            permissions: {
              admin: true,
            },
            role_name: "admin",
          },
        ],
      },
    };
    const tmpMock = webRequestMockHelper(mockData);
    const userData = {
      token: "123",
      node_id: "456",
    };

    let tmp = new GitHub();
    let res = await tmp.doesUserHaveRepo(userData, "pulsar-edit/pulsar");
    tmpMock.mockClear();

    expect(res.ok).toBe(false);
    expect(res.short).toBe("No Access");
  });
  test("Returns No Access when the user has pull permission", async () => {
    const mockData = {
      ok: true,
      content: {
        status: 200,
        headers: {
          link: "",
        },
        body: [
          {
            node_id: "123",
            permissions: {
              admin: false,
              maintain: false,
              push: false,
              triage: false,
              pull: true,
            },
            role_name: "pull",
          },
        ],
      },
    };

    const tmpMock = webRequestMockHelper(mockData);
    const userData = {
      token: "456",
      node_id: "123",
    };

    let tmp = new GitHub();
    let res = await tmp.doesUserHaveRepo(userData, "pulsar-edit/pulsar");
    tmpMock.mockClear();

    expect(res.ok).toBe(false);
    expect(res.short).toBe("No Access");
  });
});

describe("vcs_providers/github.readme() MOCK", () => {
  test("Returns Bad Auth", async () => {
    const mockData = {
      ok: false,
      short: "Failed Request",
      content: {
        status: 401,
      },
    };

    const tmpMock = webRequestMockHelper(mockData);

    let tmp = new GitHub();
    let res = await tmp.readme({ token: "123" }, "pulsar-edit/pulsar");
    tmpMock.mockClear();

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Auth");
  });
  test("Unexpected Status Code Returns Server Error", async () => {
    const mockData = {
      ok: false,
      short: "Failed Request",
      content: {
        status: 404,
      },
    };

    const tmpMock = webRequestMockHelper(mockData);

    let tmp = new GitHub();
    let res = await tmp.readme({ tokne: "123" }, "pulsar-edit/pulsar");
    tmpMock.mockClear();

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Server Error");
  });
});
