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
      },
      {}
    );

    expect(res.ok).toBeFalsy();
    expect(res.content.content).toBe("Fake auth failure");
  });

});

describe("Handles an Repository and package name appropriately", () => {

  test("When the repository is empty", async () => {
    const res = await postPackageHandler.postPackages(
      { repository: "" },
      {},
      {
        verifyAuth: () => { return { ok: true, content: { username: "fake"} }; }
      },
      {}
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
      { verifyAuth: authPass },
      {}
    );

    expect(res.ok).toBeFalsy();
    expect(res.content.short).toBe("Bad Repo");

  });

  test("When the repository is a banned name", async () => {
    const authPass = () => {
      return { ok: true, content: { username: "fake" } };
    };

    const res = await postPackageHandler.postPackages(
      { repository: "pulsar-edit/slot-pulsa" },
      {},
      { verifyAuth: authPass },
      {}
    );

    expect(res.ok).toBeFalsy();
    expect(res.content.short).toBe("Server Error");
    expect(res.content.content).toBe("Package Name is banned.");
  });

  test("When the package name is not available", async () => {
    const authPass = () => {
      return { ok: true, content: { username: "fake" } };
    };
    const dbPackageNameAvailability = () => {
      return { ok: false, short: "Not Found" };
    };

    const res = await postPackageHandler.postPackages(
      { repository: "pulsar-edit/pulsar" },
      { packageNameAvailability: dbPackageNameAvailability },
      { verifyAuth: authPass },
      {}
    );

    expect(res.ok).toBeFalsy();
    expect(res.content.short).toBe("Package Exists");
  });

  test("When the package name availability db call fails", async () => {
    const authPass = () => {
      return { ok: true, content: { username: "fake" } };
    };
    const dbPackageNameAvailability = () => {
      return { ok: false, short: "Server Error", content: "Fake failure" };
    };

    const res = await postPackageHandler.postPackages(
      { repository: "pulsar-edit/pulsar" },
      { packageNameAvailability: dbPackageNameAvailability },
      { verifyAuth: authPass },
      {}
    );

    expect(res.ok).toBeFalsy();
    expect(res.content.short).toBe("Server Error");
    expect(res.content.content).toBe("Fake failure");

  });

});

describe("Properly returns failed ownership check", () => {

  test("When VCS Returns an error", async () => {
    const authPass = () => {
      return { ok: true, content: { username: "fake" } };
    };
    const dbPackageNameAvailability = () => {
      return { ok: true };
    };
    const ownership = () => {
      return { ok: false, content: "Fake VCS error" };
    };

    const res = await postPackageHandler.postPackages(
      { repository: "pulsar-edit/pulsar" },
      { packageNameAvailability: dbPackageNameAvailability },
      { verifyAuth: authPass },
      { ownership: ownership }
    );

    expect(res.ok).toBeFalsy();
    expect(res.content.content).toBe("Fake VCS error");
  });

});
