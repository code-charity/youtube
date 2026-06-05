/**
 * @fileoverview Configuration Migration
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import * as recast from "recast";
import { Legacy } from "@eslint/eslintrc";
import camelCase from "camelcase";
import pluginsNeedingCompat from "./compat-plugins.js";
import { convertIgnorePatternToMinimatch } from "@eslint/compat";

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("eslint").Linter.FlatConfig} FlatConfig */
/** @typedef {import("eslint").Linter.Config} Config  */
/** @typedef {import("eslint").Linter.ConfigOverride} ConfigOverride  */
/** @typedef {import("recast").types.namedTypes.ObjectExpression} ObjectExpression */
/** @typedef {import("recast").types.namedTypes.ArrayExpression} ArrayExpression */
/** @typedef {import("recast").types.namedTypes.CallExpression} CallExpression */
/** @typedef {import("recast").types.namedTypes.Property} Property */
/** @typedef {import("recast").types.namedTypes.MemberExpression} MemberExpression */
/** @typedef {import("recast").types.namedTypes.Program} Program */
/** @typedef {import("recast").types.namedTypes.Statement} Statement */
/** @typedef {import("recast").types.namedTypes.Literal} Literal */
/** @typedef {import("recast").types.namedTypes.SpreadElement} SpreadElement */
/** @typedef {import("./types.js").MigrationImport} MigrationImport */

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

const keysToCopy = ["settings", "rules", "processor"];
const linterOptionsKeysToCopy = [
	"noInlineConfig",
	"reportUnusedDisableDirectives",
];

//-----------------------------------------------------------------------------
// Classes
//-----------------------------------------------------------------------------

/**
 * Represents a migration from one config to another.
 */
class Migration {
	/**
	 * The config to migrate.
	 * @type {Config}
	 */
	config;

	/**
	 * Any imports required for the new config.
	 * @type {Map<string,MigrationImport>}
	 */
	imports = new Map();

	/**
	 * Any messages to display to the user.
	 * @type {string[]}
	 */
	messages = [];

	/**
	 * Whether or not the migration needs the `__dirname` variable defined.
	 * @type {boolean}
	 */
	needsDirname = false;

	/**
	 * Any initialization needed in the file.
	 * @type {Array<Statement>}
	 */
	inits = [];

	/**
	 * Creates a new Migration object.
	 * @param {Config} config The config to migrate.
	 */
	constructor(config) {
		this.config = config;
	}
}

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const { builders: b } = recast.types;
const { naming } = Legacy;

/**
 * Determines if a string is a valid identifier.
 * @param {string} name The name to check.
 * @returns {boolean} `true` if the name is a valid identifier.
 */
function isValidIdentifier(name) {
	return /^[a-z_$][0-9a-z_$]*$/iu.test(name);
}

/**
 * Gets the name of the variable to use for the parser.
 * @param {string|undefined} parser The name of the parser.
 * @returns {string|undefined} The variable name to use or undefined if none.
 */
function getParserVariableName(parser) {
	if (!parser) {
		return undefined;
	}

	if (parser.includes("typescript-eslint")) {
		return "tsParser";
	}

	if (parser.includes("babel")) {
		return "babelParser";
	}

	if (parser === "espree") {
		return "espree";
	}

	return "parser";
}

// cache for plugins needing compat
const pluginsNeedingCompatCache = new Set(pluginsNeedingCompat);

/**
 * Determines if a plugin needs the compat utility.
 * @param {string} pluginName The name of the plugin.
 * @returns {boolean} `true` if the plugin needs the compat utility.
 */
function pluginNeedsCompat(pluginName) {
	const pluginNameToTest = pluginName.includes("/")
		? pluginName.slice(0, pluginName.indexOf("/"))
		: pluginName;

	return pluginsNeedingCompatCache.has(
		naming.normalizePackageName(pluginNameToTest, "eslint-plugin"),
	);
}

/**
 * Gets the name of the variable to use for the plugin. If the plugin name
 * contains slashes or an @ symbol, it will be normalized to a camelcase name.
 * If the name is "import" or "export", it will be prefixed with an underscore.
 * @param {string} pluginName The name of the plugin.
 * @returns {string} The variable name to use.
 */
function getPluginVariableName(pluginName) {
	let name = pluginName.replace(/^eslint-plugin-/u, "");

	if (name === "import" || name === "export") {
		return `_${name}`;
	}

	if (name.startsWith("@")) {
		name = name.slice(1);
	}

	return camelCase(name);
}

