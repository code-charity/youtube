"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mdn_1 = __importDefault(require("./mdn"));
async function Providers() {
    const [mdnRecords] = await Promise.all([(0, mdn_1.default)()]);
    const map = new Map(mdnRecords.map((record) => [record.protoChainId, record]));
    return Array.from(map.values()).filter((record) => !record.protoChain.includes("RegExp") &&
        !record.protoChainId.includes("@@"));
}
exports.default = Providers;
