"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelCaseToHyphen = void 0;
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-nocheck
const microsoft_api_catalog_data_json_1 = __importDefault(require("./microsoft-api-catalog-data.json"));
const has_prefix_1 = __importDefault(require("../../helpers/has-prefix"));
const normalize_protochain_1 = __importDefault(require("../../helpers/normalize-protochain"));
const types_1 = require("../../types");
/**
 * Comvert camelcase phrases to hypen-separated words
 * ex. camelCase => camel-case
 * This is used to map CSS DOM API names to css properties and attributes
 */
function camelCaseToHyphen(string) {
    return (Array
        // Covert string to array
        .from(string)
        // If char `X` is uppercase, map it to `-x`
        .map((curr) => curr === curr.toUpperCase() ? `-${curr.toLowerCase()}` : curr, [])
        .join(""));
}
exports.camelCaseToHyphen = camelCaseToHyphen;
/**
 * @TODO: Allow overriding database records
 */
function MicrosoftAPICatalogProvider() {
    const formattedRecords = [];
    const ignoredAPIs = [
        "arguments",
        "caller",
        "constructor",
        "length",
        "name",
        "prototype",
    ];
    // Convert two dimentional records to single dimentional array
    microsoft_api_catalog_data_json_1.default.forEach((record) => {
        formattedRecords.push({
            ...record,
            parentName: record.name,
            protoChain: [(0, normalize_protochain_1.default)(record.name)],
            protoChainId: (0, normalize_protochain_1.default)(record.name),
            spec: record.spec || false,
            webidlId: record.name,
        });
        record.apis.forEach((api) => {
            // @TODO: Properly strip vendor prefixes and check if non-prefixed API
            //        exists. If not, create the record for it
            formattedRecords.push({
                ...api,
                spec: record.spec || false,
                parentName: record.name,
            });
        });
    });
    const JSAPIs = formattedRecords
        // Filter all CSS records. For some reason reason, MicrosoftAPICatalog does not report
        // the correctly. Validate that the record's name is a string. Some record
        // names are numbers from some odd reason
        .filter((formattedRecord) => !formattedRecord.name.includes("-") &&
        formattedRecord.parentName !== "CSS2Properties" &&
        Number.isNaN(parseInt(formattedRecord.name, 10)) &&
        typeof formattedRecord.spec !== "undefined")
        .map((formattedRecord) => {
        const protoChain = (formattedRecord.protoChain || [
            (0, normalize_protochain_1.default)(formattedRecord.parentName),
            formattedRecord.name,
        ])
            // Remove 'window' from the protochain
            .filter((e) => e !== "window");
        return {
            id: formattedRecord.name,
            name: formattedRecord.name,
            specNames: formattedRecord.specNames,
            language: types_1.Language.JS,
            specIsFinished: formattedRecord.spec,
            protoChain,
            protoChainId: protoChain.join("."),
            compat: {},
        };
    })
        .filter((record) => record.name !== "defaultStatus" &&
        record.protoChain.length !== 0 &&
        !ignoredAPIs.includes(record.name) &&
        !(0, has_prefix_1.default)(record.name) &&
        !(0, has_prefix_1.default)(record.protoChainId) &&
        !(0, has_prefix_1.default)(record.id));
    // Find the CSS DOM API's and use them create the css style records
    // const CSSAPIs = JSAPIs
    //   .filter(record => record.protoChain.includes('CSSStyleDeclaration'))
    //   .map(record => ({
    //     ...record,
    //     id: camelCaseToHyphen(record.name),
    //     name: camelCaseToHyphen(record.name),
    //   }));
    // return [...CSSAPIs, ...JSAPIs];
    return JSAPIs;
}
exports.default = MicrosoftAPICatalogProvider;
