const PackageObject = require("../src/PackageObject.js");

describe("Building Objects with PackageObject Return as Expected", () => {

  test("Formal Usage", () => {
    const obj = new PackageObject()
      .setName("hello");

    expect(obj.name).toBe("hello");
  });

});
