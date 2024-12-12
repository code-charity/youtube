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
	languageOptions: {
		globals: {
			...customGlobals,
		  	...globals.browser,
		},
	},
	rules: {
		"no-unused-vars": [
			"error",
			{ destructuredArrayIgnorePattern: "^_" },
		],
	},
},

];