/**
 * Get the initialization code for `__dirname`.
 * @returns {Array<Statement>} The AST for the initialization block.
 */
function getDirnameInit() {
	/*
	 * Recast doesn't support `import.meta.url`, so using an uppercase "I" to
	 * allow for parsing. We then need to replace it with the lowercase "i".
	 */
	const init = `\n
const __filename = fileURLToPath(Import.meta.url);
const __dirname = path.dirname(__filename);`;

	const result = recast.parse(init).program.body;

	// Replace uppercase "I" with lowercase "i" in "Import.meta.url"
	result[0].declarations[0].init.arguments[0].object.object.name = "import";

	return result;
}

/**
 * Creates an initialization block for the FlatCompat utility.
 * @returns {Array<Statement>} The AST for the initialization block.
 */
function getFlatCompatInit() {
	const init = `
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});
`;
	return recast.parse(init).program.body;
}

/**
 * Creates an initialization block for the gitignore file.
 * @returns {Statement} The AST for the initialization block.
 */
function getGitignoreInit() {
	const init = `
const gitignorePath = path.resolve(__dirname, ".gitignore");
`;

	return recast.parse(init).program.body[0];
}

/**
 * Converts a glob pattern to a format that can be used in a flat config.
 * @param {string} pattern The glob pattern to convert.
 * @returns {string} The converted glob pattern.
 */
function convertGlobPattern(pattern) {
	const isNegated = pattern.startsWith("!");
	const patternToTest = isNegated ? pattern.slice(1) : pattern;

	// if the pattern is already in the correct format, return it
	if (patternToTest === "**" || patternToTest.includes("/")) {
		return pattern;
	}

	return `${isNegated ? "!" : ""}**/${patternToTest}`;
}

/**
 * Creates the entry for the gitignore inclusion.
 * @param {Migration} migration The migration object.
 * @returns {CallExpression} The AST for the gitignore entry.
 */
function createGitignoreEntry(migration) {
	migration.inits.push(getGitignoreInit());

	if (!migration.imports.has("@eslint/compat")) {
		migration.imports.set("@eslint/compat", {
			bindings: ["includeIgnoreFile"],
			added: true,
		});
	} else {
		migration.imports
			.get("@eslint/compat")
			.bindings.push("includeIgnoreFile");
	}

	if (!migration.imports.has("node:path")) {
		migration.imports.set("node:path", {
			name: "path",
			added: true,
		});
	}

	const code = `includeIgnoreFile(gitignorePath)`;

	return recast.parse(code).program.body[0].expression;
}

/**
 * Creates the globals object from the config.
 * @param {Config} config The config to create globals from.
 * @returns {ObjectExpression|undefined} The globals object or undefined if none.
 */
function createGlobals(config) {
	const { globals, env } = config;

	if (!globals && !env) {
		return undefined;
	}

	const properties = [];

	if (env) {
		properties.push(
			...Object.keys(env)
				.filter(name => !name.startsWith("es"))
				.map(name => {
					let envName = name;
					const memberExpression = b.memberExpression(
						b.identifier("globals"),
						b.identifier(name),
					);

					// plugins environments in the form plugin/env
					if (name.includes("/")) {
						const [pluginName, pluginEnvName] = name.split("/");
						const pluginVariableName =
							getPluginVariableName(pluginName);

						// looks like plugin.environments.envName.globals
						memberExpression.object = b.memberExpression(
							b.memberExpression(
								b.identifier(pluginVariableName),
								b.identifier("environments"),
							),
							isValidIdentifier(pluginEnvName)
								? b.identifier(pluginEnvName)
								: b.literal(pluginEnvName),
							!isValidIdentifier(pluginEnvName),
						);
						memberExpression.property = b.identifier("globals");
						envName = pluginEnvName;
					}

					// if the name is not a valid identifier, use computed syntax
					if (!isValidIdentifier(envName)) {
						memberExpression.computed = true;
						memberExpression.property = b.literal(envName);
					}

					const envValue = env[name];

					// environment is enabled
					if (envValue) {
						return b.spreadProperty(memberExpression);
					}

					// environment is disabled
					return b.spreadProperty(
						b.callExpression(
							b.memberExpression(
								b.identifier("Object"),
								b.identifier("fromEntries"),
							),
							[
								b.callExpression(
									b.memberExpression(
										b.callExpression(
											b.memberExpression(
												b.identifier("Object"),
												b.identifier("entries"),
											),
											[memberExpression],
										),
										b.identifier("map"),
									),
									[
										b.arrowFunctionExpression(
											[
												b.arrayPattern([
													b.identifier("key"),
												]),
											],
											b.arrayExpression([
												b.identifier("key"),
												b.literal("off"),
											]),
										),
									],
								),
							],
						),
					);
				}),
		);
	}

	if (globals) {
		properties.push(
			...Object.keys(globals).map(name =>
				b.property(
					"init",
					b.identifier(name),
					b.literal(globals[name]),
				),
			),
		);
	}

	return b.objectExpression(properties);
}

