/**
 * setup.js — vitest 测试环境初始化
 *
 * 把 platform/js/ 里的 IIFE 脚本手动加载到 jsdom 全局 window 对象，
 * 让测试用例可以访问 window.HintEngine、window.ReviewEngine、window.Share 等。
 */

import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TextEncoder, TextDecoder } from "node:util";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 平台脚本目录：platform/tests/setup.js → platform/js/
const platformDir = resolve(__dirname, "..", "js").replace(/\\/g, "/");

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
});

// 把 jsdom 的 window/document 暴露成全局
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Node = dom.window.Node;
globalThis.TextEncoder = dom.window.TextEncoder;
globalThis.TextDecoder = dom.window.TextDecoder;
// jsdom 不暴露在 window 上，需要从 node:util 提供
if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = TextDecoder;
}

// 让 btoa/atob（share.js 用）在 jsdom 里可用
if (typeof globalThis.btoa === "undefined") {
  globalThis.btoa = (str) => Buffer.from(str, "binary").toString("base64");
}
if (typeof globalThis.atob === "undefined") {
  globalThis.atob = (b64) => Buffer.from(b64, "base64").toString("binary");
}

// 加载顺序：topics → hints → review → share → wasm-clang
function loadScript(name) {
  const code = readFileSync(resolve(platformDir, name), "utf-8");
  // eslint-disable-next-line no-new-func
  const fn = new Function("window", "document", "navigator", code);
  fn(globalThis.window, globalThis.document, globalThis.navigator);
}

loadScript("topics.js");
loadScript("hints.js");
loadScript("review.js");
loadScript("share.js");
loadScript("wasm-clang.js");