"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const providers_1 = __importDefault(require("./providers"));
const ast_node_types_tester_1 = __importDefault(require("./helpers/ast-node-types-tester"));
const API_BLACKLIST = ["close", "confirm", "print"];
async function astMetadataInferer() {
    // @HACK: Temporarily ignoring the last 1K records because they
    //        cause issues for some unknown reason. They prevent
    //        AstMetadataInferer from returning
    const providerResults = await (0, providers_1.default)();
    const records = providerResults.filter((metadata) => !API_BLACKLIST.includes(metadata.name));
    const file = path_1.default.join(__dirname, "..", "metadata.json");
    if (fs_1.default.existsSync(file)) {
        await fs_1.default.promises.unlink(file);
    }
    const promises = [];
    const parallelisim = 4;
    const eachRecordsSize = Math.floor(records.length / parallelisim);
    for (let i = 0; i < parallelisim; i += 1) {
        const recordsSliceEnd = i === parallelisim ? records.length + 1 : (i + 1) * eachRecordsSize;
        const recordsSlice = records.slice(i * eachRecordsSize, recordsSliceEnd);
        promises.push((0, ast_node_types_tester_1.default)(recordsSlice));
    }
    const recordsWithMetadata = await Promise.all(promises).then((res) => res.flat());
    await fs_1.default.promises.writeFile(file, JSON.stringify(recordsWithMetadata));
    return recordsWithMetadata;
}
exports.default = astMetadataInferer;
