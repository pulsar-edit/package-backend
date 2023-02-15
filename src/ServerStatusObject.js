/**
 * @module ServerStatusObject
 * @desc This Module is used to aide in building a Server Status Object.
 * This data structure is somewhat ubiquitous within this codebase.
 * A builder allows the actual data structure to be obscurred
 * with less concern over creating the object properly and more concerned
 * with providing the correct values.
 */

/**
 * The ServerStatus Object Builder
 * @class
 */
class ServerStatus {
  constructor(params) {
    this.ok = undefined;
    this.content = undefined;
    this.short = undefined;

    if (typeof params === "object") {
      this.content = params.content ?? undefined;
      this.short = params.short ?? undefined;
      this.ok = params.ok ?? undefined;
    }
  }

  /**
   * @function isOk
   * @desc When called sets the SSO's `ok` to true.
   */
  isOk() {
    this.ok = true;
    return this;
  }

  /**
   * @function notOk
   * @desc When called sets the SSO's `ok` to false.
   */
  notOk() {
    this.ok = false;
    return this;
  }

  /**
   * @function setShort
   * @desc Allows quick setting of the `short` value.
   * @param {*} value - The contents of the value.
   */
  setShort(value) {
    this.short = value;
    return this;
  }

  /**
   * @function setContent
   * @desc Allows quick setting of the `content` value.
   * @param {*} value - The contents of the value.
   */
  setContent(value) {
    this.content = value;
    return this;
  }

  /**
   * @function build
   * @desc Builds a proper JavaScript Object for the current values.
   */
  build() {
    if (this.ok) {
      // Server Status Object OK is true, exclude short
      return {
        ok: this.ok,
        content: this.content,
      };
    } else {
      // Server Status Object OK is FALSE, include short
      return {
        ok: this.ok,
        content: this.content,
        short: this.short,
      };
    }
  }
}

module.exports = ServerStatus;
