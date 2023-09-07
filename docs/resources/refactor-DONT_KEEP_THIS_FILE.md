# DON'T KEEP THIS FILE

Alright, so lets do a big time refactor, because it's fun, and I get bothered looking at the same code for too long or something.

Essentially here's the new idea:

## HTTP Handling

Stop treating it as if it was special. HTTP handling is essentially only a utility function that's easily **replicable** and should be treated as such.

The only part of an HTTP handling process that matters is the logic that's preformed. The logic of returning the data depending on states of SSO's or adding pagination or even erroring out is insanely easily replicable.

So we should abstract away from hardcoding endless functions for HTTP handling as much as possible. So here's my idea:

Every endpoint is it's own tiny module. This module should export at least two things:

* `logic()` This function will be called to handle the actual logic of the endpoint, passing all relevant data to it
* `params()` This function will return a parameter object consisting of all query parameters that this endpoint expects to receive
* `endpoint` The endpoint object will then provide the endpoint logic with everything else it needs to define any given endpoint.

From here the `main.js` module should instead import all modules needed, and iterate through them to create every single endpoint as needed. This may result in a slightly longer startup time, but overall I hope the increase in code readability and less duplication will be worth it.

So this means that every module is imported, the `endpoint` object is read to setup the endpoint, and from there, it's made available as an endpoint via express, which can then, once hit, use the `params()` function to prepare the query parameters, and then pass those off to the `logic()` function.

### `endpoint` Structure

The `path` here is an array since in some instances, we want to accept multiple paths, such as `POST /api/packages` and `POST /api/themes`.

```javascript
const endpoint = {
  // Can be "GET", "POST", "DELETE"
  method: "GET",
  paths: [ "/api/themes" ],
  // Can be "generic" or "auth"
  rate_limit: "generic",
  options: {
    // This would be the headers to return for `HTTP OPTIONS` req:
    Allow: "GET",
    "X-Content-Type-Options": "nosniff"
  }
};
```

## Returning HTTP handling

Again, the logic here is easily replicable. So we shouldn't make it special. And if finally doing a proper rewrite, we can incorporate a proper SSO, and have a different type for every single return. This way the actual handling of any return, can instead be a factor of a `httpReturn()` function of the SSO itself, rather than baked in logic. So that way we can keep the return logic as unique as needed, as the uniqueness depends solely on the uniqueness of the SSO being returned.

## Tests

(As always the bane of existence)

With this refactor, we no longer need true "integration" tests. As integration can be tested on if the proper endpoints being hit call the proper endpoint.logic() function. Beyond that the majority of "integration" testing would be relegated to interactions with external services working as expected.

Meaning the only tests we would likely need are:

* `tests` This would be the vast majority of tests, able to be generic, and not needing any fancy setup
* `database` This suite of tests should purely test if DB calls do what we expect
* `integration` A small suite of full integration tests is never a bad idea. To test that API calls have the intended effects on the DB. With a huge focus on having the intended effects. As we are seeing some examples where the expected data is not appearing or being applied to the DB as we want.
* `external` We don't do this currently. But a suite of external tests that are run on a maybe monthly basis is not a bad idea. This could allow us to ensure external APIs are returning data as expected.

---

I think this is plenty to focus on now. At the very least the changes described here would likely mean a rewrite of about or over half the entire codebase. But if all goes to plan, would mean that every single piece of logic is more modular, keeping logic related to itself within the same file, and if tests are effected as hoped, would mean a much more robust testing solution, that who knows, may actually be able to achieve near 100% testing coverage.

One side effect of all this change, means the possibility of generating documentation of the API based totally on the documentation itself, where we no longer would be reliant on my own `@confused-techie/quick-webserver-docs` module, nor having to ensure comments are updated.
