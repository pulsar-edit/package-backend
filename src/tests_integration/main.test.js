// This can be considered the integration test, while everything else is a unit test.
// This takes the API endpoints themselves, and tests general functionality as best it can.
// Really testing the type of objects are returned, and specific errors are returned.
// It will try to avoid expecting exact values, but may rely on test data.

const request = require("supertest");
let app;

jest.setTimeout(300000);

// The following will be declarations of all predefined Error Messages returned.
// This way we can easily reference them and update them as needed.

const msg = {
  badRepoJSON:
    "That repo does not exist, isn't an atom package, or atombot does not have access.",
  badAuth:
    "Requires authentication. Please update your token if you haven't done so recently.",
  notSupported: "While under development this feature is not supported.",
  publishPackageExists: "A Package by that name already exists.",
  notFound: "Not Found",
  notFoundSite: "This is a standin for the proper site wide 404 page.",
  serverError: "Application Error",
  badPackageJSON: "The package.json at owner/repo isn't valid.",
};

beforeAll(async () => {
  let db_url = process.env.DATABASE_URL;
  // this gives us something like postgres://test-user@localhost:5432/test-db
  // We then need to map these values to where the API server expects,
  let db_url_reg = /postgres:\/\/([\/\S]+)@([\/\S]+):(\d+)\/([\/\S]+)/;
  let db_url_parsed = db_url_reg.exec(db_url);

  // set the parsed URL as proper env
  process.env.DB_HOST = db_url_parsed[2];
  process.env.DB_USER = db_url_parsed[1];
  process.env.DB_DB = db_url_parsed[4];
  process.env.DB_PORT = db_url_parsed[3];

  // Then since we want to make sure we don't initialize the config module, before we have set our values,
  // we will define our own port to use here.
  process.env.PORT = 8080;

  app = require("../main.js");
});

expect.extend({
  toBeArray(value) {
    if (Array.isArray(value)) {
      return {
        pass: true,
        message: () => "",
      };
    } else {
      return {
        pass: false,
        message: () =>
          `Expected Array but received: ${this.utils.printReceived(value)}`,
      };
    }
  },
  toHaveHTTPCode(req, want) {
    if (req.statusCode == want) {
      return {
        pass: true,
        message: () => "",
      };
    } else {
      return {
        pass: false,
        message: () =>
          `Expected HTTP Status Code: ${want} but got ${req.statusCode}`,
      };
    }
  },
});

describe("Get /", () => {
  test("Should Respond with Json Message of Server Running", async () => {
    const res = await request(app).get("/");
    expect(res.body.message).toEqual(
      expect.stringContaining("Server is up and running Version")
    );
  });
  test("Should Return valid status code", async () => {
    const res = await request(app).get("/");
    expect(res).toHaveHTTPCode(200);
  });
  test("Should 404 on invalid method", async () => {
    const res = await request(app).patch("/");
    expect(res).toHaveHTTPCode(404);
  });
});

describe("Get /api/login", () => {
  test("Returns proper Status Code", async () => {
    const res = await request(app).get("/api/login");
    expect(res).toHaveHTTPCode(302);
  });
  // As for testing the rest of the behavior is near impossible.
  // Since it relies so heavily on GitHub.
});

