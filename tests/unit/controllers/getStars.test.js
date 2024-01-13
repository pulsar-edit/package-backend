const endpoint = require("../../../src/controllers/getStars.js");
const context = require("../../../src/context.js");

describe("Has features expected", () => {
  test("Has correct endpoint features", () => {
    const expected = {
      method: "GET",
      paths: ["/api/stars"],
      rateLimit: "generic",
      successStatus: 200,
    };

    expect(endpoint.endpoint).toMatchObject(expected);
  });
});

describe("Returns as expected", () => {
  test("When 'auth.verifyAuth' fails", async () => {
    const localContext = context;
    localContext.auth = {
      verifyAuth: () => {
        return { ok: false, content: "Test Failure" };
      },
    };

    const res = await endpoint.logic({}, localContext);

    expect(res.ok).toBe(false);
    expect(res.content).toBeDefined();
    expect(res.content.content).toBe("Test Failure");
  });

  test("When 'db.getStarredPointersByUserID' fails", async () => {
    const localContext = context;
    localContext.auth = {
      verifyAuth: () => {
        return { ok: true, content: { id: 1 } };
      },
    };
    localContext.database = {
      getStarredPointersByUserID: () => {
        return { ok: false, content: "db Test Failure" };
      },
    };

    const res = await endpoint.logic({}, localContext);

    expect(res.ok).toBe(false);
    expect(res.content).toBeDefined();
    expect(res.content.content).toBe("db Test Failure");
  });

  test("When the user has no stars", async () => {
    const localContext = context;
    localContext.auth = {
      verifyAuth: () => {
        return { ok: true, content: { id: 1 } };
      },
    };
    localContext.database = {
      getStarredPointersByUserID: () => {
        return { ok: true, content: [] };
      },
    };

    const res = await endpoint.logic({}, localContext);

    expect(res.ok).toBe(true);
    expect(res.content).toBeArray();
    expect(res.content.length).toBe(0);
  });

  test("When 'db.getPackageCollectionByID' fails", async () => {
    const localContext = context;
    localContext.auth = {
      verifyAuth: () => {
        return { ok: true, content: { id: 1 } };
      },
    };
    localContext.database = {
      getStarredPointersByUserID: () => {
        return { ok: true, content: ["an_id"] };
      },
      getPackageCollectionByID: () => {
        return { ok: false, content: "Another DB Error" };
      },
    };

    const res = await endpoint.logic({}, localContext);

    expect(res.ok).toBe(false);
    expect(res.content.content).toBe("Another DB Error");
  });

  test("When request succeeds", async () => {
    const localContext = context;
    localContext.auth = {
      verifyAuth: () => {
        return { ok: true, content: { id: 1 } };
      },
    };
    localContext.database = {
      getStarredPointersByUserID: () => {
        return { ok: true, content: ["an_id"] };
      },
      getPackageCollectionByID: () => {
        return { ok: true, content: {} };
      },
    };
    localContext.utils = {
      constructPackageObjectShort: () => {
        return { item: "is_a_package" };
      },
    };

    const res = await endpoint.logic({}, localContext);

    expect(res.ok).toBe(true);
    expect(res.content.item).toBe("is_a_package");
  });
});
