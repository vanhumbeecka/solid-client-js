import {
  getOneStringInLocale,
  getOneStringUnlocalized,
  getOneInteger,
  getOneDecimal,
  getOneBoolean,
  getOneDatetime,
  getOneIri,
  getOneLiteral,
  getOneNamedNode,
  getAllIris,
  getAllStringUnlocalizeds,
  getAllStringsInLocale,
  getAllIntegers,
  getAllDecimals,
  getAllBooleans,
  getAllDatetimes,
  getAllLiterals,
  getAllNamedNodes,
} from "./get";
import { dataset } from "@rdfjs/dataset";
import { NamedNode, Quad, Literal } from "rdf-js";
import { DataFactory } from "n3";
import { IriString, Thing } from "../index";

function getMockQuadWithLiteralFor(
  predicate: IriString,
  literalValue: string,
  literalType: "string" | "integer" | "decimal" | "boolean" | "dateTime"
): Quad {
  const quad = DataFactory.quad(
    DataFactory.namedNode("https://arbitrary.vocab/subject"),
    DataFactory.namedNode(predicate),
    DataFactory.literal(
      literalValue,
      DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#" + literalType)
    )
  );
  return quad;
}
function getMockThingWithLiteralFor(
  predicate: IriString,
  literalValue: string,
  literalType: "string" | "integer" | "decimal" | "boolean" | "dateTime"
): Thing {
  const quad = getMockQuadWithLiteralFor(predicate, literalValue, literalType);
  const thing = dataset();
  thing.add(quad);

  return Object.assign(thing, { iri: "https://arbitrary.vocab/subject" });
}
function getMockThingWithLiteralsFor(
  predicate: IriString,
  literal1Value: string,
  literal2Value: string,
  literalType: "string" | "integer" | "decimal" | "boolean" | "dateTime"
): Thing {
  const quad1 = getMockQuadWithLiteralFor(
    predicate,
    literal1Value,
    literalType
  );
  const quad2 = getMockQuadWithLiteralFor(
    predicate,
    literal2Value,
    literalType
  );
  const thing = dataset();
  thing.add(quad1);
  thing.add(quad2);

  return Object.assign(thing, { iri: "https://arbitrary.vocab/subject" });
}

describe("getOneIri", () => {
  function getMockQuadWithIri(
    predicate: IriString,
    iri: IriString = "https://arbitrary.vocab/object"
  ): Quad {
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode(predicate),
      DataFactory.namedNode(iri)
    );
    return quad;
  }
  function getMockThingWithIri(
    predicate: IriString,
    iri: IriString = "https://arbitrary.vocab/object"
  ): Thing {
    const quad = getMockQuadWithIri(predicate, iri);
    const thing = dataset();
    thing.add(quad);

    return Object.assign(thing, { iri: "https://arbitrary.vocab/subject" });
  }

  it("returns the IRI value for the given Predicate", () => {
    const thingWithIri = getMockThingWithIri(
      "https://some.vocab/predicate",
      "https://some.vocab/object"
    );

    expect(getOneIri(thingWithIri, "https://some.vocab/predicate")).toBe(
      "https://some.vocab/object"
    );
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithIri = getMockThingWithIri(
      "https://some.vocab/predicate",
      "https://some.vocab/object"
    );

    expect(
      getOneIri(
        thingWithIri,
        DataFactory.namedNode("https://some.vocab/predicate")
      )
    ).toBe("https://some.vocab/object");
  });

  it("returns null if no IRI value was found", () => {
    const thingWithoutIri = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getOneIri(thingWithoutIri, "https://some.vocab/predicate")
    ).toBeNull();
  });

  it("does not return non-IRI values", () => {
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );
    thingWithDifferentDatatypes.add(
      getMockQuadWithIri(
        "https://some.vocab/predicate",
        "https://some.vocab/object"
      )
    );
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      getOneIri(thingWithDifferentDatatypes, "https://some.vocab/predicate")
    ).toBe("https://some.vocab/object");
  });

  it("returns null if no IRI value was found for the given Predicate", () => {
    const thingWithIri = getMockThingWithIri("https://some.vocab/predicate");

    expect(
      getOneIri(thingWithIri, "https://some-other.vocab/predicate")
    ).toBeNull();
  });
});

