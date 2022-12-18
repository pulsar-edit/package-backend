const query = require("../query.js");

// Page Testing

const page_cases = [
  [{ query: { page: "3" } }, 3],
  [{ query: {} }, 1],
  [{ query: { page: "2" } }, 2],
  [{ query: { page: "JustText" } }, 1],
  [{ query: { page: undefined } }, 1],
];
// once proper type conversion is implemented the last test should pass a string "2"

describe("Verify Page Query Returns", () => {
  test.each(page_cases)("Given %o Returns %p", (arg, expectedResult) => {
    expect(query.page(arg)).toBe(expectedResult);
  });
});

const sort_cases = [
  [{ query: { sort: "stars" } }, "stars"],
  [{ query: { sort: "starr" } }, "downloads"],
  [{ query: {} }, "downloads"],
];

describe("Verify Sort Query Returns", () => {
  test.each(sort_cases)("Given %o Returns %p", (arg, expectedResult) => {
    expect(query.sort(arg)).toBe(expectedResult);
  });
});

const dir_cases = [
  [{ query: { direction: "asc" } }, "asc"],
  [{ query: { direction: "desc" } }, "desc"],
  [{ query: {} }, "desc"],
  [{ query: { order: "asc" } }, "asc"],
  [{ query: { order: "BadOrder" } }, "desc"],
  [{ query: { direction: "BadDirection" } }, "desc"],
];

describe("Verify Direction Query Returns", () => {
  test.each(dir_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.dir(arg)).toBe(result);
  });
});

const order_cases = [
  [{ query: { order: "asc" } }, "asc"],
  [{ query: { order: "desc" } }, "desc"],
  [{ query: {} }, "desc"],
];

describe("Verify Order Query Returns", () => {
  test.each(order_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.dir(arg)).toBe(result);
  });
});

const query_cases = [
  [{ query: { q: "search-term" } }, "search-term"],
  [{ query: {} }, ""],
  [{ query: { q: "../your-secret.env" } }, ""], // malicious path traversal attempt
  //[{ query: { q: "%" } }, ""], // purposly causes a decodeURIComponent Error.
  // The above test is disabled, as ExpressJS will handle decodeURIComponents for us.
];

describe("Verify 'Query' Query Returns", () => {
  test.each(query_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.query(arg)).toBe(result);
  });
});

// query.engine() used to accept both the object and the string,
// but it has been simplified to accept only the string.
const engine_cases = [
  ["0.1.2", "0.1.2"],
  ["JustText", false],
  [undefined, false],
  ["2.5.6", "2.5.6"],
];

describe("Verify Engine Query Returns", () => {
  test.each(engine_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.engine(arg)).toBe(result);
  });
});

describe("Verify Auth Query Returns", () => {
  class SimpleReq {
    constructor(auth) {
      this.authHeader = auth;
    }
    get(headerType) {
      return this.authHeader;
    }
  }

  test("Properly Retreives Value", () => {
    const req = new SimpleReq("ValidHeader");
    const res = query.auth(req);
    expect(res).toEqual("ValidHeader");
  });
});

const repo_cases = [
  [{ query: { repository: "owner/repo" } }, "owner/repo"],
  [{ query: {} }, ""],
  [{ query: { repository: "InvalidRepo" } }, ""],
];

describe("Verify Repo Query Returns", () => {
  test.each(repo_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.repo(arg)).toBe(result);
  });
});

const tag_cases = [
  [{ query: { tag: "latest" } }, "latest"],
  [{ query: {} }, ""],
  [{ query: { tag: null } }, ""],
  [{ query: { tag: undefined } }, ""],
];

describe("Verify Tag Query Returns", () => {
  test.each(tag_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.tag(arg)).toBe(result);
  });
});

const rename_cases = [
  [{ query: { rename: "true" } }, true],
  [{ query: { rename: "false" } }, false],
  [{ query: {} }, false],
  [{ query: { rename: "Schrodinger" } }, false],
  [{ query: { rename: "TRUE" } }, true],
  [{ query: { rename: "FALSE" } }, false],
];

describe("Verify Rename Query Returns", () => {
  test.each(rename_cases)("Given %o Returns %p", (arg, result) => {
    expect(query.rename(arg)).toBe(result);
  });
});
