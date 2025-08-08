"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstNodeTypes = exports.STANDARD_TARGET_NAME_MAPPING = void 0;
// Maps an ID to the full name user will see
// E.g. during error, user will see full name instead of ID
exports.STANDARD_TARGET_NAME_MAPPING = {
    chrome: "Chrome",
    firefox: "Firefox",
    safari: "Safari",
    ios_saf: "iOS Safari",
    ie: "IE",
    ie_mob: "IE Mobile",
    edge: "Edge",
    baidu: "Baidu",
    electron: "Electron",
    blackberry_browser: "Blackberry Browser",
    edge_mobile: "Edge Mobile",
    and_uc: "Android UC Browser",
    and_chrome: "Android Chrome",
    and_firefox: "Android Firefox",
    and_webview: "Android Webview",
    and_samsung: "Samsung Browser",
    and_opera: "Opera Android",
    opera: "Opera",
    opera_mini: "Opera Mini",
    opera_mobile: "Opera Mobile",
    node: "Node.js",
    kaios: "KaiOS",
};
var AstNodeTypes;
(function (AstNodeTypes) {
    AstNodeTypes["MemberExpression"] = "MemberExpression";
    AstNodeTypes["CallExpression"] = "CallExpression";
    AstNodeTypes["NewExpression"] = "NewExpression";
})(AstNodeTypes || (exports.AstNodeTypes = AstNodeTypes = {}));
