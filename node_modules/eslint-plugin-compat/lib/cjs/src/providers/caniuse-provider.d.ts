import { AstMetadataApiWithTargetsResolver, Target } from "../types";
/**
 * Return an array of all unsupported targets
 */
export declare function getUnsupportedTargets(node: AstMetadataApiWithTargetsResolver, targets: Target[]): string[];
declare const CanIUseProvider: Array<AstMetadataApiWithTargetsResolver>;
export default CanIUseProvider;
