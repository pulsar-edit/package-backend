/**
 * @module debug_util
 * @desc A collection of simple functions to help devs debug the application during runtime,
 * to better assist in tracking down bugs. Since many sets of data cannot be reliably output to the console
 * this can help to view the transmutations of data as its handled.
 */

/**
 * @function roughSizeOfObject
 * @desc Returns the rough size of the object in memory, in Bytes. Can be used
 * to help determine how an object changes over time.
 * @param {object} obj - The Object to inspect.
 * @returns {integer} Returns the integer value of the object in Bytes.
 */
function roughSizeOfObject(obj) {
  let objectList = [];
  let stack = [obj];
  let bytes = 0;

  let typeDict = {
    boolean: 4,
    number: 8,
  };

  while (stack.length) {
    let value = stack.pop();

    if (typeof value === "string") {
      bytes += value.length * 2;
    } else if (typeof value === "object" && objectList.indexOf(value) === -1) {
      objectList.push(value);
      for (let i in value) {
        stack.push(value[i]);
      }
    } else {
      bytes += typeDict[typeof value];
    }
  }
  return bytes;
}

module.exports = {
  roughSizeOfObject,
};
