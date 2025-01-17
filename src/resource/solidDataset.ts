/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { Quad, NamedNode, Quad_Object } from "rdf-js";
import { dataset, DataFactory } from "../rdfjs";
import { ldp } from "../constants";
import { turtleToTriples, triplesToTurtle } from "../formats/turtle";
import {
  isLocalNode,
  isNamedNode,
  resolveIriForLocalNode,
  resolveIriForLocalNodes,
} from "../datatypes";
import {
  UrlString,
  SolidDataset,
  WithChangeLog,
  hasChangelog,
  WithResourceInfo,
  hasResourceInfo,
  LocalNode,
  Url,
  IriString,
  Thing,
  WithServerResourceInfo,
} from "../interfaces";
import { internal_toIriString } from "../interfaces.internal";
import {
  internal_defaultFetchOptions,
  getSourceUrl,
  getResourceInfo,
  isContainer,
  FetchError,
} from "./resource";
import {
  internal_cloneResource,
  internal_isUnsuccessfulResponse,
  internal_parseResourceInfo,
} from "./resource.internal";
import { thingAsMarkdown, getThingAll, getThing } from "../thing/thing";
import {
  internal_getReadableValue,
  internal_toNode,
  internal_withChangeLog,
} from "../thing/thing.internal";
import { getIriAll } from "../thing/get";

/**
 * Initialise a new [[SolidDataset]] in memory.
 *
 * @returns An empty [[SolidDataset]].
 */
export function createSolidDataset(): SolidDataset {
  return dataset();
}

/**
 * Fetch a SolidDataset from the given URL. Currently requires the SolidDataset to be available as [Turtle](https://www.w3.org/TR/turtle/).
 *
 * @param url URL to fetch a [[SolidDataset]] from.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns Promise resolving to a [[SolidDataset]] containing the data at the given Resource, or rejecting if fetching it failed.
 */
export async function getSolidDataset(
  url: UrlString | Url,
  options: Partial<
    typeof internal_defaultFetchOptions
  > = internal_defaultFetchOptions
): Promise<SolidDataset & WithServerResourceInfo> {
  url = internal_toIriString(url);
  const config = {
    ...internal_defaultFetchOptions,
    ...options,
  };

  const response = await config.fetch(url, {
    headers: {
      Accept: "text/turtle",
    },
  });
  if (internal_isUnsuccessfulResponse(response)) {
    throw new FetchError(
      `Fetching the Resource at [${url}] failed: [${response.status}] [${response.statusText}].`,
      response
    );
  }
  const data = await response.text();
  const triples = await turtleToTriples(data, url);
  const resource = dataset();
  triples.forEach((triple) => resource.add(triple));

  const resourceInfo = internal_parseResourceInfo(response);

  const resourceWithResourceInfo: SolidDataset &
    WithServerResourceInfo = Object.assign(resource, {
    internal_resourceInfo: resourceInfo,
  });

  return resourceWithResourceInfo;
}

type UpdateableDataset = SolidDataset &
  WithChangeLog &
  WithServerResourceInfo & { internal_resourceInfo: { sourceIri: IriString } };

/**
 * Create a SPARQL UPDATE Patch request from a [[SolidDataset]] with a changelog.
 * @param solidDataset the [[SolidDataset]] that has been locally updated, and that should be persisted.
 * @returns an HTTP PATCH request configuration object, aligned with the [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters), containing a SPARQL UPDATE.
 * @hidden
 */
async function prepareSolidDatasetUpdate(
  solidDataset: UpdateableDataset
): Promise<RequestInit> {
  const deleteStatement =
    solidDataset.internal_changeLog.deletions.length > 0
      ? `DELETE DATA {${(
          await triplesToTurtle(
            solidDataset.internal_changeLog.deletions.map(
              getNamedNodesForLocalNodes
            )
          )
        ).trim()}};`
      : "";
  const insertStatement =
    solidDataset.internal_changeLog.additions.length > 0
      ? `INSERT DATA {${(
          await triplesToTurtle(
            solidDataset.internal_changeLog.additions.map(
              getNamedNodesForLocalNodes
            )
          )
        ).trim()}};`
      : "";

  return {
    method: "PATCH",
    body: `${deleteStatement} ${insertStatement}`,
    headers: {
      "Content-Type": "application/sparql-update",
    },
  };
}

