const getPackageHandler = require("../../../src/handlers/get_package_handler.js");

describe("Searching Packages Returns Pagination properly", () => {
  test("When there are no results for a search", async () => {
    const res = await getPackageHandler.getPackagesSearch(
      {
        page: 1,
        sort: "relevance",
        direction: "desc",
        query: "word",
      },
      {
        simpleSearch: () => {
          return {
            ok: true,
            content: [],
            pagination: {
              count: 0,
              page: 0,
              total: 0,
              limit: 30,
            },
          };
        },
      }
    );

    expect(res.ok).toBeTruthy();
    expect(Array.isArray(res.content)).toBeTruthy();
    expect(res.content.length).toBe(0);
    expect(res.limit).toBe(30);
    expect(res.total).toBe(0);
  });
});
