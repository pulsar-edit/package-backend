
// Used to ensure the current returned data of an SSO matches
// What the `successStatus` code of the endpoints docs say it should be

function matchesSuccessObject(sso, endpoint) {

  for (const response in endpoint.docs.responses) {
    if (response == endpoint.endpoint.successStatus) {
      let obj = endpoint.docs.responses[response].content["application/json"];

      if (obj.startsWith("$")) {
        obj = require(`../models/${obj.replace("$","")}.js`);
      }

      expect(sso.content).toMatchObject(obj.test);
      return true;
    }
  }
}

module.exports = {
  matchesSuccessObject,
};
