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

import { describe, it, expect } from "@jest/globals";
import { NamedNode } from "rdf-js";
import { DataFactory } from "n3";

import {
  asIri,
  createThing,
  getThing,
  getThingAll,
  isThing,
  setThing,
} from "../thing/thing";
import {
  addAgent,
  addForbiddenRuleUrl,
  addGroup,
  addOptionalRuleUrl,
  addRequiredRuleUrl,
  createRule,
  getAgentAll,
  getForbiddenRuleUrlAll,
  getGroupAll,
  getOptionalRuleUrlAll,
  getRequiredRuleUrlAll,
  removeForbiddenRuleUrl,
  removeOptionalRuleUrl,
  removeRequiredRuleUrl,
  getRule,
  hasAuthenticated,
  hasPublic,
  removeAgent,
  removeGroup,
  Rule,
  setAgent,
  setAuthenticated,
  setForbiddenRuleUrl,
  setGroup,
  setOptionalRuleUrl,
  setPublic,
  setRequiredRuleUrl,
  getRuleAll,
  setRule,
  hasCreator,
  setCreator,
  ruleAsMarkdown,
  removeRule,
  getClientAll,
  setClient,
  addClient,
  removeClient,
  hasAnyClient,
  setAnyClient,
} from "./rule";

import { Policy } from "./policy";
import { createSolidDataset } from "../resource/solidDataset";
import { setUrl } from "../thing/set";
import { Thing, ThingPersisted, Url, UrlString } from "../interfaces";
import { acp, rdf } from "../constants";
import { getIriAll } from "../index";

// Vocabulary terms
const ACP_ANY = DataFactory.namedNode("http://www.w3.org/ns/solid/acp#anyOf");
const ACP_ALL = DataFactory.namedNode("http://www.w3.org/ns/solid/acp#allOf");
const ACP_NONE = DataFactory.namedNode("http://www.w3.org/ns/solid/acp#noneOf");
const RDF_TYPE = DataFactory.namedNode(
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
);
const ACP_RULE = DataFactory.namedNode("http://www.w3.org/ns/solid/acp#Rule");
const ACP_AGENT = DataFactory.namedNode("http://www.w3.org/ns/solid/acp#agent");
const ACP_GROUP = DataFactory.namedNode("http://www.w3.org/ns/solid/acp#group");
const ACP_CLIENT = DataFactory.namedNode(
  "http://www.w3.org/ns/solid/acp#client"
);
const ACP_PUBLIC = DataFactory.namedNode(
  "http://www.w3.org/ns/solid/acp#PublicAgent"
);
const ACP_AUTHENTICATED = DataFactory.namedNode(
  "http://www.w3.org/ns/solid/acp#AuthenticatedAgent"
);
const ACP_CREATOR = DataFactory.namedNode(
  "http://www.w3.org/ns/solid/acp#CreatorAgent"
);
const SOLID_PUBLIC_CLIENT = DataFactory.namedNode(
  "http://www.w3.org/ns/solid/terms#PublicOidcClient"
);

// Test data
const MOCKED_POLICY_IRI = DataFactory.namedNode(
  "https://some.pod/policy-resource#policy"
);
const MOCKED_RULE_IRI = DataFactory.namedNode(
  "https://some.pod/rule-resource#a-rule"
);
const OTHER_MOCKED_RULE_IRI = DataFactory.namedNode(
  "https://some.pod/rule-resource#another-rule"
);
const REQUIRED_RULE_IRI = DataFactory.namedNode(
  "https://some.pod/rule-resource#required-rule"
);
const OPTIONAL_RULE_IRI = DataFactory.namedNode(
  "https://some.pod/rule-resource#optional-rule"
);
const FORBIDDEN_RULE_IRI = DataFactory.namedNode(
  "https://some.pod/rule-resource#forbidden-rule"
);
const MOCK_WEBID_ME = DataFactory.namedNode("https://my.pod/profile#me");
const MOCK_WEBID_YOU = DataFactory.namedNode("https://your.pod/profile#you");
const MOCK_GROUP_IRI = DataFactory.namedNode("https://my.pod/group#a-group");
const MOCK_GROUP_OTHER_IRI = DataFactory.namedNode(
  "https://my.pod/group#another-group"
);
const MOCK_CLIENT_WEBID_1 = DataFactory.namedNode(
  "https://my.app/registration#it"
);
const MOCK_CLIENT_WEBID_2 = DataFactory.namedNode(
  "https://your.app/registration#it"
);

type ThingObject = ThingPersisted | Url | UrlString;

function isNamedNode(object: ThingObject): object is Url {
  return typeof (object as Url).value !== undefined;
}

const addAllObjects = (
  thing: ThingPersisted,
  predicate: NamedNode,
  objects: ThingObject[]
): void => {
  objects.forEach((objectToAdd) => {
    let objectUrl: string;
    if (isThing(objectToAdd)) {
      objectUrl = asIri(objectToAdd);
    } else if (isNamedNode(objectToAdd)) {
      // The object is an Url (aka NamedNode)
      objectUrl = objectToAdd.value;
    } else {
      objectUrl = objectToAdd;
    }
    thing.add(
      DataFactory.quad(
        DataFactory.namedNode(asIri(thing)),
        predicate,
        DataFactory.namedNode(objectUrl)
      )
    );
  });
};

