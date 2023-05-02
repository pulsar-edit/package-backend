const postPackageHandler = require("../../../src/handlers/post_package_handler.js");

describe("Handles invalid auth", () => {

  test("When auth fails", async () => {
    const res = await postPackageHandler.postPackages(
      {},
      {},
      {
        // This is the fake auth module
        verifyAuth: () => {
          return {
            ok: false,
            content: "Fake auth failure"
          };
        }
      }
    );

    expect(res.ok).toBeFalsy();
    expect(res.content.content).toBe("Fake auth failure");
  });

});

describe("Handles an invalid Repository", () => {

  test("When the repository is empty", async () => {
    const res = await postPackageHandler.postPackages(
      { repository: "" },
      {},
      {
        verifyAuth: () => { return { ok: true, content: { username: "fake"} }; }
      }
    );

    expect(res.ok).toBeFalsy();
    expect(res.content.short).toBe("Bad Repo");
  });

  test("When the repository is invalid", async () => {
    const authPass = () => {
      return {
        ok: true,
        content: { username: "fake" }
      }
    };

    const res = await postPackageHandler.postPackages(
      { repository: "just-a-long-string" },
      {},
      { verifyAuth: authPass }
    );

    expect(res.ok).toBeFalsy();
    expect(res.content.short).toBe("Bad Repo");

  });

});
