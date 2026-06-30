const { performance } = require("node:perf_hooks");

module.exports =
class Timecop {
  constructor() {
    this.timetable = {};
  }

  start(service) {
    this.timetable[service] = {
      start: performance.now(),
      end: undefined,
      duration: undefined,
    };
  }

  end(service) {
    if (!this.timetable[service]) {
      this.timetable[service] = {};
      this.timetable[service].start = 0;
      // Wildly incorrect date, more likely to be caught,
      // rather than letting the time taken be 0ms
    };
    this.timetable[service].end = performance.now();
    this.timetable[service].duration = this.timetable[service].end - this.timetable[service].start;
  }

  async time(service, cb) {
    this.start(service);
    await cb();
    this.stop(service);
  }

  // Provides Header compatible string
  toString() {
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