const mockRule = (
  url: Url,
  content?: {
    agents?: Url[];
    groups?: Url[];
    public?: boolean;
    authenticated?: boolean;
    creator?: boolean;
    clients?: Url[];
    publicClient?: boolean;
  }
): Rule => {
  let mockedRule = createThing({
    url: url.value,
  });
  mockedRule = mockedRule.add(
    DataFactory.quad(
      DataFactory.namedNode(asIri(mockedRule)),
      RDF_TYPE,
      ACP_RULE
    )
  );
  if (content?.agents) {
    addAllObjects(mockedRule, ACP_AGENT, content.agents);
  }
  if (content?.groups) {
    addAllObjects(mockedRule, ACP_GROUP, content.groups);
  }
  if (content?.clients) {
    addAllObjects(mockedRule, ACP_CLIENT, content.clients);
  }
  if (content?.public) {
    mockedRule = mockedRule.add(
      DataFactory.quad(
        DataFactory.namedNode(asIri(mockedRule)),
        ACP_AGENT,
        ACP_PUBLIC
      )
    );
  }
  if (content?.authenticated) {
    mockedRule = mockedRule.add(
      DataFactory.quad(
        DataFactory.namedNode(asIri(mockedRule)),
        ACP_AGENT,
        ACP_AUTHENTICATED
      )
    );
  }
  if (content?.creator) {
    mockedRule = mockedRule.add(
      DataFactory.quad(
        DataFactory.namedNode(asIri(mockedRule)),
        ACP_AGENT,
        ACP_CREATOR
      )
    );
  }
  if (content?.publicClient) {
    mockedRule = mockedRule.add(
      DataFactory.quad(
        DataFactory.namedNode(asIri(mockedRule)),
        ACP_CLIENT,
        SOLID_PUBLIC_CLIENT
      )
    );
  }
  return mockedRule;
};

const mockPolicy = (
  url: NamedNode,
  rules?: { required?: Rule[]; optional?: Rule[]; forbidden?: Rule[] }
): Policy => {
  const mockPolicy = createThing({ url: url.value });
  if (rules?.forbidden) {
    addAllObjects(mockPolicy, ACP_NONE, rules.forbidden);
  }
  if (rules?.optional) {
    addAllObjects(mockPolicy, ACP_ANY, rules.optional);
  }
  if (rules?.required) {
    addAllObjects(mockPolicy, ACP_ALL, rules.required);
  }
  return mockPolicy;
};

describe("addForbiddenRuleUrl", () => {
  it("adds the rule in the forbidden rules of the policy", () => {
    const myPolicy = addForbiddenRuleUrl(
      mockPolicy(MOCKED_POLICY_IRI),
      mockRule(MOCKED_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_NONE, MOCKED_RULE_IRI)
      )
    ).toBe(true);
  });

  it("does not remove the existing forbidden rules", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      forbidden: [mockRule(OTHER_MOCKED_RULE_IRI)],
    });
    const myPolicy = addForbiddenRuleUrl(
      mockedPolicy,
      mockRule(MOCKED_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_NONE, OTHER_MOCKED_RULE_IRI)
      )
    ).toBe(true);
  });

  it("does not change the existing required and optional rules", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      optional: [mockRule(OPTIONAL_RULE_IRI)],
      required: [mockRule(REQUIRED_RULE_IRI)],
    });
    const myPolicy = addForbiddenRuleUrl(
      mockedPolicy,
      mockRule(FORBIDDEN_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ALL, REQUIRED_RULE_IRI)
      )
    ).toBe(true);
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ANY, OPTIONAL_RULE_IRI)
      )
    ).toBe(true);
  });

  it("does not change the input policy", () => {
    const myPolicy = mockPolicy(MOCKED_POLICY_IRI);
    const mypolicySize = myPolicy.size;
    addForbiddenRuleUrl(myPolicy, mockRule(MOCKED_RULE_IRI));
    expect(myPolicy.size).toBe(mypolicySize);
  });
});

describe("addOptionalRuleUrl", () => {
  it("adds the rule in the optional rules of the policy", () => {
    const myPolicy = addOptionalRuleUrl(
      mockPolicy(MOCKED_POLICY_IRI),
      mockRule(MOCKED_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ANY, MOCKED_RULE_IRI)
      )
    ).toBe(true);
  });

  it("does not remove the existing optional rules", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      optional: [mockRule(OTHER_MOCKED_RULE_IRI)],
    });
    const myPolicy = addOptionalRuleUrl(
      mockedPolicy,
      mockRule(MOCKED_POLICY_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ANY, OTHER_MOCKED_RULE_IRI)
      )
    ).toBe(true);
  });

  it("does not change the existing required and forbidden rules", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      forbidden: [mockRule(FORBIDDEN_RULE_IRI)],
      required: [mockRule(REQUIRED_RULE_IRI)],
    });
    const myPolicy = addOptionalRuleUrl(
      mockedPolicy,
      mockRule(OPTIONAL_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ALL, REQUIRED_RULE_IRI)
      )
    ).toBe(true);
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_NONE, FORBIDDEN_RULE_IRI)
      )
    ).toBe(true);
  });

  it("does not change the input policy", () => {
    const myPolicy = mockPolicy(MOCKED_POLICY_IRI);
    addOptionalRuleUrl(myPolicy, mockRule(MOCKED_RULE_IRI));
    expect(myPolicy.size).toBe(0);
  });
});

