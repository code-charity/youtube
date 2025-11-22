import { Language, CssApiMetadata, ProviderApiMetadata } from "../types";
type CSSAssertions = {
    language: Language;
    apiIsSupported: string;
    allCSSValues: string;
    allCSSProperties: string;
};
type JSAssertions = {
    language: Language;
    apiIsSupported: string;
    determineASTNodeTypes: string;
    determineIsStatic: string;
};
export declare function getsCssAssertions(api: CssApiMetadata): CSSAssertions;
export declare function getJsAssertions(api: ProviderApiMetadata<Language.JS>): JSAssertions;
export default function astMetarataInfererTester(apiMetadata: ProviderApiMetadata<Language.JS>[]): Promise<ProviderApiMetadata[]>;
export {};
