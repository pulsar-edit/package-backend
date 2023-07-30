// This is an impersonator of the ExpressJS Response Object.
// Who's goal is to very simply test the exact features we care about.
// Without overhead or bloat.
class Res {
  constructor() {
    this.statusCode = 0;
    this.JSONObj = "";
  }
  json(obj) {
    this.JSONObj = obj;
    return this;
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
}

class Req {
  constructor() {
    this.ip = "0.0.0.0";
    this.method = "TEST";
    this.url = "/dev";
    this.protocol = "DEV";
    this.start = Date.now();
  }
}

module.exports = { Res, Req };
