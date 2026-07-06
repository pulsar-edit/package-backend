jest.mock("../../src/storage.js");
const getBanList = require("../../src/storage.js").getBanList;

const utils = require("../../src/utils.js");

describe("isPackageNameBanned Tests", () => {
  test("Returns true correctly for banned item", async () => {
    getBanList.mockResolvedValue({ ok: true, content: ["banned-item"] });
    const name = "banned-item";

    const isBanned = await utils.isPackageNameBanned(name);

    expect(isBanned.ok).toBeTruthy();
  });

  test("Returns false correctly for non-banned item", async () => {
    getBanList.mockResolvedValue({ ok: true, content: ["banned-item"] });
    const name = "not-banned-item";

    const isBanned = await utils.isPackageNameBanned(name);

    expect(isBanned.ok).toBeFalsy();
  });

  test("Returns true if no banned list can be retrieved", async () => {
    getBanList.mockResolvedValue({ ok: false });

    const isBanned = await utils.isPackageNameBanned("any");

    expect(isBanned.ok).toBeTruthy();
  });
});

describe("engineFilter returns version expected.", () => {
  test("Returns First Position when given multiple valid positions.", async () => {
    const pack = {
      versions: {
        "2.0.0": {
          version: "2.0.0",
          engines: {
            atom: ">1.0.0 <2.0.0",
          },
        },
        "1.9.9": {
          version: "1.9.9",
          engines: {
            atom: ">1.0.0 <2.0.0",
          },
        },
      },
    };

    const engine = "1.5.0";

    const res = await utils.engineFilter(pack, engine);
    expect(res.metadata.version).toEqual("2.0.0");
  });

  test("Returns Matching version when given an equal upper bound.", async () => {
    const pack = {
      versions: {
        "2.0.0": {
          version: "2.0.0",
          engines: {
            atom: ">=1.5.0 <2.0.0",
          },
        },
        "1.9.9": {
          version: "1.9.9",
          engines: {
            atom: ">1.0.0 <=1.4.9",
          },
        },
      },
    };

    const engine = "1.4.9";

    const res = await utils.engineFilter(pack, engine);
    expect(res.metadata.version).toEqual("1.9.9");
  });

  test("Returns First Matching version on lower bond equal.", async () => {
    const pack = {
      versions: {
        "2.0.0": {
          version: "2.0.0",
          engines: {
            atom: ">=1.2.3 <2.0.0",
          },
        },
        "1.0.0": {
          version: "1.0.0",
          engines: {
            atom: ">1.0.0 <1.2.3",
          },
        },
      },
    };

    const engine = "1.2.3";

    const res = await utils.engineFilter(pack, engine);
    expect(res.metadata.version).toEqual("2.0.0");
  });

  test("Catches non String correctly", async () => {
    const pack = {
      versions: {
        "1.0.0": {
          version: "1.0.0",
        },
      },
    };
    const engine = { bad: "engine" };
    const res = await utils.engineFilter(pack, engine);
    expect(res.versions["1.0.0"]).toBeDefined();
    expect(res.versions["1.0.0"].version).toEqual("1.0.0");
  });

  test("Supports wildcard engines (like built in packages use)", async () => {
    const pack = {
      versions: {
        "1.0.0": {
          version: "1.0.0",
          engines: {
            atom: "*",
          },
        },
      },
    };

    const engine = "1.2.3";

    const res = await utils.engineFilter(pack, engine);
    expect(res.metadata.version).toEqual("1.0.0");
  });

  test("Handles Invalid engine filter", async () => {
    const res = await utils.engineFilter(
      {
        versions: {
          "1.0.0": {
            version: "1.0.0",
            engines: { atom: "*" },
          },
        },
      },
      "not-a-valid-semver"
    );
    expect(res.versions["1.0.0"]).toBeDefined();
    expect(res.versions["1.0.0"].version).toEqual("1.0.0");
    expect(res.metadata).not.toBeDefined();
  });

  test("Handles no engine declared on package", async () => {
    const res = await utils.engineFilter(
      {
        versions: {
          "1.0.0": {
            version: "1.0.0",
            engines: { notAtom: "*" },
          },
        },
      },
      "1.0.0"
    );
    expect(res.versions["1.0.0"]).toBeDefined();
    expect(res.versions["1.0.0"].version).toEqual("1.0.0");
    expect(res.metadata).not.toBeDefined();
  });

  test("Handles invalid range in package", async () => {
    const res = await utils.engineFilter(
      {
        versions: {
          "1.0.0": {
            version: "1.0.0",
            engines: { atom: "not-a-valid-range" },
          },
        },
      },
      "1.0.0"
    );
    expect(res.versions["1.0.0"]).toBeDefined();
    expect(res.versions["1.0.0"].version).toEqual("1.0.0");
    expect(res.metadata).not.toBeDefined();
  });
});

describe("Tests for getOwnerRepoFromPackage", () => {
  test("Returns Owner/repo for repository.url set into the package", () => {
    const repo = "pulsar-edit/package-backend";
    const url = `https://github.com/${repo}.git`;
    const res = utils.getOwnerRepoFromPackage({
      repository: { url: url },
    });
    expect(res).toEqual(repo);
  });
  test("Returns Owner/repo even when repository.url is not set into the package", () => {
    const repo = "pulsar-edit/package-backend";
    const url = `git@github.com:${repo}.git`;
    const res = utils.getOwnerRepoFromPackage({
      metadata: { repository: url },
    });
    expect(res).toEqual(repo);
  });
});

describe("Tests for getOwnerRepoFromUrlString", () => {
  test("Returns Owner/repo for valid string", () => {
    const repo = "pulsar-edit/package-backend";
    const url = `https://github.com/${repo}.git`;
    const res = utils.getOwnerRepoFromUrlString(url);
    expect(res).toEqual(repo);
  });
  test("Returns Owner/repo for valid string in the 'git@' format", () => {
    const repo = "pulsar-edit/package-backend";
    const url = `git@github.com:${repo}.git`;
    const res = utils.getOwnerRepoFromUrlString(url);
    expect(res).toEqual(repo);
  });
  test("Returns owner/repo for valid string even when final .git is missing", () => {
    const repo = "pulsar-edit/package-frontend";
    const url = `https://github.com/${repo}`;
    const res = utils.getOwnerRepoFromUrlString(url);
    expect(res).toEqual(repo);
  });
  test("Returns empty string for invalid repo", () => {
    const url = "https://github.com/pulsar-edit-I-Am-Not-Valid.git";
    const res = utils.getOwnerRepoFromUrlString(url);
    expect(res).toEqual("");
  });
  test("Returns owner/repo for another valid string", () => {
    const repo = "confused-Techie/atom-backend";
    const url = `https://github.com/${repo}.git`;
    const res = utils.getOwnerRepoFromUrlString(url);
    expect(res).toEqual(repo);
  });
  test("Returns owner/repo for valid string with special characters", () => {
    const repo = "confused-Techi_e/atom_-.backend";
    const url = `https://github.com/${repo}.git`;
    const res = utils.getOwnerRepoFromUrlString(url);
    expect(res).toEqual(repo);
  });
});