/**
 * Create a Put request to write a locally created [[SolidDataset]] to a Pod.
 * @param solidDataset the [[SolidDataset]] that has been locally updated, and that should be persisted.
 * @returns an HTTP PUT request configuration object, aligned with the [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters), containing a serialization of the [[SolidDataset]].
 * @hidden
 */
async function prepareSolidDatasetCreation(
  solidDataset: SolidDataset
): Promise<RequestInit> {
  return {
    method: "PUT",
    body: await triplesToTurtle(
      Array.from(solidDataset).map(getNamedNodesForLocalNodes)
    ),
    headers: {
      "Content-Type": "text/turtle",
      "If-None-Match": "*",
      Link: `<${ldp.Resource}>; rel="type"`,
    },
  };
}

/**
 * Given a SolidDataset, store it in a Solid Pod (overwriting the existing data at the given URL).
 *
 * A SolidDataset keeps track of the data changes compared to the data in the Pod; i.e.,
 * the changelog tracks both the old value and new values of the property being modified. This
 * function applies the changes to the current SolidDataset. If the old value specified in the
 * changelog does not correspond to the value currently in the Pod, this function will throw an
 * error.
 * The SolidDataset returned by this function will contain the data sent to the Pod, and a ChangeLog
 * up-to-date with the saved data. Note that if the data on the server was modified in between the
 * first fetch and saving it, the updated data will not be reflected in the returned SolidDataset.
 * To make sure you have the latest data, call [[getSolidDataset]] again after saving the data.
 *
 * The Solid server will create any intermediary Containers that do not exist yet, so they do not
 * need to be created in advance. For example, if the target URL is
 * https://example.pod/container/resource and https://example.pod/container/ does not exist yet,
 * it will exist after this function resolves successfully.
 *
 * @param url URL to save `solidDataset` to.
 * @param solidDataset The [[SolidDataset]] to save.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A Promise resolving to a [[SolidDataset]] containing the stored data, or rejecting if saving it failed.
 */
export async function saveSolidDatasetAt<Dataset extends SolidDataset>(
  url: UrlString | Url,
  solidDataset: Dataset,
  options: Partial<
    typeof internal_defaultFetchOptions
  > = internal_defaultFetchOptions
): Promise<Dataset & WithServerResourceInfo & WithChangeLog> {
  url = internal_toIriString(url);
  const config = {
    ...internal_defaultFetchOptions,
    ...options,
  };

  const datasetWithChangelog = internal_withChangeLog(solidDataset);

  const requestInit = isUpdate(datasetWithChangelog, url)
    ? await prepareSolidDatasetUpdate(datasetWithChangelog)
    : await prepareSolidDatasetCreation(datasetWithChangelog);

  const response = await config.fetch(url, requestInit);

  if (internal_isUnsuccessfulResponse(response)) {
    const diagnostics = isUpdate(datasetWithChangelog, url)
      ? "The changes that were sent to the Pod are listed below.\n\n" +
        changeLogAsMarkdown(datasetWithChangelog)
      : "The SolidDataset that was sent to the Pod is listed below.\n\n" +
        solidDatasetAsMarkdown(datasetWithChangelog);
    throw new FetchError(
      `Storing the Resource at [${url}] failed: [${response.status}] [${response.statusText}].\n\n` +
        diagnostics,
      response
    );
  }

  const resourceInfo: WithServerResourceInfo["internal_resourceInfo"] = {
    ...internal_parseResourceInfo(response),
    sourceIri: url,
    isRawData: false,
  };
  const storedDataset: Dataset &
    WithChangeLog &
    WithServerResourceInfo = Object.assign(
    internal_cloneResource(datasetWithChangelog),
    {
      internal_changeLog: { additions: [], deletions: [] },
      internal_resourceInfo: resourceInfo,
    }
  );

  const storedDatasetWithResolvedIris = resolveLocalIrisInSolidDataset(
    storedDataset
  );

  return storedDatasetWithResolvedIris;
}

/**
 * Deletes the SolidDataset at a given URL.
 *
 * @param file The (URL of the) SolidDataset to delete
 * @since 0.6.0
 */