describe("Get /api/oauth", () => {
  test("Returns Not Found Status Code when provided no State", async () => {
    const res = await request(app).get("/api/oauth");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message when provided no State", async () => {
    const res = await request(app).get("/api/oauth");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test.todo(
    "Can we test? This section has been tested manually. But beyond that seems impossible to truly test."
  );
});

describe("Get /api/packages", () => {
  test("Should respond with an array of packages.", async () => {
    const res = await request(app).get("/api/packages");
    expect(res.body).toBeArray();
  });
  test("Should return valid Status Code", async () => {
    const res = await request(app).get("/api/packages");
    expect(res).toHaveHTTPCode(200);
  });
  test("Should respond with an array containing valid data", async () => {
    const res = await request(app).get("/api/packages");
    for (const p of res.body) {
      expect(typeof p.name === "string").toBeTruthy();
      // PostgreSQL numeric types are not fully compatible with js Number type
      expect(`${p.stargazers_count}`.match(/^\d+$/) === null).toBeFalsy();
      expect(`${p.downloads}`.match(/^\d+$/) === null).toBeFalsy();
      expect(typeof p.releases.latest === "string").toBeTruthy();
    }
  });
  test("Should respond with an array not containing sensible data", async () => {
    const res = await request(app).get("/api/packages");
    for (const p of res.body) {
      // Use type coercion to catch also undefined
      expect(p.pointer == null).toBeTruthy();
    }
  });
  test("Should 404 on invalid Method", async () => {
    const res = await request(app).patch("/api/packages");
    expect(res).toHaveHTTPCode(404);
  });
  test("Should respond with an array of packages sorted by creation date.", async () => {
    const res = await request(app).get(
      "/api/packages?page=2&sort=created_at&direction=asc"
    );
    expect(res.body).toBeArray();
  });
  test("Should return valid Status Code", async () => {
    const res = await request(app).get(
      "/api/packages?page=2&sort=created_at&direction=asc"
    );
    expect(res).toHaveHTTPCode(200);
  });
  test("Should respond with an array of packages sorted by stars.", async () => {
    const res = await request(app).get(
      "/api/packages?page=3&sort=stars&direction=desc"
    );
    expect(res.body).toBeArray();
  });
  test("Should return valid Status Code", async () => {
    const res = await request(app).get(
      "/api/packages?page=3&sort=stars&direction=desc"
    );
    expect(res).toHaveHTTPCode(200);
  });
  test("Should return valid Status Code on invalid parameters", async () => {
    const res = await request(app).get(
      "/api/packages?page=nv&sort=nv&direction=nv"
    );
    expect(res).toHaveHTTPCode(200);
  });
});

describe("Post /api/packages", () => {
  test("Fails with 'Bad Auth' when bad token is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/langauge-css" })
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Fails with 401 with bad token", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language-css" })
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Fails with 'badRepoJSON' when no repo is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.badRepoJSON);
  });
  test("Fails with 400 when no repo is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "" })
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(400);
  });
  test("Fails with 'badRepoJSON' when bad repo is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "notARepo" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.badRepoJSON);
  });
  test("Fails with 'badRepoJSON' when Repo with a space is passed", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language CSS" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.badRepoJSON);
  });
  test("Fails with 400 when bad repo is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "notARepo" })
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(400);
  });
  test("Fails with 'publishPackageExists' when existing package is passed", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language-css" })
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.publishPackageExists);
  });
  test("Fails with 409 when existing package is passed.", async () => {
    const res = await request(app)
      .post("/api/packages")
      .query({ repository: "pulsar-edit/language-css" })
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(409);
  });
  test.todo("Tests that actually modify data");
});

describe("GET /api/packages/featured", () => {
  test("Returns Successful Status Code", async () => {
    const res = await request(app).get("/api/packages/featured");
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns Array", async () => {
    const res = await request(app).get("/api/packages/featured");
    expect(res.body).toBeArray();
  });
  test("Returns Valid Data", async () => {
    const res = await request(app).get("/api/packages/featured");
    for (const p of res.body) {
      expect(typeof p.name === "string").toBeTruthy();
      // PostgreSQL numeric types are not fully compatible with js Number type
      expect(`${p.stargazers_count}`.match(/^\d+$/) === null).toBeFalsy();
      expect(`${p.downloads}`.match(/^\d+$/) === null).toBeFalsy();
      expect(typeof p.releases.latest === "string").toBeTruthy();
    }
  });
  test("Does Not Return Sensible Data", async () => {
    const res = await request(app).get("/api/packages/featured");
    for (const p of res.body) {
      // Use type coercion to catch also undefined
      expect(p.pointer == null).toBeTruthy();
    }
  });
});