describe("addRequiredRule", () => {
  it("adds the rule in the required rules of the policy", () => {
    const myPolicy = addRequiredRuleUrl(
      mockPolicy(MOCKED_POLICY_IRI),
      mockRule(MOCKED_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ALL, MOCKED_RULE_IRI)
      )
    ).toBe(true);
  });

  it("does not remove the existing required rules", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      required: [mockRule(OTHER_MOCKED_RULE_IRI)],
    });
    const myPolicy = addRequiredRuleUrl(
      mockedPolicy,
      mockRule(MOCKED_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ALL, OTHER_MOCKED_RULE_IRI)
      )
    ).toBe(true);
  });

  it("does not change the existing optional and forbidden rules", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      forbidden: [mockRule(FORBIDDEN_RULE_IRI)],
      optional: [mockRule(OPTIONAL_RULE_IRI)],
    });
    const myPolicy = addRequiredRuleUrl(
      mockedPolicy,
      mockRule(OPTIONAL_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ANY, OPTIONAL_RULE_IRI)
      )
    ).toBe(true);
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_NONE, FORBIDDEN_RULE_IRI)
      )
    ).toBe(true);
  });

  it("does not change the input policy", () => {
    const myPolicy = mockPolicy(MOCKED_POLICY_IRI);
    addOptionalRuleUrl(myPolicy, mockRule(MOCKED_RULE_IRI));
    expect(myPolicy.size).toBe(0);
  });
});

describe("setForbiddenRuleUrl", () => {
  it("sets the provided rules as the forbidden rules for the policy", () => {
    const myPolicy = setForbiddenRuleUrl(
      mockPolicy(MOCKED_POLICY_IRI),
      mockRule(MOCKED_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_NONE, MOCKED_RULE_IRI)
      )
    ).toBe(true);
  });

  it("removes any previous forbidden rules for on the policy", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      forbidden: [mockRule(OTHER_MOCKED_RULE_IRI)],
    });
    const myPolicy = setForbiddenRuleUrl(
      mockedPolicy,
      mockRule(MOCKED_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_NONE, OTHER_MOCKED_RULE_IRI)
      )
    ).toBe(false);
  });

  it("does not change the existing optional and required rules on the policy", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      optional: [mockRule(OPTIONAL_RULE_IRI)],
      required: [mockRule(REQUIRED_RULE_IRI)],
    });
    const myPolicy = setForbiddenRuleUrl(
      mockedPolicy,
      mockRule(FORBIDDEN_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ALL, REQUIRED_RULE_IRI)
      )
    ).toBe(true);
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ANY, OPTIONAL_RULE_IRI)
      )
    ).toBe(true);
  });

  it("does not change the input policy", () => {
    const myPolicy = mockPolicy(MOCKED_POLICY_IRI);
    setForbiddenRuleUrl(myPolicy, mockRule(MOCKED_RULE_IRI));
    expect(myPolicy.size).toBe(0);
  });
});

describe("setOptionalRuleUrl", () => {
  it("sets the provided rules as the optional rules for the policy", () => {
    const myPolicy = setOptionalRuleUrl(
      mockPolicy(MOCKED_POLICY_IRI),
      mockRule(MOCKED_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ANY, MOCKED_RULE_IRI)
      )
    ).toBe(true);
  });

  it("removes any previous optional rules for on the policy", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      optional: [mockRule(OTHER_MOCKED_RULE_IRI)],
    });
    const myPolicy = setOptionalRuleUrl(
      mockedPolicy,
      mockRule(MOCKED_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ANY, OTHER_MOCKED_RULE_IRI)
      )
    ).toBe(false);
  });

  it("does not change the existing forbidden and required rules on the policy", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      forbidden: [mockRule(FORBIDDEN_RULE_IRI)],
      required: [mockRule(REQUIRED_RULE_IRI)],
    });
    const myPolicy = setOptionalRuleUrl(
      mockedPolicy,
      mockRule(OPTIONAL_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ALL, REQUIRED_RULE_IRI)
      )
    ).toBe(true);
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_NONE, FORBIDDEN_RULE_IRI)
      )
    ).toBe(true);
  });

  it("does not change the input policy", () => {
    const myPolicy = mockPolicy(MOCKED_POLICY_IRI);
    setOptionalRuleUrl(myPolicy, mockRule(MOCKED_RULE_IRI));
    expect(myPolicy.size).toBe(0);
  });
});

describe("setRequiredRuleUrl", () => {
  it("sets the provided rules as the required rules for the policy", () => {
    const myPolicy = setRequiredRuleUrl(
      mockPolicy(MOCKED_POLICY_IRI),
      mockRule(MOCKED_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ALL, MOCKED_RULE_IRI)
      )
    ).toBe(true);
  });

  it("removes any previous required rules for on the policy", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      required: [mockRule(OTHER_MOCKED_RULE_IRI)],
    });
    const myPolicy = setRequiredRuleUrl(
      mockedPolicy,
      mockRule(MOCKED_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ALL, OTHER_MOCKED_RULE_IRI)
      )
    ).toBe(false);
  });

  it("does not change the existing forbidden and optional rules on the policy", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      forbidden: [mockRule(FORBIDDEN_RULE_IRI)],
      optional: [mockRule(OPTIONAL_RULE_IRI)],
    });
    const myPolicy = setRequiredRuleUrl(
      mockedPolicy,
      mockRule(REQUIRED_RULE_IRI)
    );
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_ANY, OPTIONAL_RULE_IRI)
      )
    ).toBe(true);
    expect(
      myPolicy.has(
        DataFactory.quad(MOCKED_POLICY_IRI, ACP_NONE, FORBIDDEN_RULE_IRI)
      )
    ).toBe(true);
  });

  it("does not change the input policy", () => {
    const myPolicy = mockPolicy(MOCKED_POLICY_IRI);
    setRequiredRuleUrl(myPolicy, mockRule(MOCKED_RULE_IRI));
    expect(myPolicy.size).toBe(0);
  });
});

