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
    expect(res.metadata.version === "2.0.0");
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
    expect(res.metadata.version === "1.9.9");
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
    expect(res.metadata.version === "2.0.0");
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
});

describe("Tests against semverArray", () => {
  test("Returns valid data back for 1.0.1", () => {
    const ver = "1.0.1";
    const res = utils.semverArray(ver);
    expect(res.length).toEqual(3);
    expect(res[0]).toEqual("1");
    expect(res[1]).toEqual("0");
    expect(res[2]).toEqual("1");
  });
  test("Returns valid data back for 2.4.16", () => {
    const ver = "2.4.16";
    const res = utils.semverArray(ver);
    expect(res.length).toEqual(3);
    expect(res[0]).toEqual("2");
    expect(res[1]).toEqual("4");
    expect(res[2]).toEqual("16");
  });
  test("Returns valid data back for 200.4180.2", () => {
    const ver = "200.4180.2";
    const res = utils.semverArray(ver);
    expect(res.length).toEqual(3);
    expect(res[0]).toEqual("200");
    expect(res[1]).toEqual("4180");
    expect(res[2]).toEqual("2");
  });
  test("Returns invalid data for an invalid string format", () => {
    const ver = " 1.2.3";
    const res = utils.semverArray(ver);
    expect(res).toEqual(null);
  });
  test("Returns invalid data for null passed", () => {
    const ver = null;
    const res = utils.semverArray(ver);
    expect(res).toEqual(null);
  });
  test("Returns invalid data for array passed", () => {
    const ver = [];
    const res = utils.semverArray(ver);
    expect(res).toEqual(null);
  });
  test("Returns invalid data for Object passed", () => {
    const ver = {};
    const res = utils.semverArray(ver);
    expect(res).toEqual(null);
  });
  test("Returns invalid data for Number passed", () => {
    const ver = 2;
    const res = utils.semverArray(ver);
    expect(res).toEqual(null);
  });
});

describe("Tests against semverGt", () => {
  test("Returns True with Valid data", () => {
    const gVer = ["1", "0", "1"];
    const lVer = ["1", "0", "0"];
    const res = utils.semverGt(gVer, lVer);
    expect(res).toBeTruthy();
  });
  test("Returns True with Valid Data first position", () => {
    const res = utils.semverGt(["2", "0", "0"], ["1", "0", "0"]);
    expect(res).toBeTruthy();
  });
  test("Returns True with Valid Data second position", () => {
    const res = utils.semverGt(["1", "2", "0"], ["1", "1", "0"]);
    expect(res).toBeTruthy();
  });
  test("Returns True with Valid Data third position", () => {
    const res = utils.semverGt(["1", "1", "2"], ["1", "1", "1"]);
    expect(res).toBeTruthy();
  });
  test("Returns false with Valid Data first position", () => {
    const res = utils.semverGt(["1", "0", "0"], ["2", "0", "0"]);
    expect(res).toBeFalsy();
  });
  test("Returns false with Valid Data second position", () => {
    const res = utils.semverGt(["1", "1", "0"], ["1", "2", "0"]);
    expect(res).toBeFalsy();
  });
  test("Returns false with Valid Data thrid position", () => {
    const res = utils.semverGt(["1", "1", "1"], ["1", "1", "2"]);
    expect(res).toBeFalsy();
  });
  test("Returns False with Valid data", () => {
    const ver1 = ["1", "0", "0"];
    const ver2 = ["1", "0", "1"];
    const res = utils.semverGt(ver1, ver2);
    expect(res).toBeFalsy();
  });
  test("Returns False with Equal data", () => {
    const ver1 = ["1", "1", "1"];
    const ver2 = ["1", "1", "1"];
    const res = utils.semverGt(ver1, ver2);
    expect(res).toBeFalsy();
  });
});

describe("Tests against semverLt", () => {
  test("Returns true with Valid Data first position", () => {
    const res = utils.semverLt(["0", "0", "9"], ["1", "0", "0"]);
    expect(res).toBeTruthy();
  });
  test("Returns true with Valid Data second position", () => {
    const res = utils.semverLt(["1", "1", "1"], ["1", "2", "1"]);
    expect(res).toBeTruthy();
  });
  test("Returns true with Valid Data third position", () => {
    const res = utils.semverLt(["1", "1", "1"], ["1", "1", "2"]);
    expect(res).toBeTruthy();
  });
  test("Returns false with Valid Data first position", () => {
    const res = utils.semverLt(["2", "0", "0"], ["1", "0", "0"]);
    expect(res).toBeFalsy();
  });
  test("Returns false with Valid Data second position", () => {
    const res = utils.semverLt(["1", "2", "1"], ["1", "1", "0"]);
    expect(res).toBeFalsy();
  });
  test("Returns false with Valid Data third position", () => {
    const res = utils.semverLt(["1", "1", "2"], ["1", "1", "1"]);
    expect(res).toBeFalsy();
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
