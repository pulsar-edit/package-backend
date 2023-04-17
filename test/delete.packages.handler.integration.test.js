const request = require("supertest");
const app = require("../src/main.js");

const auth = require("../src/auth.js");
const vcs = require("../src/vcs.js");

const authMock = (data) => {
  const internalMock = jest
    .spyOn(auth, "verifyAuth")
    .mockImplementationOnce((token) => {
      return data;
    });
  return internalMock;
};

let tmpMock;

describe("DELETE /api/packages/:packageName", () => {
  test("No Auth, returns 401", async () => {
    const res = await request(app).delete("/api/packages/syntax-pon");
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(msg.badAuth);
  });

  test("Returns 401 with Invalid Token", async () => {
    tmpMock = authMock({
      ok: false,
      short: "Bad Auth",
      content: "Bad Auth Mock Return for Dev User"
    });

    const res = await request(app)
      .delete("/api/packages/syntax-pon")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(msg.badAuth);

    tmpMock.mockClear();
  });

  test("Returns Bad Auth Msg with Valid Token, but no repo access", async () => {

    let vcsMock = jest.spyOn(vcs, "ownership").mockImplementationOnce(() => {
      return {
        ok: false,
        short: "No Repo Access",
        content: "Dev No Perms granted"
      };
    });

    tmpMock = authMock({
      ok: true,
      content: {
        token: "no-valid-token",
        id: 342342,
        node_id: "no-repo-access-delete-pkg",
        username: "no-repo-access-delete-pkg-node-id",
        avatar: "https://domain.org"
      }
    });

    const res = await request(app)
      .delete("/api/packages/syntax-pon")
      .set("Authorization", "no-valid-token");
    expect(res.body.message).toEqual(msg.badAuth);
    expect(res).toHaveHTTPCode(401);

    tmpMock.mockClear();
    vcsMock.mockClear();
  });

  test("Returns Success Message & HTTP with Valid Token", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "admin-token",
        id: 342342,
        node_id: "no-repo-access-delete-pkg",
        username: "no-repo-access-delete-pkg-node-id",
        avatar: "https://domain.org"
      }
    });

    let vcsMock = jest.spyOn(vcs, "ownership").mockImplementationOnce(() => {
      return {
        ok: true,
        content: "admin"
      };
    });

    const res = await request(app)
      .delete("/api/packages/syntax-pon")
      .set("Authorization", "admin-token");
    expect(res).toHaveHTTPCode(204);

    const after = await request(app).get("/api/packages");
    // This ensures our deleted package is no longer in the full package list.
    expect(after.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "syntax-pon",
        }),
      ])
    );

    tmpMock.mockClear();
    vcsMock.mockClear();
  });
  // The ^^ above ^^ reads:
  //  * Expect your Array does NOT Equal
  //  * An Array that contains
  //  * An Object that Contains
  //  * The property { name: "atom-material-ui" }
});

describe("DELETE /api/packages/:packageName/star", () => {
  test("Returns 401 with No Auth", async () => {
    const res = await request(app).delete("/api/packages/langauge-css/star");
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(msg.badAuth);
  });

  test("Returns 401 with Bad Auth", async () => {
    tmpMock = authMock({
      ok: false,
      short: "Bad Auth",
      content: "Bad Auth Mock Return for Dev User"
    });

    const res = await request(app)
      .delete("/api/packages/langauge-css/star")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(msg.badAuth);

    tmpMock.mockClear();
  });

  test("Returns 404 with bad package", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "admin-token",
        id: 342342,
        node_id: "no-repo-access-delete-pkg",
        username: "no-repo-access-delete-pkg-node-id",
        avatar: "https://domain.org"
      }
    });

    const res = await request(app)
      .delete("/api/packages/no-exist/star")
      .set("Authorization", "valid-token");
    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toEqual(msg.notFound);

    tmpMock.mockClear();
  });

  test("Returns 201 on Success", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "all-star-token",
        id: 11111,
        node_id: "has-starred-syntax-gfm",
        username: "has-starred-syntax-gfm-node-id",
        avatar: "https://domain.org"
      }
    });

    const res = await request(app)
      .delete("/api/packages/syntax-gfm/star")
      .set("Authorization", "all-star-token");
    expect(res).toHaveHTTPCode(201);

    tmpMock.mockClear();
  });

  test("Returns 201 even when the package is not starred", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "all-star-token",
        id: 11111,
        node_id: "has-starred-syntax-gfm",
        username: "has-starred-syntax-gfm-node-id",
        avatar: "https://domain.org"
      }
    });

    const res = await request(app)
      .delete("/api/packages/syntax-pon/star")
      .set("Authorization", "no-star-token");
    expect(res).toHaveHTTPCode(201);

    tmpMock.mockClear();
  });
});

