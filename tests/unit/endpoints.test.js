const endpoints = require("../../src/controllers/endpoints.js");

describe("All endpoints are valid", () => {
  test("Have expected objects", () => {

    for (const node of endpoints) {

      for (const item in node) {

        const validItems = [
          "docs",
          "endpoint",
          "params",
          "logic",
          "preLogic",
          "postLogic",
          "postReturnHTTP"
        ];

        expect(validItems.includes(item));
      }
    }

  });

  test("Have a valid 'endpoint' object", () => {
    for (const node of endpoints) {
      const endpoint = node.endpoint;

      expect(endpoint.method).toBeTypeof("string");
      expect(endpoint.method).toBeIncludedBy([ "GET", "POST", "DELETE" ]);
      expect(endpoint.paths).toBeArray();
      expect(endpoint.rateLimit).toBeTypeof("string");
      expect(endpoint.rateLimit).toBeIncludedBy([ "generic", "auth" ]);
      expect(endpoint.successStatus).toBeTypeof("number");
      expect(endpoint.options).toBeDefined();

      if (endpoint.endpointKind) {
        expect(endpoint.endpointKind).toBeTypeof("string");
        expect(endpoint.endpointKind).toBeIncludedBy([ "raw", "default" ]);
      }
    }

  });
});