describe("GET /api/packages/search", () => {
  test("Valid Search Returns Array", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    expect(res.body).toBeArray();
  });
  test("Valid Search Returns Success Status Code", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    expect(res).toHaveHTTPCode(200);
  });
  test("Valid Search Returns Valid Data", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    for (const p of res.body) {
      expect(typeof p.name === "string").toBeTruthy();
      // PostgreSQL numeric types are not fully compatible with js Number type
      expect(`${p.stargazers_count}`.match(/^\d+$/) === null).toBeFalsy();
      expect(`${p.downloads}`.match(/^\d+$/) === null).toBeFalsy();
      expect(typeof p.releases.latest === "string").toBeTruthy();
    }
  });
  test("Valid Search Does Not Return Sensible Data", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    for (const p of res.body) {
      // Use type coercion to catch also undefined
      expect(p.pointer == null).toBeTruthy();
    }
  });
  test("Invalid Search Returns Array", async () => {
    const res = await request(app).get("/api/packages/search?q=not-one-match");
    expect(res.body).toBeArray();
  });
  test("Invalid Search Returns Empty Array", async () => {
    const res = await request(app).get("/api/packages/search?q=not-one-match");
    expect(res.body.length).toBeLessThan(1);
  });
  test("Has the correct default DESC listing", async () => {
    const res = await request(app).get("/api/packages/search?q=language");
    expect(res.body[0].name).toBe("language-cpp");
  });
  test("Sets ASC listing correctly", async () => {
    const res = await request(app)
      .get("/api/packages/search?q=language")
      .query({ direction: "asc" });
    expect(res.body[0].name).toBe("language-css");
  });
  test("Sets ASC listing correctly with internal param", async () => {
    const res = await request(app)
      .get("/api/packages/search?q=language")
      .query({ order: "asc" });
    expect(res.body[0].name).toBe("language-css");
  });
  test("Ignores invalid 'direction'", async () => {
    const res = await request(app)
      .get("/api/packages/search?q=language")
      .query({ order: "this-should-not-work" });
    expect(res.body[0].name).toBe("language-cpp");
  });
});

describe("GET /api/packages/:packageName", () => {
  test("Valid package, gives correct object", async () => {
    const res = await request(app).get("/api/packages/language-css");
    expect(res.body.name).toBe("language-css");
  });
  test("Valid Mix-caps Package, gives correct object", async () => {
    const res = await request(app).get("/api/packages/LanguAge-CSs");
    expect(res.body.name).toBe("language-css");
  });
  test("Valid package contains valid data", async () => {
    const res = await request(app).get("/api/packages/language-css");
    // PostgreSQL numeric types are not fully compatible with js Number type
    expect(`${res.body.stargazers_count}`.match(/^\d+$/) === null).toBeFalsy();
    expect(`${res.body.downloads}`.match(/^\d+$/) === null).toBeFalsy();
    expect(typeof res.body.releases.latest === "string").toBeTruthy();
    for (const v of Object.keys(res.body.versions)) {
      expect(typeof res.body.versions[v].license === "string").toBeTruthy();
    }
  });
  test("Valid package, does not return sensible data", async () => {
    const res = await request(app).get("/api/packages/language-css");
    // Use type coercion to catch also undefined
    expect(res.body.pointer == null).toBeTruthy();
    for (const v of Object.keys(res.body.versions)) {
      expect(res.body.versions[v].id == null).toBeTruthy();
      expect(res.body.versions[v].package == null).toBeTruthy();
    }
  });
  test("Valid package, gives success status code", async () => {
    const res = await request(app).get("/api/packages/language-css");
    expect(res).toHaveHTTPCode(200);
  });
  test("Invalid Package, gives 'Not Found'", async () => {
    const res = await request(app).get("/api/packages/invalid-package");
    expect(res.body.message).toBe("Not Found");
  });
  test("Invalid package, gives not found status code", async () => {
    const res = await request(app).get("/api/packages/invalid-package");
    expect(res).toHaveHTTPCode(404);
  });
});

describe("DELETE /api/packages/:packageName", () => {
  test("No Auth, returns 401", async () => {
    const res = await request(app).delete("/api/packages/language-css");
    expect(res).toHaveHTTPCode(401);
  });
  test("No Auth, returns 'Bad Auth' with no token", async () => {
    const res = await request(app).delete("/api/packages/language-css");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 401 with Invalid Token", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Msg with Invalid Token", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns Bad Auth Msg with Valid Token, but no repo access", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css")
      .set("Authorization", "no-valid-token");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns Bad Auth Http with Valid Token, but no repo access", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css")
      .set("Authorization", "no-valid-token");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Success Message & HTTP with Valid Token", async () => {
    const res = await request(app)
      .delete("/api/packages/atom-material-ui")
      .set("Authorization", "admin-token");
    expect(res).toHaveHTTPCode(204);

    const after = await request(app).get("/api/packages");
    // This ensures our deleted package is no longer in the full package list.
    expect(after.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "atom-material-ui",
        }),
      ])
    );
  });
  // The ^^ above ^^ reads:
  //  * Expect your Array does NOT Equal
  //  * An Array that contains
  //  * An Object that Contains
  //  * The property { name: "atom-material-ui" }
});

