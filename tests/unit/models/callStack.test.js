const callStack = require("../../../src/models/callStack.js");
const hideValue = "*****";

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

    expect(after).toEqual({ token: hideValue });
  });

  test("Removes value of an unsafe string", () => {
    const cs = new callStack();

    const before = "gho_value";

    const after = cs.sanitize(before);

    expect(after).toEqual(hideValue);
  });

  test("Removes deeply nested unsafe string", () => {
    const cs = new callStack();

    const before = { value: { value: { value: { value: "github_pat_value" }}}};

    const after = cs.sanitize(before);

    expect(after).toEqual({ value: { value: { value: { value: hideValue }}}});
  });

  test("Removes unsafe value from array", () => {
    const cs = new callStack();

    const before = [{}, {}, { token: "super_secret" }];
    const after = cs.sanitize(before);

    expect(after).toEqual([{}, {}, { token: hideValue }]);
  });

  test("Doesn't break on 'null'", () => {
    const cs = new callStack();

    const before = null;
    const after = cs.sanitize(before);

    expect(after).toEqual(null);
  });

  test("Removes all known github token formats", () => {
    const cs = new callStack();

    const before = [
      { v1: "ghp_personal_access_token_classic" },
      { v2: "github_pat_fine_grained_personal_access_token" },
      { v3: "gho_oauth_access_token" },
      { v4: "ghu_user_access_token_for_github_app" },
      { v5: "ghs_installation_access_token" },
      { v6: "ghr_refresh_token_for_github_app" }
    ];
    const after = cs.sanitize(before);

    expect(after).toEqual([{v1: hideValue}, {v2: hideValue}, {v3: hideValue}, {v4: hideValue}, {v5: hideValue}, {v6: hideValue}]);
  });
});
