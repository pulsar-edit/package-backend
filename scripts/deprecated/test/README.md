This folder contains all the relevant tests for the Pulsar Backend.

Previously tests where stored in separate folders based on what type of test they were, such as `unit`, or `integration`.

But after much work, the goal is to no longer have to create these divides within the testing methodology.

Ideally all tests can live close together to simplify navigation and comprehension. While additionally removing the need for `integration` tests as a whole, by instead doing what's needed to mock the edges of the codebase, such as reaching out to other API's or using modules that reach to the outside world, like Google Storage or the Database.

On the above, there have already been huge improvements, allowing a dockerized database to be created within the tests, and properly mocking the web requests within the new VCS module. Leaving the last thing to receive a healthy mock being calls to the Google Cloud, but overall there is not much need for a distinction.

Additionally using mocks and more competently created modules allows reduction in the overall frameworks around testing.

With all that said, let's move onto the meat of creating and modifying new tests.

---

Tests within this location will still be colloquially classified into different testing categories such as `unit`, `integration`, `vcs`. Even if in reality this does not change the handling of tests all that much, is more inclined to provide quick access or views of tests within sections of the code.

The test type should be specified within the test file name itself, such as if testing the `cache.js` file and is to be classified as a `unit` test it's filename should be: `cache.unit.test.js`.

It's good to know that `global.setup.jest.js` contains some special setup functions for our tests. Namely extending the built-in `expect` to provide additional features to our tests for ease.

Examples and Explanations:

- handlers.setup.jest.js: Contains setup functions to run before any *.handler tests
- login.handler.integration.test.js: This is an integration test, that is testing a handler. Specifically the `login` slug of the backend.
- packages.handler.integration.test.js: This is an integration test, that is testing a handler. Specifically the `packages` slug of the backend.


How to run:

There are several options available to run tests, some options will include tests that are more directly specified by other tests.

This is intended to make it easier to run the tests you care about only, while allowing some more generic options for our CI.

* `npm run test:integration` will run all files ending in `*.integration.test.js`
  - Includes all `*.handler.integration.test.js` files
  - Includes all Package Handler Tests
  - Includes all Database Tests
* `npm run test:handlers` will run all package handler tests, or files ending in `*.handler.integration.test.js`
  - These tests are included in the `test:integration` script.
* `npm run test:unit` will run all files ending in `*.unit.test.js`
* `npm run test:vcs` will run all files ending in `*.vcs.test.js`
