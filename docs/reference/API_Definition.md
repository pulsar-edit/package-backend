# WARNING This file is deprecated. And will soon be removed. Leaving our swagger instance to be the complete standard in the Pulsar backend API documentation.

# **[GET]** /
A non-essential endpoint, returning a status message, and the server version.

Auth: `FALSE`
# **[GET]** /api/oauth
OAuth Callback URL. Other details TBD.

Auth: `FALSE`
# **[GET]** /api/oauth
OAuth Callback URL. Other details TDB.

Auth: `FALSE`
# **[GET]** /api/pat
Pat Token Signup URL.

Auth: `FALSE`
# **[GET]** /api/:packType
List all packages.

Auth: `FALSE`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
* page _(optional)_ `[integer]` | Location: `query` | Defaults: `1`
  - Indicate the page number to return.


---
* sort _(optional)_ `[string]` | Location: `query` | Defaults: `downloads` | Valid: `[downloads, created_at, updated_at, stars]`
  - The method to sort the returned pacakges by.


---
* direction _(optional)_ `[string]`  | Defaults: `desc` | Valid: `[desc, asc]`
  - Which direction to list the results. If sorting by stars, can only be sorted by desc.


---
* service _(optional)_ `[string]`   
  - A service to filter results by.


---
* serviceType _(optional)_ `[string]`   | Valid: `[provided, consumed]`
  - The service type to filter results by. Must be supplied if a service is provided.


---
* serviceVersion _(optional)_ `[string]`   
  - An optional (when providing a service) version to filter results by.


---
* fileExtension _(optional)_ `[string]`   
  - The file extension to filter all results by. Must be just the file extension without any `.`


---
Responses:
---
**HTTP Status Code:** `200 OK`

**Type:** `[application/json]`

Returns a list of all packages. Paginated 30 at a time. Links to the next and last pages are in the 'Link' Header.


---
# **[POST]** /api/packages
Publishes a new Package.

Auth: `true`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
* repository _(required)_ `[string]` | Location: `query`  
  - The repository containing the plugin, in the form 'owner/repo'.


---
* Authentication _(required)_ `[string]` | Location: `header`  
  - A valid Atom.io token, in the 'Authorization' Header.


---
Responses:
---
**HTTP Status Code:** `201 `

**Type:** `[application/json]`

Successfully created, return created package.


---
**HTTP Status Code:** `400 Bad Request`

**Type:** `[application/json]`

Repository is inaccessible, nonexistant, not an atom package. Could be different errors returned.

```json
{ "message": "That repo does not exist, ins't an atom package, or atombot does not have access." }, { "message": "The package.json at owner/repo isn't valid." }
```


---
**HTTP Status Code:** `409 Conflict`

**Type:** `[application/json]`

A package by that name already exists.


---
# **[GET]** /api/:packType/featured
Previously Undocumented endpoint. Used to return featured packages from all existing packages.

Auth: `FALSE`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
Responses:
---
**HTTP Status Code:** `200 OK`

An array of packages similar to /api/packages endpoint.


---
# **[GET]** /api/:packType/search
Searches all Packages.

Auth: `FALSE`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want.


---
* q _(required)_ `[string]` | Location: `query`  
  - Search query.


---
* page _(optional)_ `[integer]` | Location: `query`  
  - The page of search results to return.


---
* sort _(optional)_ `[string]` | Location: `query` | Defaults: `relevance` | Valid: `[downloads, created_at, updated_at, stars]`
  - Method to sort the results.


---
* direction _(optional)_ `[string]` | Location: `query` | Defaults: `desc` | Valid: `[asc, desc]`
  - Direction to list search results.


---
Responses:
---
**HTTP Status Code:** `200 OK`

**Type:** `[application/json]`

Same format as listing packages, additionally paginated at 30 items.


---
# **[GET]** /api/packages/:packageName
Show package details.

Auth: `FALSE`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
* packageName _(required)_ `[string]` | Location: `path`  
  - The name of the package to return details for. URL escaped.


---
* engine _(optional)_ `[string]` | Location: `query`  
  - Only show packages compatible with this Atom version. Must be valid SemVer.


---
Responses:
---
**HTTP Status Code:** `200 OK`

**Type:** `[application/json]`

Returns package details and versions for a single package.


---
# **[DELETE]** /api/packages/:packageName
Delete a package.

Auth: `true`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
* packageName _(required)_ `[string]` | Location: `path`  
  - The name of the package to delete.


---
* Authorization _(required)_ `[string]` | Location: `header`  
  - A valid Atom.io token, in the 'Authorization' Header.


---
Responses:
---
**HTTP Status Code:** `204 No Content`

**Type:** `[application/json]`

Successfully deleted package. Returns No Content.


---
**HTTP Status Code:** `400 Bad Request`

**Type:** `[application/json]`

Repository is inaccessible.

```json
{ "message": "Respository is inaccessible." }
```


---
**HTTP Status Code:** `401 Unauthorized`

**Type:** `[application/json]`

Unauthorized.


---
# **[POST]** /api/packages/:packageName/star
Star a package.

Auth: `true`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
* packageName _(required)_ `[string]` | Location: `path`  
  - The name of the package to star.


---
* Authorization _(required)_ `[string]` | Location: `header`  
  - A valid Atom.io token, in the 'Authorization' Header


---
Responses:
---
**HTTP Status Code:** `200 OK`

**Type:** `[application/json]`

