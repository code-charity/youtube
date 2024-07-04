import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

export default [...compat.extends("eslint:recommended"), {
	ignores: ["*.mjs"],
	languageOptions: {
		globals: {
			...globals.browser,
			...globals.node,
			...globals.webextensions,
			...globals.jest,
			...globals.worker,
			...globals.wsh
		},
		parserOptions: {
			ecmaFeatures: {
				globalReturn : true
			}
		}
	},
	rules: {
		indent: ["error", "tab", {"SwitchCase": 1}],
		"no-empty": ["error", { "allowEmptyCatch": true }],
		"no-unused-vars": ["error", { "caughtErrors": "none" }],
		"no-undef": ["off"],
		"no-trailing-spaces": "warn",
		"no-multi-spaces": "warn",
		"no-fallthrough": ["error", { "allowEmptyCase": true }],
		"no-implicit-globals": "error",
        "no-multiple-empty-lines": ["error", {"max": 1, "maxBOF": 0, "maxEOF": 0}],
		"max-len": ["error", {
			code: 255,
			ignoreUrls: true,
			ignoreStrings: true,
			ignoreComments: true,
			ignoreRegExpLiterals: true
		}]
	}
}];