describe("getForbiddenRuleurlAll", () => {
  it("returns all the forbidden rules for the given policy", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      forbidden: [mockRule(MOCKED_RULE_IRI), mockRule(OTHER_MOCKED_RULE_IRI)],
    });
    const forbiddenRules = getForbiddenRuleUrlAll(mockedPolicy);
    expect(forbiddenRules).toContain(MOCKED_RULE_IRI.value);
    expect(forbiddenRules).toContain(OTHER_MOCKED_RULE_IRI.value);
    expect(forbiddenRules).toHaveLength(2);
  });

  it("returns only the forbidden rules for the given policy", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      forbidden: [mockRule(FORBIDDEN_RULE_IRI)],
      optional: [mockRule(OPTIONAL_RULE_IRI)],
      required: [mockRule(REQUIRED_RULE_IRI)],
    });
    const forbiddenRules = getForbiddenRuleUrlAll(mockedPolicy);
    expect(forbiddenRules).not.toContain(OPTIONAL_RULE_IRI.value);
    expect(forbiddenRules).not.toContain(REQUIRED_RULE_IRI.value);
    expect(forbiddenRules).toHaveLength(1);
  });
});

describe("getOptionalRulesOnPolicyAll", () => {
  it("returns all the optional rules for the given policy", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      optional: [mockRule(MOCKED_RULE_IRI), mockRule(OTHER_MOCKED_RULE_IRI)],
    });
    const optionalRules = getOptionalRuleUrlAll(mockedPolicy);
    expect(optionalRules).toContain(MOCKED_RULE_IRI.value);
    expect(optionalRules).toContain(OTHER_MOCKED_RULE_IRI.value);
    expect(optionalRules).toHaveLength(2);
  });

  it("returns only the optional rules for the given policy", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      forbidden: [mockRule(FORBIDDEN_RULE_IRI)],
      optional: [mockRule(OPTIONAL_RULE_IRI)],
      required: [mockRule(REQUIRED_RULE_IRI)],
    });
    const optionalRules = getOptionalRuleUrlAll(mockedPolicy);
    expect(optionalRules).not.toContain(FORBIDDEN_RULE_IRI.value);
    expect(optionalRules).not.toContain(REQUIRED_RULE_IRI.value);
    expect(optionalRules).toHaveLength(1);
  });
});

describe("getRequiredRulesOnPolicyAll", () => {
  it("returns all the required rules for the given policy", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      required: [mockRule(MOCKED_RULE_IRI), mockRule(OTHER_MOCKED_RULE_IRI)],
    });
    const requiredRules = getRequiredRuleUrlAll(mockedPolicy);
    expect(requiredRules).toContain(MOCKED_RULE_IRI.value);
    expect(requiredRules).toContain(OTHER_MOCKED_RULE_IRI.value);
    expect(requiredRules).toHaveLength(2);
  });

  it("returns only the required rules for the given policy", () => {
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      forbidden: [mockRule(FORBIDDEN_RULE_IRI)],
      optional: [mockRule(OPTIONAL_RULE_IRI)],
      required: [mockRule(REQUIRED_RULE_IRI)],
    });
    const requiredRules = getRequiredRuleUrlAll(mockedPolicy);
    expect(requiredRules).not.toContain(FORBIDDEN_RULE_IRI.value);
    expect(requiredRules).not.toContain(OPTIONAL_RULE_IRI.value);
    expect(requiredRules).toHaveLength(1);
  });
});

describe("removeRequiredRule", () => {
  it("removes the rule from the rules required by the given policy", () => {
    const mockedRule = mockRule(MOCKED_RULE_IRI);
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      required: [mockedRule],
    });
    const result = removeRequiredRuleUrl(mockedPolicy, mockedRule);
    expect(
      result.has(DataFactory.quad(MOCKED_POLICY_IRI, ACP_ALL, MOCKED_RULE_IRI))
    ).toBe(false);
  });

  it("does not remove the rule from the rules optional/forbidden by the given policy", () => {
    const mockedRule = mockRule(MOCKED_RULE_IRI);
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      optional: [mockedRule],
      forbidden: [mockedRule],
    });
    const result = removeRequiredRuleUrl(mockedPolicy, mockedRule);
    expect(
      result.has(DataFactory.quad(MOCKED_POLICY_IRI, ACP_ANY, MOCKED_RULE_IRI))
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_POLICY_IRI, ACP_NONE, MOCKED_RULE_IRI))
    ).toBe(true);
  });
});