describe("POST /api/packages/:packageName/star", () => {
  test("Returns 401 with No Auth", async () => {
    const res = await request(app).post("/api/packages/language-css/star");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Msg with No Auth", async () => {
    const res = await request(app).post("/api/packages/langauge-css/star");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 401 with Bad Auth", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/star")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Msg with Bad Auth", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/star")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 404 with bad package", async () => {
    const res = await request(app)
      .post("/api/packages/language-golang/star")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found msg with bad package", async () => {
    const res = await request(app)
      .post("/api/packages/language-golang/star")
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns proper data on Success", async () => {
    const prev = await request(app).get("/api/packages/language-css");
    const res = await request(app)
      .post("/api/packages/language-css/star")
      .set("Authorization", "valid-token");
    const dup = await request(app)
      .post("/api/packages/language-css/star")
      .set("Authorization", "valid-token");
    // We are preforming multiple checks in the single check,
    // because we want to test a star action when the package is already starred.

    // DESCRIBE: Returns Success Status Code
    expect(res).toHaveHTTPCode(200);
    // DESCRIBE: Returns same Package
    expect(res.body.name).toEqual("language-css");
    // DESCRIBE: Properly Increases Star Count
    expect(parseInt(res.body.stargazers_count, 10)).toEqual(
      parseInt(prev.body.stargazers_count, 10) + 1
    );
    // DESCRIBE: A duplicate Request Returns Success Status Code
    expect(dup).toHaveHTTPCode(200);
    // DESCRIBE: A duplicate Request keeps the star, but does not increase the count
    expect(parseInt(res.body.stargazers_count, 10)).toEqual(
      parseInt(dup.body.stargazers_count, 10)
    );
  });
});

describe("DELETE /api/packages/:packageName/star", () => {
  test("Returns 401 with No Auth", async () => {
    const res = await request(app).delete("/api/packages/langauge-css/star");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with No Auth", async () => {
    const res = await request(app).delete("/api/packages/langauge-css/star");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 401 with Bad Auth", async () => {
    const res = await request(app)
      .delete("/api/packages/langauge-css/star")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with Bad Auth", async () => {
    const res = await request(app)
      .delete("/api/packages/langauge-css/star")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 404 with bad package", async () => {
    const res = await request(app)
      .delete("/api/packages/language-golang/star")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message with bad package", async () => {
    const res = await request(app)
      .delete("/api/packages/language-golang/star")
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 201 on Success", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css/star")
      .set("Authorization", "all-star-token");
    expect(res).toHaveHTTPCode(201);
  });
  test("Returns 201 even when the package is not starred", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css/star")
      .set("Authorization", "no-star-token");
    expect(res).toHaveHTTPCode(201);
  });
});

describe("GET /api/packages/:packageName/stargazers", () => {
  test("Returns 404 with Bad Package", async () => {
    const res = await request(app).get(
      "/api/packages/language-golang/stargazers"
    );
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message with Bad Packages", async () => {
    const res = await request(app).get(
      "/api/packages/language-golang/stargazers"
    );
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 200 with Valid Packages", async () => {
    const res = await request(app).get("/api/packages/language-css/stargazers");
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns an Array with Valid Package", async () => {
    const res = await request(app).get("/api/packages/language-css/stargazers");
    expect(res.body).toBeArray();
  });
  test("Returns a Non Empty Array", async () => {
    const res = await request(app).get("/api/packages/language-css/stargazers");
    expect(res.body.length).toBeGreaterThan(0);
  });
  test("Returns Array, containing Objects with login and string", async () => {
    const res = await request(app).get("/api/packages/language-css/stargazers");
    expect(res.body[0].login).toBeTruthy();
    expect(typeof res.body[0].login === "string").toBeTruthy();
  });
});