export async function deleteSolidDataset(
  solidDataset: Url | UrlString | WithResourceInfo,
  options: Partial<
    typeof internal_defaultFetchOptions
  > = internal_defaultFetchOptions
): Promise<void> {
  const config = {
    ...internal_defaultFetchOptions,
    ...options,
  };
  const url = hasResourceInfo(solidDataset)
    ? internal_toIriString(getSourceUrl(solidDataset))
    : internal_toIriString(solidDataset);
  const response = await config.fetch(url, { method: "DELETE" });

  if (internal_isUnsuccessfulResponse(response)) {
    throw new FetchError(
      `Deleting the SolidDataset at [${url}] failed: [${response.status}] [${response.statusText}].`,
      response
    );
  }
}

/**
 * Create an empty Container at the given URL.
 *
 * Throws an error if creating the Container failed, e.g. because the current user does not have
 * permissions to, or because the Container already exists.
 *
 * Note that a Solid server will automatically create the necessary Containers when storing a
 * Resource; i.e. there is no need to call this function if it is immediately followed by
 * [[saveSolidDatasetAt]] or [[overwriteFile]].
 *
 * @param url URL of the empty Container that is to be created.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @since 0.2.0
 */
export async function createContainerAt(
  url: UrlString | Url,
  options: Partial<
    typeof internal_defaultFetchOptions
  > = internal_defaultFetchOptions
): Promise<SolidDataset & WithServerResourceInfo> {
  url = internal_toIriString(url);
  url = url.endsWith("/") ? url : url + "/";
  const config = {
    ...internal_defaultFetchOptions,
    ...options,
  };

  const response = await config.fetch(url, {
    method: "PUT",
    headers: {
      Accept: "text/turtle",
      "Content-Type": "text/turtle",
      "If-None-Match": "*",
      // This header should not be required to create a Container,
      // but ESS currently expects it:
      Link: `<${ldp.BasicContainer}>; rel="type"`,
    },
  });

  if (internal_isUnsuccessfulResponse(response)) {
    if (
      response.status === 409 &&
      response.statusText === "Conflict" &&
      (await response.text()).trim() ===
        internal_NSS_CREATE_CONTAINER_SPEC_NONCOMPLIANCE_DETECTION_ERROR_MESSAGE_TO_WORKAROUND_THEIR_ISSUE_1465
    ) {
      return createContainerWithNssWorkaroundAt(url, options);
    }

    throw new FetchError(
      `Creating the empty Container at [${url}] failed: [${response.status}] [${response.statusText}].`,
      response
    );
  }

  const resourceInfo = internal_parseResourceInfo(response);
  const containerDataset: SolidDataset &
    WithChangeLog &
    WithServerResourceInfo = Object.assign(dataset(), {
    internal_changeLog: { additions: [], deletions: [] },
    internal_resourceInfo: resourceInfo,
  });

  return containerDataset;
}

/**
 * Unfortunately Node Solid Server does not confirm to the Solid spec when it comes to Container
 * creation. When we make the (valid, according to the Solid protocol) request to create a
 * Container, NSS responds with the following exact error message. Thus, when we encounter exactly
 * this message, we use an NSS-specific workaround ([[createContainerWithNssWorkaroundAt]]). Both
 * this constant and that workaround should be removed once the NSS issue has been fixed and
 * no versions of NSS with the issue are in common use/supported anymore.
 *
 * @see https://github.com/solid/node-solid-server/issues/1465
 * @internal
 */
export const internal_NSS_CREATE_CONTAINER_SPEC_NONCOMPLIANCE_DETECTION_ERROR_MESSAGE_TO_WORKAROUND_THEIR_ISSUE_1465 =
  "Can't write file: PUT not supported on containers, use POST instead";

/**
 * Unfortunately Node Solid Server does not confirm to the Solid spec when it comes to Container
 * creation. As a workaround, we create a dummy file _inside_ the desired Container (which should
 * create the desired Container on the fly), and then delete it again.
 *
 * @see https://github.com/solid/node-solid-server/issues/1465
 */
