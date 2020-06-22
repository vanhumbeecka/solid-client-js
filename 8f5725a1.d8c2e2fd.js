(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{153:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return l})),a.d(t,"metadata",(function(){return r})),a.d(t,"rightToc",(function(){return s})),a.d(t,"default",(function(){return i}));var b=a(2),c=a(9),n=(a(0),a(164)),l={id:"_acl_",title:"acl",sidebar_label:"acl"},r={id:"api/modules/_acl_",title:"acl",description:'@solid/lit-pod \u203a "acl"',source:"@site/docs/api/modules/_acl_.md",permalink:"/lit-pod/docs/api/modules/_acl_",editUrl:"https://github.com/inrupt/lit-pod/edit/master/website/docs/api/modules/_acl_.md",sidebar_label:"acl",sidebar:"api",next:{title:"acl/agent",permalink:"/lit-pod/docs/api/modules/_acl_agent_"}},s=[{value:"Index",id:"index",children:[{value:"Functions",id:"functions",children:[]}]},{value:"Functions",id:"functions-1",children:[{value:"unstable_getFallbackAcl",id:"unstable_getfallbackacl",children:[]},{value:"unstable_getResourceAcl",id:"unstable_getresourceacl",children:[]},{value:"unstable_hasFallbackAcl",id:"unstable_hasfallbackacl",children:[]},{value:"unstable_hasResourceAcl",id:"unstable_hasresourceacl",children:[]}]}],p={rightToc:s};function i(e){var t=e.components,a=Object(c.a)(e,["components"]);return Object(n.b)("wrapper",Object(b.a)({},p,a,{components:t,mdxType:"MDXLayout"}),Object(n.b)("p",null,Object(n.b)("a",Object(b.a)({parentName:"p"},{href:"/lit-pod/docs/api/index"}),"@solid/lit-pod")," \u203a ",Object(n.b)("a",Object(b.a)({parentName:"p"},{href:"/lit-pod/docs/api/modules/_acl_"}),'"acl"')),Object(n.b)("h2",{id:"index"},"Index"),Object(n.b)("h3",{id:"functions"},"Functions"),Object(n.b)("ul",null,Object(n.b)("li",{parentName:"ul"},Object(n.b)("a",Object(b.a)({parentName:"li"},{href:"/lit-pod/docs/api/modules/_acl_#unstable_getfallbackacl"}),"unstable_getFallbackAcl")),Object(n.b)("li",{parentName:"ul"},Object(n.b)("a",Object(b.a)({parentName:"li"},{href:"/lit-pod/docs/api/modules/_acl_#unstable_getresourceacl"}),"unstable_getResourceAcl")),Object(n.b)("li",{parentName:"ul"},Object(n.b)("a",Object(b.a)({parentName:"li"},{href:"/lit-pod/docs/api/modules/_acl_#unstable_hasfallbackacl"}),"unstable_hasFallbackAcl")),Object(n.b)("li",{parentName:"ul"},Object(n.b)("a",Object(b.a)({parentName:"li"},{href:"/lit-pod/docs/api/modules/_acl_#unstable_hasresourceacl"}),"unstable_hasResourceAcl"))),Object(n.b)("h2",{id:"functions-1"},"Functions"),Object(n.b)("h3",{id:"unstable_getfallbackacl"},"unstable_getFallbackAcl"),Object(n.b)("p",null,"\u25b8 ",Object(n.b)("strong",{parentName:"p"},"unstable_getFallbackAcl"),"(",Object(n.b)("inlineCode",{parentName:"p"},"resource"),": unstable",Object(n.b)("em",{parentName:"p"},"WithAcl & object): *","[unstable_AclDataset]","(/lit-pod/docs/api/modules/_interfaces"),"#unstable_acldataset)*"),Object(n.b)("p",null,Object(n.b)("em",{parentName:"p"},"Defined in ",Object(n.b)("a",Object(b.a)({parentName:"em"},{href:"https://github.com/inrupt/lit-pod/blob/698ce04/src/acl.ts#L206"}),"acl.ts:206"))),Object(n.b)("p",null,"Access the fallback ACL attached to a Resource."),Object(n.b)("p",null,"Given a Resource that has a fallback ACL attached, this function will give you access to that\nACL. To verify whether the fallback ACL is available, see ",Object(n.b)("a",Object(b.a)({parentName:"p"},{href:"/lit-pod/docs/api/modules/_acl_#unstable_hasfallbackacl"}),"unstable_hasFallbackAcl"),"."),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Parameters:")),Object(n.b)("table",null,Object(n.b)("thead",{parentName:"table"},Object(n.b)("tr",{parentName:"thead"},Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Name"),Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Type"),Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Description"))),Object(n.b)("tbody",{parentName:"table"},Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),Object(n.b)("inlineCode",{parentName:"td"},"resource")),Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),"unstable_WithAcl & object"),Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),"A Resource with potentially a fallback ACL attached.")))),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Returns:")," ",Object(n.b)("em",{parentName:"p"},Object(n.b)("a",Object(b.a)({parentName:"em"},{href:"/lit-pod/docs/api/modules/_interfaces_#unstable_acldataset"}),"unstable_AclDataset"))),Object(n.b)("p",null,"The fallback ACL, or null if it coult not be accessed."),Object(n.b)("p",null,"\u25b8 ",Object(n.b)("strong",{parentName:"p"},"unstable_getFallbackAcl"),"(",Object(n.b)("inlineCode",{parentName:"p"},"dataset"),": unstable",Object(n.b)("em",{parentName:"p"},"WithAcl): *","[unstable_AclDataset]","(/lit-pod/docs/api/modules/_interfaces"),"#unstable_acldataset) | null*"),Object(n.b)("p",null,Object(n.b)("em",{parentName:"p"},"Defined in ",Object(n.b)("a",Object(b.a)({parentName:"em"},{href:"https://github.com/inrupt/lit-pod/blob/698ce04/src/acl.ts#L213"}),"acl.ts:213"))),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Parameters:")),Object(n.b)("table",null,Object(n.b)("thead",{parentName:"table"},Object(n.b)("tr",{parentName:"thead"},Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Name"),Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Type"))),Object(n.b)("tbody",{parentName:"table"},Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),Object(n.b)("inlineCode",{parentName:"td"},"dataset")),Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),"unstable_WithAcl")))),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Returns:")," ",Object(n.b)("em",{parentName:"p"},Object(n.b)("a",Object(b.a)({parentName:"em"},{href:"/lit-pod/docs/api/modules/_interfaces_#unstable_acldataset"}),"unstable_AclDataset")," | null")),Object(n.b)("hr",null),Object(n.b)("h3",{id:"unstable_getresourceacl"},"unstable_getResourceAcl"),Object(n.b)("p",null,"\u25b8 ",Object(n.b)("strong",{parentName:"p"},"unstable_getResourceAcl"),"(",Object(n.b)("inlineCode",{parentName:"p"},"resource"),": unstable",Object(n.b)("em",{parentName:"p"},"WithAcl & object): *","[unstable_AclDataset]","(/lit-pod/docs/api/modules/_interfaces"),"#unstable_acldataset)*"),Object(n.b)("p",null,Object(n.b)("em",{parentName:"p"},"Defined in ",Object(n.b)("a",Object(b.a)({parentName:"em"},{href:"https://github.com/inrupt/lit-pod/blob/698ce04/src/acl.ts#L156"}),"acl.ts:156"))),Object(n.b)("p",null,"Access the ACL attached to a Resource."),Object(n.b)("p",null,"Given a Resource that has an ACL attached, this function will give you access to that ACL. To\nverify whether the ACL is available, see ",Object(n.b)("a",Object(b.a)({parentName:"p"},{href:"/lit-pod/docs/api/modules/_acl_#unstable_hasresourceacl"}),"unstable_hasResourceAcl"),"."),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Parameters:")),Object(n.b)("table",null,Object(n.b)("thead",{parentName:"table"},Object(n.b)("tr",{parentName:"thead"},Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Name"),Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Type"),Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Description"))),Object(n.b)("tbody",{parentName:"table"},Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),Object(n.b)("inlineCode",{parentName:"td"},"resource")),Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),"unstable_WithAcl & object"),Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),"A Resource with potentially an ACL attached.")))),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Returns:")," ",Object(n.b)("em",{parentName:"p"},Object(n.b)("a",Object(b.a)({parentName:"em"},{href:"/lit-pod/docs/api/modules/_interfaces_#unstable_acldataset"}),"unstable_AclDataset"))),Object(n.b)("p",null,"The ACL, if available, and undefined if not."),Object(n.b)("p",null,"\u25b8 ",Object(n.b)("strong",{parentName:"p"},"unstable_getResourceAcl"),"(",Object(n.b)("inlineCode",{parentName:"p"},"resource"),": unstable",Object(n.b)("em",{parentName:"p"},"WithAcl): *","[unstable_AclDataset]","(/lit-pod/docs/api/modules/_interfaces"),"#unstable_acldataset) | null*"),Object(n.b)("p",null,Object(n.b)("em",{parentName:"p"},"Defined in ",Object(n.b)("a",Object(b.a)({parentName:"em"},{href:"https://github.com/inrupt/lit-pod/blob/698ce04/src/acl.ts#L163"}),"acl.ts:163"))),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Parameters:")),Object(n.b)("table",null,Object(n.b)("thead",{parentName:"table"},Object(n.b)("tr",{parentName:"thead"},Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Name"),Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Type"))),Object(n.b)("tbody",{parentName:"table"},Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),Object(n.b)("inlineCode",{parentName:"td"},"resource")),Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),"unstable_WithAcl")))),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Returns:")," ",Object(n.b)("em",{parentName:"p"},Object(n.b)("a",Object(b.a)({parentName:"em"},{href:"/lit-pod/docs/api/modules/_interfaces_#unstable_acldataset"}),"unstable_AclDataset")," | null")),Object(n.b)("hr",null),Object(n.b)("h3",{id:"unstable_hasfallbackacl"},"unstable_hasFallbackAcl"),Object(n.b)("p",null,"\u25b8 ",Object(n.b)("strong",{parentName:"p"},"unstable_hasFallbackAcl"),"\u2039",Object(n.b)("strong",{parentName:"p"},"Resource"),"\u203a(",Object(n.b)("inlineCode",{parentName:"p"},"resource"),": Resource): ",Object(n.b)("em",{parentName:"p"},"resource is Resource & object")),Object(n.b)("p",null,Object(n.b)("em",{parentName:"p"},"Defined in ",Object(n.b)("a",Object(b.a)({parentName:"em"},{href:"https://github.com/inrupt/lit-pod/blob/698ce04/src/acl.ts#L187"}),"acl.ts:187"))),Object(n.b)("p",null,"Verify whether a fallback ACL was found for the given Resource."),Object(n.b)("p",null,"A Resource fetched with its ACL (e.g. using ",Object(n.b)("a",Object(b.a)({parentName:"p"},{href:"/lit-pod/docs/api/modules/_litdataset_#unstable_fetchlitdatasetwithacl"}),"unstable_fetchLitDatasetWithAcl"),") ",Object(n.b)("em",{parentName:"p"},"might")," have a fallback ACL\nattached, but we cannot be sure: the currently authenticated user (if any) might not have Control\naccess to one of the fetched Resource's Containers."),Object(n.b)("p",null,"This function verifies that the fallback ACL is accessible."),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Type parameters:")),Object(n.b)("p",null,"\u25aa ",Object(n.b)("strong",{parentName:"p"},"Resource"),": ",Object(n.b)("em",{parentName:"p"},"unstable_WithAcl")),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Parameters:")),Object(n.b)("table",null,Object(n.b)("thead",{parentName:"table"},Object(n.b)("tr",{parentName:"thead"},Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Name"),Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Type"),Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Description"))),Object(n.b)("tbody",{parentName:"table"},Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),Object(n.b)("inlineCode",{parentName:"td"},"resource")),Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),"Resource"),Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),"A ",Object(n.b)("a",Object(b.a)({parentName:"td"},{href:"/lit-pod/docs/api/modules/_interfaces_#litdataset"}),"LitDataset")," that might have a fallback ACL attached.")))),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Returns:")," ",Object(n.b)("em",{parentName:"p"},"resource is Resource & object")),Object(n.b)("p",null,"Whether ",Object(n.b)("inlineCode",{parentName:"p"},"dataset")," has a fallback ACL attached."),Object(n.b)("hr",null),Object(n.b)("h3",{id:"unstable_hasresourceacl"},"unstable_hasResourceAcl"),Object(n.b)("p",null,"\u25b8 ",Object(n.b)("strong",{parentName:"p"},"unstable_hasResourceAcl"),"\u2039",Object(n.b)("strong",{parentName:"p"},"Resource"),"\u203a(",Object(n.b)("inlineCode",{parentName:"p"},"resource"),": Resource): ",Object(n.b)("em",{parentName:"p"},"resource is Resource & object")),Object(n.b)("p",null,Object(n.b)("em",{parentName:"p"},"Defined in ",Object(n.b)("a",Object(b.a)({parentName:"em"},{href:"https://github.com/inrupt/lit-pod/blob/698ce04/src/acl.ts#L137"}),"acl.ts:137"))),Object(n.b)("p",null,"Verify whether an ACL was found for the given Resource."),Object(n.b)("p",null,"A Resource fetched with its ACL (e.g. using ",Object(n.b)("a",Object(b.a)({parentName:"p"},{href:"/lit-pod/docs/api/modules/_litdataset_#unstable_fetchlitdatasetwithacl"}),"unstable_fetchLitDatasetWithAcl"),") ",Object(n.b)("em",{parentName:"p"},"might")," have a resource ACL attached, but\nwe cannot be sure: it might be that none exists for this specific Resource (in which case the\nfallback ACL applies), or the currently authenticated user (if any) might not have Control access\nto the fetched Resource."),Object(n.b)("p",null,"This function verifies that the Resource's ACL is accessible."),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Type parameters:")),Object(n.b)("p",null,"\u25aa ",Object(n.b)("strong",{parentName:"p"},"Resource"),": ",Object(n.b)("em",{parentName:"p"},"unstable_WithAcl")),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Parameters:")),Object(n.b)("table",null,Object(n.b)("thead",{parentName:"table"},Object(n.b)("tr",{parentName:"thead"},Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Name"),Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Type"),Object(n.b)("th",Object(b.a)({parentName:"tr"},{align:null}),"Description"))),Object(n.b)("tbody",{parentName:"table"},Object(n.b)("tr",{parentName:"tbody"},Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),Object(n.b)("inlineCode",{parentName:"td"},"resource")),Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),"Resource"),Object(n.b)("td",Object(b.a)({parentName:"tr"},{align:null}),"A Resource that might have an ACL attached.")))),Object(n.b)("p",null,Object(n.b)("strong",{parentName:"p"},"Returns:")," ",Object(n.b)("em",{parentName:"p"},"resource is Resource & object")),Object(n.b)("p",null,"Whether ",Object(n.b)("inlineCode",{parentName:"p"},"dataset")," has an ACL attached."))}i.isMDXComponent=!0},164:function(e,t,a){"use strict";a.d(t,"a",(function(){return u})),a.d(t,"b",(function(){return j}));var b=a(0),c=a.n(b);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var b=Object.getOwnPropertySymbols(e);t&&(b=b.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,b)}return a}function r(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,b,c=function(e,t){if(null==e)return{};var a,b,c={},n=Object.keys(e);for(b=0;b<n.length;b++)a=n[b],t.indexOf(a)>=0||(c[a]=e[a]);return c}(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(b=0;b<n.length;b++)a=n[b],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(c[a]=e[a])}return c}var p=c.a.createContext({}),i=function(e){var t=c.a.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):r(r({},t),e)),a},u=function(e){var t=i(e.components);return c.a.createElement(p.Provider,{value:t},e.children)},o={inlineCode:"code",wrapper:function(e){var t=e.children;return c.a.createElement(c.a.Fragment,{},t)}},O=c.a.forwardRef((function(e,t){var a=e.components,b=e.mdxType,n=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=i(a),O=b,j=u["".concat(l,".").concat(O)]||u[O]||o[O]||n;return a?c.a.createElement(j,r(r({ref:t},p),{},{components:a})):c.a.createElement(j,r({ref:t},p))}));function j(e,t){var a=arguments,b=t&&t.mdxType;if("string"==typeof e||b){var n=a.length,l=new Array(n);l[0]=O;var r={};for(var s in t)hasOwnProperty.call(t,s)&&(r[s]=t[s]);r.originalType=e,r.mdxType="string"==typeof e?e:b,l[1]=r;for(var p=2;p<n;p++)l[p]=a[p];return c.a.createElement.apply(null,l)}return c.a.createElement.apply(null,a)}O.displayName="MDXCreateElement"}}]);