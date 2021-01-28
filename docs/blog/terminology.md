# Why solid-client invents new terminology

Calling [`getInteger`](https://docs.inrupt.com/developer-tools/api/javascript/solid-client/modules/_thing_get_.html#getinteger) on a "[`Thing`](https://docs.inrupt.com/developer-tools/javascript/client-libraries/reference/glossary/#term-Thing)" — as you are writing your first Solid app and are reading through [the `@inrupt/solid-client` documentation](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/read-write-data/), you'll come across a bunch of concepts and terminology that might seem needlessly cumbersome at first compared to coding against your run-of-the-mill REST API. While I can't remove the complexity for you, I will try to shed some light on why things are the way they are, along the way hopefully making them easier to understand and less frustrating to work with.

## It's not JSON

Typically, data sent to and from the back-end of a regular app is formatted as [JSON](https://en.wikipedia.org/wiki/JSON): JavaScript Object Notation. Because JSON is based on a subset of JavaScript, it is [almost trivial](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) to use JSON data in a JavaScript app.

> #JavaScript devs: let's take a moment to appreciate how convenient it is that the main serialisation language of the web is native to JavaScript. That's a lot of mapping between data formats that we can just skip.

Embed: https://twitter.com/VincentTunru/status/1346065726151516160

It is easy to overlook how much of an advantage that is. For example, if you work in a language that distinguishes between integers and floats, it'll take some effort to massage JSON into a format that is usable in your code. But since a number in JSON is the same as a number in JavaScript, we can access those in our code without problems.

> JSON has a single number type. 100.0 and 100 are equivalent. But many languages see them as different types. If your an SDK parsing raw JSON from the wire and you see "100.0" what type do you assign to this value?

Embed: https://twitter.com/southpolesteve/status/1314978512135168005

And possibly embed: https://twitter.com/khellang/status/1321848440826011653

So why am I telling you this? Well, here's the thing: data in Solid is not usually stored as JSON.

## RDF

In Solid, data is stored as [RDF](https://en.wikipedia.org/wiki/Resource_Description_Framework). You can read more about what the acronym stands for and its history at that link, but the main reason it's relevant to this post is because this means we'll need to do a little bit more work to read and write data than when we're dealing with JSON.

The key feature of RDF is that URLs are everywhere. Data itself has a URL, relationships between data are identified by URLs, and the type of the data is identified by a URL as well. This is the key feature that makes data in Solid interoperable: whereas there is no way to tell whether data labelled `name` refers to one's family name, their full name, or some other potential interpretation of the term "name", use of a single specific URL like `http://xmlns.com/foaf/0.1/familyName` indicates a specific interpretation of what that data is.

![](https://i.imgur.com/Hb0hEbY.png)

## From thinking in JavaScript objects to thinking in RDF

To understand what repercussions the use of RDF has, let's consider a regular JavaScript object that we might send to an API, and see what that would look like when trying to write the same data to a Solid Pod:

```js
const me = {
  name: "Vincent Tunru",
  nicknames: ["Vinnl", "VincentTunru"],
  email: [{ type: "work", value: "vincentt@inrupt.com" }],
};

fetch("https://example.com/api", {
  method: "POST",
  body: JSON.stringify(me),
  headers: { "Content-Type": "application/json" },
});
```

To distinguish them from JavaScript objects, solid-client dubs the (roughly) RDF equivalent _Things_. Let's create one:

```js
let me = createThing({ url: "https://example.pod/profile#me" });
```

As mentioned before: URLs are everywhere, so our Thing has its own URL as well. Now let's add a formatted name:

```js
me = addStringNoLocale(
  me,
  "http://www.w3.org/2006/vcard/ns#fn",
  "Vincent Tunru"
);
```

As you can see, instead of the `name` properties from before, we used URLs. And not just any URLs, but URLs from the "vCard" _Vocabulary_, a set of predefined URLs intended to be used for describing people. We re-use [URLs defined by others](https://solidproject.org/developers/vocabularies/well-known) here to indicate that we're storing the same type of data (a formatted name), but if you cannot find an existing URL that describes the type of data you're writing, you can come up with [your own URLs](https://solidproject.org/developers/vocabularies/discover) as well.

Now, let's add the two nicknames:

```js
me = addStringNoLocale(me, "http://www.w3.org/2006/vcard/ns#nickname", "Vinnl");
me = addStringNoLocale(
  me,
  "http://www.w3.org/2006/vcard/ns#nickname",
  "VincentTunru"
);
```

A single property can have multiple values. However, keep in mind that these values are not guaranteed to be in a particular order.

<!--
A sensible follow-up question here would be how to add ordered lists,
but there still is no alignment on how to do that in RDF,
and hence no support for that in solid-client. Should we still mention it?
-->

Then for the most complex part: nested objects. The original JavaScript object includes another object `{ type: "work", value: "vincentt@inrupt.com" }`. In RDF, nested objects aren't really a thing. However, since everything has a URL, a Thing can point to _another_ Thing. Thus, what we'll do is create another Thing for my email address, and link to it from the Thing describing me:

```js
let workEmail = createThing({ url: "https://example.pod/profile#workEmail" });
workEmail = addUrl(
  workEmail,
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#value",
  "mailto:vincentt@inrupt.com"
);
workEmail = addUrl(
  workEmail,
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  "http://www.w3.org/2006/vcard/ns#Work"
);

me = addUrl(
  me,
  "http://www.w3.org/2006/vcard/ns#hasEmail",
  "https://example.pod/profile#workEmail"
);
```

URLs are so important to RDF that they're a separate type, which is why we need to use [`addUrl`](https://docs.inrupt.com/developer-tools/api/javascript/solid-client/modules/thing_add.html#addurl) to add them. As you can see, we've created a new Thing with the URL `https://example.pod/profile#workEmail`, added my email address and a "Work" type, and then added a reference to that Thing to the Thing describing me.

You might also notice that all those URLs everywhere are starting to make the code hard to read. There are [various](https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/use-vocabularies/) [solutions](https://www.npmjs.com/package/rdf-namespaces) to that, but we'll discuss those in future blog posts.

And now the last step: actually saving the Things we created. As you might have inferred from the URLs we used to identify the Things, we are going to save them at the same location. To do so, we add both to what solid-client calls a _SolidDataset_, and send that SolidDataset to the given location:

```js
let solidDataset = createSolidDataset();
solidDataset = setThing(solidDataset, me);
solidDataset = setThing(solidDataset, workEmail);
saveSolidDatasetAt("https://example.pod/profile", solidDataset);
```

Whereas we had to call `JSON.stringify` on the JavaScript object to serialize it to JSON, if we give `saveSolidDatasetAt` a SolidDataset, it will take care of sending the data correctly for us.

Now, let's bring it all together. Compare it to the original plain-JavaScript version above, and you'll see that although working with solid-client involves a few extra steps, reasoning about the code is actually pretty similar! However, as opposed to the original JavaScript version, you are now saving this data in a place under the user's control, and in a way that can be re-used by other apps:

```js
import {
  createThing,
  addStringNoLocale,
  addUrl,
  createSolidDataset,
  setThing,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";

let me = createThing({ url: "https://example.pod/profile#me" });
me = addStringNoLocale(
  me,
  "http://www.w3.org/2006/vcard/ns#fn",
  "Vincent Tunru"
);
me = addStringNoLocale(me, "http://www.w3.org/2006/vcard/ns#nickname", "Vinnl");
me = addStringNoLocale(
  me,
  "http://www.w3.org/2006/vcard/ns#nickname",
  "VincentTunru"
);

let workEmail = createThing({ url: "https://example.pod/profile#workEmail" });
workEmail = addUrl(
  workEmail,
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#value",
  "mailto:vincentt@inrupt.com"
);
workEmail = addUrl(
  workEmail,
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  "http://www.w3.org/2006/vcard/ns#Work"
);
me = addUrl(
  me,
  "http://www.w3.org/2006/vcard/ns#hasEmail",
  "https://example.pod/profile#workEmail"
);

let solidDataset = createSolidDataset();
solidDataset = setThing(solidDataset, me);
solidDataset = setThing(solidDataset, workEmail);
saveSolidDatasetAt("https://example.pod/profile", solidDataset);
```

And that's it! If you have further questions about solid-client, feel free to ask them [on StackOverflow](https://stackoverflow.com/questions/tagged/solid), [the Solid forum](https://forum.solidproject.org/c/build-a-solid-app/solid-app-development-faqs/6) or in [the `app-development` chatroom](https://gitter.im/solid/app-development). And if you have requests for follow-up blog posts, do [let me know](mailto:vincentt@inrupt.com)!
