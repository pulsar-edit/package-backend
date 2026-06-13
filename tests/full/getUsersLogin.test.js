const supertest = require("supertest");
const app = require("../../src/setupEndpoints.js");
const database = require("../../src/database/_export.js");

describe("GET /api/users/:login", () => {
  test("Returns not found for a user that doesn't exist", async () => {
    const res = await supertest(app).get("/api/users/i-dont-exist");

    expect(res).toHaveHTTPCode(404);
    expect(res.body.message).toBe("Not Found");
  });

  test("Returns user when it exists", async () => {
    const addUser = await database.insertNewUser(
      "get-users-login-node-id",
      "get-users-login-node-id",
      "https://roadtonowhere.com"
    );
    expect(addUser.ok).toBe(true);

    const res = await supertest(app).get("/api/users/get-users-login-node-id");

    expect(res).toHaveHTTPCode(200);
    expect(res.body.username).toBe("get-users-login-node-id");

    // cleanup
    const removeUser = await database.removeUserByID(addUser.content.id);
    expect(removeUser.ok).toBe(true);
  });
});
