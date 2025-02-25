import * as wasm from "./tiktoken_bg.wasm";
export * from "./tiktoken_bg.js";
import { __wbg_set_wasm } from "./tiktoken_bg.js";
__wbg_set_wasm(wasm);