/**
 * Creates the linter options object from the config.
 * @param {Config} config The config to create linter options from.
 * @returns {ObjectExpression|undefined} The linter options object or undefined if none.
 */
function createLinterOptions(config) {
	if (!config.noInlineConfig && !config.reportUnusedDisableDirectives) {
		return undefined;
	}

	const properties = [];

	linterOptionsKeysToCopy.forEach(key => {
		if (config[key]) {
			properties.push(
				b.property("init", b.identifier(key), b.literal(config[key])),
			);
		}
	});

	return b.objectExpression(properties);
}

/**
 * Creates an array of function arguments from an array of extended configs.
 * @param {string|string[]} extendedConfigs The extended configs to convert.
 * @returns {Array<Literal>} The AST for the array expression.
 */
function createExtendsArguments(extendedConfigs) {
	// create an array of strings
	if (typeof extendedConfigs === "string") {
		return [b.literal(extendedConfigs)];
	}

	return extendedConfigs.map(config => b.literal(config));
}

/**
 * Creates a an object expression that duplicates an existing object.
 * @param {Object} value The object to create the AST for.
 * @returns {ObjectExpression|ArrayExpression|Literal} The AST for the object.
 */
function createAST(value) {
	if (Array.isArray(value)) {
		return b.arrayExpression(value.map(item => createAST(item)));
	}

	if (value && typeof value === "object") {
		const properties = Object.keys(value).map(key => {
			const propertyValue = value[key];
			const identifier = isValidIdentifier(key)
				? b.identifier(key)
				: b.literal(key);
			return b.property("init", identifier, createAST(propertyValue));
		});

		return b.objectExpression(properties);
	}

	return b.literal(value);
}

/**
 * Creates an array expression from an array of glob patterns.
 * @param {string[]} patterns The glob patterns to convert.
 * @returns {ArrayExpression} The AST for the array expression.
 */
function createFilesArray(patterns) {
	return b.arrayExpression(
		patterns.map(pattern => b.literal(convertGlobPattern(pattern))),
	);
}

/**
 * Creates an object expression for the language options.
 * @param {Migration} migration The migration object.
 * @param {Config} config The config to create language options from.
 * @returns {ObjectExpression|undefined} The AST for the object expression or undefined if none.
 */
function createLanguageOptions(migration, config) {
	const properties = [];
	const { imports, messages } = migration;

	// Both `env` and `globals` end up as globals in flat config
	const globals = createGlobals(config);
	if (globals) {
		properties.push(b.property("init", b.identifier("globals"), globals));
	}

	/*
	 * For `env`, we need the `globals` package if there are any environments
	 * that aren't ECMAScript environments and also aren't from plugins
	 * (the name contains a slash).
	 */
	const needsGlobals =
		config.env &&
		Object.keys(config.env).some(
			envName => !envName.startsWith("es") && !envName.includes("/"),
		);

	if (needsGlobals && !imports.has("globals")) {
		imports.set("globals", {
			name: "globals",
			added: true,
		});
	}

	// Copy over `parser`
	const parserName = getParserVariableName(config.parser);
	if (parserName) {
		properties.push(
			b.property(
				"init",
				b.identifier("parser"),
				b.identifier(parserName),
			),
		);
		imports.set(config.parser, {
			name: parserName,
		});
	}

	// Copy over `parserOptions`
	if (config.parserOptions) {
		const {
			ecmaVersion = 5,
			sourceType = "script",
			...otherParserOptions
		} = config.parserOptions;

		// move `ecmaVersion` to `languageOptions`
		properties.push(
			b.property(
				"init",
				b.identifier("ecmaVersion"),
				b.literal(ecmaVersion),
			),
		);

		// move `sourceType` to `languageOptions` -- be sure to check for Node.js environment
		/** @type {"module"|"script"|"commonjs"} */
		let finalSourceType = sourceType;
		if (config?.env?.node) {
			if (sourceType === "module") {
				messages.push(
					"The 'node' environment is used, but the sourceType is 'module'. Using sourceType 'module'. If you want to use CommonJS modules, set the sourceType to 'commonjs'.",
				);
			} else {
				finalSourceType = "commonjs";
				messages.push(
					"The 'node' environment is used, so switching sourceType to 'commonjs'.",
				);
			}
		}

		properties.push(
			b.property(
				"init",
				b.identifier("sourceType"),
				b.literal(finalSourceType),
			),
		);

		if (Object.keys(otherParserOptions).length > 0) {
			properties.push(
				b.property(
					"init",
					b.identifier("parserOptions"),
					createAST(otherParserOptions),
				),
			);
		}
	}

	return properties.length ? b.objectExpression(properties) : undefined;
}