const createContainerWithNssWorkaroundAt: typeof createContainerAt = async (
  url,
  options
) => {
  url = internal_toIriString(url);
  const config = {
    ...internal_defaultFetchOptions,
    ...options,
  };

  let existingContainer;
  try {
    existingContainer = await getResourceInfo(url, options);
  } catch (e) {
    // To create the Container, we'd want it to not exist yet. In other words, we'd expect to get
    // a 404 error here in the happy path - so do nothing if that's the case.
    if (!(e instanceof FetchError) || e.statusCode !== 404) {
      // (But if we get an error other than a 404, just throw that error like we usually would.)
      throw e;
    }
  }
  if (typeof existingContainer !== "undefined") {
    throw new Error(
      `The Container at [${url}] already exists, and therefore cannot be created again.`
    );
  }

  const dummyUrl = url + ".dummy";

  const createResponse = await config.fetch(dummyUrl, {
    method: "PUT",
    headers: {
      Accept: "text/turtle",
      "Content-Type": "text/turtle",
    },
  });

  if (internal_isUnsuccessfulResponse(createResponse)) {
    throw new FetchError(
      `Creating the empty Container at [${url}] failed: [${createResponse.status}] [${createResponse.statusText}].`,
      createResponse
    );
  }

  await config.fetch(dummyUrl, { method: "DELETE" });

  const containerInfoResponse = await config.fetch(url, { method: "HEAD" });

  const resourceInfo = internal_parseResourceInfo(containerInfoResponse);
  const containerDataset: SolidDataset &
    WithChangeLog &
    WithServerResourceInfo = Object.assign(dataset(), {
    internal_changeLog: { additions: [], deletions: [] },
    internal_resourceInfo: resourceInfo,
  });

  return containerDataset;
};

function isUpdate(
  solidDataset: SolidDataset,
  url: UrlString
): solidDataset is UpdateableDataset {
  return (
    hasChangelog(solidDataset) &&
    hasResourceInfo(solidDataset) &&
    typeof solidDataset.internal_resourceInfo.sourceIri === "string" &&
    solidDataset.internal_resourceInfo.sourceIri === url
  );
}

type SaveInContainerOptions = Partial<
  typeof internal_defaultFetchOptions & {
    slugSuggestion: string;
  }
>;
/**
 * Given a SolidDataset, store it in a Solid Pod in a new Resource inside a Container.
 *
 * The Container at the given URL should already exist; if it does not, you can initialise it first
 * using [[createContainerAt]], or directly save the SolidDataset at the desired location using
 * [[saveSolidDatasetAt]].
 *
 * This function is primarily useful if the current user does not have access to change existing files in
 * a Container, but is allowed to add new files; in other words, they have Append, but not Write
 * access to a Container. This is useful in situations where someone wants to allow others to,
 * for example, send notifications to their Pod, but not to view or delete existing notifications.
 * You can pass a suggestion for the new Resource's name, but the server may decide to give it
 * another name — for example, if a Resource with that name already exists inside the given
 * Container.
 * If the user does have access to write directly to a given location, [[saveSolidDatasetAt]]
 * will do the job just fine, and does not require the parent Container to exist in advance.
 *
 * @param containerUrl URL of the Container in which to create a new Resource.
 * @param solidDataset The [[SolidDataset]] to save to a new Resource in the given Container.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @returns A Promise resolving to a [[SolidDataset]] containing the saved data. The Promise rejects if the save failed.
 */
export async function saveSolidDatasetInContainer(
  containerUrl: UrlString | Url,
  solidDataset: SolidDataset,
  options: SaveInContainerOptions = internal_defaultFetchOptions
): Promise<SolidDataset & WithResourceInfo> {
  const config = {
    ...internal_defaultFetchOptions,
    ...options,
  };
  containerUrl = internal_toIriString(containerUrl);

  const rawTurtle = await triplesToTurtle(
    Array.from(solidDataset).map(getNamedNodesForLocalNodes)
  );
  const headers: RequestInit["headers"] = {
    "Content-Type": "text/turtle",
    Link: `<${ldp.Resource}>; rel="type"`,
  };
  if (options.slugSuggestion) {
    headers.slug = options.slugSuggestion;
  }
  const response = await config.fetch(containerUrl, {
    method: "POST",
    body: rawTurtle,
    headers: headers,
  });

  if (internal_isUnsuccessfulResponse(response)) {
    throw new FetchError(
      `Storing the Resource in the Container at [${containerUrl}] failed: [${response.status}] [${response.statusText}].\n\n` +
        "The SolidDataset that was sent to the Pod is listed below.\n\n" +
        solidDatasetAsMarkdown(solidDataset),
      response
    );
  }

  const locationHeader = response.headers.get("Location");
  if (locationHeader === null) {
    throw new Error(
      "Could not determine the location of the newly saved SolidDataset."
    );
  }

  const resourceIri = new URL(locationHeader, new URL(containerUrl).origin)
    .href;

  const resourceInfo: WithResourceInfo = {
    internal_resourceInfo: {
      isRawData: false,
      sourceIri: resourceIri,
    },
  };

  const resourceWithResourceInfo: SolidDataset &
    WithResourceInfo = Object.assign(
    internal_cloneResource(solidDataset),
    resourceInfo
  );

  const resourceWithResolvedIris = resolveLocalIrisInSolidDataset(
    resourceWithResourceInfo
  );

  return resourceWithResolvedIris;
}

