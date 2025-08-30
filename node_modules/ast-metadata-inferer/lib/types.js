"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIKind = exports.Language = exports.AstNodeTypes = void 0;
var AstNodeTypes;
(function (AstNodeTypes) {
    AstNodeTypes["MemberExpression"] = "MemberExpression";
    AstNodeTypes["CallExpression"] = "CallExpression";
    AstNodeTypes["NewExpression"] = "NewExpression";
})(AstNodeTypes = exports.AstNodeTypes || (exports.AstNodeTypes = {}));
var Language;
(function (Language) {
    Language["JS"] = "js-api";
    Language["CSS"] = "css-api";
})(Language = exports.Language || (exports.Language = {}));
var APIKind;
(function (APIKind) {
    APIKind["Web"] = "web";
    APIKind["ES"] = "es";
})(APIKind = exports.APIKind || (exports.APIKind = {}));
