// An ephemeral context that's built per every single request
// Once tests stop relying on the structure of the `context.js` object
// we can move this to be side-by-side of the original context
const context = require("./context.js");

module.exports = (req, res, endpoint) => {

  // Build parameters
  let params = {};
  for (const param in endpoint.params) {
    if (typeof endpoint.params[param] === "function") {
      params[param] = endpoint.params[param](context, req);
    } else {
      // TODO use a JSON-Schema validator to extract params
    }
  }
  
  return {
    req: req,
    res: res,
    endpoint: endpoint,
    params: params,
    timecop: new Timecop(),
    ...context,
    // Any items that need to overwrite original context keys should be put after
    // the spread operator
    callStack: new context.callStack(),
    query: require("./query_parameters/index.js")
  };
};

class Timecop {
  constructor() {
    this.timetable = {};
  }

  start(service) {
    this.timetable[service] = {
      start: performance.now(),
      end: undefined,
      duration: undefined
    };
  }

  end(service) {
    if (!this.timetable[service]) {
      this.timetable[service] = {};
      this.timetable[service].start = 0;
      // Wildly incorrect date, more likely to be caught
      // rather than letting the time taken be 0ms
    }
    this.timetable[service].end = performance.now();
    this.timetable[service].duration = this.timetable[service].end - this.timetable[service].start;
  }

  toHeader() {
    let str = "";

    for (const service in this.timetable) {
      if (str.length > 0) {
        str = str + ", ";
      }

      str = str + `${service};dur=${Number(this.timetable[service].duration).toFixed(2)}`;
    }

    return str;
  }
}