describe("getAllIris", () => {
  function getMockQuadWithIri(
    predicate: IriString,
    iri: IriString = "https://arbitrary.vocab/object"
  ): Quad {
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode(predicate),
      DataFactory.namedNode(iri)
    );
    return quad;
  }
  function getMockThingWithIris(
    predicate: IriString,
    iri1: IriString = "https://arbitrary.vocab/object1",
    iri2: IriString = "https://arbitrary.vocab/object2"
  ): Thing {
    const quad1 = getMockQuadWithIri(predicate, iri1);
    const quad2 = getMockQuadWithIri(predicate, iri2);
    const thing = dataset();
    thing.add(quad1);
    thing.add(quad2);

    return Object.assign(thing, { iri: "https://arbitrary.vocab/subject" });
  }

  it("returns the IRI values for the given Predicate", () => {
    const thingWithIris = getMockThingWithIris(
      "https://some.vocab/predicate",
      "https://some.vocab/object1",
      "https://some.vocab/object2"
    );

    expect(getAllIris(thingWithIris, "https://some.vocab/predicate")).toEqual([
      "https://some.vocab/object1",
      "https://some.vocab/object2",
    ]);
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithIris = getMockThingWithIris(
      "https://some.vocab/predicate",
      "https://some.vocab/object1",
      "https://some.vocab/object2"
    );

    expect(
      getAllIris(
        thingWithIris,
        DataFactory.namedNode("https://some.vocab/predicate")
      )
    ).toEqual(["https://some.vocab/object1", "https://some.vocab/object2"]);
  });

  it("returns an empty array if no IRI value was found", () => {
    const thingWithoutIris = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getAllIris(thingWithoutIris, "https://some.vocab/predicate")
    ).toEqual([]);
  });

  it("does not return non-IRI values", () => {
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );
    thingWithDifferentDatatypes.add(
      getMockQuadWithIri(
        "https://some.vocab/predicate",
        "https://some.vocab/object"
      )
    );

    expect(
      getAllIris(thingWithDifferentDatatypes, "https://some.vocab/predicate")
    ).toEqual(["https://some.vocab/object"]);
  });

  it("returns an empty array if no IRI value was found for the given Predicate", () => {
    const thingWithIri = getMockThingWithIris("https://some.vocab/predicate");

    expect(
      getAllIris(thingWithIri, "https://some-other.vocab/predicate")
    ).toEqual([]);
  });
});

describe("getOneStringUnlocalized", () => {
  it("returns the string value for the given Predicate", () => {
    const thingWithStringUnlocalized = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Some value",
      "string"
    );

    expect(
      getOneStringUnlocalized(
        thingWithStringUnlocalized,
        "https://some.vocab/predicate"
      )
    ).toBe("Some value");
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithStringUnlocalized = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Some value",
      "string"
    );

    expect(
      getOneStringUnlocalized(
        thingWithStringUnlocalized,
        DataFactory.namedNode("https://some.vocab/predicate")
      )
    ).toBe("Some value");
  });

  it("returns null if no string value was found", () => {
    const thingWithoutStringUnlocalized = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getOneStringUnlocalized(
        thingWithoutStringUnlocalized,
        "https://some.vocab/predicate"
      )
    ).toBeNull();
  });

  it("does not return non-string values", () => {
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );
    thingWithDifferentDatatypes.add(
      getMockQuadWithLiteralFor(
        "https://some.vocab/predicate",
        "Some value",
        "string"
      )
    );
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      getOneStringUnlocalized(
        thingWithDifferentDatatypes,
        "https://some.vocab/predicate"
      )
    ).toBe("Some value");
  });

  it("returns null if no string value was found for the given Predicate", () => {
    const thingWithStringUnlocalized = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary value",
      "string"
    );

    expect(
      getOneStringUnlocalized(
        thingWithStringUnlocalized,
        "https://some-other.vocab/predicate"
      )
    ).toBeNull();
  });
});

describe("getAllStringUnlocalizeds", () => {
  it("returns the string values for the given Predicate", () => {
    const thingWithStringUnlocalizeds = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "Some value 1",
      "Some value 2",
      "string"
    );

    expect(
      getAllStringUnlocalizeds(
        thingWithStringUnlocalizeds,
        "https://some.vocab/predicate"
      )
    ).toEqual(["Some value 1", "Some value 2"]);
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithStringUnlocalizeds = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "Some value 1",
      "Some value 2",
      "string"
    );

    expect(
      getAllStringUnlocalizeds(
        thingWithStringUnlocalizeds,
        DataFactory.namedNode("https://some.vocab/predicate")
      )
    ).toEqual(["Some value 1", "Some value 2"]);
  });

  it("returns an empty array if no string values were found", () => {
    const thingWithoutStringUnlocalizeds = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getAllStringUnlocalizeds(
        thingWithoutStringUnlocalizeds,
        "https://some.vocab/predicate"
      )
    ).toEqual([]);
  });

  it("does not return non-string values", () => {
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );
    thingWithDifferentDatatypes.add(
      getMockQuadWithLiteralFor(
        "https://some.vocab/predicate",
        "Some value",
        "string"
      )
    );
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      getAllStringUnlocalizeds(
        thingWithDifferentDatatypes,
        "https://some.vocab/predicate"
      )
    ).toEqual(["Some value"]);
  });

  it("returns an empty array if no string values were found for the given Predicate", () => {
    const thingWithStringUnlocalized = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary value",
      "string"
    );

    expect(
      getAllStringUnlocalizeds(
        thingWithStringUnlocalized,
        "https://some-other.vocab/predicate"
      )
    ).toEqual([]);
  });
});

