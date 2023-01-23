const Git = require("../vcs_providers/git.js");
const vcs = require("../vcs.js");

const webRequestMockHelper = (data) => {
  const tmpMock = jest
    .spyOn(Git.prototype, "_webRequestAuth")
    .mockImplementation((url, token) => {
      for (let i = 0; i < data.length; i++) {
        if (url === data[i].url) {
          return data[i].obj;
        }
      }
    });
  return tmpMock;
};

const userDataGeneric = {
  token: "123",
  node_id: "456"
};

describe("Does NewPackageData Return as expected", () => {
  test("Repo Exists Error on Bad WebRequest", async () => {

    const ownerRepo = "confused-Techie/pulsar-backend";
    const mockData = [
      {
        url: `/repos/${ownerRepo}`,
        obj: {
          ok: false,
          short: "Failed Request",
          content: {
            status: 404
          }
        }
      }
    ];

    const tmpMock = webRequestMockHelper(mockData);

    const res = await vcs.newPackageData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Repo");
    expect(res.content).toBe(`Failed to get repo: ${ownerRepo} - Bad Repo`);
  });

  test("Package Error on Bad WebRequest", async () => {

    const ownerRepo = "confused-Techie/pulsar-backend";
    const mockData = [
      {
        url: `/repos/${ownerRepo}`,
        obj: {
          ok: true,
          content: {
            body: {
              full_name: ownerRepo
            }
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/contents/package.json`,
        obj: {
          ok: false,
          short: "Failed Request",
          content: {
            status: 500
          }
        }
      }
    ];

    const tmpMock = webRequestMockHelper(mockData);

    const res = await vcs.newPackageData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Package");
    expect(res.content).toBe(`Failed to get gh package for ${ownerRepo} - Server Error`);
  });

  test("Tags Error Response on Bad WebRequest", async () => {

    const ownerRepo = "confused-Techie/pulsar-backend";
    const mockData = [
      {
        url: `/repos/${ownerRepo}`,
        obj: {
          ok: true,
          content: {
            body: {
              full_name: ownerRepo
            }
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/contents/package.json`,
        obj: {
          ok: true,
          content: {
            body: {
              content: "eyAibmFtZSI6ICJoZWxsbyB3b3JsZCIgfQ==",
              encoding: "base64"
            }
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/tags`,
        obj: {
          ok: false,
          short: "Failed Request",
          content: {
            status: 500
          }
        }
      }
    ];

    const tmpMock = webRequestMockHelper(mockData);

    const res = await vcs.newPackageData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Server Error");
    expect(res.content).toBe(`Failed to get gh tags for ${ownerRepo} - Server Error`);

  });

  test("Readme Error on Bad Web Request", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";
    const mockData = [
      {
        url: `/repos/${ownerRepo}`,
        obj: {
          ok: true,
          content: {
            body: {
              full_name: ownerRepo
            }
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/contents/package.json`,
        obj: {
          ok: true,
          content: {
            body: {
              content: "eyAibmFtZSI6ICJoZWxsbyB3b3JsZCIgfQ==",
              encoding: "base64"
            }
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/tags`,
        obj: {
          ok: true,
          content: {
            status: 200,
            body: [
              {
                name: "v1.101.0-beta",
                tarball_url: "https://api.github.com/repos/pulsar-edit/pulsar/tarball/refs/tags/v1.101.0-beta"
              }
            ]
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/contents/readme`,
        obj: {
          ok: false,
          short: "Failed Request",
          content: {
            status: 500
          }
        }
      }
    ];

    const tmpMock = webRequestMockHelper(mockData);

    const res = await vcs.newPackageData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Repo");
    expect(res.content).toBe(`Failed to get gh readme for ${ownerRepo} - Server Error`);
  });

  test("Returns Valid New Package Data with successful Requests", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";

    const mockData = [
      {
        url: `/repos/${ownerRepo}`,
        obj: {
          ok: true,
          content: {
            body: {
              full_name: ownerRepo
            }
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/contents/package.json`,
        obj: {
          ok: true,
          content: {
            body: {
              content: "eyAibmFtZSI6ICJwdWxzYXIiLCAidmVyc2lvbiI6ICJ2MS4xMDEuMC1iZXRhIiwgInJlcG9zaXRvcnkiOiAiaHR0cHM6Ly9naXRodWIuY29tL3B1bHNhci1lZGl0L3B1bHNhciIgfQ==",
              encoding: "base64"
            }
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/tags`,
        obj: {
          ok: true,
          content: {
            status: 200,
            body: [
              {
                name: "v1.101.0-beta",
                tarball_url: "https://api.github.com/repos/pulsar-edit/pulsar/tarball/refs/tags/v1.101.0-beta",
                commit: {
                  sha: "dca05a3fccdc7d202e4ce00a5a2d3edef50a640f"
                }
              }
            ]
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/contents/readme`,
        obj: {
          ok: true,
          content: {
            status: 200,
            body: {
              content: "VGhpcyBpcyBhIHJlYWRtZQ==",
              encoding: "base64"
            }
          }
        }
      }
    ];

    const tmpMock = webRequestMockHelper(mockData);

    const res = await vcs.newPackageData(userDataGeneric, ownerRepo, "git");
    expect(res.ok).toBe(true);
    expect(res.content.name).toBe("pulsar");
    expect(res.content.creation_method).toBe("User Made Package");
    expect(res.content.readme).toBe("This is a readme");
    expect(res.content.metadata.name).toBe("pulsar");
    expect(res.content.metadata.version).toBe("v1.101.0-beta");
    expect(res.content.metadata.repository).toBe("https://github.com/pulsar-edit/pulsar");
    expect(res.content.repository.type).toBe("git");
    expect(res.content.repository.url).toBe("https://github.com/pulsar-edit/pulsar");
    expect(res.content.versions["1.101.0-beta"]).toBeDefined();
    expect(res.content.versions["1.101.0-beta"].name).toBe("pulsar");
    expect(res.content.versions["1.101.0-beta"].version).toBe("v1.101.0-beta");
    expect(res.content.versions["1.101.0-beta"].repository).toBe("https://github.com/pulsar-edit/pulsar");
    expect(res.content.versions["1.101.0-beta"].tarball_url).toBe("https://api.github.com/repos/pulsar-edit/pulsar/tarball/refs/tags/v1.101.0-beta");
    expect(res.content.versions["1.101.0-beta"].sha).toBe("dca05a3fccdc7d202e4ce00a5a2d3edef50a640f");
    expect(res.content.releases.latest).toBe("1.101.0-beta");
  });
});

describe("Does newVersionData Return as Expected", () => {
  test("Package Error on Bad WebRequest", async () => {

    const ownerRepo = "confused-Techie/pulsar-backend";
    const mockData = [
      {
        url: `/repos/${ownerRepo}/contents/package.json`,
        obj: {
          ok: false,
          short: "Failed Request",
          content: {
            status: 500
          }
        }
      }
    ];

    const tmpMock = webRequestMockHelper(mockData);

    const res = await vcs.newVersionData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Package");
    expect(res.content).toBe(`Failed to get gh package for ${ownerRepo} - Server Error`);
  });

  test("Readme Error on Bad Web Request", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";
    const mockData = [
      {
        url: `/repos/${ownerRepo}/contents/readme`,
        obj: {
          ok: false,
          short: "Failed Request",
          content: {
            status: 500
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/contents/package.json`,
        obj: {
          ok: true,
          content: {
            status: 200,
            body: {
              content: "eyAibmFtZSI6ICJoZWxsbyB3b3JsZCIgfQ==",
              encoding: "base64"
            }
          }
        }
      }
    ];

    const tmpMock = webRequestMockHelper(mockData);

    const res = await vcs.newVersionData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Repo");
    expect(res.content).toBe(`Failed to get gh readme for ${ownerRepo} - Server Error`);
  });

  test("Tags Error on Bad Web Request", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";
    const mockData = [
      {
        url: `/repos/${ownerRepo}/tags`,
        obj: {
          ok: false,
          short: "Failed Request",
          content: {
            status: 500
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/contents/package.json`,
        obj: {
          ok: true,
          content: {
            body: {
              content: "eyAibmFtZSI6ICJwdWxzYXIiLCAidmVyc2lvbiI6ICJ2MS4xMDEuMC1iZXRhIiwgInJlcG9zaXRvcnkiOiAiaHR0cHM6Ly9naXRodWIuY29tL3B1bHNhci1lZGl0L3B1bHNhciIgfQ==",
              encoding: "base64"
            }
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/contents/readme`,
        obj: {
          ok: true,
          content: {
            status: 200,
            body: {
              content: "VGhpcyBpcyBhIHJlYWRtZQ==",
              encoding: "base64"
            }
          }
        }
      }
    ];

    const tmpMock = webRequestMockHelper(mockData);

    const res = await vcs.newVersionData(userDataGeneric, ownerRepo, "git");

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Server Error");
    expect(res.content).toBe(`Failed to get gh tags for ${ownerRepo} - Server Error`);
  });

  test("Returns Valid New Version Data with successful Requests", async () => {
    const ownerRepo = "confused-Techie/pulsar-backend";

    const mockData = [
      {
        url: `/repos/${ownerRepo}/tags`,
        obj: {
          ok: true,
          content: {
            status: 200,
            body: [
              {
                name: "v1.101.0-beta",
                tarball_url: "https://api.github.com/repos/pulsar-edit/pulsar/tarball/refs/tags/v1.101.0-beta",
                commit: {
                  sha: "dca05a3fccdc7d202e4ce00a5a2d3edef50a640f"
                }
              }
            ]
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/contents/package.json`,
        obj: {
          ok: true,
          content: {
            body: {
              content: "eyAibmFtZSI6ICJwdWxzYXIiLCAidmVyc2lvbiI6ICJ2MS4xMDEuMC1iZXRhIiwgInJlcG9zaXRvcnkiOiAiaHR0cHM6Ly9naXRodWIuY29tL3B1bHNhci1lZGl0L3B1bHNhciIgfQ==",
              encoding: "base64"
            }
          }
        }
      },
      {
        url: `/repos/${ownerRepo}/contents/readme`,
        obj: {
          ok: true,
          content: {
            status: 200,
            body: {
              content: "VGhpcyBpcyBhIHJlYWRtZQ==",
              encoding: "base64"
            }
          }
        }
      }
    ];

    const tmpMock = webRequestMockHelper(mockData);

    const res = await vcs.newVersionData(userDataGeneric, ownerRepo, "git");
    
    expect(res.ok).toBe(true);
    expect(res.content.name).toBe("pulsar");
    expect(res.content.repository.type).toBe("git");
    expect(res.content.repository.url).toBe("https://github.com/pulsar-edit/pulsar");
    expect(res.content.readme).toBe("This is a readme");
    expect(res.content.metadata.name).toBe("pulsar");
    expect(res.content.metadata.version).toBe("v1.101.0-beta");
    expect(res.content.metadata.tarball_url).toBe("https://api.github.com/repos/pulsar-edit/pulsar/tarball/refs/tags/v1.101.0-beta");
    expect(res.content.metadata.sha).toBe("dca05a3fccdc7d202e4ce00a5a2d3edef50a640f");
  });

});