describe("removeOptionalRuleUrl", () => {
  it("removes the rule from the rules required by the given policy", () => {
    const mockedRule = mockRule(MOCKED_RULE_IRI);
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      optional: [mockedRule],
    });
    const result = removeOptionalRuleUrl(mockedPolicy, mockedRule);
    expect(
      result.has(DataFactory.quad(MOCKED_POLICY_IRI, ACP_ANY, MOCKED_RULE_IRI))
    ).toBe(false);
  });

  it("does not remove the rule from the rules required/forbidden by the given policy", () => {
    const mockedRule = mockRule(MOCKED_RULE_IRI);
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      required: [mockedRule],
      forbidden: [mockedRule],
    });
    const result = removeOptionalRuleUrl(mockedPolicy, mockedRule);
    expect(
      result.has(DataFactory.quad(MOCKED_POLICY_IRI, ACP_ALL, MOCKED_RULE_IRI))
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_POLICY_IRI, ACP_NONE, MOCKED_RULE_IRI))
    ).toBe(true);
  });
});

describe("removeForbiddenRuleUrl", () => {
  it("removes the rule from the rules forbidden by the given policy", () => {
    const mockedRule = mockRule(MOCKED_RULE_IRI);
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      forbidden: [mockedRule],
    });
    const result = removeForbiddenRuleUrl(mockedPolicy, mockedRule);
    expect(
      result.has(DataFactory.quad(MOCKED_POLICY_IRI, ACP_NONE, MOCKED_RULE_IRI))
    ).toBe(false);
  });

  it("does not remove the rule from the rules required/optional by the given policy", () => {
    const mockedRule = mockRule(MOCKED_RULE_IRI);
    const mockedPolicy = mockPolicy(MOCKED_POLICY_IRI, {
      required: [mockedRule],
      optional: [mockedRule],
    });
    const result = removeForbiddenRuleUrl(mockedPolicy, mockedRule);
    expect(
      result.has(DataFactory.quad(MOCKED_POLICY_IRI, ACP_ALL, MOCKED_RULE_IRI))
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_POLICY_IRI, ACP_ANY, MOCKED_RULE_IRI))
    ).toBe(true);
  });
});

describe("createRule", () => {
  it("returns a acp:Rule", () => {
    const myRule = createRule(MOCKED_RULE_IRI.value);
    expect(
      myRule.has(DataFactory.quad(MOCKED_RULE_IRI, RDF_TYPE, ACP_RULE))
    ).toBe(true);
  });
  it("returns an **empty** rule", () => {
    const myRule = createRule("https://my.pod/rule-resource#rule");
    // The rule should only contain a type triple.
    expect(myRule.size).toBe(1);
  });
});

describe("getRule", () => {
  it("returns the rule with a matching IRI", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const dataset = setThing(createSolidDataset(), rule);
    const result = getRule(dataset, MOCKED_RULE_IRI.value);
    expect(result).not.toBeNull();
  });

  it("does not return a Thing with a matching IRI but the wrong type", () => {
    const notARule = createThing({
      url: "https://my.pod/rule-resource#not-a-rule",
    });
    const dataset = setThing(
      createSolidDataset(),
      setUrl(notARule, RDF_TYPE, "http://example.org/ns#NotRuleType")
    );
    const result = getRule(dataset, "https://my.pod/rule-resource#not-a-rule");
    expect(result).toBeNull();
  });

  it("does not return a rule with a mismatching IRI", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const dataset = setThing(createSolidDataset(), rule);
    const result = getRule(dataset, OTHER_MOCKED_RULE_IRI);
    expect(result).toBeNull();
  });
});

describe("getRuleAll", () => {
  it("returns an empty array if there are no Rules in the given Dataset", () => {
    expect(getRuleAll(createSolidDataset())).toHaveLength(0);
  });

  it("returns all the rules in a rule resource", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const dataset = setThing(createSolidDataset(), rule);
    let result = getRuleAll(dataset);
    expect(result).toHaveLength(1);

    const anotherRule = mockRule(OTHER_MOCKED_RULE_IRI);
    const newDataset = setThing(dataset, anotherRule);
    result = getRuleAll(newDataset);
    expect(result).toHaveLength(2);
  });
});

describe("removeRule", () => {
  it("removes the Rule from the given empty Dataset", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const dataset = setThing(createSolidDataset(), rule);

    const updatedDataset = removeRule(dataset, MOCKED_RULE_IRI);
    expect(getThingAll(updatedDataset)).toHaveLength(0);
  });
});

describe("setRule", () => {
  it("sets the Rule in the given empty Dataset", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const dataset = setRule(createSolidDataset(), rule);

    const result = getThing(dataset, MOCKED_RULE_IRI);
    expect(result).not.toBeNull();
    expect(
      getIriAll(result as Thing, rdf.type).includes(acp.Rule)
    ).toBeTruthy();
  });
});

describe("getAgentAll", () => {
  it("returns all the agents a rule applies to by WebID", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      agents: [MOCK_WEBID_ME, MOCK_WEBID_YOU],
    });
    const agents = getAgentAll(rule);
    expect(agents).toContain(MOCK_WEBID_ME.value);
    expect(agents).toContain(MOCK_WEBID_YOU.value);
    expect(agents).toHaveLength(2);
  });

  it("does not return the groups/public/authenticated/creator/clients a rule applies to", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      groups: [MOCK_GROUP_IRI],
      public: true,
      authenticated: true,
      creator: true,
      clients: [MOCK_CLIENT_WEBID_1],
    });
    const agents = getAgentAll(rule);
    expect(agents).not.toContain(MOCK_GROUP_IRI.value);
    expect(agents).not.toContain(ACP_CREATOR.value);
    expect(agents).not.toContain(ACP_AUTHENTICATED.value);
    expect(agents).not.toContain(ACP_PUBLIC.value);
    expect(agents).toHaveLength(0);
  });
});

