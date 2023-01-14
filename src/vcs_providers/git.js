/**
 * @module git
 * @desc This Module ideally will support a base class that all VCS support systems can inherit.
 * This Base model is needing to work against being properly useful, to helpfully cut down on
 * the code needed to create future support for other services. So we will need to test.
 */

 const superagent = require("superagent");
 const { GH_USERAGENT } = require("../config.js").getConfig();

 class Git {
   // Public properties:
   apiUrl = "";
   acceptableStatusCodes = [200];

   // Setters:
   set apiUrl(url) {
     this.apiUrl = typeof url === "string" ? url : this.apiUrl;
   }

   set acceptableStatusCodes(codes) {
     this.acceptableStatusCodes = Array.isArray(codes) ? codes : this.acceptableStatusCodes;
   }

   _initializer(opts) {
     this.apiUrl = opts.api_url ?? this.apiUrl;
     this.acceptableStatusCodes = opts.ok_status ?? this.acceptableStatusCodes;
   }

   async _webRequestAuth(url, token) {
     try {

       const res = await superagent
        .get(`${this.apiUrl}${url}`)
        .set({
          Authorization: `Bearer ${token}`,
        })
        .set({ "User-Agent": GH_USERAGENT })
        // This last line here, lets the class define what HTTP Status Codes
        // It will not throw an error on.
        // If a status code not present in this array is received, it will throw an error.
        .ok((res) => this.acceptableStatusCodes.includes(res.status));

      if (res.status !== 200) {
        // We have not received 200 code: return a failure
        return { ok: false, short: "Failed Request", content: res };
      }

      // The Status code is a success, return the request.
      return { ok: true, content: res };

     } catch(err) {
       return { ok: false, short: "Exception During Web Request", content: res };
     }
   }

 }

 // In order for extends classes to properly work with VCS, they will have to export certain functions:
 // * ownership
 // * readme
 // *

 module.exports = Git;
