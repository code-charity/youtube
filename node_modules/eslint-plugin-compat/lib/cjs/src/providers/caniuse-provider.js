"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnsupportedTargets = void 0;
const lite = __importStar(require("caniuse-lite"));
const constants_1 = require("../constants");
/**
 * Take a target's id and return it's full name by using `targetNameMappings`
 * ex. {target: and_ff, version: 40} => 'Android FireFox 40'
 */
function formatTargetNames(target) {
    const name = constants_1.STANDARD_TARGET_NAME_MAPPING[target.target] || target.target;
    return `${name} ${target.version}`;
}
/**
 * Check if a browser version is in the range format
 * ex. 10.0-10.2
 */
function versionIsRange(version) {
    return version.includes("-");
}
/**
 * Parse version from caniuse and compare with parsed version from browserslist.
 */
function areVersionsEqual(targetVersion, statsVersion) {
    return targetVersion === parseFloat(statsVersion);
}
/*
 * Check the CanIUse database to see if targets are supported
 *
 * If no record could be found, return true. Rules might not
 * be found because they could belong to another provider
 */
function isSupportedByCanIUse(node, { version, target, parsedVersion }) {
    if (!node.caniuseId)
        return false;
    const data = lite.feature(lite.features[node.caniuseId]);
    if (!data)
        return true;
    const { stats } = data;
    if (!(target in stats))
        return true;
    const targetStats = stats[target];
    if (typeof version === "string" && versionIsRange(version)) {
        return Object.keys(targetStats).some((statsVersion) => versionIsRange(statsVersion) &&
            areVersionsEqual(parsedVersion, statsVersion)
            ? !targetStats[statsVersion].includes("y")
            : true);
    }
    // @TODO: This assumes that all versions are included in the cainuse db. If this is incorrect,
    //        this will return false negatives. To properly do this, we have to to range comparisons.
    //        Ex. given query for 50 and only version 40 exists in db records, return true
    if (!(version in targetStats))
        return true;
    if (!targetStats[version])
        return true;
    return targetStats[version].includes("y");
}
/**
 * Return an array of all unsupported targets
 */
function getUnsupportedTargets(node, targets) {
    return targets
        .filter((target) => !isSupportedByCanIUse(node, target))
        .map(formatTargetNames);
}
exports.getUnsupportedTargets = getUnsupportedTargets;
const CanIUseProvider = [
    // new ServiceWorker()
    {
        caniuseId: "serviceworkers",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "ServiceWorker",
    },
    {
        caniuseId: "serviceworkers",
        astNodeType: constants_1.AstNodeTypes.MemberExpression,
        object: "navigator",
        property: "serviceWorker",
    },
    // document.querySelector()
    {
        caniuseId: "queryselector",
        astNodeType: constants_1.AstNodeTypes.MemberExpression,
        object: "document",
        property: "querySelector",
    },
    // IntersectionObserver
    {
        caniuseId: "intersectionobserver",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "IntersectionObserver",
    },
    // ResizeObserver
    {
        caniuseId: "resizeobserver",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "ResizeObserver",
    },
    // PaymentRequest
    {
        caniuseId: "payment-request",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "PaymentRequest",
    },
    // Promises
    {
        caniuseId: "promises",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "Promise",
    },
    {
        caniuseId: "promises",
        astNodeType: constants_1.AstNodeTypes.MemberExpression,
        object: "Promise",
        property: "resolve",
    },
    {
        caniuseId: "promises",
        astNodeType: constants_1.AstNodeTypes.MemberExpression,
        object: "Promise",
        property: "all",
    },
    {
        caniuseId: "promises",
        astNodeType: constants_1.AstNodeTypes.MemberExpression,
        object: "Promise",
        property: "race",
    },
    {
        caniuseId: "promises",
        astNodeType: constants_1.AstNodeTypes.MemberExpression,
        object: "Promise",
        property: "reject",
    },
    // fetch
    {
        caniuseId: "fetch",
        astNodeType: constants_1.AstNodeTypes.CallExpression,
        object: "fetch",
    },
    // document.currentScript()
    {
        caniuseId: "document-currentscript",
        astNodeType: constants_1.AstNodeTypes.MemberExpression,
        object: "document",
        property: "currentScript",
    },
    // URL
    {
        caniuseId: "url",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "URL",
    },
    // URLSearchParams
    {
        caniuseId: "urlsearchparams",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "URLSearchParams",
    },
    // performance.now()
    {
        caniuseId: "high-resolution-time",
        astNodeType: constants_1.AstNodeTypes.MemberExpression,
        object: "performance",
        property: "now",
    },
    // requestIdleCallback()
    {
        caniuseId: "requestidlecallback",
        astNodeType: constants_1.AstNodeTypes.CallExpression,
        object: "requestIdleCallback",
    },
    // requestAnimationFrame()
    {
        caniuseId: "requestanimationframe",
        astNodeType: constants_1.AstNodeTypes.CallExpression,
        object: "requestAnimationFrame",
    },
    {
        caniuseId: "typedarrays",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "TypedArray",
    },
    {
        caniuseId: "typedarrays",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "Int8Array",
    },
    {
        caniuseId: "typedarrays",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "Uint8Array",
    },
    {
        caniuseId: "typedarrays",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "Uint8ClampedArray",
    },
    {
        caniuseId: "typedarrays",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "Int16Array",
    },
    {
        caniuseId: "typedarrays",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "Uint16Array",
    },
    {
        caniuseId: "typedarrays",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "Int32Array",
    },
    {
        caniuseId: "typedarrays",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "Uint32Array",
    },
    {
        caniuseId: "typedarrays",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "Float32Array",
    },
    {
        caniuseId: "typedarrays",
        astNodeType: constants_1.AstNodeTypes.NewExpression,
        object: "Float64Array",
    },
].map((rule) => ({
    ...rule,
    getUnsupportedTargets,
    id: rule.property ? `${rule.object}.${rule.property}` : rule.object,
    protoChainId: rule.property ? `${rule.object}.${rule.property}` : rule.object,
    protoChain: rule.property ? [rule.object, rule.property] : [rule.object],
}));
exports.default = CanIUseProvider;