/**
 * Creates an object expression for the plugins array. Also adds the necessary imports
 * to the migration imports map.
 * @param {string[]} plugins The plugins to create the object expression for.
 * @param {Migration} migration The migration object.
 * @returns {ObjectExpression} The AST for the object expression.
 */
function createPlugins(plugins, migration) {
	const { imports } = migration;
	const properties = [];

	const compatNeeded = plugins.reduce((previous, pluginName) => {
		const pluginVariableName = getPluginVariableName(pluginName);
		const shortPluginName = naming.getShorthandName(
			pluginName,
			"eslint-plugin",
		);
		const needsCompat = pluginNeedsCompat(pluginName);

		const pluginValue = needsCompat
			? b.callExpression(b.identifier("fixupPluginRules"), [
					b.identifier(pluginVariableName),
				])
			: b.identifier(pluginVariableName);

		const pluginsProperty = b.property(
			"init",
			isValidIdentifier(shortPluginName)
				? b.identifier(shortPluginName)
				: b.literal(shortPluginName),
			pluginValue,
		);

		if (pluginVariableName === shortPluginName && !needsCompat) {
			pluginsProperty.shorthand = true;
		}

		properties.push(pluginsProperty);

		imports.set(naming.normalizePackageName(pluginName, "eslint-plugin"), {
			name: pluginVariableName,
		});

		return needsCompat || previous;
	}, false);

	if (compatNeeded) {
		if (!migration.imports.has("@eslint/compat")) {
			migration.imports.set("@eslint/compat", {
				bindings: ["fixupPluginRules"],
				added: true,
			});
		} else if (
			!migration.imports
				.get("@eslint/compat")
				.bindings.includes("fixupPluginRules")
		) {
			migration.imports
				.get("@eslint/compat")
				.bindings.push("fixupPluginRules");
		}
	}

	return b.objectExpression(properties);
}

/**
 * Creates an object expression for the `ignorePatterns` property.
 * @param {Config} config The config to create the object expression for.
 * @returns {ObjectExpression} The AST for the object expression.
 */
function createGlobalIgnores(config) {
	const ignorePatterns = Array.isArray(config.ignorePatterns)
		? config.ignorePatterns
		: [config.ignorePatterns];
	const ignorePatternsArray = b.arrayExpression(
		ignorePatterns.map(pattern =>
			b.literal(convertIgnorePatternToMinimatch(pattern)),
		),
	);
	return b.objectExpression([
		b.property("init", b.identifier("ignores"), ignorePatternsArray),
	]);
}

/**
 * Migrates a config object to the flat config format.
 * @param {Migration} migration The migration object.
 * @param {ConfigOverride} config The config object to migrate.
 * @returns {Array<ObjectExpression|SpreadElement>} The AST for the object expression.
 */
