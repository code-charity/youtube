"use strict";
/**
 * Determine if a css or javascript attribute is vendor-prefixed
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prefixes = exports.vendorPrefixMappings = void 0;
exports.vendorPrefixMappings = {
    chrome: "webkit",
    safari: "webkit",
    firefox: "moz",
    edge: "ms",
    ie: "ms",
};
exports.prefixes = Object.values(exports.vendorPrefixMappings);
/**
 * Determine if a css or js value is prefixed
 * ex. HasPrefix('document.mozOffscreenWidth()') => true
 * ex. HasPrefix('document.offscreenWidth()') => false
 */
function HasPrefix(property) {
    const lowerCaseProperty = property.toLowerCase();
    // $FlowFixMe: Waiting on github.com/facebook/flow/issues/2174
    return exports.prefixes.some((prefix) => lowerCaseProperty.includes(prefix));
}
exports.default = HasPrefix;
