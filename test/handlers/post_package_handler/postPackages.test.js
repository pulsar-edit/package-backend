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

describe("Calls `vcs.newPackageData()` appropriately", () => {

  test("Calls it with the expected data", async () => {
    const authPass = () => {
      return { ok: true, content: { username: "fake_username" } };
    };
    const dbPackageNameAvailability = () => {
      return { ok: true };
    };
    const ownership = () => {
      return { ok: true };
    };

    let vcsParams;
    const newPackageData = (user, repo, service) => {
      vcsParams = {
        user: user,
        repo: repo,
        service: service
      };
      return { ok: false };
    };

    const res = await postPackageHandler.postPackages(
      { repository: "pulsar-edit/pulsar" },
      { packageNameAvailability: dbPackageNameAvailability },
      { verifyAuth: authPass },
      { ownership: ownership, newPackageData: newPackageData }
    );

    expect(res.ok).toBeFalsy();
    // Now test what data was passed to vcs.newPackageData
    expect(vcsParams.user.username).toBe("fake_username");
    expect(vcsParams.repo).toBe("pulsar-edit/pulsar");
    expect(vcsParams.service).toBe("git"); // TODO: Once we stop hardcoding git

  });

  test("Returns the error from `vcs.newPackageData()`", async () => {
    const authPass = () => { return { ok: true, content: { username: "user" } }; };
    const nameAvail = () => { return { ok: true }; };
    const ownership = () => { return { ok: true }; };
    const newPackageData = () => {
      return {
        ok: false,
        content: "A random fake error"
      };
    };

    const res = await postPackageHandler.postPackages(
      { repository: "pulsar-edit/pulsar" },
      { packageNameAvailability: nameAvail },
      { verifyAuth: authPass },
      { ownership: ownership, newPackageData: newPackageData }
    );

    expect(res.ok).toBeFalsy();
    expect(res.content.content).toBe("A random fake error");

  });

});