describe("setAgent", () => {
  it("sets the given agents for the rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const result = setAgent(rule, MOCK_WEBID_ME.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_ME))
    ).toBe(true);
  });

  it("deletes any agents previously set for the rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      agents: [MOCK_WEBID_YOU],
    });
    const result = setAgent(rule, MOCK_WEBID_ME.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_ME))
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_YOU))
    ).toBe(false);
  });

  it("does not change the input rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      agents: [MOCK_WEBID_YOU],
    });
    setAgent(rule, MOCK_WEBID_ME.value);
    expect(
      rule.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_ME))
    ).toBe(false);
    expect(
      rule.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_YOU))
    ).toBe(true);
  });

  it("does not overwrite public and authenticated agents", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      public: true,
      authenticated: true,
    });
    const result = setAgent(rule, MOCK_WEBID_YOU.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_PUBLIC))
    ).toBe(true);

    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_AUTHENTICATED)
      )
    ).toBe(true);
  });
});

describe("addAgent", () => {
  it("adds the given agent to the rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const result = addAgent(rule, MOCK_WEBID_YOU.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_YOU))
    ).toBe(true);
  });

  it("does not override existing agents/public/authenticated/groups", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      agents: [MOCK_WEBID_ME],
      groups: [MOCK_GROUP_IRI],
      public: true,
      authenticated: true,
    });
    const result = addAgent(rule, MOCK_WEBID_YOU.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_YOU))
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_ME))
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_PUBLIC))
    ).toBe(true);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_AUTHENTICATED)
      )
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_IRI))
    ).toBe(true);
  });
});

describe("removeAgent", () => {
  it("removes the given agent from the rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      agents: [MOCK_WEBID_YOU],
    });
    const result = removeAgent(rule, MOCK_WEBID_YOU.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_YOU))
    ).toBe(false);
  });

  it("does not delete unrelated agents", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      agents: [MOCK_WEBID_ME, MOCK_WEBID_YOU],
      public: true,
      authenticated: true,
    });
    const result = removeAgent(rule, MOCK_WEBID_YOU.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_YOU))
    ).toBe(false);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_ME))
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_PUBLIC))
    ).toBe(true);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_AUTHENTICATED)
      )
    ).toBe(true);
  });

  it("does not remove groups, even with matching IRI", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      groups: [MOCK_GROUP_IRI],
    });
    const result = removeAgent(rule, MOCK_GROUP_IRI.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_IRI))
    ).toBe(true);
  });
});

describe("getGroupAll", () => {
  it("returns all the groups a rule applies to", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      groups: [MOCK_GROUP_IRI, MOCK_GROUP_OTHER_IRI],
    });
    const groups = getGroupAll(rule);
    expect(groups).toContain(MOCK_GROUP_IRI.value);
    expect(groups).toContain(MOCK_GROUP_OTHER_IRI.value);
    expect(groups).toHaveLength(2);
  });

  it("does not return the agents/public/authenticated/clients a rule applies to", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      agents: [MOCK_WEBID_ME],
      public: true,
      authenticated: true,
      clients: [MOCK_CLIENT_WEBID_1],
    });
    const groups = getGroupAll(rule);
    expect(groups).not.toContain(MOCK_WEBID_ME.value);
    expect(groups).not.toContain(ACP_AUTHENTICATED.value);
    expect(groups).not.toContain(ACP_PUBLIC.value);
    expect(groups).toHaveLength(0);
  });
});

describe("setGroup", () => {
  it("sets the given groups for the rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const result = setGroup(rule, MOCK_GROUP_IRI.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_IRI))
    ).toBe(true);
  });

  it("deletes any groups previously set for the rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      groups: [MOCK_GROUP_OTHER_IRI],
    });
    const result = setGroup(rule, MOCK_GROUP_IRI.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_IRI))
    ).toBe(true);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_OTHER_IRI)
      )
    ).toBe(false);
  });

  it("does not change the input rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      groups: [MOCK_GROUP_OTHER_IRI],
    });
    setGroup(rule, MOCK_GROUP_IRI.value);
    expect(
      rule.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_IRI))
    ).toBe(false);
    expect(
      rule.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_OTHER_IRI)
      )
    ).toBe(true);
  });
});

describe("addGroup", () => {
  it("adds the given group to the rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const result = addGroup(rule, "https://your.pod/groups#a-group");
    expect(
      result.has(
        DataFactory.quad(
          MOCKED_RULE_IRI,
          ACP_GROUP,
          DataFactory.namedNode("https://your.pod/groups#a-group")
        )
      )
    ).toBe(true);
  });

  it("does not override existing agents/public/authenticated/groups", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      agents: [MOCK_WEBID_ME],
      groups: [MOCK_GROUP_IRI],
      public: true,
      authenticated: true,
    });
    const result = addGroup(rule, MOCK_GROUP_OTHER_IRI.value);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_OTHER_IRI)
      )
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_ME))
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_PUBLIC))
    ).toBe(true);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_AUTHENTICATED)
      )
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_IRI))
    ).toBe(true);
  });
});

describe("removeGroup", () => {
  it("removes the given group from the rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      groups: [MOCK_GROUP_IRI],
    });
    const result = removeGroup(rule, MOCK_GROUP_IRI.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_IRI))
    ).toBe(false);
  });

  it("does not delete unrelated groups", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      groups: [MOCK_GROUP_IRI, MOCK_GROUP_OTHER_IRI],
    });
    const result = removeGroup(rule, MOCK_GROUP_IRI.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_IRI))
    ).toBe(false);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_OTHER_IRI)
      )
    ).toBe(true);
  });

  it("does not remove agents, even with matching IRI", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      agents: [MOCK_WEBID_ME],
    });
    const result = removeGroup(rule, MOCK_WEBID_ME.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_ME))
    ).toBe(true);
  });
});