/**
 * Create an empty Container inside the Container at the given URL.
 *
 * Throws an error if creating the Container failed, e.g. because the current user does not have
 * permissions to.
 *
 * The Container in which to create the new Container should itself already exist.
 *
 * This function is primarily useful if the current user does not have access to change existing files in
 * a Container, but is allowed to add new files; in other words, they have Append, but not Write
 * access to a Container. This is useful in situations where someone wants to allow others to,
 * for example, send notifications to their Pod, but not to view or delete existing notifications.
 * You can pass a suggestion for the new Resource's name, but the server may decide to give it
 * another name — for example, if a Resource with that name already exists inside the given
 * Container.
 * If the user does have access to write directly to a given location, [[createContainerAt]]
 * will do the job just fine, and does not require the parent Container to exist in advance.
 *
 * @param containerUrl URL of the Container in which the empty Container is to be created.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters).
 * @since 0.2.0
 */
export async function createContainerInContainer(
  containerUrl: UrlString | Url,
  options: SaveInContainerOptions = internal_defaultFetchOptions
): Promise<SolidDataset & WithResourceInfo> {
  containerUrl = internal_toIriString(containerUrl);
  const config = {
    ...internal_defaultFetchOptions,
    ...options,
  };

  const headers: RequestInit["headers"] = {
    "Content-Type": "text/turtle",
    Link: `<${ldp.BasicContainer}>; rel="type"`,
  };
  if (options.slugSuggestion) {
    headers.slug = options.slugSuggestion;
  }
  const response = await config.fetch(containerUrl, {
    method: "POST",
    headers: headers,
  });

  if (internal_isUnsuccessfulResponse(response)) {
    throw new FetchError(
      `Creating an empty Container in the Container at [${containerUrl}] failed: [${response.status}] [${response.statusText}].`,
      response
    );
  }

  const locationHeader = response.headers.get("Location");
  if (locationHeader === null) {
    throw new Error(
      "Could not determine the location of the newly created Container."
    );
  }

  const resourceIri = new URL(locationHeader, new URL(containerUrl).origin)
    .href;

  const resourceInfo: WithResourceInfo = {
    internal_resourceInfo: {
      isRawData: false,
      sourceIri: resourceIri,
    },
  };

  const resourceWithResourceInfo: SolidDataset &
    WithResourceInfo = Object.assign(dataset(), resourceInfo);
  return resourceWithResourceInfo;
}

/**
 * Deletes the Container at a given URL.
 *
 * @param file The (URL of the) Container to delete
 * @since 0.6.0
 */
export async function deleteContainer(
  container: Url | UrlString | WithResourceInfo,
  options: Partial<
    typeof internal_defaultFetchOptions
  > = internal_defaultFetchOptions
): Promise<void> {
  const url = hasResourceInfo(container)
    ? internal_toIriString(getSourceUrl(container))
    : internal_toIriString(container);
  if (!isContainer(container)) {
    throw new Error(
      `You're trying to delete the Container at [${url}], but Container URLs should end in a \`/\`. Are you sure this is a Container?`
    );
  }

  const config = {
    ...internal_defaultFetchOptions,
    ...options,
  };
  const response = await config.fetch(url, { method: "DELETE" });

  if (internal_isUnsuccessfulResponse(response)) {
    throw new FetchError(
      `Deleting the Container at [${url}] failed: [${response.status}] [${response.statusText}].`,
      response
    );
  }
}

