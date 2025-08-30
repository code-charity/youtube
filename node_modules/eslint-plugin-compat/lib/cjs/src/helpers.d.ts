import { AstMetadataApiWithTargetsResolver, ESLintNode, BrowserListConfig, Target, HandleFailingRule, Context, BrowsersListOpts } from "./types";
export declare function lintCallExpression(context: Context, handleFailingRule: HandleFailingRule, rules: AstMetadataApiWithTargetsResolver[], node: ESLintNode): void;
export declare function lintNewExpression(context: Context, handleFailingRule: HandleFailingRule, rules: Array<AstMetadataApiWithTargetsResolver>, node: ESLintNode): void;
export declare function lintExpressionStatement(context: Context, handleFailingRule: HandleFailingRule, rules: AstMetadataApiWithTargetsResolver[], node: ESLintNode): void;
export declare function lintMemberExpression(context: Context, handleFailingRule: HandleFailingRule, rules: Array<AstMetadataApiWithTargetsResolver>, node: ESLintNode): void;
export declare function reverseTargetMappings<K extends string, V extends string>(targetMappings: Record<K, V>): Record<V, K>;
/**
 * Determine the targets based on the browserslist config object
 * Get the targets from the eslint config and merge them with targets in browserslist config
 * Eslint target config will be deprecated in 4.0.0
 *
 * @param configPath - The file or a directory path to look for the browserslist config file
 */
export declare function determineTargetsFromConfig(configPath: string, config?: BrowserListConfig, browserslistOptsFromConfig?: BrowsersListOpts): Array<string>;
/**
 * Parses the versions that are given by browserslist. They're
 *
 * ```ts
 * parseBrowsersListVersion(['chrome 50'])
 *
 * {
 *   target: 'chrome',
 *   parsedVersion: 50,
 *   version: '50'
 * }
 * ```
 * @param targetslist - List of targest from browserslist api
 * @returns - The lowest version version of each target
 */
export declare function parseBrowsersListVersion(targetslist: Array<string>): Array<Target>;
