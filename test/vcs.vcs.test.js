const httpMock = require("./httpMock.helper.jest.js");

const vcs = require("../src/vcs.js");

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

  test("Package Error on Bad WebRequest", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";

    http_cache.pack1.good_exists = new httpMock.HTTP(`/repos/${ownerRepo}`)
      .ok(true)
      .body({ full_name: ownerRepo })
      .parse();

    http_cache.pack1.bad_package_json = new httpMock.HTTP(
      `/repos/${ownerRepo}/contents/package.json`
    )
      .ok(false)
      .short("Failed Request")
      .status(500)
      .parse();

    const tmpMock = httpMock.webRequestMock([
      http_cache.pack1.good_exists,
      http_cache.pack1.bad_package_json,
    ]);

    const res = await vcs.newPackageData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Package");
    expect(res.content).toBe(
      `Failed to get gh package for ${ownerRepo} - Server Error`
    );
  });

  test("Tags Error Response on Bad WebRequest", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";

    http_cache.pack1.good_package_json = new httpMock.HTTP(
      `/repos/${ownerRepo}/contents/package.json`
    )
      .ok(true)
      .body(
        httpMock.base64(
          '{ "name": "pulsar", "version": "v1.101.0-beta", "repository": "https://github.com/pulsar-edit/pulsar" }'
        )
      )
      .parse();

    http_cache.pack1.bad_tags = new httpMock.HTTP(`/repos/${ownerRepo}/tags`)
      .ok(false)
      .short("Failed Request")
      .status(500)
      .parse();

    const tmpMock = httpMock.webRequestMock([
      http_cache.pack1.good_exists,
      http_cache.pack1.good_package_json,
      http_cache.pack1.bad_tags,
    ]);

    const res = await vcs.newPackageData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Server Error");
    expect(res.content).toBe(
      `Failed to get gh tags for ${ownerRepo} - Server Error`
    );
  });

  test("Readme Error on Bad Web Request", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";

    http_cache.pack1.good_tags = new httpMock.HTTP(`/repos/${ownerRepo}/tags`)
      .ok(true)
      .status(200)
      .body([
        {
          name: "v1.101.0-beta",
          tarball_url:
            "https://api.github.com/repos/pulsar-edit/pulsar/tarball/refs/tags/v1.101.0-beta",
          commit: {
            sha: "dca05a3fccdc7d202e4ce00a5a2d3edef50a640f",
          },
        },
      ])
      .parse();

    http_cache.pack1.bad_readme = new httpMock.HTTP(
      `/repos/${ownerRepo}/readme`
    )
      .ok(false)
      .short("Failed Request")
      .status(500)
      .parse();

    const tmpMock = httpMock.webRequestMock([
      http_cache.pack1.good_exists,
      http_cache.pack1.good_package_json,
      http_cache.pack1.good_tags,
      http_cache.pack1.bad_readme,
    ]);

    const res = await vcs.newPackageData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Repo");
    expect(res.content).toBe(
      `Failed to get gh readme for ${ownerRepo} - Server Error`
    );
  });

  test("Returns Valid New Package Data with successful Requests", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";

    http_cache.pack1.good_readme = new httpMock.HTTP(
      `/repos/${ownerRepo}/readme`
    )
      .ok(true)
      .status(200)
      .body(httpMock.base64("This is a readme"))
      .parse();

    const tmpMock = httpMock.webRequestMock([
      http_cache.pack1.good_exists,
      http_cache.pack1.good_package_json,
      http_cache.pack1.good_tags,
      http_cache.pack1.good_readme,
    ]);

    const res = await vcs.newPackageData(userDataGeneric, ownerRepo, "git");
    expect(res.ok).toBe(true);
    expect(res.content.name).toBe("pulsar");
    expect(res.content.creation_method).toBe("User Made Package");
    expect(res.content.readme).toBe("This is a readme");
    expect(res.content.metadata.name).toBe("pulsar");
    expect(res.content.metadata.version).toBe("v1.101.0-beta");
    expect(res.content.metadata.repository).toBe(
      "https://github.com/pulsar-edit/pulsar"
    );
    expect(res.content.repository.type).toBe("git");
    expect(res.content.repository.url).toBe(
      "https://github.com/pulsar-edit/pulsar"
    );
    expect(res.content.versions["1.101.0-beta"]).toBeDefined();
    expect(res.content.versions["1.101.0-beta"].name).toBe("pulsar");
    expect(res.content.versions["1.101.0-beta"].version).toBe("v1.101.0-beta");
    expect(res.content.versions["1.101.0-beta"].repository).toBe(
      "https://github.com/pulsar-edit/pulsar"
    );
    expect(res.content.versions["1.101.0-beta"].dist.tarball).toBe(
      "https://api.github.com/repos/pulsar-edit/pulsar/tarball/refs/tags/v1.101.0-beta"
    );
    expect(res.content.versions["1.101.0-beta"].dist.sha).toBe(
      "dca05a3fccdc7d202e4ce00a5a2d3edef50a640f"
    );
    expect(res.content.releases.latest).toBe("1.101.0-beta");
  });
});