Returns the package that was stared.


---
# **[DELETE]** /api/packages/:packageName/star
Unstar a package, requires authentication.

Auth: `true`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
* Authentication _(required)_ `[string]` | Location: `header`  
  - Atom Token, in the Header Authentication Item


---
* packageName _(required)_ `[string]` | Location: `path`  
  - The package name to unstar.


---
Responses:
---
**HTTP Status Code:** `201 `

An empty response to convey successfully unstaring a package.


---
# **[GET]** /api/packages/:packageName/stargazers
List the users that have starred a package.

Auth: `FALSE`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
* packageName _(required)_  | Location: `path`  
  - The package name to check for users stars.


---
Responses:
---
**HTTP Status Code:** `200 OK`

A list of user Objects.

```json
[ { "login": "aperson" }, { "login": "anotherperson" } ]
```


---
# **[POST]** /api/packages/:packageName/versions
Creates a new package version. If `rename` is not `true`, the `name` field in `package.json` _must_ match the current package name.

Auth: `true`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
* packageName _(required)_  | Location: `path`  
  - The Package to modify.


---
* rename _(optional)_  | Location: `query`  
  - Boolean indicating whether this version contains a new name for the package.


---
* auth _(required)_  | Location: `header`  
  - A valid Atom.io API token, to authenticate with Github.


---
Responses:
---
**HTTP Status Code:** `201 `

Successfully created. Returns created version.


---
**HTTP Status Code:** `400 Bad Request`

Git tag not found / Repository inaccessible / package.json invalid.


---
# **[GET]** /api/packages/:packageName/versions/:versionName
Returns `package.json` with `dist` key added for tarball download.

Auth: `FALSE`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
* packageName _(required)_  | Location: `path`  
  - The package name we want to access


---
* versionName _(required)_  | Location: `path`  
  - The Version we want to access.


---
Responses:
---
**HTTP Status Code:** `200 OK`

The `package.json` modified as explainged in the endpoint description.


---
# **[DELETE]** /api/packages/:packageName/versions/:versionName
Deletes a package version. Note once a version is deleted, that same version should not be reused again.

Auth: `true`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
* Authentication _(required)_  | Location: `header`  
  - The Authentication header containing a valid Atom Token


---
* packageName _(required)_  | Location: `path`  
  - The package name to check for the version to delete.


---
* versionName _(required)_  | Location: `path`  
  - The Package Version to actually delete.


---
Responses:
---
**HTTP Status Code:** `204 No Content`

Indicates a successful deletion.


---
# **[GET]** /api/packages/:packageName/versions/:versionName/tarball
Previously undocumented endpoint. Seems to allow for installation of a package. This is not currently implemented.

Auth: `FALSE`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
* packageName _(required)_  | Location: `path`  
  - The package we want to download.


---
* versionName _(required)_  | Location: `path`  
  - The package version we want to download.


---
Responses:
---
**HTTP Status Code:** `200 OK`

The tarball data for the user to then be able to install.


---
# **[POST]** /api/packages/:packageName/versions/:versionName/events/uninstall
Previously undocumented endpoint. BETA: Decreases the packages download count, by one. Indicating an uninstall.

Auth: `true`
Parameters:
---
* packType _(required)_ `[string]` | Location: `path`  | Valid: `[packages, themes]`
  - The Package Type you want to request.


---
* packageName _(required)_  | Location: `path`  
  - The name of the package to modify.


---
* versionName _(required)_  | Location: `path`  
  - This value is within the original spec. But has no use in its current implementation.


---
* auth _(required)_  | Location: `header`  
  - Valid Atom.io token.


---
Responses:
---
**HTTP Status Code:** `200 OK`

Returns JSON ok: true


---
# **[GET]** /api/users/:login/stars
List a user's starred packages.

Auth: `FALSE`
Parameters:
---
* login _(required)_ `[string]`   
  - The username of who to list their stars.


---
Responses:
---
**HTTP Status Code:** `200 OK`

Return value is similar to GET /api/packages


---
**HTTP Status Code:** `404 Not Found`

If the login does not exist, a 404 is returned.


---
# **[GET]** /api/users
Display details of the currently authenticated user.

Auth: `true`
Parameters:
---
* auth _(required)_ `[string]` | Location: `header`  
  - Authorization Header of valid User Account Token.


---
Responses:
---
**HTTP Status Code:** `200 OK`

**Type:** `[application/json]`

The return Details of the User Account.


---
# **[GET]** /api/users/:login
Display the details of any user, as well as the packages they have published.

Auth: `FALSE`
Parameters:
---
* login _(required)_ `[string]` | Location: `path`  
  - The User of which to collect the details of.


---
Responses:
---
**HTTP Status Code:** `200 OK`

**Type:** `[application/json]`

The returned details of a specific user, along with the packages they have published.


---
# **[GET]** /api/stars
List the authenticated user's starred packages.

Auth: `true`
Parameters:
---
* auth _(required)_ `[string]` | Location: `header`  
  - Authorization Header of valid Atom.io Token.


---
Responses:
---
**HTTP Status Code:** `200 OK`

**Type:** `[application/json]`

Return value similar to GET /api/packages, an array of package objects.


---
# **[GET]** /api/updates
List Atom Updates.

Auth: `FALSE`
Responses:
---
**HTTP Status Code:** `200 OK`

**Type:** `[application/json]`

Atom update feed, following the format expected by Squirrel.


---
