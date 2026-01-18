# Controllers (endpoints)

Within this directory is the definition of each endpoint served by the Pulsar Package Registry Backend.

Each file represents an endpoint, named like `methodPathSubpath`.
Which would translate something like `GET /api/package/:packageName` => `getPackagePackageName.js`.

Within the file is an object exported that defines the endpoint and all of it's key features.
Which not only builds the actual endpoints that users interact with, it also builds the SwaggerUI documentation that's served alongside the site.

In an attempt to support the most flexibility in any future changes of this schema, there are multiple valid versions, allowing any changes to the schema to be subtle and peice-mealed as needed.

## Schema v1 (default)

If the top level `version` key is absent, or set to `1` then the endpoint is using the `v1` schema, which is defined below:

```js
module.exports = {
  // version: 1,
  // endpointKind: "raw", // An optional endpointKind value, which if `raw` means once `logic` is called no further processing is done on the request.
  docs: {
    // Almost every key corresponds to SwaggerUIs schema
    summary: "A summary of the endpoint, used directly in the SwaggerUI documentation.",
    description: "Another SwaggerUI key for a more in-depth explanation.",
    responses: {
      // All intended responses of the endpoint
      200: {
        // The HTTP status followed by a description and a definition of the content within the response.
        // Refer to SwaggerUIs documentation.
        description: "",
        content: { "application/json": "$userObjectPrivate" }
        // ^^ A key difference is when defining the object, we can reference complex objects by appending a `$`
      }
    }
  },
  endpoint: {
    method: "GET", // The endpoint method
    paths: [""], // An array of exact endpoint paths, written in ExpressJS style
    rateLimit: "", // An enum supporting different rate limit values.
    successStatus: 200, // The HTTP status code returned on success
    options: {
      // Key-Value pairs of HTTP headers that should be returned on an `OPTIONS` request to the path.
    },
    params: {
      // Parameters that are invoked automatically to decode their value from the HTTP req.
      auth: (context, req) => {}
    }
  },
  // The following are methods that will be called automatically during the HTTP request lifecycle
  async preLogic(req, res, context) {}, // Called before the `logic` function. Helpful for modifying any request details
  async logic(params, context) {}, // The main logic function called for the endpoint
  async postLogic(req, res, context) {}, // Called right after the initial logic call.
  async postReturnHTTP(req, res, context, obj) {}, // Called after returning to the client, allowing for any computations the user shouldn't wait on. `obj` is the return of the `logic` call
};
```

## Schema v2

If the top level `version` key is set to `1` then the endpoint schema is defined as:

```js
module.exports = {
  version: 2,
  docs: {}, // Identical to v1
  headers: {}, // Key-Value pairs of headers. Which will be applied during an `OPTIONS`
  // request, as well as automatically on every request to this path.
  endpoint: {
    method: "", // Same as v1
    path: "", // A string or array of strings, defining the path, again in ExpressJS syntax.
  },
  params: {
    auth: {
      // A JSON Schema object of the parameters schema, that will be decoded automatically.
      type: "string"
    }
  },
  async preLogic(ctx) {}, // Called with just the shared context
  async logic(ctx) {}, // Called with just the shared context
  async postLogic(ctx) {}, // Called with just the shared context
  async postHttp(ctx, obj) {}, // Called with the shared context, and the return obj of `logic`
};
```

As you may have noticed the biggest difference between v2 and v1 is that v2 only calls each method with a shared context variable. This shared context is built dynamically for each request and includes all details of the request within it, meaning we don't need specialized calls such as `preLogic` or `postLogic` (although they are still supported just in case).

Additionally, `v2` takes even more values defined in this schema and automatically injects them into the documentation and live requests, attempting to define even more of the request semantics as an object.

Lastly, in `v2` the value of a `header` key can begin with a `%` which means it's value will be replaced with the corresponding value from the shared context.

Such as `%timecop.toHeader` => `return ctx.timecop.toHeader();`.
