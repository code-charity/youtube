"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodes = void 0;
/*
 * Step 3) Compat use CanIUse and MDN providers to check if a target browser supports a particular API
 */
const caniuse_provider_1 = __importDefault(require("./caniuse-provider"));
const mdn_provider_1 = __importDefault(require("./mdn-provider"));
exports.nodes = [
    ...caniuse_provider_1.default,
    ...mdn_provider_1.default,
];
