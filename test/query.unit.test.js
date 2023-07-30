const query = require("../src/query.js");

// Page Testing

const pageCases = [
  [{ query: { page: "3" } }, 3],
  [{ query: {} }, 1],
  [{ query: { page: "2" } }, 2],
  [{ query: { page: "JustText" } }, 1],
  [{ query: { page: undefined } }, 1],
];
// once proper type conversion is implemented the last test should pass a string "2"

describe("Verify Page Query Returns", () => {
  test.each(pageCases)("Given %o Returns %p", (arg, expectedResult) => {
    expect(query.page(arg)).toBe(expectedResult);
  });
});

const sortCases = [
  [{ query: { sort: "stars" } }, "stars"],
  [{ query: { sort: "starr" } }, "downloads"],
  [{ query: {} }, "downloads"],
];

describe("Verify Sort Query Returns", () => {
  test.each(sortCases)("Given %o Returns %p", (arg, expectedResult) => {
    expect(query.sort(arg)).toBe(expectedResult);
  });
});

const dirCases = [
  [{ query: { direction: "asc" } }, "asc"],
  [{ query: { direction: "desc" } }, "desc"],
  [{ query: {} }, "desc"],
  [{ query: { order: "asc" } }, "asc"],
  [{ query: { order: "BadOrder" } }, "desc"],
  [{ query: { direction: "BadDirection" } }, "desc"],
];

describe("Verify Direction Query Returns", () => {
  test.each(dirCases)("Given %o Returns %p", (arg, result) => {
    expect(query.dir(arg)).toBe(result);
  });
});

const orderCases = [
  [{ query: { order: "asc" } }, "asc"],
  [{ query: { order: "desc" } }, "desc"],
  [{ query: {} }, "desc"],
];

describe("Verify Order Query Returns", () => {
  test.each(orderCases)("Given %o Returns %p", (arg, result) => {
    expect(query.dir(arg)).toBe(result);
  });
});

const queryCases = [
  [{ query: { q: "search-term" } }, "search-term"],
  [{ query: {} }, ""],
  [{ query: { q: "../your-secret.env" } }, ""], // malicious path traversal attempt
  //[{ query: { q: "%" } }, ""], // purposly causes a decodeURIComponent Error.
  // The above test is disabled, as ExpressJS will handle decodeURIComponents for us.
];

describe("Verify 'Query' Query Returns", () => {
  test.each(queryCases)("Given %o Returns %p", (arg, result) => {
    expect(query.query(arg)).toBe(result);
  });
});

// query.engine() used to accept both the object and the string,
// but it has been simplified to accept only the string.
const engineCases = [
  ["0.1.2", "0.1.2"],
  ["JustText", false],
  [undefined, false],
  ["2.5.6", "2.5.6"],
];

describe("Verify Engine Query Returns", () => {
  test.each(engineCases)("Given %o Returns %p", (arg, result) => {
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

  test("Properly Retrieves Value", () => {
    const req = new SimpleReq("ValidHeader");
    const res = query.auth(req);
    expect(res).toEqual("ValidHeader");
  });
});

const repoCases = [
  [{ query: { repository: "owner/repo" } }, "owner/repo"],
  [{ query: {} }, ""],
  [{ query: { repository: "InvalidRepo" } }, ""],
];

describe("Verify Repo Query Returns", () => {
  test.each(repoCases)("Given %o Returns %p", (arg, result) => {
    expect(query.repo(arg)).toBe(result);
  });
});

const tagCases = [
  [{ query: { tag: "latest" } }, "latest"],
  [{ query: {} }, ""],
  [{ query: { tag: null } }, ""],
  [{ query: { tag: undefined } }, ""],
];

describe("Verify Tag Query Returns", () => {
  test.each(tagCases)("Given %o Returns %p", (arg, result) => {
    expect(query.tag(arg)).toBe(result);
  });
});

const renameCases = [
  [{ query: { rename: "new-package-name" } }, true],
  [{ query: { rename: "" } }, false],
  [{ query: {} }, false],
  [{ query: { rename: "a" } }, true],
];

describe("Verify Rename Query Returns", () => {
  test.each(renameCases)("Given %o Returns %p", (arg, result) => {
    expect(query.rename(arg)).toBe(result);
  });
});

const serviceTypeCases = [
  [{ query: { serviceType: "consumed" } }, "consumedServices"],
  [{ query: { serviceType: "provided" } }, "providedServices"],
  [{ query: { serviceType: "invalid" } }, false],
  [{ query: {} }, false],
];

describe("Verify serviceType Returns", () => {
  test.each(serviceTypeCases)("Given %o Returns %p", (arg, result) => {
    expect(query.serviceType(arg)).toBe(result);
  });
});

const serviceVersionCases = [
  [{ query: { serviceVersion: "1.0.0" } }, "1.0.0"],
  [{ query: { serviceVersion: "1.0.0-abc" } }, "1.0.0-abc"],
  [{ query: { serviceVersion: "1234" } }, false],
  [{ query: {} }, false],
];

describe("Verify serviceVersion Returns", () => {
  test.each(serviceVersionCases)("Given %o Returns %p", (arg, result) => {
    expect(query.serviceVersion(arg)).toBe(result);
  });
});

const fileExtensionCases = [
  [{ query: { fileExtension: "css" } }, "css"],
  [{ query: { fileExtension: 123 } }, false],
  [{ query: {} }, false]
];

describe("Verify fileExtension Returns", () => {
  test.each(fileExtensionCases)("Given %o Returns %p", (arg, result) => {
    expect(query.fileExtension(arg)).toBe(result);
  });
});