describe("Does newVersionData Return as Expected", () => {
  test("Package Error on Bad WebRequest", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";

    http_cache.pack2.bad_pack = new httpMock.HTTP(
      `/repos/${ownerRepo}/contents/package.json`
    )
      .ok(false)
      .short("Failed Request")
      .status(500)
      .parse();

    const tmpMock = httpMock.webRequestMock([http_cache.pack2.bad_pack]);

    const res = await vcs.newVersionData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Package");
    expect(res.content).toBe(
      `Failed to get GitHub Package ${ownerRepo} - Server Error - 500`
    );
  });

  test("Readme Error on Bad Web Request", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";

    http_cache.pack2.good_pack = new httpMock.HTTP(
      `/repos/${ownerRepo}/contents/package.json`
    )
      .ok(true)
      .status(200)
      .body(
        httpMock.base64(
          '{ "name": "pulsar", "version": "v1.101.0-beta", "repository": "https://github.com/pulsar-edit/pulsar" }'
        )
      )
      .parse();

    http_cache.pack2.bad_readme = new httpMock.HTTP(
      `/repos/${ownerRepo}/readme`
    )
      .ok(false)
      .short("Failed Request")
      .status(500)
      .parse();

    const tmpMock = httpMock.webRequestMock([
      http_cache.pack2.good_pack,
      http_cache.pack2.bad_readme,
    ]);

    const res = await vcs.newVersionData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Repo");
    expect(res.content).toBe(
      `Failed to get GitHub ReadMe ${ownerRepo} - Server Error - 500`
    );
  });

  test("Tags Error on Bad Web Request", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";

    http_cache.pack2.good_readme = new httpMock.HTTP(
      `/repos/${ownerRepo}/readme`
    )
      .ok(true)
      .status(200)
      .body(httpMock.base64("This is a readme"))
      .parse();

    http_cache.pack2.bad_tags = new httpMock.HTTP(`/repos/${ownerRepo}/tags`)
      .ok(false)
      .short("Failed Request")
      .status(500)
      .parse();

    const tmpMock = httpMock.webRequestMock([
      http_cache.pack2.good_pack,
      http_cache.pack2.good_readme,
      http_cache.pack2.bad_tags,
    ]);

    const res = await vcs.newVersionData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Server Error");
    expect(res.content).toBe(
      `Failed to get GitHub Tags for ${ownerRepo} - Server Error - 500`
    );
  });

  test("Returns Valid New Version Data with successful Requests", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";

    http_cache.pack2.good_tags = new httpMock.HTTP(`/repos/${ownerRepo}/tags`)
      .ok(true)
      .status(200)
      .body([
        {
          name: "v1.101.0-beta",
          tarball_url:
            "https://api.github.com/repos/pulsar-edit/pulsar/tarball/refs/tags/v1.101.0-beta",
          commit: {
            sha: "dca05a3fccdc7d202e4ce00a5a2d3edef50a640f",
          },
        },
      ])
      .parse();

    const tmpMock = httpMock.webRequestMock([
      http_cache.pack2.good_pack,
      http_cache.pack2.good_readme,
      http_cache.pack2.good_tags,
    ]);

    const res = await vcs.newVersionData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(true);
    expect(res.content.name).toBe("pulsar");
    expect(res.content.repository.type).toBe("git");
    expect(res.content.repository.url).toBe(
      "https://github.com/pulsar-edit/pulsar"
    );
    expect(res.content.readme).toBe("This is a readme");
    expect(res.content.metadata.name).toBe("pulsar");
    expect(res.content.metadata.version).toBe("v1.101.0-beta");
    expect(res.content.metadata.tarball_url).toBe(
      "https://api.github.com/repos/pulsar-edit/pulsar/tarball/refs/tags/v1.101.0-beta"
    );
    expect(res.content.metadata.sha).toBe(
      "dca05a3fccdc7d202e4ce00a5a2d3edef50a640f"
    );
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

    if (process.env.PULSAR_STATUS !== "dev") {
      expect(res.ok).toBe(true);
      expect(res.content).toBe("admin");
    }
    // TODO: The above is a safegaurd put in place.
    // Currently when the env var dev is set then this test will fail.
    // because the git package has to return static data during tests
    // to still function with all the other tests that don't mock it's API calls.
    // As soon as all other tests properly mock git API calls this protection can be removed.
  });
});