describe("DELETE /api/packages/:packageName/versions/:versionName", () => {
  test("Returns 401 with No Auth", async () => {
    const res = await request(app).delete(
      "/api/packages/langauge-css/versions/0.45.7"
    );
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(msg.badAuth);
  });

  test("Returns 401 with Bad Auth", async () => {
    tmpMock = authMock({
      ok: false,
      short: "Bad Auth",
      content: "Bad Auth Mock Return for Dev User"
    });

    const res = await request(app)
      .delete("/api/packages/language-css/versions/0.45.7")
      .set("Authorization", "invalid");
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(msg.badAuth);

    tmpMock.mockClear();
  });

  test("Returns 404 with Bad Package", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "admin-token",
        id: 234234,
        node_id: "can-delete-version-node-id",
        username: "can-delete-version",
        avatar: "https://domain.org"
      }
    });

    const res = await request(app)
      .delete("/api/packages/no-exist/versions/1.0.0")
      .set("Authorization", "admin-token");
    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toEqual(msg.notFound);

    tmpMock.mockClear();
  });

  test("Returns 404 with Valid Package & Bad Version", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "admin-token",
        id: 234234,
        node_id: "can-delete-version-node-id",
        username: "can-delete-version",
        avatar: "https://domain.org"
      }
    });

    let vcsMock = jest.spyOn(vcs, "ownership").mockImplementationOnce(() => {
      return {
        ok: true,
        content: "admin"
      };
    });

    const res = await request(app)
      .delete("/api/packages/syntax-cpp/versions/1.0.1")
      .set("Authorization", "admin-token");
    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toEqual(msg.notFound);

    tmpMock.mockClear();
    vcsMock.mockClear();
  });

  test("Returns 204 on Success", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "admin-token",
        id: 234234,
        node_id: "can-delete-version-node-id",
        username: "can-delete-version",
        avatar: "https://domain.org"
      }
    });

    let vcsMock = jest.spyOn(vcs, "ownership").mockImplementationOnce(() => {
      return {
        ok: true,
        content: "admin"
      };
    });

    const res = await request(app)
      .delete("/api/packages/syntax-cpp/versions/0.0.9")
      .set("Authorization", "admin-token");

    expect(res).toHaveHTTPCode(204);

    tmpMock.mockClear();
    vcsMock.mockClear();
  });

  test("Doesn't allow deletion of only version available", async () => {
    tmpMock = authMock({
      ok: true,
      content: {
        token: "admin-token",
        id: 234234,
        node_id: "can-delete-version-node-id",
        username: "can-delete-version",
        avatar: "https://domain.org"
      }
    });

    let vcsMock = jest.spyOn(vcs, "ownership").mockImplementationOnce(() => {
      return {
        ok: true,
        content: "admin"
      };
    });

    const res = await request(app)
      .delete("/api/packages/syntax-cpp/versions/1.0.0")
      .set("Authorization", "admin-token");

    expect(res).toHaveHTTPCode(500);
    expect(res.body.message).toEqual(msg.serverError);

    tmpMock.mockClear();
    vcsMock.mockClear();

  });
});