/**
 * Given a [[SolidDataset]] representing a Container (see [[isContainer]]), fetch the URLs of all
 * contained resources.
 * If the solidDataset given is not a container, or is missing resourceInfo, throw an error.
 *
 * @param solidDataset The container from which to fetch all contained Resource URLs.
 * @returns A list of URLs, each of which points to a contained Resource of the given SolidDataset.
 * @since 1.3.0
 */

export function getContainedResourceUrlAll(
  solidDataset: SolidDataset & WithResourceInfo
): UrlString[] {
  const container = getThing(solidDataset, getSourceUrl(solidDataset));
  // See https://www.w3.org/TR/2015/REC-ldp-20150226/#h-ldpc-http_post:
  // > a containment triple MUST be added to the state of the LDPC whose subject is the LDPC URI,
  // > whose predicate is ldp:contains and whose object is the URI for the newly created document
  return container !== null ? getIriAll(container, ldp.contains) : [];
}

/**
 * Gets a human-readable representation of the given SolidDataset to aid debugging.
 *
 * Note that changes to the exact format of the return value are not considered a breaking change;
 * it is intended to aid in debugging, not as a serialisation method that can be reliably parsed.
 *
 * @param solidDataset The [[SolidDataset]] to get a human-readable representation of.
 * @since 0.3.0
 */
export function solidDatasetAsMarkdown(solidDataset: SolidDataset): string {
  let readableSolidDataset: string = "";

  if (hasResourceInfo(solidDataset)) {
    readableSolidDataset += `# SolidDataset: ${solidDataset.internal_resourceInfo.sourceIri}\n`;
  } else {
    readableSolidDataset += `# SolidDataset (no URL yet)\n`;
  }

  const things = getThingAll(solidDataset);
  if (things.length === 0) {
    readableSolidDataset += "\n<empty>\n";
  } else {
    things.forEach((thing) => {
      readableSolidDataset += "\n" + thingAsMarkdown(thing);
      if (hasChangelog(solidDataset)) {
        readableSolidDataset +=
          "\n" + getReadableChangeLogSummary(solidDataset, thing) + "\n";
      }
    });
  }

  return readableSolidDataset;
}

/**
 * Gets a human-readable representation of the local changes to a Resource to aid debugging.
 *
 * Note that changes to the exact format of the return value are not considered a breaking change;
 * it is intended to aid in debugging, not as a serialisation method that can be reliably parsed.
 *
 * @param solidDataset The Resource of which to get a human-readable representation of the changes applied to it locally.
 * @since 0.3.0
 */
export function changeLogAsMarkdown(
  solidDataset: SolidDataset & WithChangeLog
): string {
  if (!hasResourceInfo(solidDataset)) {
    return "This is a newly initialized SolidDataset, so there is no source to compare it to.";
  }
  if (
    !hasChangelog(solidDataset) ||
    (solidDataset.internal_changeLog.additions.length === 0 &&
      solidDataset.internal_changeLog.deletions.length === 0)
  ) {
    return (
      `## Changes compared to ${getSourceUrl(solidDataset)}\n\n` +
      `This SolidDataset has not been modified since it was fetched from ${getSourceUrl(
        solidDataset
      )}.\n`
    );
  }

  let readableChangeLog = `## Changes compared to ${getSourceUrl(
    solidDataset
  )}\n`;

  const changeLogsByThingAndProperty = sortChangeLogByThingAndProperty(
    solidDataset
  );
  Object.keys(changeLogsByThingAndProperty).forEach((thingUrl) => {
    readableChangeLog += `\n### Thing: ${thingUrl}\n`;
    const changeLogByProperty = changeLogsByThingAndProperty[thingUrl];
    Object.keys(changeLogByProperty).forEach((propertyUrl) => {
      readableChangeLog += `\nProperty: ${propertyUrl}\n`;
      const deleted = changeLogByProperty[propertyUrl].deleted;
      const added = changeLogByProperty[propertyUrl].added;
      if (deleted.length > 0) {
        readableChangeLog += "- Removed:\n";
        deleted.forEach(
          (deletedValue) =>
            (readableChangeLog += `  - ${internal_getReadableValue(
              deletedValue
            )}\n`)
        );
      }
      if (added.length > 0) {
        readableChangeLog += "- Added:\n";
        added.forEach(
          (addedValue) =>
            (readableChangeLog += `  - ${internal_getReadableValue(
              addedValue
            )}\n`)
        );
      }
    });
  });

  return readableChangeLog;
}

