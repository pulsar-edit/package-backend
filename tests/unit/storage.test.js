const storage = require("../../src/storage.js");

describe("Functions Return Proper Values", () => {
  test("getBanList Returns Array", async () => {
    let value = await storage.getBanList();
    expect(Array.isArray(value.content)).toBeTruthy();
  });

  test("getFeaturedPackages Returns Array", async () => {
    let value = await storage.getFeaturedPackages();
    expect(Array.isArray(value.content)).toBeTruthy();
  });

  test("getFeaturedThemes Returns Array", async () => {
    let value = await storage.getFeaturedThemes();
    expect(Array.isArray(value.content)).toBeTruthy();
  });
});
