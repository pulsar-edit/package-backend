const request = require("supertest");
const app = require("../src/main.js");

const auth = require("../src/auth.js");

const authMock = (data) => {
  const tmpMock = jest
    .spyOn(auth.prototype, "verifyAuth")
    .mockImplementation((token) => {
      return data;
    });
  return tmpMock;
};

let tmpMock;

describe("POST /api/packages/:packageName/versions", () => {

  beforeEach(() => {
    tmpMock = authMock({
      ok: false,
      short: "Bad Auth",
      content: "Bad Auth Mock Return for Dev user"
    });

  });

  afterEach(() => {
    tmpMock.mockClear();
  });

  test("Returns Bad Auth appropriately with Bad Package", async () => {

    const res = await request(app).post(
      "/api/packages/language-golang/versions"
    );
    expect(res).toHaveHTTPCode(401);
    expect(res.body.message).toEqual(msg.badAuth);

  });

  test.todo("Write all tests on this endpoint");
});
