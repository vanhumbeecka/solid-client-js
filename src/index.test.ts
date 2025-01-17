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
  getFile,
  getFileWithAcl,
  deleteFile,
  saveFileInContainer,
  overwriteFile,
  createSolidDataset,
  getSolidDataset,
  getResourceInfo,
  getResourceInfoWithAcl,
  getPodOwner,
  isPodOwner,
  isContainer,
  isRawData,
  getContentType,
  getSourceUrl,
  getSourceIri,
  saveSolidDatasetAt,
  deleteSolidDataset,
  createContainerAt,
  saveSolidDatasetInContainer,
  createContainerInContainer,
  deleteContainer,
  getContainedResourceUrlAll,
  saveAclFor,
  deleteAclFor,
  getThing,
  getThingAll,
  setThing,
  removeThing,
  createThing,
  isThing,
  asUrl,
  asIri,
  thingAsMarkdown,
  getUrl,
  getIri,
  getBoolean,
  getDatetime,
  getDecimal,
  getInteger,
  getStringWithLocale,
  getStringNoLocale,
  getUrlAll,
  getIriAll,
  getBooleanAll,
  getDatetimeAll,
  getDecimalAll,
  getIntegerAll,
  getStringWithLocaleAll,
  getStringByLocaleAll,
  getStringNoLocaleAll,
  getLiteral,
  getNamedNode,
  getTerm,
  getLiteralAll,
  getNamedNodeAll,
  getTermAll,
  addUrl,
  addIri,
  addBoolean,
  addDatetime,
  addDecimal,
  addInteger,
  addStringWithLocale,
  addStringNoLocale,
  addLiteral,
  addNamedNode,
  addTerm,
  setUrl,
  setIri,
  setBoolean,
  setDatetime,
  setDecimal,
  setInteger,
  setStringWithLocale,
  setStringNoLocale,
  setLiteral,
  setNamedNode,
  setTerm,
  removeAll,
  removeUrl,
  removeIri,
  removeBoolean,
  removeDatetime,
  removeDecimal,
  removeInteger,
  removeStringWithLocale,
  removeStringNoLocale,
  removeLiteral,
  removeNamedNode,
  getSolidDatasetWithAcl,
  solidDatasetAsMarkdown,
  changeLogAsMarkdown,
  hasAcl,
  hasFallbackAcl,
  getFallbackAcl,
  hasResourceAcl,
  getResourceAcl,
  createAcl,
  createAclFromFallbackAcl,
  getAgentAccess,
  getAgentAccessAll,
  getAgentResourceAccess,
  getAgentResourceAccessAll,
  setAgentResourceAccess,
  getAgentDefaultAccess,
  getAgentDefaultAccessAll,
  setAgentDefaultAccess,
  getPublicAccess,
  getPublicResourceAccess,
  getPublicDefaultAccess,
  setPublicResourceAccess,
  setPublicDefaultAccess,
  hasResourceInfo,
  hasServerResourceInfo,
  hasAccessibleAcl,
  getGroupAccess,
  getGroupAccessAll,
  getGroupResourceAccess,
  getGroupResourceAccessAll,
  getGroupDefaultAccess,
  getGroupDefaultAccessAll,
  setGroupDefaultAccess,
  setGroupResourceAccess,
  mockSolidDatasetFrom,
  mockContainerFrom,
  mockFileFrom,
  mockFetchError,
  mockThingFrom,
  addMockResourceAclTo,
  addMockFallbackAclTo,
  // Error classes:
  SolidClientError,
  FetchError,
  ThingExpectedError,
  // Preview API's exported for early adopters:
  acp_v1,
  acp_v2,
  access,
  // Deprecated functions still exported for backwards compatibility:
} from "./index";

