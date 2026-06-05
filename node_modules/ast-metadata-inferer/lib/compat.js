"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const metadata_1 = __importDefault(require("./metadata"));
const mdn_1 = __importDefault(require("./providers/mdn"));
/**
 * Write compat.json file which contains API metadata and compat data
 */
async function Compat() {
    const astMetadata = await (0, metadata_1.default)();
    // Add all the corresponding compat data for each inferred ast node
    const compatDataMap = new Map((0, mdn_1.default)().map((e) => [e.protoChainId, e]));
    const apisWithCompatRecords = astMetadata.filter((api) => compatDataMap.has(api.protoChainId));
    const compatRecordsFile = path_1.default.join(__dirname, "../compat.json");
    await fs_1.default.promises.writeFile(compatRecordsFile, JSON.stringify(apisWithCompatRecords));
    return apisWithCompatRecords;
}
exports.default = Compat;
if (require.main === module) {
    Compat()
        .then(() => {
        process.exit(0);
    })
        .catch((e) => {
        throw new Error(e);
    });
}
