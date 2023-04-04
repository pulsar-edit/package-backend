# Server Status Object's

The way the backend communicates between the many different modules, and retains context is via Server Status Objects.

A Server Status Object is what is returned after nearly every descrete action, and allows vital and complex communication between modules.

While some of this functionality could be accomplished by errors, the idea is to never have to error catch an interaction with a module, and that the module itself will be fully self reliant in terms of errors, instead returning an object that can be checked for success.

The basic format of these:

* ok: The boolean status to indicate if a request was successful.
* short: The recognized enum of valid failure types.
* content: A detailed error message, that is safe to display to users.
* error: An optional error value from a stack trace that can be added to the server status object.
