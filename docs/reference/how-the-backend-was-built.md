# How the Backend Was Built

When The term "reverse-engineer" is used throughout the documentation to describe how the backend was built, it's good form to have a longer explanation here as well as cover the Pulsar Team from any legal questions that may stem from this terms use.

The process to build the backend was not true reverse-engineering it was more in fact building a compatible system for the Pulsar Editor, with the purpose to create a backend that did not require any major changes to the editor to work.

Whether this goal was achieved in it's entirety it's completely to be seen.

But at it's core the process used was to hit every endpoint of the (at the time) existing Atom.io Package Registry and determine how it seemed to process the query. For example what would fail first in a request the Authentication or a non-existent package. Or what errors would you receive to certain requests.

This process was then used to shape how the backend was originally planned and created but even during the creation process had to differ because of our likely varied technologies and tech stack used to create the backend.

Beyond this the code used to create the backend is unique, and is the work of the editors that have committed to the repo, which then falls under the MIT license.