// These tests aren't too useful in preventing bugs, but they work around this issue:
// https://github.com/facebook/jest/issues/10032
it("exports the public API from the entry file", () => {
  expect(getFile).toBeDefined();
  expect(getFileWithAcl).toBeDefined();
  expect(deleteFile).toBeDefined();
  expect(saveFileInContainer).toBeDefined();
  expect(overwriteFile).toBeDefined();
  expect(createSolidDataset).toBeDefined();
  expect(getSolidDataset).toBeDefined();
  expect(getResourceInfo).toBeDefined();
  expect(getResourceInfoWithAcl).toBeDefined();
  expect(getPodOwner).toBeDefined();
  expect(isPodOwner).toBeDefined();
  expect(isContainer).toBeDefined();
  expect(isRawData).toBeDefined();
  expect(getContentType).toBeDefined();
  expect(getSourceUrl).toBeDefined();
  expect(getSourceIri).toBeDefined();
  expect(saveSolidDatasetAt).toBeDefined();
  expect(deleteSolidDataset).toBeDefined();
  expect(createContainerAt).toBeDefined();
  expect(saveSolidDatasetInContainer).toBeDefined();
  expect(createContainerInContainer).toBeDefined();
  expect(deleteContainer).toBeDefined();
  expect(getContainedResourceUrlAll).toBeDefined();
  expect(saveAclFor).toBeDefined();
  expect(deleteAclFor).toBeDefined();
  expect(getThing).toBeDefined();
  expect(getThingAll).toBeDefined();
  expect(setThing).toBeDefined();
  expect(removeThing).toBeDefined();
  expect(createThing).toBeDefined();
  expect(isThing).toBeDefined();
  expect(asUrl).toBeDefined();
  expect(asIri).toBeDefined();
  expect(thingAsMarkdown).toBeDefined();
  expect(getUrl).toBeDefined();
  expect(getIri).toBeDefined();
  expect(getBoolean).toBeDefined();
  expect(getDatetime).toBeDefined();
  expect(getDecimal).toBeDefined();
  expect(getInteger).toBeDefined();
  expect(getStringWithLocale).toBeDefined();
  expect(getStringNoLocale).toBeDefined();
  expect(getStringByLocaleAll).toBeDefined();
  expect(getUrlAll).toBeDefined();
  expect(getIriAll).toBeDefined();
  expect(getBooleanAll).toBeDefined();
  expect(getDatetimeAll).toBeDefined();
  expect(getDecimalAll).toBeDefined();
  expect(getIntegerAll).toBeDefined();
  expect(getStringWithLocaleAll).toBeDefined();
  expect(getStringNoLocaleAll).toBeDefined();
  expect(getLiteral).toBeDefined();
  expect(getNamedNode).toBeDefined();
  expect(getTerm).toBeDefined();
  expect(getLiteralAll).toBeDefined();
  expect(getNamedNodeAll).toBeDefined();
  expect(getTermAll).toBeDefined();
  expect(addUrl).toBeDefined();
  expect(addIri).toBeDefined();
  expect(addBoolean).toBeDefined();
  expect(addDatetime).toBeDefined();
  expect(addDecimal).toBeDefined();
  expect(addInteger).toBeDefined();
  expect(addStringWithLocale).toBeDefined();
  expect(addStringNoLocale).toBeDefined();
  expect(addLiteral).toBeDefined();
  expect(addNamedNode).toBeDefined();
  expect(addTerm).toBeDefined();
  expect(setUrl).toBeDefined();
  expect(setIri).toBeDefined();
  expect(setBoolean).toBeDefined();
  expect(setDatetime).toBeDefined();
  expect(setDecimal).toBeDefined();
  expect(setInteger).toBeDefined();
  expect(setStringWithLocale).toBeDefined();
  expect(setStringNoLocale).toBeDefined();
  expect(setLiteral).toBeDefined();
  expect(setNamedNode).toBeDefined();
  expect(setTerm).toBeDefined();
  expect(removeAll).toBeDefined();
  expect(removeUrl).toBeDefined();
  expect(removeIri).toBeDefined();
  expect(removeBoolean).toBeDefined();
  expect(removeDatetime).toBeDefined();
  expect(removeDecimal).toBeDefined();
  expect(removeInteger).toBeDefined();
  expect(removeStringWithLocale).toBeDefined();
  expect(removeStringNoLocale).toBeDefined();
  expect(removeLiteral).toBeDefined();
  expect(removeNamedNode).toBeDefined();
  expect(getSolidDatasetWithAcl).toBeDefined();
  expect(solidDatasetAsMarkdown).toBeDefined();
  expect(changeLogAsMarkdown).toBeDefined();
  expect(hasAcl).toBeDefined();
  expect(hasFallbackAcl).toBeDefined();
  expect(getFallbackAcl).toBeDefined();
  expect(hasResourceAcl).toBeDefined();
  expect(getResourceAcl).toBeDefined();
  expect(createAcl).toBeDefined();
  expect(createAclFromFallbackAcl).toBeDefined();
  expect(getAgentAccess).toBeDefined();
  expect(getAgentAccessAll).toBeDefined();
  expect(getAgentResourceAccess).toBeDefined();
  expect(getAgentResourceAccessAll).toBeDefined();
  expect(setAgentResourceAccess).toBeDefined();
  expect(getAgentDefaultAccess).toBeDefined();
  expect(getAgentDefaultAccessAll).toBeDefined();
  expect(setAgentDefaultAccess).toBeDefined();
  expect(getPublicAccess).toBeDefined();
  expect(getPublicResourceAccess).toBeDefined();
  expect(getPublicDefaultAccess).toBeDefined();
  expect(setPublicResourceAccess).toBeDefined();
  expect(setPublicDefaultAccess).toBeDefined();
  expect(getPublicDefaultAccess).toBeDefined();
  expect(hasResourceInfo).toBeDefined();
  expect(hasServerResourceInfo).toBeDefined();
  expect(hasAccessibleAcl).toBeDefined();
  expect(getGroupAccess).toBeDefined();
  expect(getGroupAccessAll).toBeDefined();
  expect(getGroupResourceAccess).toBeDefined();
  expect(getGroupResourceAccessAll).toBeDefined();
  expect(getGroupDefaultAccess).toBeDefined();
  expect(getGroupDefaultAccessAll).toBeDefined();
  expect(setGroupDefaultAccess).toBeDefined();
  expect(setGroupResourceAccess).toBeDefined();
  expect(mockSolidDatasetFrom).toBeDefined();
  expect(mockContainerFrom).toBeDefined();
  expect(mockFileFrom).toBeDefined();
  expect(mockFetchError).toBeDefined();
  expect(mockThingFrom).toBeDefined();
  expect(addMockResourceAclTo).toBeDefined();
  expect(addMockFallbackAclTo).toBeDefined();
});

it("exports error classes", () => {
  expect(SolidClientError).toBeDefined();
  expect(FetchError).toBeDefined();
  expect(ThingExpectedError).toBeDefined();
});

it("exports preview API's for early adopters", () => {
  expect(acp_v1).toBeDefined();
  expect(acp_v2).toBeDefined();
  expect(access).toBeDefined();
});

// eslint-disable-next-line jest/expect-expect -- no deprecated functions are currently included:
it("still exports deprecated methods", () => {});