function sortChangeLogByThingAndProperty(
  solidDataset: WithChangeLog & WithResourceInfo
) {
  const changeLogsByThingAndProperty: Record<
    UrlString,
    Record<UrlString, { added: Quad_Object[]; deleted: Quad_Object[] }>
  > = {};
  solidDataset.internal_changeLog.deletions.forEach((deletion) => {
    const subjectNode = isLocalNode(deletion.subject)
      ? resolveIriForLocalNode(deletion.subject, getSourceUrl(solidDataset))
      : deletion.subject;
    if (!isNamedNode(subjectNode) || !isNamedNode(deletion.predicate)) {
      return;
    }
    const thingUrl = internal_toIriString(subjectNode);
    const propertyUrl = internal_toIriString(deletion.predicate);
    changeLogsByThingAndProperty[thingUrl] ??= {};
    changeLogsByThingAndProperty[thingUrl][propertyUrl] ??= {
      added: [],
      deleted: [],
    };
    changeLogsByThingAndProperty[thingUrl][propertyUrl].deleted.push(
      deletion.object
    );
  });
  solidDataset.internal_changeLog.additions.forEach((addition) => {
    const subjectNode = isLocalNode(addition.subject)
      ? resolveIriForLocalNode(addition.subject, getSourceUrl(solidDataset))
      : addition.subject;
    if (!isNamedNode(subjectNode) || !isNamedNode(addition.predicate)) {
      return;
    }
    const thingUrl = internal_toIriString(subjectNode);
    const propertyUrl = internal_toIriString(addition.predicate);
    changeLogsByThingAndProperty[thingUrl] ??= {};
    changeLogsByThingAndProperty[thingUrl][propertyUrl] ??= {
      added: [],
      deleted: [],
    };
    changeLogsByThingAndProperty[thingUrl][propertyUrl].added.push(
      addition.object
    );
  });

  return changeLogsByThingAndProperty;
}

function getReadableChangeLogSummary(
  solidDataset: WithChangeLog,
  thing: Thing
): string {
  const subject = internal_toNode(thing);
  const nrOfAdditions = solidDataset.internal_changeLog.additions.reduce(
    (count, addition) => (addition.subject.equals(subject) ? count + 1 : count),
    0
  );
  const nrOfDeletions = solidDataset.internal_changeLog.deletions.reduce(
    (count, deletion) => (deletion.subject.equals(subject) ? count + 1 : count),
    0
  );
  const additionString =
    nrOfAdditions === 1
      ? "1 new value added"
      : nrOfAdditions + " new values added";
  const deletionString =
    nrOfDeletions === 1 ? "1 value removed" : nrOfDeletions + " values removed";
  return `(${additionString} / ${deletionString})`;
}

function getNamedNodesForLocalNodes(quad: Quad): Quad {
  const subject = isLocalNode(quad.subject)
    ? getNamedNodeFromLocalNode(quad.subject)
    : quad.subject;
  const object = isLocalNode(quad.object)
    ? getNamedNodeFromLocalNode(quad.object)
    : quad.object;

  return {
    ...quad,
    subject: subject,
    object: object,
  };
}

function getNamedNodeFromLocalNode(localNode: LocalNode): NamedNode {
  return DataFactory.namedNode("#" + localNode.internal_name);
}

function resolveLocalIrisInSolidDataset<
  Dataset extends SolidDataset & WithResourceInfo
>(solidDataset: Dataset): Dataset {
  const resourceIri = getSourceUrl(solidDataset);
  const unresolvedQuads = Array.from(solidDataset);

  unresolvedQuads.forEach((unresolvedQuad) => {
    const resolvedQuad = resolveIriForLocalNodes(unresolvedQuad, resourceIri);
    solidDataset.delete(unresolvedQuad);
    solidDataset.add(resolvedQuad);
  });

  return solidDataset;
}
