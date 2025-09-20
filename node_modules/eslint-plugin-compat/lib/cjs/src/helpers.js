"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBrowsersListVersion = exports.determineTargetsFromConfig = exports.reverseTargetMappings = exports.lintMemberExpression = exports.lintExpressionStatement = exports.lintNewExpression = exports.lintCallExpression = void 0;
/* eslint no-nested-ternary: off */
const browserslist_1 = __importDefault(require("browserslist"));
/*
3) Figures out which browsers user is targeting

- Uses browserslist config and/or targets defined eslint config to discover this
- For every API ecnountered during traversal, gets compat record for that
- Protochain (e.g. 'document.querySelector')
  - All of the rules have compatibility info attached to them
- Each API is given to versioning.ts with compatibility info
*/
function isInsideIfStatement(context) {
    return context.getAncestors().some((ancestor) => {
        return ancestor.type === "IfStatement";
    });
}
function checkNotInsideIfStatementAndReport(context, handleFailingRule, failingRule, node) {
    if (!isInsideIfStatement(context)) {
        handleFailingRule(failingRule, node);
    }
}
function lintCallExpression(context, handleFailingRule, rules, node) {
    if (!node.callee)
        return;
    const calleeName = node.callee.name;
    const failingRule = rules.find((rule) => rule.object === calleeName);
    if (failingRule)
        checkNotInsideIfStatementAndReport(context, handleFailingRule, failingRule, node);
}
exports.lintCallExpression = lintCallExpression;
function lintNewExpression(context, handleFailingRule, rules, node) {
    if (!node.callee)
        return;
    const calleeName = node.callee.name;
    const failingRule = rules.find((rule) => rule.object === calleeName);
    if (failingRule)
        checkNotInsideIfStatementAndReport(context, handleFailingRule, failingRule, node);
}
exports.lintNewExpression = lintNewExpression;
function lintExpressionStatement(context, handleFailingRule, rules, node) {
    if (!node?.expression?.name)
        return;
    const failingRule = rules.find((rule) => rule.object === node?.expression?.name);
    if (failingRule)
        checkNotInsideIfStatementAndReport(context, handleFailingRule, failingRule, node);
}
exports.lintExpressionStatement = lintExpressionStatement;
function isStringLiteral(node) {
    return node.type === "Literal" && typeof node.value === "string";
}
function protoChainFromMemberExpression(node) {
    if (!node.object)
        return [node.name];
    const protoChain = (() => {
        if (node.object.type === "NewExpression" ||
            node.object.type === "CallExpression") {
            return protoChainFromMemberExpression(node.object.callee);
        }
        else if (node.object.type === "ArrayExpression") {
            return ["Array"];
        }
        else if (isStringLiteral(node.object)) {
            return ["String"];
        }
        else {
            return protoChainFromMemberExpression(node.object);
        }
    })();
    return [...protoChain, node.property.name];
}
function lintMemberExpression(context, handleFailingRule, rules, node) {
    if (!node.object || !node.property)
        return;
    if (!node.object.name ||
        node.object.name === "window" ||
        node.object.name === "globalThis") {
        const rawProtoChain = protoChainFromMemberExpression(node);
        const [firstObj] = rawProtoChain;
        const protoChain = firstObj === "window" || firstObj === "globalThis"
            ? rawProtoChain.slice(1)
            : rawProtoChain;
        const protoChainId = protoChain.join(".");
        const failingRule = rules.find((rule) => rule.protoChainId === protoChainId);
        if (failingRule) {
            checkNotInsideIfStatementAndReport(context, handleFailingRule, failingRule, node);
        }
    }
    else {
        const objectName = node.object.name;
        const propertyName = node.property.name;
        const failingRule = rules.find((rule) => rule.object === objectName &&
            (rule.property == null || rule.property === propertyName));
        if (failingRule)
            checkNotInsideIfStatementAndReport(context, handleFailingRule, failingRule, node);
    }
}
exports.lintMemberExpression = lintMemberExpression;
function reverseTargetMappings(targetMappings) {
    const reversedEntries = Object.entries(targetMappings).map((entry) => entry.reverse());
    return Object.fromEntries(reversedEntries);
}
exports.reverseTargetMappings = reverseTargetMappings;
/**
 * Determine the targets based on the browserslist config object
 * Get the targets from the eslint config and merge them with targets in browserslist config
 * Eslint target config will be deprecated in 4.0.0
 *
 * @param configPath - The file or a directory path to look for the browserslist config file
 */
function determineTargetsFromConfig(configPath, config, browserslistOptsFromConfig) {
    const browserslistOpts = { path: configPath, ...browserslistOptsFromConfig };
    const eslintTargets = (() => {
        // Get targets from eslint settings
        if (Array.isArray(config) || typeof config === "string") {
            return (0, browserslist_1.default)(config, browserslistOpts);
        }
        if (config && typeof config === "object") {
            return (0, browserslist_1.default)([...(config.production || []), ...(config.development || [])], browserslistOpts);
        }
        return [];
    })();
    if (browserslist_1.default.findConfig(configPath)) {
        // If targets are defined in ESLint and browerslist configs, merge the targets together
        if (eslintTargets.length) {
            const browserslistTargets = (0, browserslist_1.default)(undefined, browserslistOpts);
            return Array.from(new Set(eslintTargets.concat(browserslistTargets)));
        }
    }
    else if (eslintTargets.length) {
        return eslintTargets;
    }
    // Get targets fron browserslist configs
    return (0, browserslist_1.default)(undefined, browserslistOpts);
}
exports.determineTargetsFromConfig = determineTargetsFromConfig;
/**
 * Parses the versions that are given by browserslist. They're
 *
 * ```ts
 * parseBrowsersListVersion(['chrome 50'])
 *
 * {
 *   target: 'chrome',
 *   parsedVersion: 50,
 *   version: '50'
 * }
 * ```
 * @param targetslist - List of targest from browserslist api
 * @returns - The lowest version version of each target
 */
function parseBrowsersListVersion(targetslist) {
    return (
    // Sort the targets by target name and then version number in ascending order
    targetslist
        .map((e) => {
        const [target, version] = e.split(" ");
        const parsedVersion = (() => {
            if (typeof version === "number")
                return version;
            if (version === "all")
                return 0;
            return version.includes("-")
                ? parseFloat(version.split("-")[0])
                : parseFloat(version);
        })();
        return {
            target,
            version,
            parsedVersion,
        };
    }) // Sort the targets by target name and then version number in descending order
        // ex. [a@3, b@3, a@1] => [a@3, a@1, b@3]
        .sort((a, b) => {
        if (b.target === a.target) {
            // If any version === 'all', return 0. The only version of op_mini is 'all'
            // Otherwise, compare the versions
            return typeof b.parsedVersion === "string" ||
                typeof a.parsedVersion === "string"
                ? 0
                : b.parsedVersion - a.parsedVersion;
        }
        return b.target > a.target ? 1 : -1;
    }) // First last target always has the latest version
        .filter((e, i, items) => 
    // Check if the current target is the last of its kind.
    // If it is, then it's the most recent version.
    i + 1 === items.length || e.target !== items[i + 1].target));
}
exports.parseBrowsersListVersion = parseBrowsersListVersion;