describe("POST /api/packages/:packageName/versions", () => {
  test("Returns 404 with Bad Package", async () => {
    const res = await request(app).post(
      "/api/packages/language-golang/versions"
    );
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with No Auth", async () => {
    const res = await request(app).post(
      "/api/packages/language-golang/versions"
    );
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test.todo("Write all tests on this endpoint");
});

describe("GET /api/packages/:packageName/versions/:versionName", () => {
  test("Returns 404 with Bad Package", async () => {
    const res = await request(app).get(
      "/api/packages/language-golang/versions/1.0.0"
    );
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message with Bad Package", async () => {
    const res = await request(app).get(
      "/api/packages/language-golang/versions/1.0.0"
    );
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 404 with Valid Package - Invalid Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/1.0.0"
    );
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message with Valid Package = Invalid Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/1.0.0"
    );
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 404 with Valid Package - Invalid Formated Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/ThisIsNotAVersion"
    );
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message with Valid Package - Invalid Formatted Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/ThisIsNotAVersion"
    );
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 200 with Valid Params", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/0.45.7"
    );
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns Valid Data on Expected Package Name with Valid Params", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/0.45.7"
    );
    expect(res.body.name).toEqual("language-css");
    expect(typeof res.body.dist.tarball === "string").toBeTruthy();
  });
  test("Does Not Return Sensible Data on Expected Package Name with Valid Params", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/0.45.7"
    );
    // Use type coercion to catch also undefined
    expect(res.body.id == null).toBeTruthy();
    expect(res.body.package == null).toBeTruthy();
    expect(res.body.sha == null).toBeTruthy();
  });
});

describe("GET /api/packages/:packageName/versions/:versionName/tarball", () => {
  test("Returns 404 with Invalid Package", async () => {
    const res = await request(app).get(
      "/api/packages/language-golang/versions/1.0.0/tarball"
    );
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found with Invalid Package", async () => {
    const res = await request(app).get(
      "/api/packages/language-golang/versions/1.0.0/tarball"
    );
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 404 with Valid Package, Invalid Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/1.0.0/tarball"
    );
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found with Valid Package, Invalid Versions", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/1.0.0/tarball"
    );
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 302 with Valid Package, Valid Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/0.45.7/tarball"
    );
    expect(res).toHaveHTTPCode(302);
  });
  test("Returns Redirect True with Valid Package, Valid Version", async () => {
    const res = await request(app).get(
      "/api/packages/language-css/versions/0.45.7/tarball"
    );
    expect(res.redirect).toBeTruthy();
  });
});

describe("DELETE /api/packages/:packageName/versions/:versionName", () => {
  test.todo("Finish these tests");
  test("Returns 401 with No Auth", async () => {
    const res = await request(app).delete(
      "/api/packages/langauge-css/versions/0.45.7"
    );
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with No Auth", async () => {
    const res = await request(app).delete(
      "/api/packages/langauge-css/versions/0.45.7"
    );
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 401 with Bad Auth", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css/versions/0.45.7")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with Bad Auth", async () => {
    const res = await request(app)
      .delete("/api/packages/langauge-css/versions/0.45.7")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 404 with Bad Package", async () => {
    const res = await request(app)
      .delete("/api/packages/language-golang/versions/1.0.0")
      .set("Authorization", "admin-token");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Msg with Bad Package", async () => {
    const res = await request(app)
      .delete("/api/packages/langauge-golang/versions/1.0.0")
      .set("Authorization", "admin-token");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 404 with Valid Package & Bad Version", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css/versions/1.0.0")
      .set("Authorization", "admin-token");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Msg with Valid Package & Bad Version", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css/versions/1.0.0")
      .set("Authorization", "admin-token");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 204 on Success", async () => {
    const res = await request(app)
      .delete("/api/packages/language-css/versions/0.45.0")
      .set("Authorization", "admin-token");
    expect(res).toHaveHTTPCode(204);
  });
});

