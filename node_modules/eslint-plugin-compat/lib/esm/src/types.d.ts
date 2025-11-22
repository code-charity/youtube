import { APIKind } from "ast-metadata-inferer/lib/types";
import { Rule } from "eslint";
import { TargetNameMappings } from "./constants";
import type { Options as DefaultBrowsersListOpts } from "browserslist";
export type BrowserListConfig = string | Array<string> | {
    production?: Array<string>;
    development?: Array<string>;
} | null;
type AstMetadataApi = {
    type?: string;
    name?: string;
    object: string;
    astNodeType: "MemberExpression" | "CallExpression" | "NewExpression";
    property?: string;
    protoChainId: string;
    protoChain: Array<string>;
};
export interface Target {
    target: keyof TargetNameMappings;
    parsedVersion: number;
    version: number | string | "all";
}
export type HandleFailingRule = (node: AstMetadataApiWithTargetsResolver, eslintNode: ESLintNode) => void;
export type TargetNames = Array<string>;
export type ESLintNode = {
    name: string;
    type: string;
    value?: unknown;
    object?: ESLintNode;
    parent?: ESLintNode;
    expression?: ESLintNode;
    property?: ESLintNode;
    callee?: ESLintNode & {
        name: string;
        type?: string;
    };
};
export interface AstMetadataApiWithTargetsResolver extends AstMetadataApi {
    id: string;
    caniuseId?: string;
    kind?: APIKind;
    getUnsupportedTargets: (node: AstMetadataApiWithTargetsResolver, targets: Target[]) => Array<string>;
}
export interface Context extends Rule.RuleContext {
    settings: {
        targets?: string[];
        browsers?: Array<string>;
        polyfills?: Array<string>;
        lintAllEsApis?: boolean;
        browserslistOpts?: BrowsersListOpts;
    };
}
export interface BrowsersListOpts extends Exclude<DefaultBrowsersListOpts, "path"> {
}
export {};
