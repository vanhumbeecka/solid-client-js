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

import { jest, describe, it, expect } from "@jest/globals";

jest.mock("../fetcher.ts", () => ({
  fetch: jest.fn(window.fetch).mockImplementation(() =>
    Promise.resolve(
      new Response(undefined, {
        headers: { Location: "https://arbitrary.pod/resource" },
      })
    )
  ),
}));

import { Response } from "cross-fetch";
import {
  getFileWithAccessDatasets,
  getFileWithAcp,
  getResourceInfoWithAccessDatasets,
  getResourceInfoWithAcp,
  getSolidDatasetWithAccessDatasets,
  getSolidDatasetWithAcp,
  WithAccessibleAcr,
} from "./acp";
import { acp, rdf } from "../constants";
import * as SolidDatasetModule from "../resource/solidDataset";
import * as FileModule from "../resource/nonRdfData";
import * as ResourceModule from "../resource/resource";
import { mockSolidDatasetFrom } from "../resource/mock";
import { File, UrlString, WithServerResourceInfo } from "../interfaces";
import { AccessControlResource } from "./control";
import { createThing, setThing } from "../thing/thing";
import { addIri } from "../thing/add";

const defaultMockPolicies = {
  policies: ["https://some.pod/policies#policy"],
  memberPolicies: ["https://some.pod/policies#memberPolicy"],
};
function mockAcr(accessTo: UrlString, policies = defaultMockPolicies) {
  let control = createThing({ name: "access-control" });
  control = addIri(control, rdf.type, acp.AccessControl);
  policies.policies.forEach((policyUrl) => {
    control = addIri(control, acp.apply, policyUrl);
  });
  policies.memberPolicies.forEach((policyUrl) => {
    control = addIri(control, acp.applyMembers, policyUrl);
  });

  let acr: AccessControlResource &
    WithServerResourceInfo = Object.assign(
    mockSolidDatasetFrom(accessTo + "?ext=acr"),
    { accessTo: accessTo }
  );
  acr = setThing(acr, control);

  return acr;
}

