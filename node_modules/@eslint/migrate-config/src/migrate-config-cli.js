#!/usr/bin/env node
/**
 * @fileoverview CLI to migrate an ESLint config.
 * @author Nicholas C. Zakas
 */

/*
 * IMPORTANT!
 *
 * Because this file is executable, `npm install` changes its permission to
 * include the executable bit. This is a problem because it causes the file to
 * be marked as changed in Git, even though it hasn't. This, in turn, causes
 * JSR to think the directory is dirty and fails the build. To prevent this,
 * we ran:
 * $ git update-index --chmod=+x packages/migrate-config/src/migrate-config-cli.js
 * This tells Git to ignore changes to the executable bit on this file.
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import fsp from "node:fs/promises";
import path from "node:path";
import { migrateConfig } from "./migrate-config.js";
import { Legacy } from "@eslint/eslintrc";

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

const args = process.argv.slice(2);
const configFilePath = args[0];
const commonjs = args.includes("--commonjs");
const gitignore = args.includes("--gitignore");
const { loadConfigFile } = Legacy;

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Loads an ignore file.
 * @param {string} filePath The path to the ignore file.
 * @returns {Promise<string[]|undefined>} The list of patterns to ignore.
 */
async function loadIgnoreFile(filePath) {
	try {
		const lines = (await fsp.readFile(filePath, "utf8")).split(/\r?\n/u);
		return lines.filter(
			line => line.trim() !== "" && !line.startsWith("#"),
		);
	} catch {
		return undefined;
	}
}

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

if (!configFilePath) {
	console.error("Usage: migrate-config <config-file>");
	process.exit(1);
}

const config = loadConfigFile(path.resolve(configFilePath));
const ignorePatterns = await loadIgnoreFile(
	path.resolve(configFilePath, "../", ".eslintignore"),
);
const resultExtname = commonjs ? "cjs" : "mjs";
const configFileExtname = path.extname(configFilePath);
const configFileBasename = path.basename(configFilePath, configFileExtname);
const resultFileBasename = configFileBasename.startsWith(".eslintrc")
	? "eslint.config"
	: configFileBasename;
const resultFilePath = `${path.dirname(configFilePath)}/${resultFileBasename}.${resultExtname}`;

console.log("\nMigrating", configFilePath);

if (configFileExtname.endsWith("js")) {
	console.error(
		"\nWARNING: This tool does not yet work great for .eslintrc.(js|cjs|mjs) files.",
	);
	console.error(
		"It will convert the evaluated output of our config file, not the source code.",
	);
	console.error(
		"Please review the output carefully to ensure it is correct.\n",
	);
}

if (ignorePatterns) {
	console.log("Also importing your .eslintignore file");

	if (!config.ignorePatterns) {
		config.ignorePatterns = [];
	}

	// put the .eslintignore patterns last so they can override config ignores
	config.ignorePatterns = [...config.ignorePatterns, ...ignorePatterns];
}

const result = migrateConfig(config, {
	sourceType: commonjs ? "commonjs" : "module",
	gitignore,
});
await fsp.writeFile(resultFilePath, result.code);

console.log("\nWrote new config to", resultFilePath);

if (result.imports.size) {
	const addedImports = [...result.imports.entries()]
		.filter(([key, imp]) => imp.added && !key.startsWith("node:"))
		.map(([key]) => key);

	console.log(
		"\nYou will need to install the following packages to use the new config:",
	);
	console.log(`${addedImports.map(imp => `- ${imp}`).join("\n")}\n`);
	console.log("You can install them using the following command:\n");
	console.log(`npm install ${addedImports.join(" ")} -D\n`);
}

if (result.messages.length) {
	console.log("The following messages were generated during migration:");
	console.log(`${result.messages.map(msg => `- ${msg}`).join("\n")}\n`);
}
