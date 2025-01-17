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

import {
  UrlString,
  hasResourceInfo,
  Url,
  WebId,
  Resource,
  WithServerResourceInfo,
  WithResourceInfo,
  hasServerResourceInfo,
  SolidClientError,
} from "../interfaces";
import { internal_toIriString } from "../interfaces.internal";
import { fetch } from "../fetcher";
import {
  internal_isUnsuccessfulResponse,
  internal_parseResourceInfo,
} from "./resource.internal";

/** @ignore For internal use only. */
export const internal_defaultFetchOptions = {
  fetch: fetch,
};

/**
 * Retrieve the information about a resource (e.g. access permissions) without
 * fetching the resource itself.
 *
 * @param url URL to fetch Resource metadata from.
 * @param options Optional parameter `options.fetch`: An alternative `fetch` function to make the HTTP request, compatible with the browser-native [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters).
 * @returns Promise resolving to the metadata describing the given Resource, or rejecting if fetching it failed.
 * @since 0.4.0
 */
export async function getResourceInfo(
  url: UrlString,
  options: Partial<
    typeof internal_defaultFetchOptions
  > = internal_defaultFetchOptions
): Promise<WithServerResourceInfo> {
  const config = {
    ...internal_defaultFetchOptions,
    ...options,
  };

  const response = await config.fetch(url, { method: "HEAD" });
  if (internal_isUnsuccessfulResponse(response)) {
    throw new FetchError(
      `Fetching the metadata of the Resource at [${url}] failed: [${response.status}] [${response.statusText}].`,
      response
    );
  }

  const resourceInfo = internal_parseResourceInfo(response);

  return { internal_resourceInfo: resourceInfo };
}

/**
 * @param resource Resource for which to check whether it is a Container.
 * @returns Whether `resource` is a Container.
 */
export function isContainer(
  resource: Url | UrlString | WithResourceInfo
): boolean {
  const containerUrl = hasResourceInfo(resource)
    ? getSourceUrl(resource)
    : internal_toIriString(resource);
  return containerUrl.endsWith("/");
}

/**
 * This function will tell you whether a given Resource contains raw data, or a SolidDataset.
 *
 * @param resource Resource for which to check whether it contains raw data.
 * @return Whether `resource` contains raw data.
 */
export function isRawData(resource: WithResourceInfo): boolean {
  return resource.internal_resourceInfo.isRawData;
}

/**
 * @param resource Resource for which to determine the Content Type.
 * @returns The Content Type, if known, or null if not known.
 */
export function getContentType(resource: WithResourceInfo): string | null {
  return resource.internal_resourceInfo.contentType ?? null;
}

/**
 * @param resource
 * @returns The URL from which the Resource has been fetched, or null if it is not known.
 */
export function getSourceUrl(resource: WithResourceInfo): string;
export function getSourceUrl(resource: Resource): string | null;
export function getSourceUrl(
  resource: Resource | WithResourceInfo
): string | null {
  if (hasResourceInfo(resource)) {
    return resource.internal_resourceInfo.sourceIri;
  }
  return null;
}
/** @hidden Alias of getSourceUrl for those who prefer to use IRI terminology. */
export const getSourceIri = getSourceUrl;

/**
 * Given a Resource that exposes information about the owner of the Pod it is in, returns the WebID of that owner.
 *
 * Data about the owner of the Pod is exposed when the following conditions hold:
 * - The Pod server supports exposing the Pod owner
 * - The current user is allowed to see who the Pod owner is.
 *
 * If one or more of those conditions are false, this function will return `null`.
 *
 * @param resource A Resource that contains information about the owner of the Pod it is in.
 * @returns The WebID of the owner of the Pod the Resource is in, if provided, or `null` if not.
 * @since 0.6.0
 */
export function getPodOwner(resource: WithServerResourceInfo): WebId | null {
  if (!hasServerResourceInfo(resource)) {
    return null;
  }

  const podOwners =
    resource.internal_resourceInfo.linkedResources[
      "http://www.w3.org/ns/solid/terms#podOwner"
    ] ?? [];

  return podOwners.length === 1 ? podOwners[0] : null;
}

/**
 * Given a WebID and a Resource that exposes information about the owner of the Pod it is in, returns whether the given WebID is the owner of the Pod.
 *
 * Data about the owner of the Pod is exposed when the following conditions hold:
 * - The Pod server supports exposing the Pod owner
 * - The current user is allowed to see who the Pod owner is.
 *
 * If one or more of those conditions are false, this function will return `null`.
 *
 * @param webId The WebID of which to check whether it is the Pod Owner's.
 * @param resource A Resource that contains information about the owner of the Pod it is in.
 * @returns Whether the given WebID is the Pod Owner's, if the Pod Owner is exposed, or `null` if it is not exposed.
 * @since 0.6.0
 */
export function isPodOwner(
  webId: WebId,
  resource: WithServerResourceInfo
): boolean | null {
  const podOwner = getPodOwner(resource);

  if (typeof podOwner !== "string") {
    return null;
  }

  return podOwner === webId;
}

/**
 * Extends the regular JavaScript error object with access to the status code and status message.
 * @since 1.2.0
 */
export class FetchError extends SolidClientError {
  /** @since 1.3.0 */
  public readonly response: Response & { ok: false };

  get statusCode(): number {
    return this.response.status;
  }

  get statusText(): string | undefined {
    return this.response.statusText;
  }

  constructor(message: string, errorResponse: Response & { ok: false }) {
    super(message);
    this.response = errorResponse;
  }
}
