# ast-metadata-inferer

[![Test](https://github.com/amilajack/ast-metadata-inferer/actions/workflows/test.yml/badge.svg)](https://github.com/amilajack/ast-metadata-inferer/actions/workflows/test.yml)

A collection of metadata about browser API's. This collection is intended for tools that analyze JS. It currently supports more than 6,000 compatibility records.

For all the API's it supports, it gives the

- AST node type of the API (`MemberExpression`, `NewExpression`, or `CallExpression`)
- Determines if an API is statically invoked (ex. `document.querySelector()`)
- Determines if an API is a CSS or JS API
- Provides compatibility information from `@mdn/browser-compat-data`

## Usage

```js
import AstMetadata from "ast-metadata-inferer";

const [firstRecord] = AstMetadata;
console.log(firstRecord);
// {
//   "language":"js-api",
//   "protoChain":["document","querySelector"],
//   "protoChainId":"document.querySelector",
//   "astNodeTypes":["MemberExpression"],
//   "isStatic":true,
//   "compat": {
//     support: {
//       chrome: {
//         version_added: "14"
//       },
//       chrome_android: { version_added: "18" },
//       ...
//     }
//   }
// }
```

## Related

- [eslint-plugin-compat](https://github.com/amilajack/eslint-plugin-compat)
- [compat-db](https://github.com/amilajack/compat-db)
