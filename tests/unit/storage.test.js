const storage = require("../../src/storage.js");

describe("Functions Return Proper Values", () => {
  test("getBanList Returns Array", async () => {
    let value = await storage.getBanList();
    expect(value.content).toBeArray();
  });

  test("getFeaturedPackages Returns Array", async () => {
    let value = await storage.getFeaturedPackages();
    expect(value.content).toBeArray();
  });

  test("getFeaturedThemes Returns Array", async () => {
    let value = await storage.getFeaturedThemes();
    expect(value.content).toBeArray();
  });
});
