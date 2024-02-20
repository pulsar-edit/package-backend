const callStack = require("../../../src/models/callStack.js");

describe("Sanitizes content as expected", () => {
  test("Leaves safe data unmodified", () => {
    const cs = new callStack();

    const before = {
      value: "Safe data"
    };

    const after = cs.sanitize(before);

    expect(after).toEqual(before);
  });

  test("Removes value of a key starting with 'token'", () => {
    const cs = new callStack();

    const before = {
      token: "super_secret"
    };

    const after = cs.sanitize(before);

    expect(after).toEqual({ token: "*****" });
  });
});
