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
  test("Returns No Access when the repo we want isn't there", async () => {

    let port = "65534";
    let repo = "pulsar-edit/pulsar";

    let server = require("./fixtures/doesUserHaveRepo_noRepo.js");
    server.setRepoName("pulsar-edit/ppm"); // Purposefully setting the wrong repo
    // here, since we don't want the repo to be on the server API call.
    server.setPort(port);
    let serve = server.app.listen(port);

    let tmp = new GitHub({ api_url: `localhost:${port}` });
    let res = await tmp.doesUserHaveRepo("token", repo);
    serve.close();

    expect(res.ok).toBe(false);
    expect(res.short).toBe("No Access");
  });
  test("Returns Ownership when the repo is not on the first page", async () => {

    let port = "65533";
    let repo = "pulsar-edit/pulsar";

    let server = require("./fixtures/doesUserHaveRepo_secondPage.js");
    server.setRepoName([ "pulsar-edit/brackets", repo ]);
    // Above we are setting the repo we want as item two to get it on the second page.
    server.setPort(port);
    let serve = server.app.listen(port);

    let tmp = new GitHub({ api_url: `localhost:${port}` });
    let res = await tmp.doesUserHaveRepo("token", repo);
    serve.close();

    expect(res.ok).toBe(true);
    expect(res.content.full_name).toBe(repo);
  });
});
