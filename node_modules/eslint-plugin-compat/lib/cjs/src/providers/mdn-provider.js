"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnsupportedTargets = exports.isSupportedByMDN = void 0;
const ast_metadata_inferer_1 = __importDefault(require("ast-metadata-inferer"));
const semver_1 = __importDefault(require("semver"));
const helpers_1 = require("../helpers");
const constants_1 = require("../constants");
const apis = ast_metadata_inferer_1.default;
// @TODO Import this type from ast-metadata-inferer after migrating this project to TypeScript
const mdnRecords = new Map(apis.map((e) => [e.protoChainId, e]));
/**
 * Map ids of mdn targets to their "common/friendly" name
 */
const targetIdMappings = {
    chrome: "chrome",
    firefox: "firefox",
    opera: "opera",
    safari: "safari",
    safari_ios: "ios_saf",
    ie: "ie",
    edge_mobile: "ie_mob",
    edge: "edge",
    opera_android: "and_opera",
    chrome_android: "and_chrome",
    firefox_android: "and_firefox",
    webview_android: "and_webview",
    samsunginternet_android: "and_samsung",
    nodejs: "node",
};
const reversedTargetMappings = (0, helpers_1.reverseTargetMappings)(targetIdMappings);
/**
 * Take a target's id and return it's full name by using `targetNameMappings`
 * ex. {target: and_ff, version: 40} => 'Android FireFox 40'
 */
function formatTargetNames(target) {
    return `${constants_1.STANDARD_TARGET_NAME_MAPPING[target.target]} ${target.version}`;
}
/**
 * Convert '9' => '9.0.0'
 */
function customCoerce(version) {
    return version.length === 1 ? [version, 0, 0].join(".") : version;
}
/*
 * Return if MDN supports the API or not
 */
function isSupportedByMDN(node, { version, target: mdnTarget }) {
    // @ts-ignore
    const target = reversedTargetMappings[mdnTarget];
    // If no record could be found, return true. Rules might not
    // be found because they could belong to another provider
    if (!mdnRecords.has(node.protoChainId))
        return true;
    const record = mdnRecords.get(node.protoChainId);
    if (!record || !record.compat.support)
        return true;
    const compatRecord = record.compat.support[target];
    if (!compatRecord)
        return true;
    if (!Array.isArray(compatRecord) && !("version_added" in compatRecord))
        return true;
    const { version_added: versionAdded } = Array.isArray(compatRecord)
        ? compatRecord.find((e) => "version_added" in e)
        : compatRecord;
    // If a version is true then it is supported but version is unsure
    if (typeof versionAdded === "boolean")
        return versionAdded;
    if (versionAdded === null)
        return true;
    // Special case for Safari TP: TP is always gte than any other releases
    if (target === "safari") {
        if (version === "TP")
            return true;
        if (versionAdded === "TP")
            return false;
    }
    // A browser supports an API if its version is greater than or equal
    // to the first version of the browser that API was added in
    const semverCurrent = semver_1.default.coerce(customCoerce(String(version)));
    const semverAdded = semver_1.default.coerce(customCoerce(versionAdded));
    // semver.coerce() might be null for non-semvers (other than Safari TP)
    // Just warn and treat features as supported here for now to avoid lint from
    // crashing
    if (!semverCurrent) {
        // eslint-disable-next-line no-console
        console.warn(`eslint-plugin-compat: A non-semver target "${target} ${version}" matched for the feature ${node.protoChainId}, skipping. You're welcome to submit this log to https://github.com/amilajack/eslint-plugin-compat/issues for analysis.`);
        return true;
    }
    if (!versionAdded) {
        // eslint-disable-next-line no-console
        console.warn(`eslint-plugin-compat: The feature ${node.protoChainId} is supported since a non-semver target "${target} ${versionAdded}", skipping. You're welcome to submit this log to https://github.com/amilajack/eslint-plugin-compat/issues for analysis.`);
        return true;
    }
    if (!semverAdded)
        return false;
    return semver_1.default.gte(semverCurrent, semverAdded);
}
exports.isSupportedByMDN = isSupportedByMDN;
/**
 * Return an array of all unsupported targets
 */
function getUnsupportedTargets(node, targets) {
    return targets
        .filter((target) => !isSupportedByMDN(node, target))
        .map(formatTargetNames);
}
exports.getUnsupportedTargets = getUnsupportedTargets;
function getMetadataName(metadata) {
    switch (metadata.protoChain.length) {
        case 1: {
            return metadata.protoChain[0];
        }
        default:
            return `${metadata.protoChain.join(".")}()`;
    }
}
const MdnProvider = apis
    // Create entries for each ast node type
    .map((metadata) => metadata.astNodeTypes.map((astNodeType) => ({
    ...metadata,
    name: getMetadataName(metadata),
    id: metadata.protoChainId,
    protoChainId: metadata.protoChainId,
    astNodeType,
    object: metadata.protoChain[0],
    // @TODO Handle cases where 'prototype' is in protoChain
    property: metadata.protoChain[1],
})))
    // Flatten the array of arrays
    .flat()
    // Add rule and target support logic for each entry
    .map((rule) => ({
    ...rule,
    getUnsupportedTargets,
}));
exports.default = MdnProvider;
