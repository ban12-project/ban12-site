import * as wasm from "./calculate_hash_bg.wasm";
import { __wbg_set_wasm } from "./calculate_hash_bg.js";
__wbg_set_wasm(wasm);
export * from "./calculate_hash_bg.js";
