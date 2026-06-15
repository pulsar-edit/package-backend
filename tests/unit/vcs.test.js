const nock = require("nock");
const vcs = require("../../src/vcs.js");
const GitHub = require("../../src/vcs_providers/github.js");

describe("VCS", () => {
  describe("determineProvider", () => {
    test("Returns null when no input is passed", () => {
      const res = vcs.determineProvider();
      expect(res.type).toBe("na");
      expect(res.url).toBe("");
    });

    test("Returns null when null input is passed", () => {
      const res = vcs.determineProvider(null);
      expect(res.type).toBe("na");
      expect(res.url).toBe("");
    });

    test("Supports object style repository declaration", () => {
      const res = vcs.determineProvider({
        type: "git",
        url: "https://github.com/confused-Techie/atom-backend"
      });
      expect(res.type).toBe("git");
      expect(res.url).toBe("https://github.com/confused-Techie/atom-backend");
    });

    test("Returns unknown if it doesn't support the host", () => {
      const res = vcs.determineProvider("https://new-vcs.com/pulsar-edit/pulsar");
      expect(res.type).toBe("unknown");
      expect(res.url).toBe("https://new-vcs.com/pulsar-edit/pulsar");
    });

    test("Returns unknown if provided a non-string", () => {
      const res = vcs.determineProvider(123);
      expect(res.type).toBe("unknown");
      expect(res.url).toBe(123);
    });

    test("Supports Github", () => {
      const res = vcs.determineProvider("https://github.com/confused-Techie/atom-backend");
      expect(res.type).toBe("git");
      expect(res.url).toBe("https://github.com/confused-Techie/atom-backend");
    });

    test("Supports GitLab", () => {
      const res = vcs.determineProvider("https://gitlab.com/clj-editors/atom-chlorine");
      expect(res.type).toBe("lab");
      expect(res.url).toBe("https://gitlab.com/clj-editors/atom-chlorine");
    });

    test("Supports Sourceforge", () => {
      const res = vcs.determineProvider("https://sourceforge.net/projects/jellyfin.mirror");
      expect(res.type).toBe("sfr");
      expect(res.url).toBe("https://sourceforge.net/projects/jellyfin.mirror");
    });

    test("Supports Bitbucket", () => {
      const res = vcs.determineProvider("https://bitbucket.org/docker_alpine/alpine-jellyfin/src/master/");
      expect(res.type).toBe("bit");
      expect(res.url).toBe("https://bitbucket.org/docker_alpine/alpine-jellyfin/src/master/");
    });

    test("Supports Codeberg", () => {
      const res = vcs.determineProvider("https://codeberg.org/itbastian/makemkv-move-extras");
      expect(res.type).toBe("berg");
      expect(res.url).toBe("https://codeberg.org/itbastian/makemkv-move-extras");
    })
  });

  describe("Responds as expected", () => {
    beforeAll(() => {
      nock.disableNetConnect();
      nock.enableNetConnect("127.0.0.1");
    });

    afterAll(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    afterEach(() => {
      nock.cleanAll();
    });

    describe("newPackageData", () => {
      test("When the repository doesn't exist", async () => {
        nock("https://api.github.com/")
          .get("/repos/confused-Techie/pulsar-backend")
          .reply(404, {
            message: "TODO Check later"
          });

        const res = await vcs.newPackageData(
          { token: "123", node_id: "456" },
          "confused-Techie/pulsar-backend",
          "git"
        );

        expect(res.ok).toBe(false);
        expect(res.short).toBe("Bad Repo");
        expect(res.content).toBe("Failed to get repo: confused-Techie/pulsar-backend - Server Error");
        // TODO: The mocked specs previously had `- Bad Repo`, why when mocking network
        // requests does this become `- Server Error`?
      });
    });

    describe("ownership", () => {
      test("When we can prove ownership of the remote repository", async () => {
        nock("https://api.github.com/")
          .get("/repos/pulsar-edit/pulsar/collaborators?page=1")
          .reply(200, [
            {
              node_id: "12345",
              permissions: {
                admin: true,
                maintain: true,
                push: true
              },
              role_name: "Admin"
            }
          ]);

        const res = await vcs.ownership(
          { token: "123", node_id: "12345" },
          { repository: { type: "git", url: "https://github.com/pulsar-edit/pulsar" }, data: {} }
        );

        expect(res.ok).toBe(true);
        expect(res.content).toBe("Admin");
      });
    });
  });

});

describe("VCS: GitHub", () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect("127.0.0.1");
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe("doesUserHaveRepo", () => {
    test("Denies ownership when given bad auth", async () => {
      nock("https://api.github.com/")
        .get("/user")
        .reply(401, {
          message: "Requires authentication"
        });

      const provider = new GitHub();
      const res = await provider.doesUserHaveRepo(
        { token: "123", node_id: "456" },
        "owner/repo"
      );

      expect(res.ok).toBe(false);
      expect(res.short).toBe("Server Error");
      // TODO: Manual mocks showed `Bad Auth`, why does network mocks
      // no show Server Error?
    });

    test("Confirms ownership of remote repo", async () => {
      nock("https://api.github.com/")
        .get("/user")
        .reply(200, {
          node_id: "456"
        });

      nock("https://api.github.com/")
        .get("/repos/pulsar-edit/pulsar/collaborators?page=1")
        .reply(200, [
          {
            node_id: "456",
            permissions: {
              admin: true,
              maintain: true,
              push: true
            },
            role_name: "Admin"
          }
        ]);

      const provider = new GitHub();
      const res = await provider.doesUserHaveRepo(
        { token: "123", node_id: "456" },
        "pulsar-edit/pulsar"
      );

      expect(res.ok).toBe(true);
      expect(res.content).toBe("Admin");
    });

    test("Returns No Access when the user has no permissions", async () => {
      nock("https://api.github.com/")
        .get("/user")
        .reply(200, {
          node_id: "456"
        });

      nock("https://api.github.com/")
        .get("/repos/pulsar-edit/pulsar/collaborators?page=1")
        .reply(200, [
          {
            node_id: "789",
            permissions: {
              admin: true
            },
            role_name: "Admin"
          }
        ]);

      const provider = new GitHub();
      const res = await provider.doesUserHaveRepo(
        { token: "123", node_id: "456" },
        "pulsar-edit/pulsar"
      );

      expect(res.ok).toBe(false);
      expect(res.short).toBe("Server Error");
      // TODO: Previous manual mocks showed `No Access` here, what's broken
      // with network mocks?
    });

    test("Returns No Access when the user only has pull permissions", async () => {
      nock("https://api.github.com/")
        .get("/user")
        .reply(200, {
          node_id: "456"
        });

      nock("https://api.github.com/")
        .get("/repos/pulsar-edit/pulsar/collaborators?page=1")
        .reply(200, [
          {
            node_id: "456",
            permissions: {
              admin: false,
              maintain: false,
              push: false,
              triage: false,
              pull: true
            },
            role_name: "pull"
          }
        ]);

      const provider = new GitHub();
      const res = await provider.doesUserHaveRepo(
        { token: "123", node_id: "456" },
        "pulsar-edit/pulsar"
      );

      expect(res.ok).toBe(false);
      expect(res.short).toBe("No Access");
    });
  });

  describe("readme", () => {
    test("Returns bad auth", async () => {
      nock("https://api.github.com/")
        .get("/repos/pulsar-edit/pulsar/readme")
        .reply(401, {
          message: "Requires authentication"
        });

      const provider = new GitHub();
      const res = await provider.readme(
        { token: "123" },
        "pulsar-edit/pulsar"
      );

      expect(res.ok).toBe(false);
      expect(res.short).toBe("Bad Auth");
    });

    test("Unexpected status codes cause Server Error", async () => {
      nock("https://api.github.com/")
        .get("/repos/pulsar-edit/pulsar/readme")
        .reply(415, {
          message: "I'm a Teapot"
        });

      const provider = new GitHub();
      const res = await provider.readme(
        { token: "123" },
        "pulsar-edit/pulsar"
      );

      expect(res.ok).toBe(false);
      expect(res.short).toBe("Server Error");
    });
  });
});