describe("getSolidDatasetWithAcp", () => {
  it("calls the included fetcher by default", async () => {
    const mockedFetcher = jest.requireMock("../fetcher.ts") as {
      fetch: jest.Mock<
        ReturnType<typeof window.fetch>,
        [RequestInfo, RequestInit?]
      >;
    };

    await getSolidDatasetWithAcp("https://some.pod/resource");

    expect(mockedFetcher.fetch.mock.calls[0][0]).toEqual(
      "https://some.pod/resource"
    );
  });

  it("uses the given fetcher if provided", async () => {
    const mockFetch = jest.fn(window.fetch).mockResolvedValue(new Response());

    await getSolidDatasetWithAcp("https://some.pod/resource", {
      fetch: mockFetch,
    });

    expect(mockFetch.mock.calls[0][0]).toEqual("https://some.pod/resource");
  });

  it("returns null for the ACR if it is not accessible to the current user", async () => {
    const mockFetch = jest
      .fn(window.fetch)
      .mockResolvedValueOnce(
        new Response(undefined, {
          headers: {
            Link: `<https://some.pod/acr.ttl>; rel="${acp.accessControl}"`,
          },
          url: "https://some.pod/resource",
        } as ResponseInit)
      )
      .mockResolvedValueOnce(new Response("Not allowed", { status: 401 }));

    const fetchedDataset = await getSolidDatasetWithAcp(
      "https://some.pod/resource",
      { fetch: mockFetch }
    );

    expect(mockFetch.mock.calls[0][0]).toEqual("https://some.pod/resource");
    expect(mockFetch.mock.calls[1][0]).toEqual("https://some.pod/acr.ttl");
    expect(fetchedDataset.internal_acp.acr).toBeNull();
  });

  it("returns an empty Object if no APRs were referenced", async () => {
    const mockedSolidDataset = mockSolidDatasetFrom(
      "https://arbitrary.pod/resource"
    );
    mockedSolidDataset.internal_resourceInfo.linkedResources = {
      [acp.accessControl]: ["https://arbitrary.pod/resource?ext=acr"],
    };
    const mockedAcr = mockAcr("https://arbitrary.pod/resource", {
      policies: [],
      memberPolicies: [],
    });
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset
      .mockResolvedValueOnce(mockedSolidDataset)
      .mockResolvedValueOnce(mockedAcr);

    const fetchedDataset = await getSolidDatasetWithAcp(
      "https://some.pod/resource"
    );

    expect(fetchedDataset.internal_acp.acr).not.toBeNull();
    expect((fetchedDataset as WithAccessibleAcr).internal_acp.aprs).toEqual({});
  });

  it("fetches all referenced ACPs once", async () => {
    const mockedSolidDataset = mockSolidDatasetFrom(
      "https://some.pod/resource"
    );
    mockedSolidDataset.internal_resourceInfo.linkedResources = {
      [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
    };
    const mockedAcr = mockAcr("https://some.pod/resource", {
      policies: ["https://some.pod/policy-resource#a-policy"],
      memberPolicies: [
        "https://some.pod/policy-resource#a-member-policy",
        "https://some.pod/policy-resource#another-member-policy",
      ],
    });
    const mockedAcp = mockSolidDatasetFrom("https://some.pod/policy-resource");
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset
      .mockResolvedValueOnce(mockedSolidDataset)
      .mockResolvedValueOnce(mockedAcr)
      .mockResolvedValueOnce(mockedAcp);

    const fetchedDataset = await getSolidDatasetWithAcp(
      "https://some.pod/resource"
    );

    expect(mockedGetSolidDataset.mock.calls).toHaveLength(3);
    expect(mockedGetSolidDataset.mock.calls[0][0]).toBe(
      "https://some.pod/resource"
    );
    expect(mockedGetSolidDataset.mock.calls[1][0]).toBe(
      "https://some.pod/resource?ext=acr"
    );
    expect(mockedGetSolidDataset.mock.calls[2][0]).toBe(
      "https://some.pod/policy-resource"
    );
    expect(fetchedDataset.internal_acp.acr).not.toBeNull();
    expect(
      (fetchedDataset as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/policy-resource"
      ]
    ).toBeDefined();
    expect(
      (fetchedDataset as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/policy-resource"
      ]
    ).not.toBeNull();
  });

  it("lists Access Policy Resources that could not be fetched as null", async () => {
    const mockedSolidDataset = mockSolidDatasetFrom(
      "https://some.pod/resource"
    );
    mockedSolidDataset.internal_resourceInfo.linkedResources = {
      [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
    };
    const mockedAcr = mockAcr("https://some.pod/resource", {
      policies: ["https://some.pod/policy-resource#a-policy"],
      memberPolicies: [
        "https://some.pod/policy-resource#a-member-policy",
        "https://some.pod/policy-resource#another-member-policy",
      ],
    });
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset
      .mockResolvedValueOnce(mockedSolidDataset)
      .mockResolvedValueOnce(mockedAcr)
      .mockRejectedValueOnce(
        new Error("Could not fetch this Access Policy Resource")
      );

    const fetchedDataset = await getSolidDatasetWithAcp(
      "https://some.pod/resource"
    );

    expect(mockedGetSolidDataset.mock.calls).toHaveLength(3);
    expect(fetchedDataset.internal_acp.acr).not.toBeNull();
    expect(
      (fetchedDataset as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/policy-resource"
      ]
    ).toBeNull();
  });

  it("does not add the ACR itself to the APR list", async () => {
    const mockedSolidDataset = mockSolidDatasetFrom(
      "https://some.pod/resource"
    );
    mockedSolidDataset.internal_resourceInfo.linkedResources = {
      [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
    };
    const mockedAcr = mockAcr("https://some.pod/resource", {
      policies: ["https://some.pod/resource?ext=acr#a-policy"],
      memberPolicies: [
        "https://some.pod/resource?ext=acr#a-member-policy",
        "https://some.pod/resource?ext=acr#another-member-policy",
      ],
    });
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset
      .mockResolvedValueOnce(mockedSolidDataset)
      .mockResolvedValueOnce(mockedAcr);

    const fetchedDataset = await getSolidDatasetWithAcp(
      "https://some.pod/resource"
    );

    expect(mockedGetSolidDataset.mock.calls).toHaveLength(2);
    expect(fetchedDataset.internal_acp.acr).not.toBeNull();
    expect(
      (fetchedDataset as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/resource?ext=acr"
      ]
    ).not.toBeDefined();
  });

  it("does not add the SolidDataset itself to the APR list", async () => {
    const mockedSolidDataset = mockSolidDatasetFrom(
      "https://some.pod/resource"
    );
    mockedSolidDataset.internal_resourceInfo.linkedResources = {
      [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
    };
    const mockedAcr = mockAcr("https://some.pod/resource", {
      policies: ["https://some.pod/resource#a-policy"],
      memberPolicies: [
        "https://some.pod/resource#a-member-policy",
        "https://some.pod/resource#another-member-policy",
      ],
    });
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset
      .mockResolvedValueOnce(mockedSolidDataset)
      .mockResolvedValueOnce(mockedAcr);

    const fetchedDataset = await getSolidDatasetWithAcp(
      "https://some.pod/resource"
    );

    expect(mockedGetSolidDataset.mock.calls).toHaveLength(2);
    expect(fetchedDataset.internal_acp.acr).not.toBeNull();
    expect(
      (fetchedDataset as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/resource"
      ]
    ).not.toBeDefined();
  });
});

describe("getFileWithAcp", () => {
  it("calls the included fetcher by default", async () => {
    const mockedFetcher = jest.requireMock("../fetcher.ts") as {
      fetch: jest.Mock<
        ReturnType<typeof window.fetch>,
        [RequestInfo, RequestInit?]
      >;
    };

    await getFileWithAcp("https://some.pod/resource");

    expect(mockedFetcher.fetch.mock.calls[0][0]).toEqual(
      "https://some.pod/resource"
    );
  });

  it("uses the given fetcher if provided", async () => {
    const mockFetch = jest.fn(window.fetch).mockResolvedValue(new Response());

    await getFileWithAcp("https://some.pod/resource", {
      fetch: mockFetch,
    });

    expect(mockFetch.mock.calls[0][0]).toEqual("https://some.pod/resource");
  });

  it("returns null for the ACR if it is not accessible to the current user", async () => {
    const mockFetch = jest
      .fn(window.fetch)
      .mockResolvedValueOnce(
        new Response(undefined, {
          headers: {
            Link: `<https://some.pod/acr.ttl>; rel="${acp.accessControl}"`,
          },
          url: "https://some.pod/resource",
        } as ResponseInit)
      )
      .mockResolvedValueOnce(new Response("Not allowed", { status: 401 }));

    const fetchedFile = await getFileWithAcp("https://some.pod/resource", {
      fetch: mockFetch,
    });

    expect(mockFetch.mock.calls[0][0]).toEqual("https://some.pod/resource");
    expect(mockFetch.mock.calls[1][0]).toEqual("https://some.pod/acr.ttl");
    expect(fetchedFile.internal_acp.acr).toBeNull();
  });

  it("returns an empty Object if no APRs were referenced", async () => {
    const mockedFile: File & WithServerResourceInfo = Object.assign(
      new Blob(),
      {
        internal_resourceInfo: {
          sourceIri: "https://some.pod/resource",
          isRawData: true,
          linkedResources: {
            [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
          },
        },
      }
    );
    const mockedAcr = mockAcr("https://arbitrary.pod/resource", {
      policies: [],
      memberPolicies: [],
    });
    const mockedGetFile = jest.spyOn(FileModule, "getFile");
    mockedGetFile.mockResolvedValueOnce(mockedFile);
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset.mockResolvedValueOnce(mockedAcr);

    const fetchedFile = await getFileWithAcp("https://some.pod/resource");

    expect(fetchedFile.internal_acp.acr).not.toBeNull();
    expect((fetchedFile as WithAccessibleAcr).internal_acp.aprs).toEqual({});
  });

  it("fetches all referenced ACPs once", async () => {
    const mockedFile: File & WithServerResourceInfo = Object.assign(
      new Blob(),
      {
        internal_resourceInfo: {
          sourceIri: "https://some.pod/resource",
          isRawData: true,
          linkedResources: {
            [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
          },
        },
      }
    );
    const mockedAcr = mockAcr("https://some.pod/resource", {
      policies: ["https://some.pod/policy-resource#a-policy"],
      memberPolicies: [
        "https://some.pod/policy-resource#a-member-policy",
        "https://some.pod/policy-resource#another-member-policy",
      ],
    });
    const mockedAcp = mockSolidDatasetFrom("https://some.pod/policy-resource");
    const mockedGetFile = jest.spyOn(FileModule, "getFile");
    mockedGetFile.mockResolvedValueOnce(mockedFile);
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset
      .mockResolvedValueOnce(mockedAcr)
      .mockResolvedValueOnce(mockedAcp);

    const fetchedFile = await getFileWithAcp("https://some.pod/resource");

    expect(mockedGetFile.mock.calls).toHaveLength(1);
    expect(mockedGetFile.mock.calls[0][0]).toBe("https://some.pod/resource");
    expect(mockedGetSolidDataset.mock.calls).toHaveLength(2);
    expect(mockedGetSolidDataset.mock.calls[0][0]).toBe(
      "https://some.pod/resource?ext=acr"
    );
    expect(mockedGetSolidDataset.mock.calls[1][0]).toBe(
      "https://some.pod/policy-resource"
    );
    expect(fetchedFile.internal_acp.acr).not.toBeNull();
    expect(
      (fetchedFile as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/policy-resource"
      ]
    ).toBeDefined();
    expect(
      (fetchedFile as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/policy-resource"
      ]
    ).not.toBeNull();
  });

  it("lists Access Policy Resources that could not be fetched as null", async () => {
    const mockedFile: File & WithServerResourceInfo = Object.assign(
      new Blob(),
      {
        internal_resourceInfo: {
          sourceIri: "https://some.pod/resource",
          isRawData: true,
          linkedResources: {
            [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
          },
        },
      }
    );
    const mockedAcr = mockAcr("https://some.pod/resource", {
      policies: ["https://some.pod/policy-resource#a-policy"],
      memberPolicies: [
        "https://some.pod/policy-resource#a-member-policy",
        "https://some.pod/policy-resource#another-member-policy",
      ],
    });
    const mockedGetFile = jest.spyOn(FileModule, "getFile");
    mockedGetFile.mockResolvedValueOnce(mockedFile);
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset
      .mockResolvedValueOnce(mockedAcr)
      .mockRejectedValueOnce(
        new Error("Could not fetch this Access Policy Resource")
      );

    const fetchedFile = await getFileWithAcp("https://some.pod/resource");

    expect(mockedGetFile.mock.calls).toHaveLength(1);
    expect(mockedGetSolidDataset.mock.calls).toHaveLength(2);
    expect(fetchedFile.internal_acp.acr).not.toBeNull();
    expect(
      (fetchedFile as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/policy-resource"
      ]
    ).toBeNull();
  });

  it("does not add the ACR itself to the APR list", async () => {
    const mockedFile: File & WithServerResourceInfo = Object.assign(
      new Blob(),
      {
        internal_resourceInfo: {
          sourceIri: "https://some.pod/resource",
          isRawData: true,
          linkedResources: {
            [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
          },
        },
      }
    );
    const mockedAcr = mockAcr("https://some.pod/resource", {
      policies: ["https://some.pod/resource?ext=acr#a-policy"],
      memberPolicies: [
        "https://some.pod/resource?ext=acr#a-member-policy",
        "https://some.pod/resource?ext=acr#another-member-policy",
      ],
    });
    const mockedGetFile = jest.spyOn(FileModule, "getFile");
    mockedGetFile.mockResolvedValueOnce(mockedFile);
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset.mockResolvedValueOnce(mockedAcr);

    const fetchedFile = await getFileWithAcp("https://some.pod/resource");

    expect(mockedGetFile.mock.calls).toHaveLength(1);
    expect(mockedGetSolidDataset.mock.calls).toHaveLength(1);
    expect(fetchedFile.internal_acp.acr).not.toBeNull();
    expect(
      (fetchedFile as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/resource?ext=acr"
      ]
    ).not.toBeDefined();
  });
});

describe("getResourceInfoWithAcp", () => {
  it("calls the included fetcher by default", async () => {
    const mockedFetcher = jest.requireMock("../fetcher.ts") as {
      fetch: jest.Mock<
        ReturnType<typeof window.fetch>,
        [RequestInfo, RequestInit?]
      >;
    };

    await getResourceInfoWithAcp("https://some.pod/resource");

    expect(mockedFetcher.fetch.mock.calls[0][0]).toEqual(
      "https://some.pod/resource"
    );
  });

  it("uses the given fetcher if provided", async () => {
    const mockFetch = jest.fn(window.fetch).mockResolvedValue(new Response());

    await getResourceInfoWithAcp("https://some.pod/resource", {
      fetch: mockFetch,
    });

    expect(mockFetch.mock.calls[0][0]).toEqual("https://some.pod/resource");
  });

  it("returns null for the ACR if it is not accessible to the current user", async () => {
    const mockFetch = jest
      .fn(window.fetch)
      .mockResolvedValueOnce(
        new Response(undefined, {
          headers: {
            Link: `<https://some.pod/acr.ttl>; rel="${acp.accessControl}"`,
          },
          url: "https://some.pod/resource",
        } as ResponseInit)
      )
      .mockResolvedValueOnce(new Response("Not allowed", { status: 401 }));

    const fetchedResourceInfo = await getResourceInfoWithAcp(
      "https://some.pod/resource",
      { fetch: mockFetch }
    );

    expect(mockFetch.mock.calls[0][0]).toEqual("https://some.pod/resource");
    expect(mockFetch.mock.calls[1][0]).toEqual("https://some.pod/acr.ttl");
    expect(fetchedResourceInfo.internal_acp.acr).toBeNull();
  });

  it("returns an empty Object if no APRs were referenced", async () => {
    const mockedResourceInfo: WithServerResourceInfo = {
      internal_resourceInfo: {
        sourceIri: "https://arbitrary.pod/resource",
        isRawData: true,
        linkedResources: {
          [acp.accessControl]: ["https://arbitrary.pod/resource?ext=acr"],
        },
      },
    };
    const mockedAcr = mockAcr("https://arbitrary.pod/resource", {
      policies: [],
      memberPolicies: [],
    });
    const mockedGetResourceInfo = jest.spyOn(ResourceModule, "getResourceInfo");
    mockedGetResourceInfo.mockResolvedValueOnce(mockedResourceInfo);
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset.mockResolvedValueOnce(mockedAcr);

    const fetchedResourceInfo = await getResourceInfoWithAcp(
      "https://some.pod/resource"
    );

    expect(fetchedResourceInfo.internal_acp.acr).not.toBeNull();
    expect(
      (fetchedResourceInfo as WithAccessibleAcr).internal_acp.aprs
    ).toEqual({});
  });

  it("fetches all referenced ACPs once", async () => {
    const mockedResourceInfo: WithServerResourceInfo = {
      internal_resourceInfo: {
        sourceIri: "https://some.pod/resource",
        isRawData: true,
        linkedResources: {
          [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
        },
      },
    };
    const mockedAcr = mockAcr("https://some.pod/resource", {
      policies: ["https://some.pod/policy-resource#a-policy"],
      memberPolicies: [
        "https://some.pod/policy-resource#a-member-policy",
        "https://some.pod/policy-resource#another-member-policy",
      ],
    });
    const mockedAcp = mockSolidDatasetFrom("https://some.pod/policy-resource");
    const mockedGetResourceInfo = jest.spyOn(ResourceModule, "getResourceInfo");
    mockedGetResourceInfo.mockResolvedValueOnce(mockedResourceInfo);
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset
      .mockResolvedValueOnce(mockedAcr)
      .mockResolvedValueOnce(mockedAcp);

    const fetchedResourceInfo = await getResourceInfoWithAcp(
      "https://some.pod/resource"
    );

    expect(mockedGetResourceInfo.mock.calls).toHaveLength(1);
    expect(mockedGetResourceInfo.mock.calls[0][0]).toBe(
      "https://some.pod/resource"
    );
    expect(mockedGetSolidDataset.mock.calls).toHaveLength(2);
    expect(mockedGetSolidDataset.mock.calls[0][0]).toBe(
      "https://some.pod/resource?ext=acr"
    );
    expect(mockedGetSolidDataset.mock.calls[1][0]).toBe(
      "https://some.pod/policy-resource"
    );
    expect(fetchedResourceInfo.internal_acp.acr).not.toBeNull();
    expect(
      (fetchedResourceInfo as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/policy-resource"
      ]
    ).toBeDefined();
    expect(
      (fetchedResourceInfo as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/policy-resource"
      ]
    ).not.toBeNull();
  });

  it("lists Access Policy Resources that could not be fetched as null", async () => {
    const mockedResourceInfo: WithServerResourceInfo = {
      internal_resourceInfo: {
        sourceIri: "https://arbitrary.pod/resource",
        isRawData: true,
        linkedResources: {
          [acp.accessControl]: ["https://arbitrary.pod/resource?ext=acr"],
        },
      },
    };
    const mockedAcr = mockAcr("https://some.pod/resource", {
      policies: ["https://some.pod/policy-resource#a-policy"],
      memberPolicies: [
        "https://some.pod/policy-resource#a-member-policy",
        "https://some.pod/policy-resource#another-member-policy",
      ],
    });
    const mockedGetResourceInfo = jest.spyOn(ResourceModule, "getResourceInfo");
    mockedGetResourceInfo.mockResolvedValueOnce(mockedResourceInfo);
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset
      .mockResolvedValueOnce(mockedAcr)
      .mockRejectedValueOnce(
        new Error("Could not fetch this Access Policy Resource")
      );

    const fetchedResourceInfo = await getResourceInfoWithAcp(
      "https://some.pod/resource"
    );

    expect(mockedGetResourceInfo.mock.calls).toHaveLength(1);
    expect(mockedGetSolidDataset.mock.calls).toHaveLength(2);
    expect(fetchedResourceInfo.internal_acp.acr).not.toBeNull();
    expect(
      (fetchedResourceInfo as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/policy-resource"
      ]
    ).toBeNull();
  });

  it("does not add the ACR itself to the APR list", async () => {
    const mockedResourceInfo: WithServerResourceInfo = {
      internal_resourceInfo: {
        sourceIri: "https://arbitrary.pod/resource",
        isRawData: true,
        linkedResources: {
          [acp.accessControl]: ["https://arbitrary.pod/resource?ext=acr"],
        },
      },
    };
    const mockedAcr = mockAcr("https://some.pod/resource", {
      policies: ["https://some.pod/resource?ext=acr#a-policy"],
      memberPolicies: [
        "https://some.pod/resource?ext=acr#a-member-policy",
        "https://some.pod/resource?ext=acr#another-member-policy",
      ],
    });
    const mockedGetResourceInfo = jest.spyOn(ResourceModule, "getResourceInfo");
    mockedGetResourceInfo.mockResolvedValueOnce(mockedResourceInfo);
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset.mockResolvedValueOnce(mockedAcr);

    const fetchedResourceInfo = await getResourceInfoWithAcp(
      "https://some.pod/resource"
    );

    expect(mockedGetResourceInfo.mock.calls).toHaveLength(1);
    expect(mockedGetSolidDataset.mock.calls).toHaveLength(1);
    expect(fetchedResourceInfo.internal_acp.acr).not.toBeNull();
    expect(
      (fetchedResourceInfo as WithAccessibleAcr).internal_acp.aprs[
        "https://some.pod/resource?ext=acr"
      ]
    ).not.toBeDefined();
  });
});

describe("getSolidDatasetWithAccessDatasets", () => {
  it("fetches the Resource at the given URL", async () => {
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );

    await getSolidDatasetWithAccessDatasets("https://some.pod/resource");

    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(1);
    expect(mockedGetSolidDataset).toHaveBeenLastCalledWith(
      "https://some.pod/resource",
      expect.anything()
    );
  });

  it("fetches the ACL when the SolidDataset at the given URL exposes one", async () => {
    const mockDataset = mockSolidDatasetFrom("https://arbitrary.pod/resource");
    mockDataset.internal_resourceInfo.aclUrl = "https://some.pod/resource.acl";
    mockDataset.internal_resourceInfo.linkedResources = {
      acl: ["https://some.pod/resource.acl"],
    };
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset.mockResolvedValueOnce(mockDataset);

    await getSolidDatasetWithAccessDatasets("https://arbitrary.pod/resource");

    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(2);
    expect(mockedGetSolidDataset).toHaveBeenLastCalledWith(
      "https://some.pod/resource.acl",
      expect.anything()
    );
  });

  it("fetches the ACR when the SolidDataset at the given URL exposes one", async () => {
    const mockDataset = mockSolidDatasetFrom("https://arbitrary.pod/resource");
    mockDataset.internal_resourceInfo.linkedResources = {
      [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
    };
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset.mockResolvedValueOnce(mockDataset);

    await getSolidDatasetWithAccessDatasets("https://arbitrary.pod/resource");

    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(2);
    expect(mockedGetSolidDataset).toHaveBeenLastCalledWith(
      "https://some.pod/resource?ext=acr",
      expect.anything()
    );
  });

  it("does not fetch any Access Dataset if none is exposed", async () => {
    const mockDataset = mockSolidDatasetFrom("https://arbitrary.pod/resource");
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset.mockResolvedValueOnce(mockDataset);

    await getSolidDatasetWithAccessDatasets("https://arbitrary.pod/resource");

    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(1);
  });

  it("passes on the given fetcher to the Resource and ACL fetcher", async () => {
    const mockDataset = mockSolidDatasetFrom("https://some.pod/resource");
    mockDataset.internal_resourceInfo.aclUrl = "https://some.pod/resource.acl";
    mockDataset.internal_resourceInfo.linkedResources = {
      acl: ["https://some.pod/resource.acl"],
    };
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset.mockResolvedValueOnce(mockDataset);
    const mockedFetcher = jest
      .fn(window.fetch)
      .mockResolvedValue(new Response());

    await getSolidDatasetWithAccessDatasets("https://some.pod/resource", {
      fetch: mockedFetcher,
    });

    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(2);
    expect(mockedGetSolidDataset).toHaveBeenNthCalledWith(
      1,
      "https://some.pod/resource",
      expect.objectContaining({ fetch: mockedFetcher })
    );
    expect(mockedGetSolidDataset).toHaveBeenNthCalledWith(
      2,
      "https://some.pod/resource.acl",
      expect.objectContaining({ fetch: mockedFetcher })
    );
  });

  it("passes on the given fetcher to the Resource and ACR fetcher", async () => {
    const mockDataset = mockSolidDatasetFrom("https://some.pod/resource");
    mockDataset.internal_resourceInfo.linkedResources = {
      [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
    };
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    mockedGetSolidDataset.mockResolvedValueOnce(mockDataset);
    const mockedFetcher = jest
      .fn(window.fetch)
      .mockResolvedValue(new Response());

    await getSolidDatasetWithAccessDatasets("https://some.pod/resource", {
      fetch: mockedFetcher,
    });

    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(2);
    expect(mockedGetSolidDataset).toHaveBeenNthCalledWith(
      1,
      "https://some.pod/resource",
      expect.objectContaining({ fetch: mockedFetcher })
    );
    expect(mockedGetSolidDataset).toHaveBeenNthCalledWith(
      2,
      "https://some.pod/resource?ext=acr",
      expect.objectContaining({ fetch: mockedFetcher })
    );
  });
});

describe("getFileWithAccessDatasets", () => {
  it("fetches the Resource at the given URL", async () => {
    const mockedGetFile = jest.spyOn(FileModule, "getFile");

    await getFileWithAccessDatasets("https://some.pod/resource");

    expect(mockedGetFile).toHaveBeenCalledTimes(1);
    expect(mockedGetFile).toHaveBeenLastCalledWith(
      "https://some.pod/resource",
      expect.anything()
    );
  });

  it("fetches the ACL when the File at the given URL exposes one", async () => {
    const mockFile = Object.assign(new Blob(), {
      internal_resourceInfo: {
        aclUrl: "https://some.pod/resource.acl",
        linkedResources: { acl: ["https://some.pod/resource.acl"] },
        sourceIri: "https://arbitrary.pod/resource",
        isRawData: true,
      },
    });
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    const mockedGetFile = jest.spyOn(FileModule, "getFile");
    mockedGetFile.mockResolvedValueOnce(mockFile);

    await getFileWithAccessDatasets("https://arbitrary.pod/resource");

    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(1);
    expect(mockedGetSolidDataset).toHaveBeenLastCalledWith(
      "https://some.pod/resource.acl",
      expect.anything()
    );
  });

  it("fetches the ACR when the File at the given URL exposes one", async () => {
    const mockFile = Object.assign(new Blob(), {
      internal_resourceInfo: {
        linkedResources: {
          [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
        },
        sourceIri: "https://arbitrary.pod/resource",
        isRawData: true,
      },
    });
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    const mockedGetFile = jest.spyOn(FileModule, "getFile");
    mockedGetFile.mockResolvedValueOnce(mockFile);

    await getFileWithAccessDatasets("https://arbitrary.pod/resource");

    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(1);
    expect(mockedGetSolidDataset).toHaveBeenLastCalledWith(
      "https://some.pod/resource?ext=acr",
      expect.anything()
    );
  });

  it("does not fetch any Access Dataset if none is exposed", async () => {
    const mockFile = Object.assign(new Blob(), {
      internal_resourceInfo: {
        linkedResources: {},
        sourceIri: "https://arbitrary.pod/resource",
        isRawData: true,
      },
    });
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    const mockedGetFile = jest.spyOn(FileModule, "getFile");
    mockedGetFile.mockResolvedValueOnce(mockFile);

    await getFileWithAccessDatasets("https://arbitrary.pod/resource");

    expect(mockedGetSolidDataset).not.toHaveBeenCalled();
  });

  it("passes on the given fetcher to the Resource and ACL fetcher", async () => {
    const mockFile = Object.assign(new Blob(), {
      internal_resourceInfo: {
        aclUrl: "https://some.pod/resource.acl",
        linkedResources: { acl: ["https://some.pod/resource.acl"] },
        sourceIri: "https://arbitrary.pod/resource",
        isRawData: true,
      },
    });
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    const mockedGetFile = jest.spyOn(FileModule, "getFile");
    mockedGetFile.mockResolvedValueOnce(mockFile);
    const mockedFetcher = jest
      .fn(window.fetch)
      .mockResolvedValue(new Response());

    await getFileWithAccessDatasets("https://some.pod/resource", {
      fetch: mockedFetcher,
    });

    expect(mockedGetFile).toHaveBeenCalledTimes(1);
    expect(mockedGetFile).toHaveBeenLastCalledWith(
      "https://some.pod/resource",
      expect.objectContaining({ fetch: mockedFetcher })
    );
    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(1);
    expect(mockedGetSolidDataset).toHaveBeenLastCalledWith(
      "https://some.pod/resource.acl",
      expect.objectContaining({ fetch: mockedFetcher })
    );
  });

  it("passes on the given fetcher to the Resource and ACR fetcher", async () => {
    const mockFile = Object.assign(new Blob(), {
      internal_resourceInfo: {
        linkedResources: {
          [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
        },
        sourceIri: "https://arbitrary.pod/resource",
        isRawData: true,
      },
    });
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    const mockedGetFile = jest.spyOn(FileModule, "getFile");
    mockedGetFile.mockResolvedValueOnce(mockFile);
    const mockedFetcher = jest
      .fn(window.fetch)
      .mockResolvedValue(new Response());

    await getFileWithAccessDatasets("https://some.pod/resource", {
      fetch: mockedFetcher,
    });

    expect(mockedGetFile).toHaveBeenCalledTimes(1);
    expect(mockedGetFile).toHaveBeenLastCalledWith(
      "https://some.pod/resource",
      expect.objectContaining({ fetch: mockedFetcher })
    );
    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(1);
    expect(mockedGetSolidDataset).toHaveBeenLastCalledWith(
      "https://some.pod/resource?ext=acr",
      expect.objectContaining({ fetch: mockedFetcher })
    );
  });
});

describe("getResourceInfoWithAccessDatasets", () => {
  it("fetches the ResourceInfo for the given URL", async () => {
    const mockedGetResourceInfo = jest.spyOn(ResourceModule, "getResourceInfo");

    await getResourceInfoWithAccessDatasets("https://some.pod/resource");

    expect(mockedGetResourceInfo).toHaveBeenCalledTimes(1);
    expect(mockedGetResourceInfo).toHaveBeenLastCalledWith(
      "https://some.pod/resource",
      expect.anything()
    );
  });

  it("fetches the ACL when the Resource at the given URL exposes one", async () => {
    const mockResourceInfo: WithServerResourceInfo = {
      internal_resourceInfo: {
        aclUrl: "https://some.pod/resource.acl",
        linkedResources: { acl: ["https://some.pod/resource.acl"] },
        sourceIri: "https://arbitrary.pod/resource",
        isRawData: true,
      },
    };
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    const mockedGetResourceInfo = jest.spyOn(ResourceModule, "getResourceInfo");
    mockedGetResourceInfo.mockResolvedValueOnce(mockResourceInfo);

    await getResourceInfoWithAccessDatasets("https://arbitrary.pod/resource");

    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(1);
    expect(mockedGetSolidDataset).toHaveBeenLastCalledWith(
      "https://some.pod/resource.acl",
      expect.anything()
    );
  });

  it("fetches the ACR when the Resource at the given URL exposes one", async () => {
    const mockResourceInfo: WithServerResourceInfo = {
      internal_resourceInfo: {
        linkedResources: {
          [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
        },
        sourceIri: "https://arbitrary.pod/resource",
        isRawData: true,
      },
    };
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    const mockedGetResourceInfo = jest.spyOn(ResourceModule, "getResourceInfo");
    mockedGetResourceInfo.mockResolvedValueOnce(mockResourceInfo);

    await getResourceInfoWithAccessDatasets("https://arbitrary.pod/resource");

    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(1);
    expect(mockedGetSolidDataset).toHaveBeenLastCalledWith(
      "https://some.pod/resource?ext=acr",
      expect.anything()
    );
  });

  it("does not fetch any Access Dataset if none is exposed", async () => {
    const mockResourceInfo: WithServerResourceInfo = {
      internal_resourceInfo: {
        linkedResources: {},
        sourceIri: "https://arbitrary.pod/resource",
        isRawData: true,
      },
    };
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    const mockedGetResourceInfo = jest.spyOn(ResourceModule, "getResourceInfo");
    mockedGetResourceInfo.mockResolvedValueOnce(mockResourceInfo);

    await getResourceInfoWithAccessDatasets("https://arbitrary.pod/resource");

    expect(mockedGetSolidDataset).not.toHaveBeenCalled();
  });

  it("passes on the given fetcher to the ResourceInfo and ACL fetcher", async () => {
    const mockResourceInfo: WithServerResourceInfo = {
      internal_resourceInfo: {
        aclUrl: "https://some.pod/.acl",
        linkedResources: { acl: ["https://some.pod/.acl"] },
        sourceIri: "https://some.pod/",
        isRawData: true,
      },
    };
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    const mockedGetResourceInfo = jest.spyOn(ResourceModule, "getResourceInfo");
    mockedGetResourceInfo.mockResolvedValueOnce(mockResourceInfo);
    const mockedFetcher = jest
      .fn(window.fetch)
      .mockResolvedValue(new Response());

    // We specifically use the root Resource here,
    // because otherwise `getResourceInfo` would be called on the parent Resource
    // to find a fallback ACL:
    await getResourceInfoWithAccessDatasets("https://some.pod/", {
      fetch: mockedFetcher,
    });

    expect(mockedGetResourceInfo).toHaveBeenCalledTimes(1);
    expect(mockedGetResourceInfo).toHaveBeenLastCalledWith(
      "https://some.pod/",
      expect.objectContaining({ fetch: mockedFetcher })
    );
    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(1);
    expect(mockedGetSolidDataset).toHaveBeenLastCalledWith(
      "https://some.pod/.acl",
      expect.objectContaining({ fetch: mockedFetcher })
    );
  });

  it("passes on the given fetcher to the ResourceInfo and ACR fetcher", async () => {
    const mockResourceInfo: WithServerResourceInfo = {
      internal_resourceInfo: {
        linkedResources: {
          [acp.accessControl]: ["https://some.pod/resource?ext=acr"],
        },
        sourceIri: "https://some.pod/resource",
        isRawData: true,
      },
    };
    const mockedGetSolidDataset = jest.spyOn(
      SolidDatasetModule,
      "getSolidDataset"
    );
    const mockedGetResourceInfo = jest.spyOn(ResourceModule, "getResourceInfo");
    mockedGetResourceInfo.mockResolvedValueOnce(mockResourceInfo);
    const mockedFetcher = jest
      .fn(window.fetch)
      .mockResolvedValue(new Response());

    await getResourceInfoWithAccessDatasets("https://some.pod/resource", {
      fetch: mockedFetcher,
    });

    expect(mockedGetResourceInfo).toHaveBeenCalledTimes(1);
    expect(mockedGetResourceInfo).toHaveBeenLastCalledWith(
      "https://some.pod/resource",
      expect.objectContaining({ fetch: mockedFetcher })
    );
    expect(mockedGetSolidDataset).toHaveBeenCalledTimes(1);
    expect(mockedGetSolidDataset).toHaveBeenLastCalledWith(
      "https://some.pod/resource?ext=acr",
      expect.objectContaining({ fetch: mockedFetcher })
    );
  });
});