describe("hasPublic", () => {
  it("returns true if the rule applies to the public agent", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      public: true,
    });
    expect(hasPublic(rule)).toBe(true);
  });
  it("returns false if the rule only applies to other agent", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      public: false,
      authenticated: true,
      agents: [MOCK_WEBID_ME],
    });
    expect(hasPublic(rule)).toBe(false);
  });
});

describe("setPublic", () => {
  it("applies to given rule to the public agent", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const result = setPublic(rule, true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_PUBLIC))
    ).toBe(true);
  });

  it("prevents the rule from applying to the public agent", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      public: true,
    });
    const result = setPublic(rule, false);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_PUBLIC))
    ).toBe(false);
  });

  it("does not change the input rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    setPublic(rule, true);
    expect(
      rule.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_PUBLIC))
    ).toBe(false);
  });

  it("does not change the other agents", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      authenticated: true,
      agents: [MOCK_WEBID_ME],
    });
    const result = setPublic(rule, true);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_AUTHENTICATED)
      )
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_ME))
    ).toBe(true);
  });
});

describe("hasAuthenticated", () => {
  it("returns true if the rule applies to authenticated agents", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      authenticated: true,
    });
    expect(hasAuthenticated(rule)).toBe(true);
  });
  it("returns false if the rule only applies to other agent", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      public: true,
      authenticated: false,
      agents: [MOCK_WEBID_ME],
    });
    expect(hasAuthenticated(rule)).toBe(false);
  });
});

describe("setAuthenticated", () => {
  it("applies to given rule to authenticated agents", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const result = setAuthenticated(rule, true);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_AUTHENTICATED)
      )
    ).toBe(true);
  });

  it("prevents the rule from applying to authenticated agents", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      authenticated: true,
    });
    const result = setAuthenticated(rule, false);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_AUTHENTICATED)
      )
    ).toBe(false);
  });

  it("does not change the input rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    setAuthenticated(rule, true);
    expect(
      rule.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_AUTHENTICATED))
    ).toBe(false);
  });

  it("does not change the other agents", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      public: true,
      agents: [MOCK_WEBID_ME],
    });
    const result = setAuthenticated(rule, true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_PUBLIC))
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_ME))
    ).toBe(true);
  });
});

describe("hasCreator", () => {
  it("returns true if the rule applies to the Resource's creator", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      creator: true,
    });
    expect(hasCreator(rule)).toBe(true);
  });
  it("returns false if the rule only applies to other agents", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      public: true,
      creator: false,
      agents: [MOCK_WEBID_ME],
    });
    expect(hasCreator(rule)).toBe(false);
  });
});

describe("setCreator", () => {
  it("applies the given rule to the Resource's creator", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const result = setCreator(rule, true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_CREATOR))
    ).toBe(true);
  });

  it("prevents the rule from applying to the Resource's creator", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      creator: true,
    });
    const result = setCreator(rule, false);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_CREATOR))
    ).toBe(false);
  });

  it("does not change the input rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    setCreator(rule, true);
    expect(
      rule.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_CREATOR))
    ).toBe(false);
  });

  it("does not change the other agents", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      public: true,
      agents: [MOCK_WEBID_ME],
    });
    const result = setCreator(rule, true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, ACP_PUBLIC))
    ).toBe(true);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_ME))
    ).toBe(true);
  });
});

describe("getClientAll", () => {
  it("returns all the clients a rule applies to by WebID", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      clients: [MOCK_CLIENT_WEBID_1, MOCK_CLIENT_WEBID_2],
    });
    const clients = getClientAll(rule);
    expect(clients).toContain(MOCK_CLIENT_WEBID_1.value);
    expect(clients).toContain(MOCK_CLIENT_WEBID_2.value);
    expect(clients).toHaveLength(2);
  });

  it("does not return the agents/groups/public client a rule applies to", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      agents: [MOCK_WEBID_ME],
      groups: [MOCK_GROUP_IRI],
      public: true,
      authenticated: true,
      creator: true,
      publicClient: true,
    });
    const clients = getClientAll(rule);
    expect(clients).not.toContain(MOCK_GROUP_IRI.value);
    expect(clients).not.toContain(ACP_CREATOR.value);
    expect(clients).not.toContain(ACP_AUTHENTICATED.value);
    expect(clients).not.toContain(ACP_PUBLIC.value);
    expect(clients).toHaveLength(0);
  });
});

describe("setClient", () => {
  it("sets the given clients for the rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const result = setClient(rule, MOCK_CLIENT_WEBID_1.value);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, MOCK_CLIENT_WEBID_1)
      )
    ).toBe(true);
  });

  it("deletes any clients previously set for the rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      clients: [MOCK_CLIENT_WEBID_1],
    });
    const result = setClient(rule, MOCK_CLIENT_WEBID_2.value);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, MOCK_CLIENT_WEBID_2)
      )
    ).toBe(true);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, MOCK_CLIENT_WEBID_1)
      )
    ).toBe(false);
  });

  it("does not change the input rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      clients: [MOCK_CLIENT_WEBID_1],
    });
    setClient(rule, MOCK_CLIENT_WEBID_2.value);
    expect(
      rule.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, MOCK_CLIENT_WEBID_2)
      )
    ).toBe(false);
    expect(
      rule.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, MOCK_CLIENT_WEBID_1)
      )
    ).toBe(true);
  });

  it("does not overwrite the public client class", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      publicClient: true,
    });
    const result = setClient(rule, MOCK_CLIENT_WEBID_1.value);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, SOLID_PUBLIC_CLIENT)
      )
    ).toBe(true);
  });
});

