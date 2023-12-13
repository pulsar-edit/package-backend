const PackageObject = require("../../src/PackageObject.js");

describe("Building Objects with PackageObject Return as Expected", () => {
  test("Formal Usage", () => {
    const obj = new PackageObject().setName("hello");

    expect(obj.name).toBe("hello");
  });

  test("Adding multiple versions", () => {
    let obj = new PackageObject()
      .setName("hello")
      .setOwnerRepo("pulsar/hello")
      .setDownloads(100)
      .setStargazers(200)
      .setReadme("## Hello this is a readme!")
      .setRepositoryURL("https://github.com/pulsar-edit/hello")
      .setRepositoryType("git");

    obj.Version.addSemver("v1.101.0-beta")
      .addTarball("v1.101.0-beta", "https://nowhere.com")
      .addSha("v1.101.0-beta", "123")
      .addSemver("v1.101.1-beta")
      .addTarball("v1.101.1-beta", "https://nowhere.1.com")
      .addSha("v1.101.1-beta", "1234");

    expect(obj.Version.getLatestVersionSemver()).toBe("1.101.1-beta");
  });

  test("Adding Multiple Complicated Versions", () => {
    let obj = new PackageObject();

    obj.Version.addSemver("v1.101.0-beta");
    obj.Version.addSemver("v2.101.0-beta");
    obj.Version.addSemver("3.444.0");
    obj.Version.addSemver("v0.0.1-alpha");
    obj.Version.addSemver("v3.444.1-beta");

    expect(obj.Version.getLatestVersionSemver()).toBe("3.444.1-beta");
  });
});
