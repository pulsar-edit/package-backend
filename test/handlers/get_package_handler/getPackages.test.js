const getPackageHandler = require("../../../src/handlers/get_package_handler.js");

describe("Handles unexpected database returns properly", () => {

  test("Database call fails", async () => {
    const res = await getPackageHandler.getPackages({}, {
      getSortedPackages: () => {
        return {
          ok: false,
          content: "Fake error"
        }
      }
    });

    expect(res.ok).toBeFalsy();
    expect(res.content.content).toBe("Fake error");
  });

  test("Database call returns an empty array", async () => {
    const res = await getPackageHandler.getPackages(
      {
        page: 1,
        sort: "relevance",
        direction: "desc",
        serviceType: "",
        service: "",
        serviceVersion: ""
      },
      {
        getSortedPackages: () => {
          return {
            ok: true,
            content: [],
            pagination: {
              count: 0,
              page: 1,
              total: 1,
              limit: 10
            }
          };
        }
      }
    );

    expect(res.ok).toBeTruthy();
    expect(Array.isArray(res.content)).toBeTruthy();
    expect(res.content.length).toBe(0);
  });

  test("Returns all proper pagination keys", async () => {
    const res = await getPackageHandler.getPackages(
      {
        page: 1,
        sort: "relevance",
        direction: "desc",
        serviceType: "",
        service: "",
        serviceVersion: ""
      },
      {
        getSortedPackages: () => {
          return {
            ok: true,
            content: [],
            pagination: {
              count: 0,
              page: 1,
              total: 1,
              limit: 10
            }
          };
        }
      }
    );

    expect(res.ok).toBeTruthy();
    expect(typeof res.link).toBe("string");
    expect(res.link.includes("desc")).toBeTruthy();
    expect(res.total).toBe(0);
    expect(res.limit).toBe(10);

  });

});