describe("addClient", () => {
  it("adds the given client to the rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const result = addClient(rule, MOCK_CLIENT_WEBID_1.value);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, MOCK_CLIENT_WEBID_1)
      )
    ).toBe(true);
  });

  it("does not override existing clients/the public client class", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      clients: [MOCK_CLIENT_WEBID_1],
      publicClient: true,
    });
    const result = addClient(rule, MOCK_CLIENT_WEBID_2.value);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, MOCK_CLIENT_WEBID_1)
      )
    ).toBe(true);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, MOCK_CLIENT_WEBID_2)
      )
    ).toBe(true);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, SOLID_PUBLIC_CLIENT)
      )
    ).toBe(true);
  });
});

describe("removeClient", () => {
  it("removes the given client from the rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      clients: [MOCK_CLIENT_WEBID_1],
    });
    const result = removeClient(rule, MOCK_CLIENT_WEBID_1.value);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, MOCK_CLIENT_WEBID_1)
      )
    ).toBe(false);
  });

  it("does not delete unrelated clients", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      clients: [MOCK_CLIENT_WEBID_1, MOCK_CLIENT_WEBID_2],
      publicClient: true,
    });
    const result = removeClient(rule, MOCK_CLIENT_WEBID_2.value);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, MOCK_CLIENT_WEBID_2)
      )
    ).toBe(false);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, MOCK_CLIENT_WEBID_1)
      )
    ).toBe(true);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, SOLID_PUBLIC_CLIENT)
      )
    ).toBe(true);
  });

  it("does not remove agents, even with a matching IRI", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      agents: [MOCK_WEBID_ME],
    });
    const result = removeClient(rule, MOCK_WEBID_ME.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_AGENT, MOCK_WEBID_ME))
    ).toBe(true);
  });

  it("does not remove groups, even with a matching IRI", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      groups: [MOCK_GROUP_IRI],
    });
    const result = removeClient(rule, MOCK_GROUP_IRI.value);
    expect(
      result.has(DataFactory.quad(MOCKED_RULE_IRI, ACP_GROUP, MOCK_GROUP_IRI))
    ).toBe(true);
  });
});

describe("hasAnyClient", () => {
  it("returns true if the rule applies to any client", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      publicClient: true,
    });
    expect(hasAnyClient(rule)).toBe(true);
  });
  it("returns false if the rule only applies to individual clients", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      clients: [MOCK_CLIENT_WEBID_1],
    });
    expect(hasAnyClient(rule)).toBe(false);
  });
});

describe("setAnyClient", () => {
  it("applies to given rule to the public client class", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    const result = setAnyClient(rule, true);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, SOLID_PUBLIC_CLIENT)
      )
    ).toBe(true);
  });

  it("prevents the rule from applying to the public client class", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      publicClient: true,
    });
    const result = setAnyClient(rule, false);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, SOLID_PUBLIC_CLIENT)
      )
    ).toBe(false);
  });

  it("does not change the input rule", () => {
    const rule = mockRule(MOCKED_RULE_IRI);
    setAnyClient(rule, true);
    expect(
      rule.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, SOLID_PUBLIC_CLIENT)
      )
    ).toBe(false);
  });

  it("does not change the other clients", () => {
    const rule = mockRule(MOCKED_RULE_IRI, {
      clients: [MOCK_CLIENT_WEBID_1],
    });
    const result = setAnyClient(rule, true);
    expect(
      result.has(
        DataFactory.quad(MOCKED_RULE_IRI, ACP_CLIENT, MOCK_CLIENT_WEBID_1)
      )
    ).toBe(true);
  });
});

describe("ruleAsMarkdown", () => {
  it("shows when a rule is empty", () => {
    const rule = createRule("https://some.pod/policyResource#rule");

    expect(ruleAsMarkdown(rule)).toBe(
      "## Rule: https://some.pod/policyResource#rule\n" + "\n" + "<empty>\n"
    );
  });

  it("can show everything to which the rule applies", () => {
    let rule = createRule("https://some.pod/policyResource#rule");
    rule = setCreator(rule, true);
    rule = setAuthenticated(rule, true);
    rule = setPublic(rule, true);
    rule = addAgent(rule, "https://some.pod/profile#agent");
    rule = addAgent(rule, "https://some-other.pod/profile#agent");
    rule = addGroup(rule, "https://some.pod/groups#family");

    expect(ruleAsMarkdown(rule)).toBe(
      "## Rule: https://some.pod/policyResource#rule\n" +
        "\n" +
        "This rule applies to:\n" +
        "- Everyone\n" +
        "- All authenticated agents\n" +
        "- The creator of this resource\n" +
        "- The following agents:\n" +
        "  - https://some.pod/profile#agent\n" +
        "  - https://some-other.pod/profile#agent\n" +
        "- Members of the following groups:\n" +
        "  - https://some.pod/groups#family\n"
    );
  });
});
