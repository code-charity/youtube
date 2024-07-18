const rules = {
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
	"no-multiple-empty-lines": ["error", {"max": 1, "maxBOF": 0, "maxEOF": 0}],
	"keyword-spacing": ["warn", { "before": true, "after": true }],
	"space-before-function-paren": "warn",
	"space-before-blocks": "warn",
	"max-len": ["error", {
	  code: 255,
	  ignoreUrls: true,
	  ignoreStrings: true,
	  ignoreComments: true,
	  ignoreRegExpLiterals: true
	}]
  };

import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import { fixupConfigRules } from '@eslint/compat';
import eslintPluginCompat from 'eslint-plugin-compat';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

const compatConfiguration = fixupConfigRules(
	eslintPluginCompat.configs['flat/recommended'],
)

export default [...compat.extends("eslint:recommended"), ...compatConfiguration, {
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
	rules: rules
}];
