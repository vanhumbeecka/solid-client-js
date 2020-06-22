(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{151:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return i})),a.d(t,"metadata",(function(){return r})),a.d(t,"rightToc",(function(){return o})),a.d(t,"default",(function(){return b}));var n=a(2),c=a(9),s=(a(0),a(164)),i={id:"managing-access",title:"Managing Access to Data",sidebar_label:"Managing Access"},r={id:"tutorials/managing-access",title:"Managing Access to Data",description:"The Solid specification has not settled yet, and access management specifically is expected to",source:"@site/docs/tutorials/managing-access.md",permalink:"/lit-pod/docs/tutorials/managing-access",editUrl:"https://github.com/inrupt/lit-pod/edit/master/website/docs/tutorials/managing-access.md",sidebar_label:"Managing Access",sidebar:"prose",previous:{title:"Working with Files",permalink:"/lit-pod/docs/tutorials/working-with-files"},next:{title:"Glossary",permalink:"/lit-pod/docs/glossary"}},o=[{value:"Access Control in Solid",id:"access-control-in-solid",children:[]},{value:"Finding out who has access",id:"finding-out-who-has-access",children:[{value:"Fetching access information",id:"fetching-access-information",children:[]},{value:"Reading agent access",id:"reading-agent-access",children:[]}]},{value:"Changing who has access",id:"changing-who-has-access",children:[{value:"Two types of ACL",id:"two-types-of-acl",children:[]}]}],l={rightToc:o};function b(e){var t=e.components,a=Object(c.a)(e,["components"]);return Object(s.b)("wrapper",Object(n.a)({},l,a,{components:t,mdxType:"MDXLayout"}),Object(s.b)("div",{className:"admonition admonition-warning alert alert--danger"},Object(s.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(s.b)("h5",{parentName:"div"},Object(s.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(s.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(s.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"})))),"warning")),Object(s.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(s.b)("p",{parentName:"div"},"The Solid specification has not settled yet, and access management specifically is expected to\nchange in the future."),Object(s.b)("p",{parentName:"div"},"As a result, the API's described here are expected to change as well.\nHence, all functions are marked as ",Object(s.b)("inlineCode",{parentName:"p"},"unstable_")," and may break in future non-major releases."))),Object(s.b)("h2",{id:"access-control-in-solid"},"Access Control in Solid"),Object(s.b)("p",null,"In Solid, who has what access to a ",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../glossary#resource"}),"Resource")," is defined in an Access Control\nList (",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../glossary#acl"}),"ACL"),"). These may be defined in separate Resources, so if you want to be able\nto access the ACLs for a Resource in addition to the Resource itself, you'll have to explicitly\nfetch them using\n",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../api/modules/_litdataset_#unstable_fetchlitdatasetwithacl"}),Object(s.b)("inlineCode",{parentName:"a"},"unstable_fetchLitDatasetWithAcl"))," \u2014\nbut be aware that this may result in several extra HTTP requests being sent."),Object(s.b)("p",null,"The possible ",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../glossary#access-modes"}),"Access Modes")," that can be granted are\n",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../glossary#read-access"}),"Read"),", ",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../glossary#append-access"}),"Append"),",\n",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../glossary#write-access"}),"Write")," and ",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../glossary#control-access"}),"Control"),","),Object(s.b)("div",{className:"admonition admonition-note alert alert--secondary"},Object(s.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(s.b)("h5",{parentName:"div"},Object(s.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(s.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(s.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"A note about access to ACLs")),Object(s.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(s.b)("p",{parentName:"div"},"A Resource's or Container's ACL is only accessible to your app if the following are true:"),Object(s.b)("ol",{parentName:"div"},Object(s.b)("li",{parentName:"ol"},"The authenticated user must have authorised your app to manage access on their behalf. At the\ntime of writing, the most common Solid server has that permission unchecked by default, i.e.\nusers will need to have actively given your app this permission."),Object(s.b)("li",{parentName:"ol"},"The authenticated user should have ",Object(s.b)("a",Object(n.a)({parentName:"li"},{href:"../glossary#control-access"}),"Control access")," to the\napplicable Resource or Container.")))),Object(s.b)("h2",{id:"finding-out-who-has-access"},"Finding out who has access"),Object(s.b)("p",null,"Access can be granted to individual ",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../glossary#agent"}),"agents"),", to groups, or even to everyone.\nWe currently only support reading what access has been granted to individual agents specifically."),Object(s.b)("h3",{id:"fetching-access-information"},"Fetching access information"),Object(s.b)("p",null,"Getting access information when fetching a resource may result in an additional request to the server. To avoid\nunecessary requests, the API makes it explicit when you get access information along your resource: ",Object(s.b)("inlineCode",{parentName:"p"},"unstable_fetchLitDatasetWithAcl"),". The returned value includes both the Resource data (e.g. your profile or friend list), the ",Object(s.b)("inlineCode",{parentName:"p"},"ResourceInfo"),",\nand the ACL containing the associated access information."),Object(s.b)("h3",{id:"reading-agent-access"},"Reading agent access"),Object(s.b)("p",null,"Given a ",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../glossary#litdataset"}),"LitDataset")," that has an ACL attached, you can check what access a\nspecific agent has been granted, or get all agents for which access has been explicitly granted."),Object(s.b)("p",null,"To do the former, use\n",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../api/modules/_acl_agent_#unstable_getagentaccessmodesone"}),Object(s.b)("inlineCode",{parentName:"a"},"unstable_getAgentAccessModesOne")),":"),Object(s.b)("pre",null,Object(s.b)("code",Object(n.a)({parentName:"pre"},{className:"language-typescript"}),'import {\n  unstable_fetchLitDatasetWithAcl,\n  unstable_getAgentAccessModesOne,\n} from "@solid/lit-pod";\n\nconst webId = "https://example.com/profile#webid";\nconst litDatasetWithAcl = await unstable_fetchLitDatasetWithAcl(\n  "https://example.com"\n);\nconst agentAccess = unstable_getAgentAccessModesOne(litDatasetWithAcl, webId);\n\n// => an object like\n//    { read: true, append: false, write: false, control: true }\n//    or null if the ACL is not accessible to the current user.\n')),Object(s.b)("p",null,"To get all agent to whom access was granted, use\n",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../api/modules/_acl_agent_#unstable_getagentaccessmodesall"}),Object(s.b)("inlineCode",{parentName:"a"},"unstable_getAgentAccessModesAll")),":"),Object(s.b)("pre",null,Object(s.b)("code",Object(n.a)({parentName:"pre"},{className:"language-typescript"}),'import {\n  unstable_fetchLitDatasetWithAcl,\n  unstable_getAgentAccessModesAll,\n} from "@solid/lit-pod";\n\nconst litDatasetWithAcl = await unstable_fetchLitDatasetWithAcl(\n  "https://example.com"\n);\nconst accessByAgent = unstable_getAgentAccessModesAll(litDatasetWithAcl);\n\n// => an object like\n//    {\n//      "https://example.com/profile#webid":\n//        { read: true, append: false, write: false, control: true },\n//      "https://example.com/other-profile#webid":\n//        { read: true, append: false, write: false, control: false },\n//    }\n')),Object(s.b)("h2",{id:"changing-who-has-access"},"Changing who has access"),Object(s.b)("div",{className:"admonition admonition-caution alert alert--warning"},Object(s.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-heading"}),Object(s.b)("h5",{parentName:"div"},Object(s.b)("span",Object(n.a)({parentName:"h5"},{className:"admonition-icon"}),Object(s.b)("svg",Object(n.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"}),Object(s.b)("path",Object(n.a)({parentName:"svg"},{fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"})))),"caution")),Object(s.b)("div",Object(n.a)({parentName:"div"},{className:"admonition-content"}),Object(s.b)("p",{parentName:"div"},"This section is still being written."))),Object(s.b)("h3",{id:"two-types-of-acl"},"Two types of ACL"),Object(s.b)("p",null,"A Resource ",Object(s.b)("em",{parentName:"p"},"can")," have an ACL that applies to just that Resource. However, if no such ACL exists, the\nPod server will fall back to the ACL of its ",Object(s.b)("a",Object(n.a)({parentName:"p"},{href:"../glossary#container"}),"Container")," \u2014 or its Container's\nContainer's, or its Container's Container's Container's, etc."),Object(s.b)("p",null,"Thus, an ACL can control both access to a specific Resource or Container directly, and provide\n",Object(s.b)("em",{parentName:"p"},"default")," access rules: those that apply to the ",Object(s.b)("em",{parentName:"p"},"children")," of the applicable Container when it\nserves as their fallback ACL. Note that the Container's ",Object(s.b)("em",{parentName:"p"},"Resource")," access rules will ",Object(s.b)("em",{parentName:"p"},"not")," apply to\nits children."))}b.isMDXComponent=!0},164:function(e,t,a){"use strict";a.d(t,"a",(function(){return p})),a.d(t,"b",(function(){return u}));var n=a(0),c=a.n(n);function s(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function r(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){s(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,c=function(e,t){if(null==e)return{};var a,n,c={},s=Object.keys(e);for(n=0;n<s.length;n++)a=s[n],t.indexOf(a)>=0||(c[a]=e[a]);return c}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)a=s[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(c[a]=e[a])}return c}var l=c.a.createContext({}),b=function(e){var t=c.a.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):r(r({},t),e)),a},p=function(e){var t=b(e.components);return c.a.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return c.a.createElement(c.a.Fragment,{},t)}},h=c.a.forwardRef((function(e,t){var a=e.components,n=e.mdxType,s=e.originalType,i=e.parentName,l=o(e,["components","mdxType","originalType","parentName"]),p=b(a),h=n,u=p["".concat(i,".").concat(h)]||p[h]||d[h]||s;return a?c.a.createElement(u,r(r({ref:t},l),{},{components:a})):c.a.createElement(u,r({ref:t},l))}));function u(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var s=a.length,i=new Array(s);i[0]=h;var r={};for(var o in t)hasOwnProperty.call(t,o)&&(r[o]=t[o]);r.originalType=e,r.mdxType="string"==typeof e?e:n,i[1]=r;for(var l=2;l<s;l++)i[l]=a[l];return c.a.createElement.apply(null,i)}return c.a.createElement.apply(null,a)}h.displayName="MDXCreateElement"}}]);