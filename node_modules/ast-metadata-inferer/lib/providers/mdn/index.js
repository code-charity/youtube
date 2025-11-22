"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint @typescript-eslint/ban-ts-ignore: off, no-underscore-dangle: off */
const browser_compat_data_1 = __importDefault(require("@mdn/browser-compat-data"));
const normalize_protochain_1 = __importDefault(require("../../helpers/normalize-protochain"));
const types_1 = require("../../types");
// `version_added: true` or `version_added: "some browser version number"`
// means that the feature has been implemented in the browser. When `true`,
// a specific version is unknown. `version_added: false` means that the browser
// does not support the feature, and never has. `version_added: null` means that
// we have no idea if the browser has support for the feature. (A major goal is to
// get rid of as many of the `null` values we can and replace them with real data
// from the browsers.)
//
// See https://github.com/mdn/browser-compat-data/issues/3425#issuecomment-462176276
function mdnComaptDataProvider() {
    const apiMetadata = [];
    const normalizedBrowserCompatApis = [
        ...Object.entries(browser_compat_data_1.default.api).map(([name, api]) => ({
            ...api,
            name,
            kind: types_1.APIKind.Web,
        })),
        ...Object.entries(browser_compat_data_1.default.javascript.builtins).map(([name, api]) => ({
            ...api,
            name,
            kind: types_1.APIKind.ES,
        })),
    ];
    normalizedBrowserCompatApis.forEach((api) => {
        // ex. 'Window'
        // ex. Window {... }
        const { name } = api;
        const normalizedApi = (0, normalize_protochain_1.default)(name);
        apiMetadata.push({
            id: normalizedApi,
            name,
            language: types_1.Language.JS,
            protoChain: [normalizedApi],
            protoChainId: normalizedApi,
            kind: api.kind,
            // @ts-ignore
            compat: api.__compat || api,
        });
        // ex. ['alert', 'document', ...]
        Object.entries(api).forEach(([childName, childApi]) => {
            const protoChainId = [normalizedApi, childName].join(".");
            apiMetadata.push({
                id: protoChainId,
                name: childName,
                language: types_1.Language.JS,
                kind: api.kind,
                protoChain: [normalizedApi, childName],
                protoChainId,
                // eslint-disable-next-line no-underscore-dangle
                // @ts-ignore
                compat: childApi?.__compat || childApi || api,
            });
        });
    });
    return apiMetadata;
}
exports.default = mdnComaptDataProvider;
