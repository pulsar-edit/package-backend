## Modules

<dl>
<dt><a href="#module_ServerStatusObject">ServerStatusObject</a></dt>
<dd><p>This Module is used to aide in building a Server Status Object.
This data structure is somewhat ubiquitous within this codebase.
A builder allows the actual data structure to be obscurred
with less concern over creating the object properly and more concerned
with providing the correct values.</p>
</dd>
<dt><a href="#module_cache">cache</a></dt>
<dd><p>Provides an interface for helpful caching mechanisms.
Originally created after some circular dependency issues arouse during
rapid redevelopment of the entire storage system.
But this does provide an opportunity to allow multiple caching systems.</p>
</dd>
<dt><a href="#module_config">config</a></dt>
<dd><p>Module that access&#39; and returns the server wide configuration.</p>
</dd>
<dt><a href="#module_dev_server">dev_server</a></dt>
<dd><p>The Development initializer of <code>main.js</code> as well as managing the startup of a locally created Docker SQL
Server. This uses pg-test to set up a database hosted on local Docker. Migrating all data as needed,
to allow the real server feel, without having access or the risk of the production database. But otherwise runs
the backend API server as normal.</p>
</dd>
<dt><a href="#module_logger">logger</a></dt>
<dd><p>Allows easy logging of the server. Allowing it to become simple to add additional
logging methods if a log server is ever implemented.</p>
</dd>
<dt><a href="#module_server">server</a></dt>
<dd><p>The initializer of <code>main.js</code> starting up the Express Server, and setting the port
to listen on. As well as handling a graceful shutdown of the server.</p>
</dd>
<dt><a href="#module_storage">storage</a></dt>
<dd><p>This module is the second generation of data storage methodology,
in which this provides static access to files stored within regular cloud
file storage. Specifically intended for use with Google Cloud Storage.</p>
</dd>
<dt><a href="#module_utils">utils</a></dt>
<dd><p>A helper for any functions that are agnostic in handlers.</p>
</dd>
<dt><a href="#module_vcs">vcs</a></dt>
<dd><p>This Module is intended to be the platform agnostic tool to interaction
with Version Control Systems of different types in the cloud.
To collect data from them, format it accordingly ang return it to the requesting
function.</p>
</dd>
<dt><a href="#module_webhook">webhook</a></dt>
<dd><p>Handles sending out webhooks based on function calls.</p>
</dd>
<dt><a href="#module_deletePackagesPackageName">deletePackagesPackageName</a></dt>
<dd></dd>
<dt><a href="#module_DeletePackagesPackageNameStar">DeletePackagesPackageNameStar</a></dt>
<dd></dd>
<dt><a href="#module_deletePackagesPackageNameVersionsVersionName">deletePackagesPackageNameVersionsVersionName</a></dt>
<dd></dd>
<dt><a href="#module_getLogin">getLogin</a></dt>
<dd></dd>
<dt><a href="#module_getOauth">getOauth</a></dt>
<dd></dd>
<dt><a href="#module_getPackages">getPackages</a></dt>
<dd></dd>
<dt><a href="#module_getPackagesFeatured">getPackagesFeatured</a></dt>
<dd></dd>
<dt><a href="#module_getPackagesPackageName">getPackagesPackageName</a></dt>
<dd></dd>
<dt><a href="#module_getPackagesPackageNameStargazers">getPackagesPackageNameStargazers</a></dt>
<dd></dd>
<dt><a href="#module_getPackagesPackageNameVersionsVersionName">getPackagesPackageNameVersionsVersionName</a></dt>
<dd></dd>
<dt><a href="#module_getPackagesPackageNameVersionsVersionNameTarball">getPackagesPackageNameVersionsVersionNameTarball</a></dt>
<dd></dd>
<dt><a href="#module_getPackagesSearch">getPackagesSearch</a></dt>
<dd></dd>
<dt><a href="#module_getPat">getPat</a></dt>
<dd></dd>
<dt><a href="#module_getRoot">getRoot</a></dt>
<dd></dd>
<dt><a href="#module_getStars">getStars</a></dt>
<dd></dd>
<dt><a href="#module_getThemes">getThemes</a></dt>
<dd></dd>
<dt><a href="#module_getThemesFeatured">getThemesFeatured</a></dt>
<dd></dd>
<dt><a href="#module_getThemesSearch">getThemesSearch</a></dt>
<dd></dd>
<dt><a href="#module_getUpdates">getUpdates</a></dt>
<dd></dd>
<dt><a href="#module_getUsers">getUsers</a></dt>
<dd></dd>
<dt><a href="#module_getUsersLogin">getUsersLogin</a></dt>
<dd></dd>
<dt><a href="#module_getUsersLoginStars">getUsersLoginStars</a></dt>
<dd></dd>
<dt><a href="#module_postPackages">postPackages</a></dt>
<dd></dd>
<dt><a href="#module_postPackagesPackageNameStar">postPackagesPackageNameStar</a></dt>
<dd></dd>
<dt><a href="#module_postPackagesPackageNameVersions">postPackagesPackageNameVersions</a></dt>
<dd></dd>
<dt><a href="#module_postPackagesPackageNameVersionsVersionNameEventsUninstall">postPackagesPackageNameVersionsVersionNameEventsUninstall</a></dt>
<dd></dd>
<dt><a href="#module_query">query</a></dt>
<dd><p>Home to parsing all query parameters from the <code>Request</code> object. Ensuring a valid response.
While most values will just return their default there are some expecptions:
engine(): Returns false if not defined, to allow a fast way to determine if results need to be pruned.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#verifyAuth">verifyAuth()</a> ⇒ <code>object</code></dt>
<dd><p>This will be the major function to determine, confirm, and provide user
details of an authenticated user. This will take a users provided token,
and use it to check GitHub for the details of whoever owns this token.
Once that is done, we can go ahead and search for said user within the database.
If the user exists, then we can confirm that they are both locally and globally
authenticated, and execute whatever action it is they wanted to.</p>
</dd>
<dt><a href="#auth">auth(req)</a> ⇒ <code>string</code></dt>
<dd><p>Retrieves Authorization Headers from Request, and Checks for Undefined.</p>
</dd>
<dt><a href="#direction">direction(req)</a> ⇒ <code>string</code></dt>
<dd><p>Parser for either &#39;direction&#39; or &#39;order&#39; query parameter, prioritizing
&#39;direction&#39;.</p>
</dd>
<dt><a href="#engine">engine(semver)</a> ⇒ <code>string</code> | <code>boolean</code></dt>
<dd><p>Parses the &#39;engine&#39; query parameter to ensure it&#39;s valid, otherwise returning false.</p>
</dd>
<dt><a href="#fileExtension">fileExtension(req)</a> ⇒ <code>string</code> | <code>boolean</code></dt>
<dd><p>Returns the file extension being requested.</p>
</dd>
<dt><a href="#login">login(req)</a> ⇒ <code>string</code></dt>
<dd><p>Returns the User from the URL Path, otherwise &#39;&#39;</p>
</dd>
<dt><a href="#packageName">packageName(req)</a> ⇒ <code>string</code></dt>
<dd><p>This function will convert a user provided package name into a safe format.
It ensures the name is converted to lower case. As is the requirement of all package names.</p>
</dd>
<dt><a href="#page">page(req)</a> ⇒ <code>number</code></dt>
<dd><p>Parser of the Page query parameter. Defaulting to 1.</p>
</dd>
<dt><a href="#query">query(req)</a> ⇒ <code>string</code></dt>
<dd><p>Checks the &#39;q&#39; query parameter, trunicating it at 50 characters, and checking simplisticly that
it is not a malicious request. Returning &quot;&quot; if an unsafe or invalid query is passed.</p>
</dd>
<dt><a href="#rename">rename(req)</a> ⇒ <code>boolean</code></dt>
<dd><p>Since this is intended to be returning a boolean value, returns false
if invalid, otherwise returns true. Checking for mixed captilization.</p>
</dd>
<dt><a href="#repo">repo(req)</a> ⇒ <code>string</code></dt>
<dd><p>Parses the &#39;repository&#39; query parameter, returning it if valid, otherwise returning &#39;&#39;.</p>
</dd>
<dt><a href="#service">service(req)</a> ⇒ <code>string</code> | <code>boolean</code></dt>
<dd><p>Returns the service being requested.</p>
</dd>
<dt><a href="#serviceType">serviceType(req)</a> ⇒ <code>string</code> | <code>boolean</code></dt>
<dd><p>Returns the service type being requested.</p>
</dd>
<dt><a href="#serviceVersion">serviceVersion(req)</a> ⇒ <code>string</code> | <code>boolean</code></dt>
<dd><p>Returns the version of whatever service is being requested.</p>
</dd>
<dt><a href="#sort">sort(req, [def])</a> ⇒ <code>string</code></dt>
<dd><p>Parser for the &#39;sort&#39; query parameter. Defaulting usually to downloads.</p>
</dd>
<dt><a href="#tag">tag(req)</a> ⇒ <code>string</code></dt>
<dd><p>Parses the &#39;tag&#39; query parameter, returning it if valid, otherwise returning &#39;&#39;.</p>
</dd>
<dt><a href="#stringValidation">stringValidation(value)</a> ⇒ <code>string</code> | <code>boolean</code></dt>
<dd><p>Provides a generic Query Utility that validates if a provided value
is a string, as well as trimming it to the safe max length of query strings,
while additionally passing it through the Path Traversal Detection function.</p>
</dd>
<dt><a href="#pathTraversalAttempt">pathTraversalAttempt(data)</a> ⇒ <code>boolean</code></dt>
<dd><p>Completes some short checks to determine if the data contains a malicious
path traversal attempt. Returning a boolean indicating if a path traversal attempt
exists in the data.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ServerStatusObject">ServerStatusObject</a> : <code>object</code></dt>
<dd><p>The Generic Object that should be returned by nearly every function
within every module. Allows ease of bubbling errors to the HTTP Handler.</p>
</dd>
<dt><a href="#SSO_VCS_newVersionData">SSO_VCS_newVersionData</a> : <code>object</code></dt>
<dd><p>The Server Status Object returned by <code>vcs.newVersionData()</code> containing all
the data needed to update a packages version.</p>
</dd>
</dl>