describe("getOneStringInLocale", () => {
  it("returns the string value for the given Predicate in the given locale", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithLocaleString = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getOneStringInLocale(
        thingWithLocaleString,
        "https://some.vocab/predicate",
        "nl-NL"
      )
    ).toBe("Some value");
  });

  it("accepts Predicates as Named Nodes", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithLocaleString = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getOneStringInLocale(
        thingWithLocaleString,
        DataFactory.namedNode("https://some.vocab/predicate"),
        "nl-NL"
      )
    ).toBe("Some value");
  });

  it("supports matching locales with different casing", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithLocaleString = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getOneStringInLocale(
        thingWithLocaleString,
        "https://some.vocab/predicate",
        "NL-nL"
      )
    ).toBe("Some value");
  });

  it("returns null if no locale string value was found", () => {
    const thingWithoutStringUnlocalized = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getOneStringInLocale(
        thingWithoutStringUnlocalized,
        "https://some.vocab/predicate",
        "nl-NL"
      )
    ).toBeNull();
  });

  it("returns null if no locale string with the requested locale was found", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithDifferentLocaleString = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getOneStringInLocale(
        thingWithDifferentLocaleString,
        "https://some.vocab/predicate",
        "en-GB"
      )
    ).toBeNull();
    expect(
      getOneStringInLocale(
        thingWithDifferentLocaleString,
        "https://some.vocab/predicate",
        "nl"
      )
    ).toBeNull();
  });

  it("does not return non-locale-string values", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quadWithLocaleString = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );
    thingWithDifferentDatatypes.add(quadWithLocaleString);
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      getOneStringInLocale(
        thingWithDifferentDatatypes,
        "https://some.vocab/predicate",
        "nl-NL"
      )
    ).toBe("Some value");
  });

  it("returns null if no locale string was found for the given Predicate", () => {
    const literalWithLocale = DataFactory.literal("Arbitrary value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithLocaleString = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getOneStringInLocale(
        thingWithLocaleString,
        "https://some-other.vocab/predicate",
        "nl-NL"
      )
    ).toBeNull();
  });
});

describe("getAllStringsInLocale", () => {
  it("returns the string values for the given Predicate in the given locale", () => {
    const literalWithLocale1 = DataFactory.literal("Some value 1", "nl-NL");
    const quad1 = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale1
    );
    const literalWithLocale2 = DataFactory.literal("Some value 2", "nl-NL");
    const quad2 = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale2
    );
    const thing = dataset();
    thing.add(quad1);
    thing.add(quad2);
    const thingWithLocaleStrings = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getAllStringsInLocale(
        thingWithLocaleStrings,
        "https://some.vocab/predicate",
        "nl-NL"
      )
    ).toEqual(["Some value 1", "Some value 2"]);
  });

  it("accepts Predicates as Named Nodes", () => {
    const literalWithLocale1 = DataFactory.literal("Some value 1", "nl-NL");
    const quad1 = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale1
    );
    const literalWithLocale2 = DataFactory.literal("Some value 2", "nl-NL");
    const quad2 = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale2
    );
    const thing = dataset();
    thing.add(quad1);
    thing.add(quad2);
    const thingWithLocaleStrings = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getAllStringsInLocale(
        thingWithLocaleStrings,
        DataFactory.namedNode("https://some.vocab/predicate"),
        "nl-NL"
      )
    ).toEqual(["Some value 1", "Some value 2"]);
  });

  it("supports matching locales with different casing", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithLocaleString = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getAllStringsInLocale(
        thingWithLocaleString,
        "https://some.vocab/predicate",
        "NL-nL"
      )
    ).toEqual(["Some value"]);
  });

  it("returns an empty array if no locale string values were found", () => {
    const thingWithoutStringUnlocalizeds = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getAllStringsInLocale(
        thingWithoutStringUnlocalizeds,
        "https://some.vocab/predicate",
        "nl-NL"
      )
    ).toEqual([]);
  });

  it("returns an empty array if no locale strings with the requested locale were found", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithDifferentLocaleStrings = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getAllStringsInLocale(
        thingWithDifferentLocaleStrings,
        "https://some.vocab/predicate",
        "en-GB"
      )
    ).toEqual([]);
    expect(
      getAllStringsInLocale(
        thingWithDifferentLocaleStrings,
        "https://some.vocab/predicate",
        "nl"
      )
    ).toEqual([]);
  });

  it("does not return non-locale-string values", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quadWithLocaleString = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );
    thingWithDifferentDatatypes.add(quadWithLocaleString);
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      getAllStringsInLocale(
        thingWithDifferentDatatypes,
        "https://some.vocab/predicate",
        "nl-NL"
      )
    ).toEqual(["Some value"]);
  });

  it("returns an empty array if no locale strings were found for the given Predicate", () => {
    const literalWithLocale = DataFactory.literal("Arbitrary value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithLocaleString = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getAllStringsInLocale(
        thingWithLocaleString,
        "https://some-other.vocab/predicate",
        "nl-NL"
      )
    ).toEqual([]);
  });
});

