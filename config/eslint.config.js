import js from "@eslint/js";
import globals from "globals";

const customGlobals = {
	extension: "writable",
	ImprovedTube: "writable",
	chrome: "readonly",
}

export default [
	js.configs.recommended,
	{
		languageOptions: { globals: {
			...customGlobals,
			...globals.browser,
		}},
		ignores: ["../node_modules", "."],
		rules: {
			indent: ["error", "tab", {"SwitchCase": 1}],
			"brace-style": ["error", "1tbs", { "allowSingleLine": true }],
			"no-empty": ["error", { "allowEmptyCatch": true }],
			"no-unused-vars": ["error", { "caughtErrors": "none" }],
			"no-undef": "off",
			"no-trailing-spaces": "warn",
			"no-multi-spaces": "warn",
			"semi-spacing": "warn",
			"comma-spacing": "warn",
			"no-fallthrough": ["error", { "allowEmptyCase": true }],
			"no-implicit-globals": "error",
			"no-multiple-empty-lines": ["warn", {"max": 2, "maxBOF": 0, "maxEOF": 0}],
			"keyword-spacing": ["warn", { "before": true, "after": true }],
			"space-before-function-paren": "warn",
			"space-before-blocks": "warn",
			"max-len": ["error", {
				code: 255,
				ignoreUrls: true,
				ignoreStrings: true,
				ignoreComments: true,
				ignoreRegExpLiterals: true
			}],
		},
	},
];
