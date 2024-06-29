"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
// @ts-expect-error
const imports = require("./tiktoken_bg.cjs");
let isInitialized = false;
async function init(callback) {
    if (isInitialized)
        return imports;
    const result = await callback({ "./tiktoken_bg.js": imports });
    const instance = "instance" in result && result.instance instanceof WebAssembly.Instance
        ? result.instance
        : result instanceof WebAssembly.Instance
            ? result
            : null;
    if (instance == null)
        throw new Error("Missing instance");
    imports.__wbg_set_wasm(instance.exports);
    isInitialized = true;
    return imports;
}
exports.init = init;
exports["Tiktoken"] = imports["Tiktoken"];
// @ts-expect-error
__exportStar(require("./tiktoken_bg.cjs"), exports);