describe("getOneStringInLocale", () => {
  it("returns the string value for the given Predicate in the given locale", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithLocaleString = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getOneStringInLocale(
        thingWithLocaleString,
        "https://some.vocab/predicate",
        "nl-NL"
      )
    ).toBe("Some value");
  });

  it("accepts Predicates as Named Nodes", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithLocaleString = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getOneStringInLocale(
        thingWithLocaleString,
        DataFactory.namedNode("https://some.vocab/predicate"),
        "nl-NL"
      )
    ).toBe("Some value");
  });

  it("supports matching locales with different casing", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithLocaleString = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getOneStringInLocale(
        thingWithLocaleString,
        "https://some.vocab/predicate",
        "NL-nL"
      )
    ).toBe("Some value");
  });

  it("returns null if no locale string value was found", () => {
    const thingWithoutStringUnlocalized = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getOneStringInLocale(
        thingWithoutStringUnlocalized,
        "https://some.vocab/predicate",
        "nl-NL"
      )
    ).toBeNull();
  });

  it("returns null if no locale string with the requested locale was found", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithDifferentLocaleString = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getOneStringInLocale(
        thingWithDifferentLocaleString,
        "https://some.vocab/predicate",
        "en-GB"
      )
    ).toBeNull();
    expect(
      getOneStringInLocale(
        thingWithDifferentLocaleString,
        "https://some.vocab/predicate",
        "nl"
      )
    ).toBeNull();
  });

  it("does not return non-locale-string values", () => {
    const literalWithLocale = DataFactory.literal("Some value", "nl-NL");
    const quadWithLocaleString = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );
    thingWithDifferentDatatypes.add(quadWithLocaleString);
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      getOneStringInLocale(
        thingWithDifferentDatatypes,
        "https://some.vocab/predicate",
        "nl-NL"
      )
    ).toBe("Some value");
  });

  it("returns null if no locale string was found for the given Predicate", () => {
    const literalWithLocale = DataFactory.literal("Arbitrary value", "nl-NL");
    const quad = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode("https://some.vocab/predicate"),
      literalWithLocale
    );
    const thing = dataset();
    thing.add(quad);
    const thingWithLocaleString = Object.assign(thing, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getOneStringInLocale(
        thingWithLocaleString,
        "https://some-other.vocab/predicate",
        "nl-NL"
      )
    ).toBeNull();
  });
});

describe("getOneInteger", () => {
  it("returns the integer value for the given Predicate", () => {
    const thingWithInteger = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getOneInteger(thingWithInteger, "https://some.vocab/predicate")
    ).toBe(42);
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithInteger = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getOneInteger(
        thingWithInteger,
        DataFactory.namedNode("https://some.vocab/predicate")
      )
    ).toBe(42);
  });

  it("returns null if no integer value was found", () => {
    const thingWithoutInteger = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "13.37",
      "decimal"
    );

    expect(
      getOneInteger(thingWithoutInteger, "https://some.vocab/predicate")
    ).toBeNull();
  });

  it("does not return non-integer values", () => {
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary value",
      "string"
    );
    thingWithDifferentDatatypes.add(
      getMockQuadWithLiteralFor("https://some.vocab/predicate", "42", "integer")
    );
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      getOneInteger(thingWithDifferentDatatypes, "https://some.vocab/predicate")
    ).toBe(42);
  });

  it("returns null if no integer value was found for the given Predicate", () => {
    const thingWithInteger = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getOneInteger(thingWithInteger, "https://some-other.vocab/predicate")
    ).toBeNull();
  });
});

describe("getAllIntegers", () => {
  it("returns the integer values for the given Predicate", () => {
    const thingWithIntegers = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "42",
      "1337",
      "integer"
    );

    expect(
      getAllIntegers(thingWithIntegers, "https://some.vocab/predicate")
    ).toEqual([42, 1337]);
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithIntegers = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "42",
      "1337",
      "integer"
    );

    expect(
      getAllIntegers(
        thingWithIntegers,
        DataFactory.namedNode("https://some.vocab/predicate")
      )
    ).toEqual([42, 1337]);
  });

  it("returns an empty array if no integer values were found", () => {
    const thingWithoutIntegers = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "13.37",
      "decimal"
    );

    expect(
      getAllIntegers(thingWithoutIntegers, "https://some.vocab/predicate")
    ).toEqual([]);
  });

  it("does not return non-integer values", () => {
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary value",
      "string"
    );
    thingWithDifferentDatatypes.add(
      getMockQuadWithLiteralFor("https://some.vocab/predicate", "42", "integer")
    );
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      getAllIntegers(
        thingWithDifferentDatatypes,
        "https://some.vocab/predicate"
      )
    ).toEqual([42]);
  });

  it("returns an empty array if no integer values were found for the given Predicate", () => {
    const thingWithInteger = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getAllIntegers(thingWithInteger, "https://some-other.vocab/predicate")
    ).toEqual([]);
  });
});

