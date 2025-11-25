
module.exports =
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
      this.timetable[service].start = 0; // Wildly incorrect date, more likely
      // to be caught rather than letting the time taken be 0ms
    }
    this.timetable[service].end = performance.now();
    this.timetable[service].duration =
      this.timetable[service].end -
      this.timetable[service].start;
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