<a name="module_ServerStatusObject"></a>

## ServerStatusObject
This Module is used to aide in building a Server Status Object.
This data structure is somewhat ubiquitous within this codebase.
A builder allows the actual data structure to be obscurred
with less concern over creating the object properly and more concerned
with providing the correct values.


* [ServerStatusObject](#module_ServerStatusObject)
    * [~ServerStatus](#module_ServerStatusObject..ServerStatus)
    * [~isOk()](#module_ServerStatusObject..isOk)
    * [~notOk()](#module_ServerStatusObject..notOk)
    * [~setShort(value)](#module_ServerStatusObject..setShort)
    * [~setContent(value)](#module_ServerStatusObject..setContent)
    * [~build()](#module_ServerStatusObject..build)

<a name="module_ServerStatusObject..ServerStatus"></a>

### ServerStatusObject~ServerStatus
The ServerStatus Object Builder

**Kind**: inner class of [<code>ServerStatusObject</code>](#module_ServerStatusObject)  
<a name="module_ServerStatusObject..isOk"></a>

### ServerStatusObject~isOk()
When called sets the SSO's `ok` to true.

**Kind**: inner method of [<code>ServerStatusObject</code>](#module_ServerStatusObject)  
<a name="module_ServerStatusObject..notOk"></a>

### ServerStatusObject~notOk()
When called sets the SSO's `ok` to false.

**Kind**: inner method of [<code>ServerStatusObject</code>](#module_ServerStatusObject)  
<a name="module_ServerStatusObject..setShort"></a>

### ServerStatusObject~setShort(value)
Allows quick setting of the `short` value.

**Kind**: inner method of [<code>ServerStatusObject</code>](#module_ServerStatusObject)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The contents of the value. |

<a name="module_ServerStatusObject..setContent"></a>

### ServerStatusObject~setContent(value)
Allows quick setting of the `content` value.

**Kind**: inner method of [<code>ServerStatusObject</code>](#module_ServerStatusObject)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The contents of the value. |

<a name="module_ServerStatusObject..build"></a>

### ServerStatusObject~build()
Builds a proper JavaScript Object for the current values.

**Kind**: inner method of [<code>ServerStatusObject</code>](#module_ServerStatusObject)  
<a name="module_cache"></a>

## cache
Provides an interface for helpful caching mechanisms.
Originally created after some circular dependency issues arouse during
rapid redevelopment of the entire storage system.
But this does provide an opportunity to allow multiple caching systems.


* [cache](#module_cache)
    * [~CacheObject](#module_cache..CacheObject)
        * [new CacheObject([name], contents)](#new_module_cache..CacheObject_new)

<a name="module_cache..CacheObject"></a>

### cache~CacheObject
**Kind**: inner class of [<code>cache</code>](#module_cache)  
<a name="new_module_cache..CacheObject_new"></a>

#### new CacheObject([name], contents)
Allows simple interfaces to handle caching an object in memory. Used to cache data read from the filesystem.


| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | Optional name to assign to the Cached Object. |
| contents | <code>object</code> | The contents of this cached object. Intended to be a JavaScript object. But could be anything. |

<a name="module_config"></a>

## config
Module that access' and returns the server wide configuration.


* [config](#module_config)
    * [~getConfigFile()](#module_config..getConfigFile) ⇒ <code>object</code>
    * [~getConfig()](#module_config..getConfig) ⇒ <code>object</code>

<a name="module_config..getConfigFile"></a>

### config~getConfigFile() ⇒ <code>object</code>
Used to read the `yaml` config file from the root of the project.
Returning the YAML parsed file, or an empty obj.

**Kind**: inner method of [<code>config</code>](#module_config)  
**Returns**: <code>object</code> - A parsed YAML file config, or an empty object.  
<a name="module_config..getConfig"></a>

### config~getConfig() ⇒ <code>object</code>
Used to get Server Config data from the `app.yaml` file at the root of the project.
Or from environment variables. Prioritizing environment variables.

**Kind**: inner method of [<code>config</code>](#module_config)  
**Returns**: <code>object</code> - The different available configuration values.  
**Example** *(Using &#x60;getConfig()&#x60; during an import for a single value.)*  
```js
const { search_algorithm } = require("./config.js").getConfig();
```
<a name="module_dev_server"></a>

## dev\_server
The Development initializer of `main.js` as well as managing the startup of a locally created Docker SQL
Server. This uses pg-test to set up a database hosted on local Docker. Migrating all data as needed,
to allow the real server feel, without having access or the risk of the production database. But otherwise runs
the backend API server as normal.

<a name="module_dev_server..localExterminate"></a>

### dev_server~localExterminate(callee, serve, db)
Similar to `server.js` exterminate(), except used for the `dev_server.js` instance.

**Kind**: inner method of [<code>dev\_server</code>](#module_dev_server)  

| Param | Type | Description |
| --- | --- | --- |
| callee | <code>string</code> | Simply a way to better log what called the server to shutdown. |
| serve | <code>object</code> | The instance of the ExpressJS `app` that has started listening and can be called to shutdown. |
| db | <code>object</code> | The instance of the `database.js` module, used to properly close its connections during a graceful shutdown. |

<a name="module_logger"></a>

## logger
Allows easy logging of the server. Allowing it to become simple to add additional
logging methods if a log server is ever implemented.


* [logger](#module_logger)
    * [~httpLog(req, res)](#module_logger..httpLog)
    * [~sanitizeLogs(val)](#module_logger..sanitizeLogs) ⇒ <code>string</code>
    * [~generic(lvl, val, [meta])](#module_logger..generic)
    * [~craftError(meta)](#module_logger..craftError) ⇒ <code>string</code>
    * [~craftHttp(meta)](#module_logger..craftHttp) ⇒ <code>string</code>

<a name="module_logger..httpLog"></a>

### logger~httpLog(req, res)
The standard logger for HTTP calls. Logging in a modified 'Apache Combined Log Format'.

**Kind**: inner method of [<code>logger</code>](#module_logger)  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |
| res | <code>object</code> | The `Response` object inherited from the Express endpoint. |

**Example** *(Logging Output Format)*  
```js
HTTP:: IP [DATE (as ISO String)] "HTTP_METHOD URL PROTOCOL" STATUS_CODE DURATION_OF_REQUESTms
```
<a name="module_logger..sanitizeLogs"></a>

### logger~sanitizeLogs(val) ⇒ <code>string</code>
This function intends to assist in sanitizing values from users that
are input into the logs. Ensuring log forgery does not occur.
And to help ensure that other malicious actions are unable to take place to
admins reviewing the logs.

**Kind**: inner method of [<code>logger</code>](#module_logger)  
**Returns**: <code>string</code> - A sanitized log from the provided value.  
**See**: [https://cwe.mitre.org/data/definitions/117.html](https://cwe.mitre.org/data/definitions/117.html)  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>string</code> | The user provided value to sanitize. |

<a name="module_logger..generic"></a>

### logger~generic(lvl, val, [meta])
A generic logger, that will can accept all types of logs. And from then
create warning, or info logs debending on the Log Level provided.
Additionally the generic logger accepts a meta object argument, to extend
it's logging capabilities, to include system objects, or otherwise unexpected values.
It will have support for certain objects in the meta field to create specific
logs, but otherwise will attempt to display the data provided.

**Kind**: inner method of [<code>logger</code>](#module_logger)  

| Param | Type | Description |
| --- | --- | --- |
| lvl | <code>integer</code> | The Log Level to output. With the following definition. 1 - Fatal 2 - Error 3 - Warning 4 - Information 5 - Debug 6 - Trace |
| val | <code>string</code> | The main information to contain within the log. |
| [meta] | <code>object</code> | An optional Object to include, this object as described above can contain additional information either expected of the log, or that is not natively supported, but will be attempted to display. |

<a name="module_logger..craftError"></a>

### logger~craftError(meta) ⇒ <code>string</code>
Used to help `logger.generic()` build it's logs. Used when type is
specified as `error`.

**Kind**: inner method of [<code>logger</code>](#module_logger)  
**Returns**: <code>string</code> - A crafted string message containing the output of the data
provided.  

| Param | Type | Description |
| --- | --- | --- |
| meta | <code>object</code> | An object containing `err`. |

<a name="module_logger..craftHttp"></a>

### logger~craftHttp(meta) ⇒ <code>string</code>
Used to help `logger.generic()` build it's logs. Used when type is
specified as `http`. Based largely off `logger.httpLog()`

**Kind**: inner method of [<code>logger</code>](#module_logger)  
**Returns**: <code>string</code> - A crafted string message containing the output of the data
provided.  

| Param | Type | Description |
| --- | --- | --- |
| meta | <code>string</code> | An object containing `req`, and `res` |

<a name="module_server"></a>

## server
The initializer of `main.js` starting up the Express Server, and setting the port
to listen on. As well as handling a graceful shutdown of the server.

<a name="module_server..exterminate"></a>

### server~exterminate(callee)
This is called when the server process receives a `SIGINT` or `SIGTERM` signal.
Which this will then handle closing the server listener, as well as calling `data.Shutdown`.

**Kind**: inner method of [<code>server</code>](#module_server)  

| Param | Type | Description |
| --- | --- | --- |
| callee | <code>string</code> | Simply a way to better log what called the server to shutdown. |

<a name="module_storage"></a>

## storage
This module is the second generation of data storage methodology,
in which this provides static access to files stored within regular cloud
file storage. Specifically intended for use with Google Cloud Storage.


* [storage](#module_storage)
    * [~setupGCS()](#module_storage..setupGCS) ⇒ <code>object</code>
    * [~getBanList()](#module_storage..getBanList) ⇒ <code>Array</code>
    * [~getFeaturedPackages()](#module_storage..getFeaturedPackages) ⇒ <code>Array</code>
    * [~getFeaturedThemes()](#module_storage..getFeaturedThemes) ⇒ <code>Array</code>

<a name="module_storage..setupGCS"></a>

### storage~setupGCS() ⇒ <code>object</code>
Sets up the Google Cloud Storage Class, to ensure its ready to use.

**Kind**: inner method of [<code>storage</code>](#module_storage)  
**Returns**: <code>object</code> - - A new Google Cloud Storage instance.  
<a name="module_storage..getBanList"></a>

### storage~getBanList() ⇒ <code>Array</code>
Reads the ban list from the Google Cloud Storage Space.
Returning the cached parsed JSON object.
If it has been read before during this instance of hosting just the cached
version is returned.

**Kind**: inner method of [<code>storage</code>](#module_storage)  
**Returns**: <code>Array</code> - Parsed JSON Array of all Banned Packages.  
<a name="module_storage..getFeaturedPackages"></a>

### storage~getFeaturedPackages() ⇒ <code>Array</code>
Returns the hardcoded featured packages file from Google Cloud Storage.
Caching the object once read for this instance of the server run.

**Kind**: inner method of [<code>storage</code>](#module_storage)  
**Returns**: <code>Array</code> - Parsed JSON Array of all Featured Packages.  
<a name="module_storage..getFeaturedThemes"></a>

### storage~getFeaturedThemes() ⇒ <code>Array</code>
Used to retrieve Google Cloud Storage Object for featured themes.

**Kind**: inner method of [<code>storage</code>](#module_storage)  
**Returns**: <code>Array</code> - JSON Parsed Array of Featured Theme Names.  
<a name="module_utils"></a>

## utils
A helper for any functions that are agnostic in handlers.


* [utils](#module_utils)
    * [~isPackageNameBanned(name)](#module_utils..isPackageNameBanned) ⇒ <code>object</code>
    * [~engineFilter()](#module_utils..engineFilter) ⇒ <code>object</code>
    * [~semverArray(semver)](#module_utils..semverArray) ⇒ <code>array</code> \| <code>null</code>
    * [~semverGt(a1, a2)](#module_utils..semverGt) ⇒ <code>boolean</code>
    * [~semverLt(a1, a2)](#module_utils..semverLt) ⇒ <code>boolean</code>
    * [~getOwnerRepoFromPackage(pack)](#module_utils..getOwnerRepoFromPackage) ⇒ <code>string</code>
    * [~getOwnerRepoFromUrlString(url)](#module_utils..getOwnerRepoFromUrlString) ⇒ <code>string</code>
    * [~semverEq(a1, a2)](#module_utils..semverEq) ⇒ <code>boolean</code>
    * [~generateRandomString(n)](#module_utils..generateRandomString) ⇒ <code>string</code>

<a name="module_utils..isPackageNameBanned"></a>

### utils~isPackageNameBanned(name) ⇒ <code>object</code>
This uses the `storage.js` to retrieve a banlist. And then simply
iterates through the banList array, until it finds a match to the name
it was given. If no match is found then it returns false.

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>object</code> - Returns Server Status Object with ok as true if blocked,
false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the package to check if it is banned. |

<a name="module_utils..engineFilter"></a>

### utils~engineFilter() ⇒ <code>object</code>
A complex function that provides filtering by Atom engine version.
This should take a package with its versions and retrieve whatever matches
that engine version as provided.

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>object</code> - The filtered object.  
<a name="module_utils..semverArray"></a>

### utils~semverArray(semver) ⇒ <code>array</code> \| <code>null</code>
Takes a semver string and returns it as an Array of strings.
This can also be used to check for semver valitidy. If it's not a semver, null is returned.

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>array</code> \| <code>null</code> - The formatted semver in array of three strings, or null if no match.  

| Param | Type |
| --- | --- |
| semver | <code>string</code> | 

**Example** *(Valid Semver Passed)*  
```js
// returns ["1", "2", "3" ]
semverArray("1.2.3");
```
**Example** *(Invalid Semver Passed)*  
```js
// returns null
semverArray("1.Hello.World");
```
<a name="module_utils..semverGt"></a>

### utils~semverGt(a1, a2) ⇒ <code>boolean</code>
Compares two sermver and return true if the first is greater than the second.
Expects to get the semver formatted as array of strings.
Should be always executed after running semverArray.

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>boolean</code> - The result of the comparison  

| Param | Type | Description |
| --- | --- | --- |
| a1 | <code>array</code> | First semver as array of strings. |
| a2 | <code>array</code> | Second semver as array of string. |

<a name="module_utils..semverLt"></a>

### utils~semverLt(a1, a2) ⇒ <code>boolean</code>
Compares two sermver and return true if the first is less than the second.
Expects to get the semver formatted as array of strings.
Should be always executed after running semverArray.

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>boolean</code> - The result of the comparison  

| Param | Type | Description |
| --- | --- | --- |
| a1 | <code>array</code> | First semver as array of strings. |
| a2 | <code>array</code> | Second semver as array of strings. |

<a name="module_utils..getOwnerRepoFromPackage"></a>

### utils~getOwnerRepoFromPackage(pack) ⇒ <code>string</code>
A function that takes a package and tries to extract `owner/repo` string from it
relying on getOwnerRepoFromUrlString util.

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>string</code> - The `owner/repo` string from the URL. Or an empty string if unable to parse.  

| Param | Type | Description |
| --- | --- | --- |
| pack | <code>object</code> | The Github package. |

<a name="module_utils..getOwnerRepoFromUrlString"></a>

### utils~getOwnerRepoFromUrlString(url) ⇒ <code>string</code>
A function that takes the URL string of a GitHub repo and return the `owner/repo`
string for the repo. Intended to be used from a packages entry `data.repository.url`

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>string</code> - The `owner/repo` string from the URL. Or an empty string if unable to parse.  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL for the Repo. |

<a name="module_utils..semverEq"></a>

### utils~semverEq(a1, a2) ⇒ <code>boolean</code>
Compares two sermver and return true if the first is equal to the second.
Expects to get the semver formatted as array of strings.
Should be always executed after running semverArray.

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>boolean</code> - The result of the comparison.  

| Param | Type | Description |
| --- | --- | --- |
| a1 | <code>array</code> | First semver as array. |
| a2 | <code>array</code> | Second semver as array. |

<a name="module_utils..generateRandomString"></a>

### utils~generateRandomString(n) ⇒ <code>string</code>
Uses the crypto module to generate and return a random string.

**Kind**: inner method of [<code>utils</code>](#module_utils)  
**Returns**: <code>string</code> - A string exported from the generated Buffer using the "hex" format (encode
each byte as two hexadecimal characters).  

| Param | Type | Description |
| --- | --- | --- |
| n | <code>string</code> | The number of bytes to generate. |

<a name="module_vcs"></a>

## vcs
This Module is intended to be the platform agnostic tool to interaction
with Version Control Systems of different types in the cloud.
To collect data from them, format it accordingly ang return it to the requesting
function.


* [vcs](#module_vcs)
    * [~ownership(userObj, packObj, [opts])](#module_vcs..ownership) ⇒ <code>object</code>
    * [~newPackageData(userObj, ownerRepo, service)](#module_vcs..newPackageData) ⇒ <code>object</code>
    * [~newVersionData(userObj, ownerRepo, tagRef, service)](#module_vcs..newVersionData) ⇒ [<code>SSO\_VCS\_newVersionData</code>](#SSO_VCS_newVersionData)
    * [~featureDetection(userObj, ownerRepo, service)](#module_vcs..featureDetection) ⇒ <code>object</code>
    * [~determineProvider(repo)](#module_vcs..determineProvider) ⇒ <code>object</code>

<a name="module_vcs..ownership"></a>

### vcs~ownership(userObj, packObj, [opts]) ⇒ <code>object</code>
Allows the ability to check if a user has permissions to write to a repo.
<b>MUST</b> be provided the full `user` and `package` objects here to account
for possible situations. This allows any new handling that's needed to be defined
here rather than in multiple locations throughout the codebase.
Returns `ok: true` where content is the repo data from the service provider on
success, returns `ok: false` if they do not have access to said repo, with
specificity available within the `short` key.

**Kind**: inner method of [<code>vcs</code>](#module_vcs)  
**Returns**: <code>object</code> - - A Server Status object containing the role of the user according
to the repo or otherwise a failure.  

| Param | Type | Description |
| --- | --- | --- |
| userObj | <code>object</code> | The Full User Object, as returned by the backend, and appended to with authorization data. |
| packObj | <code>object</code> \| <code>string</code> | The full Package objects data from the backend. Although, can also contain a string, this string would directly be an Owner/Repo combo, but it is recommended to use the Package Object when possible. The string variant is intended to be used when first publishing a package, and there is no package object to use. |
| [opts] | <code>object</code> | An optional configuration object, that allows the definition of non-standard options to change the fucntionality of this function. `opts` can accept the following parameters:  - dev_override: {boolean} - Wether to enable or disable the dev_override. Disabled    by default, this dangerous boolean is inteded to be used during tests that    overrides the default safe static returns, and lets the function run as intended    in development mode. |

<a name="module_vcs..newPackageData"></a>

### vcs~newPackageData(userObj, ownerRepo, service) ⇒ <code>object</code>
Replaces the previous git.createPackage().
Intended to retrieve the full packages data. The data which will contain
all information needed to create a new package entry onto the DB.

**Kind**: inner method of [<code>vcs</code>](#module_vcs)  
**Returns**: <code>object</code> - - Returns a Server Status Object, which when `ok: true`
Contains the full package data. This includes the Readme, the package.json, and all version data.  
**Todo**

- [ ] Stop hardcoding the service that is passed here.


| Param | Type | Description |
| --- | --- | --- |
| userObj | <code>object</code> | The Full User Object as returned by auth.verifyAuth() |
| ownerRepo | <code>string</code> | The Owner Repo Combo for the package such as `pulsar-edit/pulsar` |
| service | <code>string</code> | The Service this package is intended for. Matching a valid return type from `vcs.determineProvider()` Eventually this service will be detected by the package handler or moved here, but for now is intended to be hardcoded as "git" |

<a name="module_vcs..newVersionData"></a>

### vcs~newVersionData(userObj, ownerRepo, tagRef, service) ⇒ [<code>SSO\_VCS\_newVersionData</code>](#SSO_VCS_newVersionData)
Replaces the previously used `git.metadataAppendTarballInfo()`
Intended to retrieve the most basic of a package's data.
Bundles all the special handling of crafting such an object into this single
function to reduce usage elsewhere.

**Kind**: inner method of [<code>vcs</code>](#module_vcs)  
**Returns**: [<code>SSO\_VCS\_newVersionData</code>](#SSO_VCS_newVersionData) - A Server Status Object, which when `ok: true`
returns all data that would be needed to update a package on the DB, and
upload a new version.  

| Param | Type | Description |
| --- | --- | --- |
| userObj | <code>object</code> | The Full User Object as returned by `auth.verifyAuth()` |
| ownerRepo | <code>string</code> | The Owner Repo Combo of the package affected. Such as `pulsar-edit/pulsar` |
| tagRef | <code>string</code> | The version number or ref where data should be sought from the remote resource. |
| service | <code>string</code> | The service to use as expected to be returned by `vcs.determineProvider()`. Currently should be hardcoded to "git" |

<a name="module_vcs..featureDetection"></a>

### vcs~featureDetection(userObj, ownerRepo, service) ⇒ <code>object</code>
Calls the apropriate provider's `featureDetection()` method

**Kind**: inner method of [<code>vcs</code>](#module_vcs)  
**Returns**: <code>object</code> - A `featureObject` as provided by the provider.  

| Param | Type | Description |
| --- | --- | --- |
| userObj | <code>object</code> | The Full User Object as returned by `auth.verifyAuth()` |
| ownerRepo | <code>string</code> | The Owner Repo Combo of the package affected. Such as `pulsar-edit/pulsar` |
| service | <code>string</code> | The service to use as expected to be returned by `vcs.determineProvider()`. Currently should be hardcoded to "git" |

<a name="module_vcs..determineProvider"></a>

### vcs~determineProvider(repo) ⇒ <code>object</code>
Determines the repostiry object by the given argument.
Takes the `repository` key of a `package.json` and with very little if not no
desctructing will attempt to locate the provider service and return an object
with it.

**Kind**: inner method of [<code>vcs</code>](#module_vcs)  
**Returns**: <code>object</code> - The object related to the package repository type.  

| Param | Type | Description |
| --- | --- | --- |
| repo | <code>string</code> \| <code>object</code> | The `repository` of the retrieved package. |

<a name="module_webhook"></a>

## webhook
Handles sending out webhooks based on function calls.


* [webhook](#module_webhook)
    * [~alertPublishPackage(pack, user)](#module_webhook..alertPublishPackage)
    * [~alertPublishVersion(pack, user)](#module_webhook..alertPublishVersion)
    * [~sendWebHook(obj, webhookURL)](#module_webhook..sendWebHook)

<a name="module_webhook..alertPublishPackage"></a>

### webhook~alertPublishPackage(pack, user)
Used to send a webhook of a new package being published.

**Kind**: inner method of [<code>webhook</code>](#module_webhook)  

| Param | Type | Description |
| --- | --- | --- |
| pack | <code>object</code> | The full package object being published. |
| user | <code>object</code> | The full user object. |

<a name="module_webhook..alertPublishVersion"></a>

### webhook~alertPublishVersion(pack, user)
Used to send a webhook of a new package version being published.

**Kind**: inner method of [<code>webhook</code>](#module_webhook)  

| Param | Type | Description |
| --- | --- | --- |
| pack | <code>object</code> | The full package object and version being published. |
| user | <code>object</code> | The full user object. |

<a name="module_webhook..sendWebHook"></a>

### webhook~sendWebHook(obj, webhookURL)
Used to preform the actual sending of the webhook.

**Kind**: inner method of [<code>webhook</code>](#module_webhook)  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | The Object to send via the webhook |
| webhookURL | <code>string</code> | The URL to send the webhook to. |

<a name="module_deletePackagesPackageName"></a>

## deletePackagesPackageName
<a name="module_DeletePackagesPackageNameStar"></a>

## DeletePackagesPackageNameStar
<a name="module_deletePackagesPackageNameVersionsVersionName"></a>

## deletePackagesPackageNameVersionsVersionName
<a name="module_getLogin"></a>

## getLogin
<a name="module_getOauth"></a>

## getOauth
<a name="module_getPackages"></a>

## getPackages
<a name="module_getPackagesFeatured"></a>

## getPackagesFeatured
<a name="module_getPackagesPackageName"></a>

## getPackagesPackageName
<a name="module_getPackagesPackageNameStargazers"></a>

## getPackagesPackageNameStargazers
<a name="module_getPackagesPackageNameVersionsVersionName"></a>

## getPackagesPackageNameVersionsVersionName
<a name="module_getPackagesPackageNameVersionsVersionNameTarball"></a>

## getPackagesPackageNameVersionsVersionNameTarball
<a name="module_getPackagesSearch"></a>

## getPackagesSearch
<a name="module_getPat"></a>

## getPat
<a name="module_getRoot"></a>

## getRoot
<a name="module_getStars"></a>

## getStars
<a name="module_getThemes"></a>

## getThemes
<a name="module_getThemesFeatured"></a>

## getThemesFeatured
<a name="module_getThemesSearch"></a>

## getThemesSearch
<a name="module_getUpdates"></a>

## getUpdates
<a name="module_getUsers"></a>

## getUsers
<a name="module_getUsersLogin"></a>

## getUsersLogin
<a name="module_getUsersLoginStars"></a>

## getUsersLoginStars
<a name="module_postPackages"></a>

## postPackages
<a name="module_postPackagesPackageNameStar"></a>

## postPackagesPackageNameStar
<a name="module_postPackagesPackageNameVersions"></a>

## postPackagesPackageNameVersions
<a name="module_postPackagesPackageNameVersionsVersionNameEventsUninstall"></a>

## postPackagesPackageNameVersionsVersionNameEventsUninstall
<a name="module_query"></a>

## query
Home to parsing all query parameters from the `Request` object. Ensuring a valid response.
While most values will just return their default there are some expecptions:
engine(): Returns false if not defined, to allow a fast way to determine if results need to be pruned.

<a name="verifyAuth"></a>

## verifyAuth() ⇒ <code>object</code>
This will be the major function to determine, confirm, and provide user
details of an authenticated user. This will take a users provided token,
and use it to check GitHub for the details of whoever owns this token.
Once that is done, we can go ahead and search for said user within the database.
If the user exists, then we can confirm that they are both locally and globally
authenticated, and execute whatever action it is they wanted to.

**Kind**: global function  
**Returns**: <code>object</code> - A server status object.  
**Params**: <code>string</code> token - The token the user provided.  
<a name="auth"></a>

## auth(req) ⇒ <code>string</code>
Retrieves Authorization Headers from Request, and Checks for Undefined.

**Kind**: global function  
**Returns**: <code>string</code> - Returning a valid Authorization Token, or '' if invalid/not found.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="direction"></a>

## direction(req) ⇒ <code>string</code>
Parser for either 'direction' or 'order' query parameter, prioritizing
'direction'.

**Kind**: global function  
**Returns**: <code>string</code> - The valid direction value from the 'direction' or 'order'
query parameter.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="engine"></a>

## engine(semver) ⇒ <code>string</code> \| <code>boolean</code>
Parses the 'engine' query parameter to ensure it's valid, otherwise returning false.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>boolean</code> - Returns the valid 'engine' specified, or if none, returns false.  

| Param | Type | Description |
| --- | --- | --- |
| semver | <code>string</code> | The engine string. |

<a name="fileExtension"></a>

## fileExtension(req) ⇒ <code>string</code> \| <code>boolean</code>
Returns the file extension being requested.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>boolean</code> - Returns false if the provided value is invalid, or
nonexistant. Returns the service string otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="login"></a>

## login(req) ⇒ <code>string</code>
Returns the User from the URL Path, otherwise ''

**Kind**: global function  
**Returns**: <code>string</code> - Returns a valid specified user or ''.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="packageName"></a>

## packageName(req) ⇒ <code>string</code>
This function will convert a user provided package name into a safe format.
It ensures the name is converted to lower case. As is the requirement of all package names.

**Kind**: global function  
**Returns**: <code>string</code> - Returns the package name in a safe format that can be worked with further.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` Object inherited from the Express endpoint. |

<a name="page"></a>

## page(req) ⇒ <code>number</code>
Parser of the Page query parameter. Defaulting to 1.

**Kind**: global function  
**Returns**: <code>number</code> - Returns the valid page provided in the query parameter or 1, as the default.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="query"></a>

## query(req) ⇒ <code>string</code>
Checks the 'q' query parameter, trunicating it at 50 characters, and checking simplisticly that
it is not a malicious request. Returning "" if an unsafe or invalid query is passed.

**Kind**: global function  
**Implements**: [<code>pathTraversalAttempt</code>](#pathTraversalAttempt)  
**Returns**: <code>string</code> - A valid search string derived from 'q' query parameter. Or '' if invalid.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="rename"></a>

## rename(req) ⇒ <code>boolean</code>
Since this is intended to be returning a boolean value, returns false
if invalid, otherwise returns true. Checking for mixed captilization.

**Kind**: global function  
**Returns**: <code>boolean</code> - Returns false if invalid, or otherwise returns the boolean value of the string.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="repo"></a>

## repo(req) ⇒ <code>string</code>
Parses the 'repository' query parameter, returning it if valid, otherwise returning ''.

**Kind**: global function  
**Returns**: <code>string</code> - Returning the valid 'repository' query parameter, or false if invalid.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="service"></a>

## service(req) ⇒ <code>string</code> \| <code>boolean</code>
Returns the service being requested.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>boolean</code> - Returns false if the provided value is invalid or
nonexistent. Returns the service string otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="serviceType"></a>

## serviceType(req) ⇒ <code>string</code> \| <code>boolean</code>
Returns the service type being requested.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>boolean</code> - Returns false if the provided value is invalid, or
nonexistent. Returns `providedServices` if the query is `provided` or returns
`consumedServices` if the query is `consumed`  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="serviceVersion"></a>

## serviceVersion(req) ⇒ <code>string</code> \| <code>boolean</code>
Returns the version of whatever service is being requested.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>boolean</code> - Returns false if the provided value is invalid, or
nonexistant. Returns the version as a string otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express Endpoint. |

<a name="sort"></a>

## sort(req, [def]) ⇒ <code>string</code>
Parser for the 'sort' query parameter. Defaulting usually to downloads.

**Kind**: global function  
**Returns**: <code>string</code> - Either the user provided 'sort' query parameter, or the default specified.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| req | <code>object</code> |  | The `Request` object inherited from the Express endpoint. |
| [def] | <code>string</code> | <code>&quot;\&quot;downloads\&quot;&quot;</code> | The default provided for sort. Allowing The search function to use "relevance" instead of the default "downloads". |

<a name="tag"></a>

## tag(req) ⇒ <code>string</code>
Parses the 'tag' query parameter, returning it if valid, otherwise returning ''.

**Kind**: global function  
**Returns**: <code>string</code> - Returns a valid 'tag' query parameter. Or '' if invalid.  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>object</code> | The `Request` object inherited from the Express endpoint. |

<a name="stringValidation"></a>

## stringValidation(value) ⇒ <code>string</code> \| <code>boolean</code>
Provides a generic Query Utility that validates if a provided value
is a string, as well as trimming it to the safe max length of query strings,
while additionally passing it through the Path Traversal Detection function.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>boolean</code> - Returns false if any check fails, otherwise returns
the valid string.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The value to check |

<a name="pathTraversalAttempt"></a>

## pathTraversalAttempt(data) ⇒ <code>boolean</code>
Completes some short checks to determine if the data contains a malicious
path traversal attempt. Returning a boolean indicating if a path traversal attempt
exists in the data.

**Kind**: global function  
**Returns**: <code>boolean</code> - True indicates a path traversal attempt was found. False otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> | The data to check for possible malicious data. |

<a name="ServerStatusObject"></a>

## ServerStatusObject : <code>object</code>
The Generic Object that should be returned by nearly every function
within every module. Allows ease of bubbling errors to the HTTP Handler.

**Kind**: global typedef  
**See**: [docs/reference/bubbled_errors.md](docs/reference/bubbled_errors.md)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ok | <code>boolean</code> | Indicates if the overall function was successful. |
| content | <code>\*</code> | The returned data of the request. Can be anything. |
| [short] | <code>string</code> | Only included if `ok` is false. Includes a generic reason the request failed. |

<a name="SSO_VCS_newVersionData"></a>

## SSO\_VCS\_newVersionData : <code>object</code>
The Server Status Object returned by `vcs.newVersionData()` containing all
the data needed to update a packages version.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ok | <code>boolean</code> | Indicates if the overall function was successful. |
| [short] | <code>string</code> | Only included if `ok: false`. Includes the generic reason the request failed. |
| content | <code>string</code> \| <code>object</code> | When `ok: false` returns a string error but when `ok: true` returns an object further documented below. |
| content.name | <code>string</code> | The Lowercase string of the packages name. As taken from the `package.json` content at it's remote repository. |
| content.repository | <code>object</code> | The returned repository object as returned by `vcs.determineProvider()` when passed the remote `package.json`s `repository` key. |
| content.repository.type | <code>string</code> | A string representing the service vcs name of where the repo is located. One of the valid types returned by `vcs.determineProvider()` |
| content.repository.url | <code>string</code> | A String URL of where the remote repository is located. |
| content.readme | <code>string</code> | The Text based readme of the package, as received from it's remote repository. |
| content.metadata | <code>object</code> | Largely made up of the remote `package.json` Where it will include all fields as found in the remote file. While additionally adding a few others which will be documented here. |
| content.metadata.tarball_url | <code>string</code> | The URL of the tarball download for the newest tag published for the package. |
| content.metadata.sha | <code>string</code> | The SHA hash of the `tarball_url` |