describe("getOneDecimal", () => {
  it("returns the decimal value for the given Predicate", () => {
    const thingWithDecimal = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "13.37",
      "decimal"
    );

    expect(
      getOneDecimal(thingWithDecimal, "https://some.vocab/predicate")
    ).toBe(13.37);
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithDecimal = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "13.37",
      "decimal"
    );

    expect(
      getOneDecimal(
        thingWithDecimal,
        DataFactory.namedNode("https://some.vocab/predicate")
      )
    ).toBe(13.37);
  });

  it("returns null if no decimal value was found", () => {
    const thingWithoutDecimal = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getOneDecimal(thingWithoutDecimal, "https://some.vocab/predicate")
    ).toBeNull();
  });

  it("does not return non-decimal values", () => {
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary value",
      "string"
    );
    thingWithDifferentDatatypes.add(
      getMockQuadWithLiteralFor(
        "https://some.vocab/predicate",
        "13.37",
        "decimal"
      )
    );
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      getOneDecimal(thingWithDifferentDatatypes, "https://some.vocab/predicate")
    ).toBe(13.37);
  });

  it("returns null if no decimal value was found for the given Predicate", () => {
    const thingWithDecimal = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "13.37",
      "decimal"
    );

    expect(
      getOneDecimal(thingWithDecimal, "https://some-other.vocab/predicate")
    ).toBeNull();
  });
});

describe("getAllDecimals", () => {
  it("returns the decimal values for the given Predicate", () => {
    const thingWithDecimals = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "13.37",
      "7.2",
      "decimal"
    );

    expect(
      getAllDecimals(thingWithDecimals, "https://some.vocab/predicate")
    ).toEqual([13.37, 7.2]);
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithDecimals = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "13.37",
      "7.2",
      "decimal"
    );

    expect(
      getAllDecimals(
        thingWithDecimals,
        DataFactory.namedNode("https://some.vocab/predicate")
      )
    ).toEqual([13.37, 7.2]);
  });

  it("returns an empty array if no decimal values were found", () => {
    const thingWithoutDecimals = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getAllDecimals(thingWithoutDecimals, "https://some.vocab/predicate")
    ).toEqual([]);
  });

  it("does not return non-decimal values", () => {
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary value",
      "string"
    );
    thingWithDifferentDatatypes.add(
      getMockQuadWithLiteralFor(
        "https://some.vocab/predicate",
        "13.37",
        "decimal"
      )
    );
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      getAllDecimals(
        thingWithDifferentDatatypes,
        "https://some.vocab/predicate"
      )
    ).toEqual([13.37]);
  });

  it("returns an empty array if no decimal values were found for the given Predicate", () => {
    const thingWithDecimal = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "13.37",
      "decimal"
    );

    expect(
      getAllDecimals(thingWithDecimal, "https://some-other.vocab/predicate")
    ).toEqual([]);
  });
});

describe("getOneBoolean", () => {
  it("returns the boolean value for the given Predicate", () => {
    const thingWithBoolean = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "1",
      "boolean"
    );

    expect(
      getOneBoolean(thingWithBoolean, "https://some.vocab/predicate")
    ).toBe(true);
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithBoolean = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "0",
      "boolean"
    );

    expect(
      getOneBoolean(
        thingWithBoolean,
        DataFactory.namedNode("https://some.vocab/predicate")
      )
    ).toBe(false);
  });

  it("returns null if no boolean value was found", () => {
    const thingWithoutBoolean = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getOneBoolean(thingWithoutBoolean, "https://some.vocab/predicate")
    ).toBeNull();
  });

  it("does not return non-boolean values", () => {
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary value",
      "string"
    );
    thingWithDifferentDatatypes.add(
      getMockQuadWithLiteralFor("https://some.vocab/predicate", "1", "boolean")
    );
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      getOneBoolean(thingWithDifferentDatatypes, "https://some.vocab/predicate")
    ).toBe(true);
  });

  it("returns null if no boolean value was found for the given Predicate", () => {
    const thingWithBoolean = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "1",
      "boolean"
    );

    expect(
      getOneBoolean(thingWithBoolean, "https://some-other.vocab/predicate")
    ).toBeNull();
  });

  it("returns null if an invalid value, marked as boolean, was found for the given Predicate", () => {
    const thingWithNonBoolean = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Not a boolean",
      "boolean"
    );

    expect(
      getOneBoolean(thingWithNonBoolean, "https://some.vocab/predicate")
    ).toBeNull();
  });
});

describe("getAllBooleans", () => {
  it("returns the boolean values for the given Predicate", () => {
    const thingWithBooleans = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "1",
      "0",
      "boolean"
    );

    expect(
      getAllBooleans(thingWithBooleans, "https://some.vocab/predicate")
    ).toEqual([true, false]);
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithBooleans = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "1",
      "0",
      "boolean"
    );

    expect(
      getAllBooleans(
        thingWithBooleans,
        DataFactory.namedNode("https://some.vocab/predicate")
      )
    ).toEqual([true, false]);
  });

  it("returns an empty array if no boolean values were found", () => {
    const thingWithoutBooleans = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getAllBooleans(thingWithoutBooleans, "https://some.vocab/predicate")
    ).toEqual([]);
  });

  it("does not return non-boolean values", () => {
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary value",
      "string"
    );
    thingWithDifferentDatatypes.add(
      getMockQuadWithLiteralFor("https://some.vocab/predicate", "1", "boolean")
    );
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      getAllBooleans(
        thingWithDifferentDatatypes,
        "https://some.vocab/predicate"
      )
    ).toEqual([true]);
  });

  it("returns an empty array if no boolean values were found for the given Predicate", () => {
    const thingWithBoolean = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "1",
      "boolean"
    );

    expect(
      getAllBooleans(thingWithBoolean, "https://some-other.vocab/predicate")
    ).toEqual([]);
  });

  it("does not include invalid values marked as boolean", () => {
    const thingWithNonBoolean = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "Not a boolean",
      "0",
      "boolean"
    );

    expect(
      getAllBooleans(thingWithNonBoolean, "https://some.vocab/predicate")
    ).toEqual([false]);
  });
});

