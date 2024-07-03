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
	languageOptions: {
		globals: {

		  ...globals.browser,
		  ...globals.node,
		  ...globals.webextensions,
		  ...globals.jest,
		  ...globals.worker,
		  ...globals.wsh,
		  "ImprovedTube" : false,
		  "satus": false,
		  "extension": false,
		  "loading": false,
		  "vertical": false,
		  "shorts": false,
		  "DATA": false,
		  "keywords": false
		},
	},
	rules: {
		indent: ["error", "tab"],

		"max-len": ["error", {
			code: 255,
			ignoreUrls: true,
			ignoreStrings: true,
			ignoreComments: true,
			ignoreRegExpLiterals: true,
		}],
		"no-undef": "off"
	},
}];