describe("POST /api/packages/:packageName/versions/:versionName/events/uninstall", () => {
  test.todo("Write all of these");
  test("Returns 401 with No Auth", async () => {
    const res = await request(app).post(
      "/api/packages/language-css/versions/0.45.7/events/uninstall"
    );
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with No Auth", async () => {
    const res = await request(app).post(
      "/api/packages/langauge-css/versions/0.45.7/events/uninstall"
    );
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 401 with Bad Auth", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/versions/0.45.7/events/uninstall")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Bad Auth Message with No Auth", async () => {
    const res = await request(app)
      .post("/api/packages/langauge-css/versions/0.45.7/events/uninstall")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns 404 with Bad Package", async () => {
    const res = await request(app)
      .post("/api/packages/language-golang/versions/1.0.0/events/uninstall")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found Message with Bad Package", async () => {
    const res = await request(app)
      .post("/api/packages/language-golang/versions/1.0.0/events/uninstall")
      .set("Authorization", "valid-token");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns 200 with Valid Package, Bad Version", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/versions/1.0.0/events/uninstall")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(200);
    // Please note on Atom.io this would result in a 404. But the Pulsar Backend intentionally ignores the `version`
    // of the query. This is due to changes in the database structure.
  });
  test("Returns Json {ok: true } with Valid Package, Bad Version", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/versions/1.0.0/events/uninstall")
      .set("Authorization", "valid-token");
    expect(res.body.ok).toBeTruthy();
    // Please note on Atom.io this would result in a 404. But the Pulsar Backend intentionally ignores the `version`
    // of the query. This is due to changes in the database structure.
  });
  test("Returns 200 on Success", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/versions/0.45.7/events/uninstall")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns Json { ok: true } on Success", async () => {
    const res = await request(app)
      .post("/api/packages/language-css/versions/0.45.7/events/uninstall")
      .set("Authorization", "valid-token");
    expect(res.body.ok).toBeTruthy();
  });
  test("Properly decrements the download count", async () => {
    const orig = await request(app).get("/api/packages/language-css");
    const res = await request(app)
      .post("/api/packages/language-css/versions/0.45.7/events/uninstall")
      .set("Authorization", "valid-token");
    const after = await request(app).get("/api/packages/language-css");
    expect(parseInt(orig.body.downloads, 10)).toBeGreaterThan(
      parseInt(after.body.downloads, 10)
    );
  });
});

describe("GET /api/themes/featured", () => {
  test("Returns Successful Status Code", async () => {
    const res = await request(app).get("/api/themes/featured");
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns Array", async () => {
    const res = await request(app).get("/api/themes/featured");
    expect(res.body).toBeArray();
  });
});

describe("GET /api/themes", () => {
  test("Returns Successful Status Code", async () => {
    const res = await request(app).get("/api/themes");
    expect(res).toHaveHTTPCode(200);
  });
  test("Returns Array", async () => {
    const res = await request(app).get("/api/themes");
    expect(res.body).toBeArray();
  });
});

describe("GET /api/themes/search", () => {
  test("Valid search returns array", async () => {
    const res = await request(app).get("/api/themes/search?q=syntax");
    expect(res.body).toBeArray();
  });
  test("Valid Search Returns Success Status Code", async () => {
    const res = await request(app).get("/api/themes/search?q=syntax");
    expect(res).toHaveHTTPCode(200);
  });
  test("Valid Search does not Return Sensitive Data", async () => {
    const res = await request(app).get("/api/themes/search?q=syntax");
    for (const p of res.body) {
      expect(p.pointer == null).toBeTruthy();
    }
  });
  test("Valid Search returns valid data", async () => {
    const res = await request(app).get("/api/themes/search?q=syntax");
    for (const p of res.body) {
      expect(typeof p.name === "string").toBeTruthy();
      expect(`${p.stargazers_count}`.match(/^\d+$/) === null).toBeFalsy();
      expect(`${p.downloads}`.match(/^\d+$/) === null).toBeFalsy();
      expect(typeof p.releases.latest === "string").toBeTruthy();
    }
  });
  test("Invalid Search Returns Array", async () => {
    const res = await request(app).get("/api/themes/search?q=not-one-match");
    expect(res.body).toBeArray();
  });
  test("Invalid Search Returns Empty Array", async () => {
    const res = await request(app).get("/api/themes/search?q=not-one-match");
    expect(res.body.length).toBeLessThan(1);
  });
});

describe("Ensure Themes is passed to each endpoint Properly", () => {
  test("GET /api/themes/:packageName", async () => {
    const res = await request(app).get("/api/themes/language-css");
    expect(res).toHaveHTTPCode(200);
    expect(res.body.name).toBe("language-css");
    expect(res.body.pointer == null).toBeTruthy();
  });
  test("GET /api/themes/:packageName/stargazers", async () => {
    const res = await request(app).get("/api/themes/language-css/stargazers");
    expect(res).toHaveHTTPCode(200);
    expect(res.body).toBeArray();
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].login).toBeTruthy();
    expect(typeof res.body[0].login === "string").toBeTruthy();
  });
  test("GET /api/themes/:packageName/versions/:versionName", async () => {
    const res = await request(app).get(
      "/api/themes/language-css/versions/0.45.7"
    );
    expect(res).toHaveHTTPCode(200);
    expect(res.body.name).toEqual("language-css");
    expect(typeof res.body.dist.tarball === "string").toBeTruthy();
    expect(res.body.id == null).toBeTruthy();
    expect(res.body.package == null).toBeTruthy();
    expect(res.body.sha == null).toBeTruthy();
  });
  test("GET /api/themes/:pakageName/versions/:versionName/tarball", async () => {
    const res = await request(app).get(
      "/api/themes/language-css/versions/0.45.7/tarball"
    );
    expect(res).toHaveHTTPCode(302);
    expect(res.redirect).toBeTruthy();
  });
});