describe("getOneDatetime", () => {
  it("returns the datetime value for the given Predicate", () => {
    const thingWithDatetime = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "1990-11-12T13:37:42Z",
      "dateTime"
    );
    const expectedDate = new Date(Date.UTC(1990, 10, 12, 13, 37, 42, 0));

    expect(
      getOneDatetime(thingWithDatetime, "https://some.vocab/predicate")
    ).toEqual(expectedDate);
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithDatetime = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "1990-11-12T13:37:42Z",
      "dateTime"
    );
    const expectedDate = new Date(Date.UTC(1990, 10, 12, 13, 37, 42, 0));

    expect(
      getOneDatetime(
        thingWithDatetime,
        DataFactory.namedNode("https://some.vocab/predicate")
      )
    ).toEqual(expectedDate);
  });

  it("returns null if no datetime value was found", () => {
    const thingWithoutDatetime = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getOneDatetime(thingWithoutDatetime, "https://some.vocab/predicate")
    ).toBeNull();
  });

  it("does not return non-datetime values", () => {
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary value",
      "string"
    );
    thingWithDifferentDatatypes.add(
      getMockQuadWithLiteralFor(
        "https://some.vocab/predicate",
        "1990-11-12T13:37:42Z",
        "dateTime"
      )
    );
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );
    const expectedDate = new Date(Date.UTC(1990, 10, 12, 13, 37, 42, 0));

    expect(
      getOneDatetime(
        thingWithDifferentDatatypes,
        "https://some.vocab/predicate"
      )
    ).toEqual(expectedDate);
  });

  it("returns null if no datetime value was found for the given Predicate", () => {
    const thingWithDatetime = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "1990-11-12T13:37:42Z",
      "dateTime"
    );

    expect(
      getOneDatetime(thingWithDatetime, "https://some-other.vocab/predicate")
    ).toBeNull();
  });

  it("returns null if an invalid value, marked as datetime, was found for the given Predicate", () => {
    const thingWithNonDatetime = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Not a datetime",
      "dateTime"
    );

    expect(
      getOneDatetime(thingWithNonDatetime, "https://some.vocab/predicate")
    ).toBeNull();
  });
});

describe("getAllDatetimes", () => {
  it("returns the datetime values for the given Predicate", () => {
    const thingWithDatetimes = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "1955-06-08T13:37:42Z",
      "1990-11-12T13:37:42Z",
      "dateTime"
    );
    const expectedDate1 = new Date(Date.UTC(1955, 5, 8, 13, 37, 42, 0));
    const expectedDate2 = new Date(Date.UTC(1990, 10, 12, 13, 37, 42, 0));

    expect(
      getAllDatetimes(thingWithDatetimes, "https://some.vocab/predicate")
    ).toEqual([expectedDate1, expectedDate2]);
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithDatetimes = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "1955-06-08T13:37:42Z",
      "1990-11-12T13:37:42Z",
      "dateTime"
    );
    const expectedDate1 = new Date(Date.UTC(1955, 5, 8, 13, 37, 42, 0));
    const expectedDate2 = new Date(Date.UTC(1990, 10, 12, 13, 37, 42, 0));

    expect(
      getAllDatetimes(
        thingWithDatetimes,
        DataFactory.namedNode("https://some.vocab/predicate")
      )
    ).toEqual([expectedDate1, expectedDate2]);
  });

  it("returns an empty array if no datetime values were found", () => {
    const thingWithoutDatetimes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "42",
      "integer"
    );

    expect(
      getAllDatetimes(thingWithoutDatetimes, "https://some.vocab/predicate")
    ).toEqual([]);
  });

  it("does not return non-datetime values", () => {
    const thingWithDifferentDatatypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary value",
      "string"
    );
    thingWithDifferentDatatypes.add(
      getMockQuadWithLiteralFor(
        "https://some.vocab/predicate",
        "1990-11-12T13:37:42Z",
        "dateTime"
      )
    );
    thingWithDifferentDatatypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );
    const expectedDate = new Date(Date.UTC(1990, 10, 12, 13, 37, 42, 0));

    expect(
      getAllDatetimes(
        thingWithDifferentDatatypes,
        "https://some.vocab/predicate"
      )
    ).toEqual([expectedDate]);
  });

  it("returns an empty array if no datetime values were found for the given Predicate", () => {
    const thingWithDatetime = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "1990-11-12T13:37:42Z",
      "dateTime"
    );

    expect(
      getAllDatetimes(thingWithDatetime, "https://some-other.vocab/predicate")
    ).toEqual([]);
  });

  it("does not return invalid values marked as datetime", () => {
    const thingWithNonDatetime = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "Not a datetime",
      "1990-11-12T13:37:42Z",
      "dateTime"
    );

    const expectedDate = new Date(Date.UTC(1990, 10, 12, 13, 37, 42, 0));

    expect(
      getAllDatetimes(thingWithNonDatetime, "https://some.vocab/predicate")
    ).toEqual([expectedDate]);
  });
});

