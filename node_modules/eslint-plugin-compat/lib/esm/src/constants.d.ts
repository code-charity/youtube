export interface TargetNameMappings {
    chrome: "Chrome";
    firefox: "Firefox";
    safari: "Safari";
    ios_saf: "iOS Safari";
    ie: "IE";
    ie_mob: "IE Mobile";
    edge: "Edge";
    baidu: "Baidu";
    electron: "Electron";
    blackberry_browser: "Blackberry Browser";
    edge_mobile: "Edge Mobile";
    and_uc: "Android UC Browser";
    and_chrome: "Android Chrome";
    and_firefox: "Android Firefox";
    and_webview: "Android Webview";
    and_samsung: "Samsung Browser";
    and_opera: "Opera Android";
    opera: "Opera";
    opera_mini: "Opera Mini";
    opera_mobile: "Opera Mobile";
    node: "Node.js";
    kaios: "KaiOS";
}
export declare const STANDARD_TARGET_NAME_MAPPING: Readonly<TargetNameMappings>;
export declare enum AstNodeTypes {
    MemberExpression = "MemberExpression",
    CallExpression = "CallExpression",
    NewExpression = "NewExpression"
}
