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

import { acp, rdf, solid } from "../constants";
import {
  SolidDataset,
  Thing,
  ThingPersisted,
  Url,
  UrlString,
  WebId,
} from "../interfaces";
import { internal_toIriString } from "../interfaces.internal";
import { addIri } from "../thing/add";
import { getIriAll, getUrl } from "../thing/get";
import { removeIri } from "../thing/remove";
import { setIri, setUrl } from "../thing/set";
import {
  asUrl,
  createThing,
  getThing,
  getThingAll,
  removeThing,
  setThing,
} from "../thing/thing";
import { Policy } from "./policy";

export type Rule = ThingPersisted;

/**
 * NOTE: Don't export for now (i.e. if exported, should this be `isAcpRule()` so
 * as not to clash with `isAclRule()`.
 *
 * @param thing the [[Thing]] to check to see if it's an ACP rule or not
 */
function isRule(thing: Thing): thing is Rule {
  return getIriAll(thing, rdf.type).includes(acp.Rule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a rule that refines the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is **not** present in **any** of the required rules,
 * they will not be granted access.
 * @param policy The [[Policy]] to which the rule should be added.
 * @param rule The rule to add to the policy.
 * @returns A new [[Policy]] clone of the original one, with the new rule added.
 * @since Unreleased
 */
export function addRequiredRuleUrl(
  policy: Policy,
  rule: Rule | Url | UrlString
): Policy {
  return addIri(policy, acp.allOf, rule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes a rule that refines the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is **not** present in **any** of the required rules,
 * they will not be granted access.
 * @param policy The [[Policy]] from which the rule should be removed.
 * @param rule The rule to remove from the policy.
 * @returns A new [[Policy]] clone of the original one, with the rule removed.
 * @since Unreleased
 */
export function removeRequiredRuleUrl(
  policy: Policy,
  rule: Rule | Url | UrlString
): Policy {
  return removeIri(policy, acp.allOf, rule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrites the rule refining the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is **not** present in **any** of the required rules,
 * they will not be granted access.
 * @param policy The [[Policy]] to which the rule should be added.
 * @param rules The rules the policy requires.
 * @returns A new [[Policy]] clone of the original one, with the required rules replaced.
 * @since Unreleased
 */
export function setRequiredRuleUrl(
  policy: Policy,
  rule: Rule | Url | UrlString
): Policy {
  return setIri(policy, acp.allOf, rule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[Rule]]'s required by the given [[Policy]]
 * @param policy The [[policy]] from which the rules should be read.
 * @returns A list of the required [[Rule]]'s
 * @since unreleased
 */
export function getRequiredRuleUrlAll(policy: Policy): UrlString[] {
  return getIriAll(policy, acp.allOf);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a rule that extends the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the required rules,
 * they will be granted access.
 * @param policy The [[Policy]] to which the rule should be added.
 * @param rule The rule to add to the policy.
 * @returns A new [[Policy]] clone of the original one, with the new rule added.
 * @since Unreleased
 */
export function addOptionalRuleUrl(
  policy: Policy,
  rule: Rule | Url | UrlString
): Policy {
  return addIri(policy, acp.anyOf, rule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes a rule that extends the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the required rules,
 * they will be granted access.
 * @param policy The [[Policy]] from which the rule should be removed.
 * @param rule The rule to remove from the policy.
 * @returns A new [[Policy]] clone of the original one, with the rule removed.
 * @since Unreleased
 */
export function removeOptionalRuleUrl(
  policy: Policy,
  rule: Rule | Url | UrlString
): Policy {
  return removeIri(policy, acp.anyOf, rule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the rule extending the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the required rules,
 * they will be granted access.
 * @param policy The [[Policy]] to which the rule should be added.
 * @param rules The rules the policy accepts.
 * @returns A new [[Policy]] clone of the original one, with the optional rules replaced.
 * @since Unreleased
 */
export function setOptionalRuleUrl(
  policy: Policy,
  rule: Rule | Url | UrlString
): Policy {
  return setIri(policy, acp.anyOf, rule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[Rule]]'s accepted by the given [[Policy]]
 * @param policy The [[policy]] from which the rules should be read.
 * @returns A list of the optional [[Rule]]'s
 * @since unreleased
 */
export function getOptionalRuleUrlAll(policy: Policy): UrlString[] {
  return getIriAll(policy, acp.anyOf);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Add a rule that restricts the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the forbidden rules,
 * they will **not** be granted access.
 * @param policy The [[Policy]] to which the rule should be added.
 * @param rule The rule to add to the policy.
 * @returns A new [[Policy]] clone of the original one, with the new rule added.
 * @since Unreleased
 */
export function addForbiddenRuleUrl(
  policy: Policy,
  rule: Rule | Url | UrlString
): Policy {
  return addIri(policy, acp.noneOf, rule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes a rule that restricts the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the forbidden rules,
 * they will **not** be granted access.
 * @param policy The [[Policy]] from which the rule should be removed.
 * @param rule The rule to remove from the policy.
 * @returns A new [[Policy]] clone of the original one, with the rule removed.
 * @since Unreleased
 */
export function removeForbiddenRuleUrl(
  policy: Policy,
  rule: Rule | Url | UrlString
): Policy {
  return removeIri(policy, acp.noneOf, rule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Set the rules restrincting the scope of a given the [[Policy]]. If an agent
 * requesting access to a resource is present in **any** of the required rules,
 * they will not be granted access.
 * @param policy The [[Policy]] to which the rule should be added.
 * @param rules The rules the policy accepts.
 * @returns A new [[Policy]] clone of the original one, with the optional rules replaced.
 * @since Unreleased
 */
export function setForbiddenRuleUrl(
  policy: Policy,
  rule: Rule | Url | UrlString
): Policy {
  return setIri(policy, acp.noneOf, rule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[Rule]]'s forbidden by the given [[Policy]]
 * @param policy The [[policy]] from which the rules should be read.
 * @returns A list of the forbidden [[Rule]]'s
 * @since unreleased
 */
export function getForbiddenRuleUrlAll(policy: Policy): UrlString[] {
  return getIriAll(policy, acp.noneOf);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Initialise a new, empty [[Rule]].
 *
 * @param url URL that identifies this [[Rule]].
 */
export function createRule(url: Url | UrlString): Rule {
  const stringUrl = internal_toIriString(url);
  let ruleThing = createThing({ url: stringUrl });
  ruleThing = setUrl(ruleThing, rdf.type, acp.Rule);
  return ruleThing;
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Get the [[Rule]] with the given URL from an [[RuleDataset]].
 *
 * @param ruleResource The Resource that contains the given [[Rule]].
 * @param url URL that identifies this [[Rule]].
 * @returns The requested [[Rule]], if it exists, or `null` if it does not.
 */
export function getRule(
  ruleResource: SolidDataset,
  url: Url | UrlString
): Rule | null {
  const foundThing = getThing(ruleResource, url);
  if (foundThing === null || getUrl(foundThing, rdf.type) !== acp.Rule) {
    return null;
  }
  return foundThing;
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Gets the [[Rule]]s from a [[SolidDataset]].
 *
 * @param ruleResource The Resource that contains (zero of more) [[Rule]]s.
 * @returns The [[Rule]]s contained in this resource.
 */
export function getRuleAll(ruleResource: SolidDataset): Rule[] {
  const things = getThingAll(ruleResource);
  return things.filter(isRule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Removes the given [[Rule]] from the given [[SolidDataset]].
 *
 * @param ruleResource The Resource that contains (zero of more) [[Rule]]s.
 * @returns A new RuleDataset equal to the given Rule Resource, but without the given Rule.
 */
export function removeRule<Dataset extends SolidDataset>(
  ruleResource: Dataset,
  rule: Url | UrlString | Rule
): Dataset {
  return removeThing(ruleResource, rule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Insert the given [[Rule]] into the given [[SolidDataset]], replacing previous
 * instances of that Rule.
 *
 * @param ruleResource The Resource that contains (zero of more) [[Rule]]s.
 * @returns A new RuleDataset equal to the given Rule Resource, but with the given Rule.
 */
export function setRule<Dataset extends SolidDataset>(
  ruleResource: Dataset,
  rule: Rule
): Dataset {
  return setThing(ruleResource, rule);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * List all the agents a [[Rule]] applies **directly** to. This will not include agents
 * that are part of a group the [[Rule]] applies to, nor will it include specific agent
 * classes, such as authenticated or public agents.
 *
 * @param rule The rule from which agents are read.
 * @returns A list of the WebIDs of agents included in the rule.
 * @since Unreleased
 */
export function getAgentAll(rule: Rule): WebId[] {
  return getIriAll(rule, acp.agent).filter(
    (agent: WebId) =>
      agent !== acp.PublicAgent &&
      agent !== acp.AuthenticatedAgent &&
      agent !== acp.CreatorAgent
  );
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the agents the [[Rule]] applies to with the provided agents.
 *
 * @param rule The rule for which agents are set.
 * @param agent The agent the rule should apply to.
 * @returns A copy of the input rule, applying to a different set of agents.
 * @since Unreleased
 */
export function setAgent(rule: Rule, agent: WebId): Rule {
  // Preserve the special agent classes authenticated and public, which we
  // don't want to overwrite with this function.
  const isPublic = hasPublic(rule);
  const isAuthenticated = hasAuthenticated(rule);
  let result = setIri(rule, acp.agent, agent);
  // Restore public and authenticated
  result = setPublic(result, isPublic);
  result = setAuthenticated(result, isAuthenticated);
  return result;
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Apply the [[Rule]] to an additional agent.
 *
 * @param rule The [[Rule]] to be applied to an additional agent.
 * @param agent The agent the [[Rule]] should apply to.
 * @returns A copy of the [[Rule]], applying to an additional agent.
 * @since Unreleased
 */
export function addAgent(rule: Rule, agent: WebId): Rule {
  return addIri(rule, acp.agent, agent);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Prevent the [[Rule]] from applying to a given agent directly. This will not
 * remove the agent from any groups the rule applies to.
 *
 * @param rule The [[Rule]] that should no longer apply to a given agent.
 * @param agent The agent the rule should no longer apply to.
 * @returns A copy of the rule, not applying to the given agent.
 * @since Unreleased
 */
export function removeAgent(rule: Rule, agent: WebId): Rule {
  return removeIri(rule, acp.agent, agent);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Lists all the groups a [[Rule]] applies to.
 *
 * @param rule The rule from which groups are read.
 * @returns A list of the [[URL]]'s of groups included in the rule.
 * @since Unreleased
 */
export function getGroupAll(rule: Rule): UrlString[] {
  return getIriAll(rule, acp.group);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the groups the [[Rule]] applies to with the provided groups.
 *
 * @param rule The rule for which groups are set.
 * @param group The group the rule should apply to.
 * @returns A copy of the input rule, applying to a different set of groups.
 * @since Unreleased
 */
export function setGroup(rule: Rule, group: UrlString): Rule {
  return setIri(rule, acp.group, group);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Apply the [[Rule]] to an additional group.
 *
 * @param rule The [[Rule]] to be applied to an additional group.
 * @param agent The group the [[Rule]] should apply to.
 * @returns A copy of the [[Rule]], applying to an additional group.
 * @since Unreleased
 */
export function addGroup(rule: Rule, group: UrlString): Rule {
  return addIri(rule, acp.group, group);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Prevent the [[Rule]] from applying to a given group.
 *
 * @param rule The [[Rule]] that should no longer apply to a given group.
 * @param agent The group the rule should no longer apply to.
 * @returns A copy of the rule, not applying to the given group.
 * @since Unreleased
 */
export function removeGroup(rule: Rule, group: UrlString): Rule {
  return removeIri(rule, acp.group, group);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the rule applies to any agent.
 *
 * @param rule The rule checked for public access.
 * @returns Whether the rule applies to any agent or not.
 */
export function hasPublic(rule: Rule): boolean {
  return (
    getIriAll(rule, acp.agent).filter((agent) => agent === acp.PublicAgent)
      .length > 0
  );
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Enable or disable a rule from applying to any agent.
 *
 * @param rule The rule being modified.
 * @param hasPublic A boolean indicating whether the rule should apply or not to any agent.
 * @returns A copy of the rule, updated to apply/not apply to any agent.
 * @status Unreleased
 */
export function setPublic(rule: Rule, hasPublic: boolean): Rule {
  return hasPublic
    ? addIri(rule, acp.agent, acp.PublicAgent)
    : removeIri(rule, acp.agent, acp.PublicAgent);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the rule applies to any authenticated agent.
 *
 * @param rule The rule checked for authenticated access.
 * @returns Whether the rule applies to any authenticated agent or not.
 */
export function hasAuthenticated(rule: Rule): boolean {
  return (
    getIriAll(rule, acp.agent).filter(
      (agent) => agent === acp.AuthenticatedAgent
    ).length > 0
  );
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Enable or disable a rule from applying to any authenticated agent.
 *
 * @param rule The rule being modified.
 * @param hasPublic A boolean indicating whether the rule should apply or not to any authenticated agent.
 * @returns A copy of the rule, updated to apply/not apply to any authenticated agent.
 * @status Unreleased
 */
export function setAuthenticated(rule: Rule, authenticated: boolean): Rule {
  return authenticated
    ? addIri(rule, acp.agent, acp.AuthenticatedAgent)
    : removeIri(rule, acp.agent, acp.AuthenticatedAgent);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the rule applies to the creator of the Resource.
 *
 * @param rule The rule checked for authenticated access.
 * @returns Whether the rule applies to the creator of the Resource or not.
 */
export function hasCreator(rule: Rule): boolean {
  return (
    getIriAll(rule, acp.agent).filter((agent) => agent === acp.CreatorAgent)
      .length > 0
  );
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Enable or disable a rule from applying to the creator of the Resource.
 *
 * @param rule The rule being modified.
 * @param hasPublic A boolean indicating whether the rule should apply or not to the creator of the Resource.
 * @returns A copy of the rule, updated to apply/not apply to the creator of the Resource.
 * @status Unreleased
 */
export function setCreator(rule: Rule, creator: boolean): Rule {
  return creator
    ? addIri(rule, acp.agent, acp.CreatorAgent)
    : removeIri(rule, acp.agent, acp.CreatorAgent);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * List all the clients a [[Rule]] applies **directly** to. This will not include
 * specific client classes, such as public clients.
 *
 * @param rule The rule from which clients are read.
 * @returns A list of the WebIDs of clients included in the rule.
 * @since Unreleased
 */
export function getClientAll(rule: Rule): WebId[] {
  return getIriAll(rule, acp.client).filter(
    (client: WebId) => client !== solid.PublicOidcClient
  );
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the clients the [[Rule]] applies to with the provided Client.
 *
 * @param rule The rule for which clients are set.
 * @param client The Client the rule should apply to.
 * @returns A copy of the input rule, applying to a different set of Clients.
 * @since Unreleased
 */
export function setClient(rule: Rule, client: WebId): Rule {
  // Preserve the special "any client" class, which we
  // don't want to overwrite with this function.
  const anyClientEnabled = hasAnyClient(rule);
  let result = setIri(rule, acp.client, client);
  // Restore the "any client" class
  result = setAnyClient(result, anyClientEnabled);
  return result;
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Apply the [[Rule]] to an additional Client.
 *
 * @param rule The [[Rule]] to be applied to an additional Client.
 * @param client The Client the [[Rule]] should apply to.
 * @returns A copy of the [[Rule]], applying to an additional Client.
 * @since Unreleased
 */
export function addClient(rule: Rule, client: WebId): Rule {
  return addIri(rule, acp.client, client);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Prevent the [[Rule]] from applying to a given Client directly.
 *
 * @param rule The [[Rule]] that should no longer apply to a given Client.
 * @param client The Client the rule should no longer apply to.
 * @returns A copy of the rule, not applying to the given Client.
 * @since Unreleased
 */
export function removeClient(rule: Rule, client: WebId): Rule {
  return removeIri(rule, acp.client, client);
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Check if the rule applies to any client, i.e. all the applications
 * regardless of their identifier.
 *
 * @param rule The rule checked for authenticated access.
 * @returns Whether the rule applies to public clients.
 */
export function hasAnyClient(rule: Rule): boolean {
  return (
    getIriAll(rule, acp.client).filter(
      (client) => client === solid.PublicOidcClient
    ).length > 0
  );
}

/**
 * ```{note} There is no Access Control Policies specification yet. As such, this
 * function is still experimental and subject to change, even in a non-major release.
 * ```
 *
 * Overwrite the clients the [[Rule]] applies to with the provided client.
 *
 * @param rule The rule for which clients are set.
 * @param anyClient Whether the Rule applies to any client, i.e. all the
 * applications regardless of their identifier.
 * @returns A copy of the rule, updated to apply/not apply to any client
 * @since Unreleased
 */
export function setAnyClient(rule: Rule, anyClient: boolean): Rule {
  return anyClient
    ? addIri(rule, acp.client, solid.PublicOidcClient)
    : removeIri(rule, acp.client, solid.PublicOidcClient);
}

/**
 * Gets a human-readable representation of the given [[Rule]] to aid debugging.
 *
 * Note that changes to the exact format of the return value are not considered a breaking change;
 * it is intended to aid in debugging, not as a serialisation method that can be reliably parsed.
 *
 * @param rule The Rule to get a human-readable representation of.
 */
export function ruleAsMarkdown(rule: Rule): string {
  let markdown = `## Rule: ${asUrl(rule)}\n\n`;

  let targetEnumeration = "";
  if (hasPublic(rule)) {
    targetEnumeration += "- Everyone\n";
  }
  if (hasAuthenticated(rule)) {
    targetEnumeration += "- All authenticated agents\n";
  }
  if (hasCreator(rule)) {
    targetEnumeration += "- The creator of this resource\n";
  }
  const targetAgents = getAgentAll(rule);
  if (targetAgents.length > 0) {
    targetEnumeration += "- The following agents:\n  - ";
    targetEnumeration += targetAgents.join("\n  - ") + "\n";
  }
  const targetGroups = getGroupAll(rule);
  if (targetGroups.length > 0) {
    targetEnumeration += "- Members of the following groups:\n  - ";
    targetEnumeration += targetGroups.join("\n  - ") + "\n";
  }

  markdown +=
    targetEnumeration.length > 0
      ? "This rule applies to:\n" + targetEnumeration
      : "<empty>\n";

  return markdown;
}