describe("getOneLiteral", () => {
  it("returns the Literal for the given Predicate", () => {
    const thingWithLiteral = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Some string",
      "string"
    );

    const foundLiteral = getOneLiteral(
      thingWithLiteral,
      "https://some.vocab/predicate"
    );
    expect(foundLiteral).not.toBeNull();
    expect((foundLiteral as Literal).termType).toBe("Literal");
    expect((foundLiteral as Literal).value).toBe("Some string");
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithLiteral = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Some string",
      "string"
    );

    const foundLiteral = getOneLiteral(
      thingWithLiteral,
      DataFactory.namedNode("https://some.vocab/predicate")
    );
    expect(foundLiteral).not.toBeNull();
    expect((foundLiteral as Literal).termType).toBe("Literal");
    expect((foundLiteral as Literal).value).toBe("Some string");
  });

  it("returns null if no Literal value was found", () => {
    const plainDataset = dataset();

    const thingWithoutLiteral: Thing = Object.assign(plainDataset, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getOneLiteral(thingWithoutLiteral, "https://some.vocab/predicate")
    ).toBeNull();
  });

  it("does not return non-Literal values", () => {
    const thingWithDifferentTermTypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary string",
      "string"
    );
    thingWithDifferentTermTypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      (getOneLiteral(
        thingWithDifferentTermTypes,
        "https://some.vocab/predicate"
      ) as Literal).termType
    ).toBe("Literal");
  });
});

describe("getAllLiterals", () => {
  it("returns the Literals for the given Predicate", () => {
    const thingWithLiterals = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "Some string 1",
      "Some string 2",
      "string"
    );

    const foundLiterals = getAllLiterals(
      thingWithLiterals,
      "https://some.vocab/predicate"
    );
    expect(foundLiterals.length).toBe(2);
    expect((foundLiterals[0] as Literal).termType).toBe("Literal");
    expect((foundLiterals[0] as Literal).value).toBe("Some string 1");
    expect((foundLiterals[1] as Literal).termType).toBe("Literal");
    expect((foundLiterals[1] as Literal).value).toBe("Some string 2");
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithLiterals = getMockThingWithLiteralsFor(
      "https://some.vocab/predicate",
      "Some string 1",
      "Some string 2",
      "string"
    );

    const foundLiterals = getAllLiterals(
      thingWithLiterals,
      DataFactory.namedNode("https://some.vocab/predicate")
    );
    expect(foundLiterals.length).toBe(2);
    expect((foundLiterals[0] as Literal).termType).toBe("Literal");
    expect((foundLiterals[0] as Literal).value).toBe("Some string 1");
    expect((foundLiterals[1] as Literal).termType).toBe("Literal");
    expect((foundLiterals[1] as Literal).value).toBe("Some string 2");
  });

  it("returns an empty array if no Literal values were found", () => {
    const plainDataset = dataset();

    const thingWithoutLiterals: Thing = Object.assign(plainDataset, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getAllLiterals(thingWithoutLiterals, "https://some.vocab/predicate")
    ).toEqual([]);
  });

  it("does not return non-Literal values", () => {
    const thingWithDifferentTermTypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary string",
      "string"
    );
    thingWithDifferentTermTypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    const foundLiterals = getAllLiterals(
      thingWithDifferentTermTypes,
      "https://some.vocab/predicate"
    );

    expect(foundLiterals.length).toBe(1);
    expect(foundLiterals[0].termType).toBe("Literal");
  });
});

function getMockQuadWithNamedNode(
  predicate: IriString,
  object: IriString
): Quad {
  const quad = DataFactory.quad(
    DataFactory.namedNode("https://arbitrary.vocab/subject"),
    DataFactory.namedNode(predicate),
    DataFactory.namedNode(object)
  );
  return quad;
}
function getMockThingWithNamedNode(
  predicate: IriString,
  object: IriString
): Thing {
  const plainDataset = dataset();
  const quad = getMockQuadWithNamedNode(predicate, object);
  plainDataset.add(quad);

  const thing: Thing = Object.assign(plainDataset, {
    iri: "https://arbitrary.vocab/subject",
  });
  return thing;
}

