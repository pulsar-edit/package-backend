const httpMock = require("../helpers/httpMock.helper.jest.js");

const vcs = require("../../src/vcs.js");

let http_cache = {
  pack1: {}, // pack1 will be used for newPackageData tests
  pack2: {}, // pack2 will be used for newVersionData tests
};

const userDataGeneric = {
  token: "123",
  node_id: "456",
};

describe("Does NewPackageData Return as expected", () => {
  test("Repo Exists Error on Bad WebRequest", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";

    http_cache.pack1.bad_exists = new httpMock.HTTP(`/repos/${ownerRepo}`)
      .ok(false)
      .short("Failed Request")
      .status(404)
      .parse();

    const tmpMock = httpMock.webRequestMock([http_cache.pack1.bad_exists]);

    const res = await vcs.newPackageData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Repo");
    expect(res.content).toBe(`Failed to get repo: ${ownerRepo} - Bad Repo`);
  });
});

describe("Ownership Returns as Expected", () => {
  test("Returns Successfully", async () => {
    const ownerRepo = "pulsar-edit/pulsar";
    const userObj = {
      token: "123",
      node_id: "12345",
    };
    const packObj = {
      repository: {
        type: "git",
        url: "https://github.com/pulsar-edit/pulsar",
      },
      data: {},
    };

    const mockData = new httpMock.HTTP(
      `/repos/${ownerRepo}/collaborators?page=1`
    )
      .ok(true)
      .status(200)
      .body([
        {
          login: "confused-Techie",
          node_id: userObj.node_id,
          permissions: {
            admin: true,
            maintain: true,
            push: true,
            triage: true,
            pull: true,
          },
          role_name: "admin",
        },
      ])
      .parse();

    const tmpMock = httpMock.webRequestMock([mockData]);

    const res = await vcs.ownership(userObj, packObj);

    expect(res.ok).toBe(true);
    expect(res.content).toBe("admin");
  });
});