describe("GET /api/users/:login/stars", () => {
  test("Returns 404 for Bad User", async () => {
    const res = await request(app).get("/api/users/not-a-user/stars");
    expect(res).toHaveHTTPCode(404);
  });
  test("Returns Not Found for Bad User", async () => {
    const res = await request(app).get("/api/users/not-a-user/stars");
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns an Array for Valid User with Stars", async () => {
    const res = await request(app).get("/api/users/has-all-stars/stars");
    expect(res.body).toBeArray();
  });
  test("Returns an Array for Valid User without Stars", async () => {
    const res = await request(app).get("/api/users/has-no-stars/stars");
    expect(res.body).toBeArray();
  });
  test("Returns an Empty Array for Valid User without Stars", async () => {
    const res = await request(app).get("/api/users/has-no-stars/stars");
    expect(res.body.length).toEqual(0);
  });
});

describe("GET /api/users", () => {
  test("Returns Unauthenticated Status Code for No Creds", async () => {
    const res = await request(app).get("/api/users");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Unauthenticated Message for No Creds", async () => {
    const res = await request(app).get("/api/users");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns Unauthenticated Status Code & Message for Bad Creds", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Returns User Data and Proper Status Code for Good Creds", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(200);
    expect(res.body.username).toEqual("dever");
    expect(res.body.avatar).toEqual("https://roadtonowhere.com");
    expect(res.body.created_at).toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.node_id).toEqual("dever-nodeid");
    expect(res.body.token).toEqual("valid-token");
    expect(res.body.packages).toBeDefined();
    expect(res.body.packages).toBeArray();
  });
});

describe("GET /api/users/:login", () => {
  test("Returns 404 && Not Found Message for bad user", async () => {
    const res = await request(app).get("/api/users/not-a-user");
    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toEqual(msg.notFound);
  });
  test("Returns User Object for Valid User", async () => {
    const res = await request(app).get("/api/users/dever");
    expect(res).toHaveHTTPCode(200);
    expect(res.body.username).toEqual("dever");
    expect(res.body.avatar).toEqual("https://roadtonowhere.com");
    expect(res.body.created_at).toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.packages).toBeDefined();
    expect(res.body.packages).toBeArray();
  });
  test("Returns No Senstive Data for Valid User", async () => {
    const res = await request(app).get("/api/users/dever");
    expect(res).toHaveHTTPCode(200);
    expect(res.body.token == null).toBeTruthy();
    expect(res.body.id == null).toBeTruthy();
    expect(res.body.node_id == null).toBeTruthy();
  });
});

describe("GET /api/stars", () => {
  test("Returns Unauthenticated Status Code for Invalid User", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
  });
  test("Returns Unauthenticated JSON for Invalid User", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "invalid");
    expect(res.body.message).toEqual(msg.badAuth);
  });
  test("Valid User with No Stars Returns array", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "no-star-token");
    expect(res.body).toBeArray();
  });
  test("Valid User with No Stars Returns Empty Array", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "no-star-token");
    expect(res.body.length).toEqual(0);
  });
  test("Valid User with No Stars Returns 200 Status Code", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "no-star-token");
    expect(res).toHaveHTTPCode(200);
  });
  test("Valid User with Stars Returns 200 Status Code", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "all-star-token");
    expect(res).toHaveHTTPCode(200);
  });
  test("Valid User with Stars Returns Array", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "all-star-token");
    expect(res.body).toBeArray();
  });
  test("Valid User with Stars Returns Non-Empty Array", async () => {
    const res = await request(app)
      .get("/api/stars")
      .set("Authorization", "all-star-token");
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("GET /api/updates", () => {
  test.todo("/api/updates currentlty returns Not Supported.");
  test("Returns NotSupported Status Code.", async () => {
    const res = await request(app).get("/api/updates");
    expect(res).toHaveHTTPCode(501);
  });
  test("Returns NotSupported Message", async () => {
    const res = await request(app).get("/api/updates");
    expect(res.body.message).toEqual(msg.notSupported);
  });
});
