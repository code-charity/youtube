import { AstMetadataApiWithTargetsResolver, Target } from "../types";
export declare function isSupportedByMDN(node: AstMetadataApiWithTargetsResolver, { version, target: mdnTarget }: Target): boolean;
/**
 * Return an array of all unsupported targets
 */
export declare function getUnsupportedTargets(node: AstMetadataApiWithTargetsResolver, targets: Target[]): string[];
declare const MdnProvider: Array<AstMetadataApiWithTargetsResolver>;
export default MdnProvider;