function migrateConfigObject(migration, config) {
	const configArrayElements = [];
	const properties = [];
	let files, ignores;

	// Copy over `files` -- should end up first by convention
	if (config.files) {
		files = createFilesArray(
			Array.isArray(config.files) ? config.files : [config.files],
		);
		properties.push(b.property("init", b.identifier("files"), files));
	}

	// Copy over `excludedFiles` -- should end up first if no `files` or second if `files` is present
	if (config.excludedFiles) {
		ignores = createFilesArray(
			Array.isArray(config.excludedFiles)
				? config.excludedFiles
				: [config.excludedFiles],
		);
		properties.push(b.property("init", b.identifier("ignores"), ignores));
	}

	// Handle `extends`
	if (config.extends) {
		let extendsCallExpression = b.callExpression(
			b.memberExpression(b.identifier("compat"), b.identifier("extends")),
			createExtendsArguments(config.extends),
		);

		const extendsArray = Array.isArray(config.extends)
			? config.extends
			: [config.extends];

		// Check if any of the extends are plugins that need the compat utility
		const needsCompat = extendsArray.some(extend => {
			if (!extend.startsWith("plugin:")) {
				return false;
			}

			return pluginNeedsCompat(extend.slice(7));
		});

		if (needsCompat) {
			/*
			 * When even one `extends` item needs compat, we need to mark every
			 * plugin as needing compat. This is because the `fixupConfigRules`
			 * function will be called on the entire object, and if any of those
			 * plugins is also referenced in `plugins`, the user will get a
			 * "can't redefine plugin" error.
			 */
			extendsArray.forEach(extend => {
				if (extend.startsWith("plugin:")) {
					const pluginName = extend.slice(7, extend.indexOf("/"));
					const normalizedPluginName = naming.normalizePackageName(
						pluginName,
						"eslint-plugin",
					);

					pluginsNeedingCompatCache.add(normalizedPluginName);
				}
			});

			if (!migration.imports.has("@eslint/compat")) {
				migration.imports.set("@eslint/compat", {
					bindings: ["fixupConfigRules"],
					added: true,
				});
			} else {
				migration.imports
					.get("@eslint/compat")
					.bindings.push("fixupConfigRules");
			}

			extendsCallExpression = b.callExpression(
				b.identifier("fixupConfigRules"),
				[extendsCallExpression],
			);
		}

		// if there are either files or ignores, map so the resulting object has files and ignores
		if (files || ignores) {
			extendsCallExpression = b.callExpression(
				b.memberExpression(extendsCallExpression, b.identifier("map")),
				[
					b.arrowFunctionExpression(
						[b.identifier("config")],
						b.objectExpression([
							b.spreadElement(b.identifier("config")),
							...(files
								? [
										b.property(
											"init",
											b.identifier("files"),
											files,
										),
									]
								: []),
							...(ignores
								? [
										b.property(
											"init",
											b.identifier("ignores"),
											ignores,
										),
									]
								: []),
						]),
					),
				],
			);
		}

		configArrayElements.push(b.spreadElement(extendsCallExpression));
	}

	/*
	 * Copy over plugins. This must happen after processing `extends` in order to
	 * properly account for plugins that need the compat utility.
	 */
	if (config.plugins) {
		properties.push(
			b.property(
				"init",
				b.identifier("plugins"),
				createPlugins(config.plugins, migration),
			),
		);
	}

	// Copy over `noInlineConfig` and `reportUnusedDisableDirectives`
	const linterOptions = createLinterOptions(config);
	if (linterOptions) {
		properties.push(
			b.property("init", b.identifier("linterOptions"), linterOptions),
		);
	}

	// Create `languageOptions` from `env`, `globals`, `parser`, and `parserOptions`
	const languageOptions = createLanguageOptions(migration, config);
	if (languageOptions) {
		properties.push(
			b.property(
				"init",
				b.identifier("languageOptions"),
				languageOptions,
			),
		);
	}

	// Copy over everything that stays the same - `settings`, `rules`, `processor`
	keysToCopy.forEach(key => {
		if (config[key]) {
			const propertyValue =
				typeof config[key] === "object"
					? createAST(config[key])
					: b.literal(config[key]);
			properties.push(
				b.property("init", b.identifier(key), propertyValue),
			);
		}
	});

	/*
	 * If there is an `extends` with a `files` and/or `ignores`, then it's possible this object
	 * will contain only `files` (and/or `ignores`), in which case we don't need it because there
	 * is already a config object with the same properties.
	 */
	const objectIsNeeded =
		!config.extends ||
		properties.some(property => {
			if (property.key.type === "Identifier") {
				return (
					property.key.name !== "files" &&
					property.key.name !== "ignores"
				);
			}

			return true;
		});
	if (objectIsNeeded) {
		configArrayElements.push(b.objectExpression(properties));
	}

	return configArrayElements;
}

