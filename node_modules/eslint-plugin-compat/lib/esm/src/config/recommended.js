"use strict";
/**
 * @file Recommended configs for this plugin
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = __importDefault(require("globals"));
// Flat config: https://eslint.org/docs/latest/use/configure/configuration-files-new
const flat = {
    languageOptions: {
        globals: {
            ...globals_1.default.browser,
        },
    },
    rules: {
        "compat/compat": "error",
    },
};
// eslintrc config: https://eslint.org/docs/latest/use/configure/configuration-files
const legacy = {
    env: {
        browser: true,
    },
    rules: flat.rules,
};
const recommended = {
    flat,
    legacy,
};
exports.default = recommended;
