const vcs = require("../src/vcs.js");

describe("determineProvider Returns as expected", () => {
  test("Returns null when no input is passed", () => {
    const res = vcs.determineProvider();
    expect(res.type).toBe("na");
    expect(res.url).toBe("");
  });
  test("Returns null when null input is passed", () => {
    const res = vcs.determineProvider(null);
    expect(res.type).toBe("na");
    expect(res.url).toBe("");
  });
  test("Returns proper object, when object is passed", () => {
    const tmp = {
      type: "git",
      url: "https://github.com/confused-Techie/atom-backend",
    };
    const res = vcs.determineProvider(tmp);
    expect(res.type).toBe(tmp.type);
    expect(res.url).toBe(tmp.url);
  });
  test("Returns unknown VCS Object, when unkown is passed", () => {
    const tmp = "https://new-vcs.com/pulsar-edit/pulsar";
    const res = vcs.determineProvider(tmp);
    expect(res.type).toBe("unknown");
    expect(res.url).toBe(tmp);
  });
  test("Returns unkown string when passed invalid data", () => {
    const tmp = 123;
    const res = vcs.determineProvider(tmp);
    expect(res.type).toBe("unknown");
    expect(res.url).toBe(tmp);
  });
  test("Returns proper GitHub Object, passed GitHub string", () => {
    const tmp = "https://github.com/confused-Techie/atom-backend";
    const res = vcs.determineProvider(tmp);
    expect(res.type).toBe("git");
    expect(res.url).toBe(tmp);
  });
  test("Returns proper GitLab Object, passed GitLab string", () => {
    const tmp = "https://gitlab.com/clj-editors/atom-chlorine";
    const res = vcs.determineProvider(tmp);
    expect(res.type).toBe("lab");
    expect(res.url).toBe(tmp);
  });
  test("Returns proper Sourceforge Object, when passed Sourceforge string", () => {
    const tmp = "https://sourceforge.net/projects/jellyfin.mirror/";
    const res = vcs.determineProvider(tmp);
    expect(res.type).toBe("sfr");
    expect(res.url).toBe(tmp);
  });
  test("Returns proper Bitbucket Object, when passed Bitbucket string", () => {
    const tmp =
      "https://bitbucket.org/docker_alpine/alpine-jellyfin/src/master/";
    const res = vcs.determineProvider(tmp);
    expect(res.type).toBe("bit");
    expect(res.url).toBe(tmp);
  });
  test("Returns proper Codeberg Object, when passed Codeberg string", () => {
    const tmp = "https://codeberg.org/itbastian/makemkv-move-extras";
    const res = vcs.determineProvider(tmp);
    expect(res.type).toBe("berg");
    expect(res.url).toBe(tmp);
  });
});
