# Changelog

This project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

The following changes have been implemented but not released yet:

## [Unreleased]

## [1.5.0] - 2021-04-08

### New features

- `@inrupt/solid-client/access/universal`: an early preview of a set of APIs to
  manage Access which are agnostic to the Access Control mechanism actually
  implemented (from the user's point of view). Currently, these modules
  support the two known access controls for Solid, i.e. Web Access Control and
  Access Control Policies.

The following sections document changes that have been released already:

## [1.4.0] - 2021-02-19

### Bugs fixed

- Saving a SolidDataset with a Thing obtained from a different SolidDataset would fail if that Thing
  contained an RDF Blank Node.
- Saving back a SolidDataset you just fetched used to result in a "412: Conflict" error.

### New features

- `setGroupDefaultAccess`: A function to set a Group's access modes for all the child Resources of a Container, in the
  case this Container is controlled using WAC.
- `setGroupResourceAccess`: A function to set a Group's access modes for a given Resource, in the case this Resource is
  controlled using WAC.

## [1.3.0] - 2021-01-07

### New features

- If you know the content type of a file to upload via `overwriteFile` or `saveFileInContainer`,
  you can now manually set it using the `contentType` property in their `options` parameters.
- `getContainedResourceUrlAll`: a function that returns the URLs for each resource contained in
  the given Container.
- FetchError now contains the server response (`error.response`).

### Bugs fixed

- Files sent to a Pod via `overwriteFile` or `saveFileInContainer` without a known content type
  were rejected by Inrupt's Enterprise Solid Server with a 400 Bad Request, as
  the Solid specification says it should do. To avoid this, solid-client now sets the content type
  to `application/octet-stream` by default if no content type is known for the given file.

## [1.2.0] - 2020-12-02

### New features

- It is now possible to import solid-client as an ES module in Node.
- A number of error messages have been improved that should make it easier for you to identify what
  went wrong. If you encounter more unhelpful error messages, please
  [let us know](https://github.com/inrupt/solid-client-js/issues/new?assignees=&labels=bug&template=bug_report.md&title=).

### Bugs fixed

- While the documentation mentioned `hasAcl()`, solid-client did not actually export that function.
- Dates in between the years 0 and 100 AD were not parsed properly.

## [1.1.0] - 2020-11-16

### New features

- When a function that makes an HTTP request, such as `getSolidDataset`, receives an error response
  from the server, the error's status code and status text are now exposed via the `.statusCode`
  and `.statusText` properties, respectively, on the thrown (/returned in the rejected Promise)
  Error object.
- Additionally, to help you mock the above errors in your unit tests, we now export
  `mockFetchError()`. Pass it the URL the fake fetch targeted, and optionally the status code
  that caused the error.

### Bugs fixed

- Our property-based tests discovered a new edge case in which reading a Datetime from the Pod used
  to fail. That edge case is now handled properly.
- Using solid-client with TypeScript would result in the following error:
  `error TS2305: Module '"../constants"' has no exported member 'acp'.` This is now fixed, and we
  are working on preventing such errors in the future.

## [1.0.0] - 2020-11-04

The big v1! There are no major changes in this release, but from now on, when we intend to change
our publicly-documented non-experimental API's, we will bump up the major version to help you plan
the impact of the upgrade.

### Deprecations

- solid-client will no longer attempt to automatically load solid-auth-client, because it comes with
  security risks. It is recommended to use
  [solid-client-authn-browser](https://www.npmjs.com/package/@inrupt/solid-client-authn-browser)
  instead. It will remain possible to pass a `fetch` function generated by solid-auth-client to the
  data fetching functions in solid-client.

## [0.6.4] - 2020-11-03

### Bugs fixed

- The compiled code of solid-client was not sent to the correct location, causing imports to fail.
  This bug was introduced in version 0.6.2.

## [0.6.3] - 2020-11-03

This release contains no public changes.

## [0.6.2] - 2020-10-30

### Bugs fixed

- When writing non-RDF data, the request headers were incorrectly set.

## [0.6.1] - 2020-10-15

### Bugs fixed

- All `get*WithAcl()` functions would always fetch _both_ the Resource's own ACL and its fallback
  ACL, causing issues when the Resource is the Pod's root, but not at the root of the domain,
  resulting in an attempt to find a fallback ACL for a Resource outside of the Pod. These functions
  will now only attempt to fetch the Fallback ACL if the Resource's own ACL is not available. Hence,
  only at most one of the two will be available at any time.

## [0.6.0] - 2020-10-14

### New features

- `deleteSolidDataset` and `deleteContainer`: two functions that allow you to delete a SolidDataset
  and a Container from the user's Pod, respectively.
- `hasServerResourceInfo`: a function that determines whether server-provided information about the
  Resource is present, such as which server-managed Resources are linked to it.
- `getPodOwner` and `isPodOwner` allow you to check who owns the Pod that contains a given Resource,
  if supported by the Pod server and exposed to the current user.

## [0.5.1] - 2020-10-13

### Bugs fixed

- The type definition of `asUrl` caused the compiler to complain when passing it a Thing of which
  the final URL was either known or not known yet, when using TypeScript.

## [0.5.0] - 2020-09-24

### Breaking changes

- All previously deprecated functions have been removed (their replacements are still available).
- Previously, if no data with the given URL could be found, `getThing` would return a new, empty
  Thing. From now on, it will return `null` in those situations.

### Bugs fixed

- `createAclFromFallbackAcl` did not correctly initialise the new ACL: rules that applied to the
  applicable Resource's children _before_ the new ACL was created (i.e. defined in the fallback ACL)
  no longer applied after saving the new one. This is now fixed.

## [0.4.0] - 2020-09-15

### Deprecations

- The experimental function `fetchResourceInfoWithAcl` has been deprecated. It is replaced by the
  otherwise identical (but still experimental) `getResourceInfoWithAcl`.

### New features

- `getResourceInfo`: Function fetching metadata for a resource, without fetching the resource itself. This enables
  having lightwheight interaction with a Pod before fetching a large file.
- When fetching data from or storing data to a Pod results in an error, those error messages now
  contain more information about what data was being sent, and where it was sent to.

### Bugs fixed

- When creating a new Container on Node Solid Server using `createContainerAt`, no error would be
  thrown when the Container already exists. Now, as with other Solid servers, an error will be
  thrown if the Container you are trying to create already exists.
- The second, optional parameter to functions like `getSolidDataset`, which allows you to pass e.g.
  your own `fetch` function, was not included in our type definitions. This prevented editors from
  autocompleting them, and could cause compilation errors for developers using TypeScript.

## [0.3.0] - 2020-09-03

### New features

- `thingAsMarkdown()`, `solidDatasetAsMarkdown()` and `changeLogAsMarkdown`: functions that take a
  Thing and SolidDataset (with local changes), respectively, and returns a string representation of
  it that can assist in debugging issues.

## [0.2.0] - 2020-08-27

### New features

- `hasResourceInfo`: a function that can verify whether its parameter (e.g. a file or a
  SolidDataset) was fetched from somewhere, or was initialised in-memory.
- `createContainerAt` and `createContainerInContainer`: two functions that can help you create an
  empty Container at a given location or in another Container on the Pod, respectively.
- `isThing`: a function that can verify whether its parameter is a Thing.
- `mockSolidDatasetFrom`, `mockContainerFrom`, `mockFileFrom`, `mockThingFrom`,
  `addMockResourceAclTo` and `addMockFallbackAclTo`: functions that allow you to mock the
  solid-client data structures in your unit tests.
- `getFileWithAcl`: like `getSolidDatasetWithAcl`, this function lets you fetch a file along with
  its ACLs, if available.
- The legacy predicate `acl:defaultForNew` is now supported by our library. If you interact with a
  server where it is used to stipulate default access, `@inrupt/solid-client` will behave as expected.

### Bugs fixed

- `getSourceUrl` used to throw an error when called on a Resource that was not fetched from
  somewhere (and hence had no source URL). It now returns `null` in that case.
- Giving more rights to an Agent or Group could lead to privilege escalation for an app identified
  by an `acl:origin` predicate in the ACL.
- While we allow reading data of different types, they are stored as plain strings. While multiple
  serialisations of data are often possible, we only supported one per data type. What this means
  is that, whereas we would correctly return `true` for a boolean stored as `"1"`, we would not do
  so for `"true"`, even though both are valid serialisations of the value `true` according to the
  XML Schema Datatypes specification: https://www.w3.org/TR/xmlschema-2. solid-client now recognises
  all valid serialisations of all supported data types as defined by that specification.

## [0.1.0] - 2020-08-06

### New features

First release! What's possible with this first release:

- Fetch data from Solid Pods or other public sources that publish Turtle data.
- Store data back to Solid Pods.
- Read data from datasets.
- Manipulate data in datasets.
- Inspect a user's, group's and public permissions w.r.t. a given Resource or child Resources of a
  Container. (Experimental.)
- Retrieve, delete and/or write any file (including non-RDF) from/to a Pod. (Experimental.)
