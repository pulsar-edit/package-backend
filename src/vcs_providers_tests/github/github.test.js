const GitHub = require("../../vcs_providers/github.js");

describe("vcs_providers/github.doesUserHaveRepo()", () => {
  test("Returns No ownership with bad auth return of server", async () => {

    let port = "65535";
    let server = require("./fixtures/doesUserHaveRepo_badAuth.js");
    server.setPort(port);
    let serve = server.app.listen(port);

    let tmp = new GitHub({ api_url: `localhost:${port}` });

    let res = await tmp.doesUserHaveRepo("token", "owner/repo");
    serve.close();

    expect(res.ok).toBe(false);
    expect(res.short).toBe("Bad Auth");
  });
  test("Returns Successful Ownership", async () => {

    let port = "65535";
    let repo = "pulsar-edit/pulsar";

    let server = require("./fixtures/doesUserHaveRepo_authFirstPage.js");
    server.setRepoName(repo);
    server.setPort(port);
    let serve = server.app.listen(port);

    let tmp = new GitHub({ api_url: `localhost:${port}` });
    let res = await tmp.doesUserHaveRepo("token", repo);
    serve.close();

    expect(res.ok).toBe(true);
    expect(res.content.full_name).toBe(repo);
  });
});