describe("getOneNamedNode", () => {
  it("returns the Named Node for the given Predicate", () => {
    const thingWithNamedNode = getMockThingWithNamedNode(
      "https://some.vocab/predicate",
      "https://some.vocab/object"
    );

    const foundNamedNode = getOneNamedNode(
      thingWithNamedNode,
      "https://some.vocab/predicate"
    );
    expect(foundNamedNode).not.toBeNull();
    expect((foundNamedNode as NamedNode).termType).toBe("NamedNode");
    expect((foundNamedNode as NamedNode).value).toBe(
      "https://some.vocab/object"
    );
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithNamedNode = getMockThingWithNamedNode(
      "https://some.vocab/predicate",
      "https://some.vocab/object"
    );

    const foundNamedNode = getOneNamedNode(
      thingWithNamedNode,
      DataFactory.namedNode("https://some.vocab/predicate")
    );
    expect(foundNamedNode).not.toBeNull();
    expect((foundNamedNode as NamedNode).termType).toBe("NamedNode");
    expect((foundNamedNode as NamedNode).value).toBe(
      "https://some.vocab/object"
    );
  });

  it("returns null if no Named Node value was found", () => {
    const plainDataset = dataset();

    const thingWithoutNamedNode: Thing = Object.assign(plainDataset, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getOneNamedNode(thingWithoutNamedNode, "https://some.vocab/predicate")
    ).toBeNull();
  });

  it("does not return non-NamedNode values", () => {
    const thingWithDifferentTermTypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary string",
      "string"
    );
    thingWithDifferentTermTypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    expect(
      (getOneNamedNode(
        thingWithDifferentTermTypes,
        "https://some.vocab/predicate"
      ) as NamedNode).termType
    ).toBe("NamedNode");
  });
});

describe("getAllNamedNodes", () => {
  function getMockThingWithNamedNodes(
    predicate: IriString,
    object1: IriString,
    object2: IriString
  ): Thing {
    const plainDataset = dataset();
    const quad1 = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode(predicate),
      DataFactory.namedNode(object1)
    );
    const quad2 = DataFactory.quad(
      DataFactory.namedNode("https://arbitrary.vocab/subject"),
      DataFactory.namedNode(predicate),
      DataFactory.namedNode(object2)
    );
    plainDataset.add(quad1);
    plainDataset.add(quad2);

    const thing: Thing = Object.assign(plainDataset, {
      iri: "https://arbitrary.vocab/subject",
    });
    return thing;
  }

  it("returns the Named Nodes for the given Predicate", () => {
    const thingWithNamedNodes = getMockThingWithNamedNodes(
      "https://some.vocab/predicate",
      "https://some.vocab/object1",
      "https://some.vocab/object2"
    );

    const foundNamedNodes = getAllNamedNodes(
      thingWithNamedNodes,
      "https://some.vocab/predicate"
    );
    expect(foundNamedNodes.length).toBe(2);
    expect(foundNamedNodes[0].termType).toBe("NamedNode");
    expect(foundNamedNodes[0].value).toBe("https://some.vocab/object1");
    expect(foundNamedNodes[1].termType).toBe("NamedNode");
    expect(foundNamedNodes[1].value).toBe("https://some.vocab/object2");
  });

  it("accepts Predicates as Named Nodes", () => {
    const thingWithNamedNodes = getMockThingWithNamedNodes(
      "https://some.vocab/predicate",
      "https://some.vocab/object1",
      "https://some.vocab/object2"
    );

    const foundNamedNodes = getAllNamedNodes(
      thingWithNamedNodes,
      DataFactory.namedNode("https://some.vocab/predicate")
    );
    expect(foundNamedNodes.length).toBe(2);
    expect(foundNamedNodes[0].termType).toBe("NamedNode");
    expect(foundNamedNodes[0].value).toBe("https://some.vocab/object1");
    expect(foundNamedNodes[1].termType).toBe("NamedNode");
    expect(foundNamedNodes[1].value).toBe("https://some.vocab/object2");
  });

  it("returns an empty array if no Named Node values were found", () => {
    const plainDataset = dataset();

    const thingWithoutNamedNodes: Thing = Object.assign(plainDataset, {
      iri: "https://arbitrary.vocab/subject",
    });

    expect(
      getAllNamedNodes(thingWithoutNamedNodes, "https://some.vocab/predicate")
    ).toEqual([]);
  });

  it("does not return non-NamedNode values", () => {
    const thingWithDifferentTermTypes = getMockThingWithLiteralFor(
      "https://some.vocab/predicate",
      "Arbitrary string",
      "string"
    );
    thingWithDifferentTermTypes.add(
      DataFactory.quad(
        DataFactory.namedNode("https://arbitrary.vocab/subject"),
        DataFactory.namedNode("https://some.vocab/predicate"),
        DataFactory.namedNode("https://arbitrary.vocab/object")
      )
    );

    const foundNamedNodes = getAllNamedNodes(
      thingWithDifferentTermTypes,
      "https://some.vocab/predicate"
    );
    expect(foundNamedNodes.length).toBe(1);
    expect(foundNamedNodes[0].termType).toBe("NamedNode");
  });
});