/**
 * Migrates an eslintrc config to flat config format.
 * @param {Config} config The eslintrc config to migrate.
 * @param {Object} [options] Options for the migration.
 * @param {"module"|"commonjs"} [options.sourceType] The module type to use.
 * @param {boolean} [options.gitignore] `true` to include contents of a .gitignore file.
 * @returns {{code:string,messages:Array<string>,imports:Map<string,MigrationImport>}} The migrated config and
 * any messages to display to the user.
 */
export function migrateConfig(
	config,
	{ sourceType = "module", gitignore = false } = {},
) {
	const migration = new Migration(config);
	const body = [];

	/** @type {Array<CallExpression|ObjectExpression|SpreadElement>} */
	const configArrayElements = [
		...migrateConfigObject(
			migration,
			/** @type {ConfigOverride} */ (config),
		),
	];
	const isModule = sourceType === "module";

	// if the base config has no properties, then remove the empty object
	if (
		configArrayElements[0].type === "ObjectExpression" &&
		configArrayElements[0].properties.length === 0
	) {
		configArrayElements.shift();
	}

	// add any overrides
	if (config.overrides) {
		config.overrides.forEach(override => {
			configArrayElements.push(
				...migrateConfigObject(migration, override),
			);
		});
	}

	// if any config has extends then we need to add imports
	if (
		config.extends ||
		config.overrides?.some(override => override.extends)
	) {
		if (isModule) {
			migration.imports.set("node:path", {
				name: "path",
				added: true,
			});
			migration.imports.set("node:url", {
				bindings: ["fileURLToPath"],
				added: true,
			});
		}
		migration.imports.set("@eslint/js", {
			name: "js",
			added: true,
		});
		migration.imports.set("@eslint/eslintrc", {
			bindings: ["FlatCompat"],
			added: true,
		});
		migration.needsDirname ||= isModule;
		migration.inits.push(...getFlatCompatInit());
	}

	// add .gitignore if necessary
	if (gitignore) {
		migration.needsDirname ||= isModule;
		configArrayElements.unshift(createGitignoreEntry(migration));

		if (migration.needsDirname && !migration.imports.has("node:url")) {
			migration.imports.set("node:url", {
				bindings: ["fileURLToPath"],
				added: true,
			});
		}
	}

	if (config.ignorePatterns) {
		configArrayElements.unshift(createGlobalIgnores(config));
	}

	// add imports to the top of the file
	if (!isModule) {
		migration.imports.forEach(({ name, bindings }, path) => {
			const bindingProperties = bindings?.map(binding => {
				const bindingProperty = b.property(
					"init",
					b.identifier(binding),
					b.identifier(binding),
				);
				bindingProperty.shorthand = true;
				return bindingProperty;
			});

			body.push(
				name
					? b.variableDeclaration("const", [
							b.variableDeclarator(
								b.identifier(name),
								b.callExpression(b.identifier("require"), [
									b.literal(path),
								]),
							),
						])
					: b.variableDeclaration("const", [
							b.variableDeclarator(
								b.objectPattern(bindingProperties),
								b.callExpression(b.identifier("require"), [
									b.literal(path),
								]),
							),
						]),
			);
		});
	} else {
		migration.imports.forEach(({ name, bindings }, path) => {
			body.push(
				name
					? b.importDeclaration(
							[b.importDefaultSpecifier(b.identifier(name))],
							b.literal(path),
						)
					: b.importDeclaration(
							bindings.map(binding =>
								b.importSpecifier(b.identifier(binding)),
							),
							b.literal(path),
						),
			);
		});
	}

	// add calculation of `__dirname` if needed
	if (migration.needsDirname) {
		body.push(...getDirnameInit());
	}

	// output any inits
	body.push(...migration.inits);

	// output the actual config array to the program
	if (!isModule) {
		body.push(
			b.expressionStatement(
				b.assignmentExpression(
					"=",
					b.memberExpression(
						b.identifier("module"),
						b.identifier("exports"),
					),
					b.arrayExpression(configArrayElements),
				),
			),
		);
	} else {
		body.push(
			b.exportDefaultDeclaration(b.arrayExpression(configArrayElements)),
		);
	}

	return {
		// Recast doesn't export the `StatementKind` type so we need to cast the body to `Array<any>`
		code: recast.print(b.program(/** @type {Array<any>}*/ (body)), {
			tabWidth: 4,
			trailingComma: true,
			lineTerminator: "\n",
		}).code,
		messages: migration.messages,
		imports: migration.imports,
	};
}
