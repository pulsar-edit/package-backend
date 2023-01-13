const GitHub = require("../../vcs_providers/github.js");

describe("vcs_providers/github.doesUserHaveRepo()", () => {
  test("Returns Ownership when the repo is not on the first page", async () => {

    let port = "65533";
    let nodeID = "5678";

    let server = require("./fixtures/doesUserHaveRepo_secondPage.js");
    server.setNodeID([ "098", nodeID ]);
    // Above we are setting the nodeID we want as item two to get it on the second page.
    server.setPort(port);
    let serve = server.app.listen(port);

    let tmp = new GitHub({ api_url: `localhost:${port}` });
    let res = await tmp.doesUserHaveRepo({ token: "123", node_id: nodeID }, "pulsar-edit/pulsar");
    serve.close();

    expect(res.ok).toBe(true);
    expect(res.content).toBe("admin");
  });
});
