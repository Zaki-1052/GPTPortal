const wasm = require("./tiktoken_bg.cjs");
let imports = {};
imports["./tiktoken_bg.js"] = wasm;
const path = require("path");
const fs = require("fs");

const candidates = __dirname
  .split(path.sep)
  .reduce((memo, _, index, array) => {
    const prefix = array.slice(0, index + 1).join(path.sep) + path.sep;
    if (!prefix.includes("node_modules" + path.sep)) {
      memo.unshift(
        path.join(
          prefix,
          "node_modules",
          "tiktoken",
          "",
          "./tiktoken_bg.wasm"
        )
      );
    }
    return memo;
  }, [])
candidates.unshift(path.join(__dirname, "./tiktoken_bg.wasm"));

let bytes = null;
for (const candidate of candidates) {
  try {
    bytes = fs.readFileSync(candidate);
    break;
  } catch {}
}

if (bytes == null) throw new Error("Missing tiktoken_bg.wasm");
const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm.__wbg_set_wasm(wasmInstance.exports);
exports["get_encoding"] = wasm["get_encoding"];
exports["encoding_for_model"] = wasm["encoding_for_model"];
exports["get_encoding_name_for_model"] = wasm["get_encoding_name_for_model"];
exports["Tiktoken"] = wasm["Tiktoken"];