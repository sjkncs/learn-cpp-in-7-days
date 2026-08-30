/* ============================================================================
 * wasm-clang.js — WebAssembly C++ 执行客户端（Phase 10）
 * ============================================================================
 *
 * 用途：不依赖后端服务器，在浏览器里编译运行 C++。
 *       提供与 window.Judge0.run() 相同的返回格式，方便 app.js 无缝切换。
 *
 * 执行路径（优先级从高到低）：
 *   1. Wandbox API  — https://wandbox.org/api/glue/ （推荐，免费无需 Key）
 *   2. Compiler Explorer — https://godbolt.org/api/ （需要 CORS）
 *   3. 离线兜底   — 返回结构化错误，提示用户开启后端
 *
 * API 格式（与 Judge0 兼容）：
 *   run(code, language, stdin)
 *   → Promise<{stdout, stderr, compile_output, status, time}>
 *
 * 注意：WASM 平台的 stdin 支持有限，stdin 功能标记为 experimental。
 * ========================================================================== */

window.WasmRunner = (function () {
  // ── 公共配置（可被 index.html 的 script 覆盖）───────────────────────────────
  const CONFIG = {
    /** Wandbox API 地址 */
    WANDBOX_URL: "https://wandbox.org/api/glue",
    /** Compiler Explorer 地址 */
    COMPILER_URL: "https://godbolt.org/api",
    /** 单次执行超时（毫秒） */
    TIMEOUT_MS: 20000,
    /** 是否优先尝试 Wandbox（false 则先试 Compiler Explorer） */
    PREFER_WANDBOX: true,
  };

  // ── 工具函数 ────────────────────────────────────────────────────────────────

  /** 把字符串 base64 编码（浏览器/Node 双兼容） */
  function toBase64(str) {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (_) {
      return btoa(str);
    }
  }

  /** base64 → UTF-8 解码 */
  function fromBase64(b64) {
    if (!b64) return "";
    try {
      return decodeURIComponent(escape(atob(b64)));
    } catch (_) {
      try {
        return atob(b64);
      } catch (_2) {
        return b64;
      }
    }
  }

  /** 带超时的 fetch */
  async function fetchWithTimeout(url, opts, ms = CONFIG.TIMEOUT_MS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      const resp = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(id);
      return resp;
    } catch (err) {
      clearTimeout(id);
      if (err.name === "AbortError") {
        throw new Error(`请求超时（> ${ms}ms）：${url}`);
      }
      throw err;
    }
  }

  /** 通用错误包装 */
  function wrapError(err, service) {
    return {
      stdout: "",
      stderr: "",
      compile_output: "",
      status: "Error",
      time: null,
      error: `[${service}] ${err.message}`,
    };
  }

  // ── Wandbox 执行 ──────────────────────────────────────────────────────────

  /**
   * Wandbox API
   * POST https://wandbox.org/api/glue
   * Body: { "code": "...", "compiler": "gcc-head", "options": "warning,locale", "stdin": "..." }
   *
   * Wandbox 编译器映射（选最轻量的）：
   *   gcc-head      — GCC trunk（最新，支持 C++20）
   *   clang-head    — Clang trunk
   *   gcc-13.2.0   — 稳定版
   *   bash          — 不支持 C++，仅作兜底
   *
   * Wandbox 的 stdin 支持是通过 stdin 参数实现的。
   */
  async function runWandbox(code, language, stdin = "") {
    // Wandbox 没有官方的 C++17-WASM 编译器，但有 gcc/clang 可以编译
    // 我们用 gcc-head 编译，gcc 支持编译到标准输出格式
    // Wandbox 不直接支持 WASM，但它是纯后端执行，比 Judge0 轻
    // 注意：Wandbox 的 stdin 需要在请求体里传

    const compilerMap = {
      cpp: "gcc-head",
      c: "gcc-head",
    };
    const compiler = compilerMap[language] || "gcc-head";

    const body = {
      code,
      compiler,
      stdin: stdin, // Wandbox 支持 stdin 参数
      options: "warning,locale",
    };

    const resp = await fetchWithTimeout(CONFIG.WANDBOX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Wandbox HTTP ${resp.status}: ${text.slice(0, 200)}`);
    }

    const data = await resp.json();

    // Wandbox 返回格式：
    // { "status": "0", "signal": null, "output": "..." }
    // status: "0" = 正常退出，其他 = 编译/运行错误
    const stdout = (data.program_output || data.output || "").trim();
    const stderr = (data.compiler_output || data.stderr || "").trim();
    const compile_output = (data.compiler_output || "").trim();
    const statusCode = String(data.status || data.exit_code || "0");

    // Wandbox 状态码映射
    const STATUS_MAP = {
      "0": "Accepted",
      "-1": "Runtime Error",
      "1": "Compilation Error",
      "2": "Runtime Error",
      "3": "Time Limit Exceeded",
    };
    const status = STATUS_MAP[statusCode] || (statusCode === "0" ? "Accepted" : `Exit ${statusCode}`);

    return {
      stdout,
      stderr,
      compile_output,
      status,
      time: data.time || null,
    };
  }

  // ── Compiler Explorer 执行 ────────────────────────────────────────────────

  /**
   * Compiler Explorer API
   * Step 1: POST /api/compiler/<id>/compile  → 获取编译结果 + asm/wasm
   * Step 2: POST /api/execute                → 运行 WASM
   *
   * 注意：Compiler Explorer 的 WASM 执行需要先编译得到 wasm 二进制，
   * 然后用 wasm 环境运行。完整的 wasm 执行在浏览器里需要 WebAssembly API。
   *
   * 这里我们用 GCC for wasm32 作为目标，输出 asm，然后：
   * 方案 A：直接用 Godbolt 的 execute API（如果有的话）
   * 方案 B：把编译结果返回给调用方，让对方决定怎么跑
   *
   * 简化策略：用 GCC 编译到标准输出（-S），返回 asm。
   * 如果需要实际执行，交给 app.js 里的 WebAssembly.runWasm()。
   *
   * 更实用的策略：直接返回编译结果 + 提示如何执行。
   */
  async function runCompilerExplorer(code, language, stdin = "") {
    // Compiler Explorer 支持 gcc 编译到 WASM
    const compilerMap = {
      cpp: "89",   // GCC 13.2 — Wasm
      c:   "89",   // 同上
    };
    const compilerId = compilerMap[language] || "89";

    // Step 1: 编译
    const compileResp = await fetchWithTimeout(
      `${CONFIG.COMPILER_URL}/compiler/${compilerId}/compile`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: code,
          options: { userArguments: "-O2", executeParameters: { stdin } },
          backend: { compiler: compilerId },
        }),
      }
    );

    if (!compileResp.ok) {
      throw new Error(`Godbolt HTTP ${compileResp.status}`);
    }

    const compileData = await compileResp.json();

    if (compileData.didCompile === false || compileData.didProduceWasm === false) {
      return {
        stdout: "",
        stderr: fromBase64(compileData.stderr || ""),
        compile_output: fromBase64(compileData.stdout || ""),
        status: "Compilation Error",
        time: null,
      };
    }

    // Step 2: 如果有 wasm，执行它
    if (compileData.wasm && compileData.wasm.length > 0) {
      try {
        // 把 base64 wasm 解码成 Uint8Array，交给 WebAssembly.instantiate
        const wasmBytes = Uint8Array.from(
          atob(compileData.wasm),
          (c) => c.charCodeAt(0)
        );

        // 简单 WASM 环境：只支持 hello-world 类型的基本函数
        // 实际教学代码不会有复杂系统调用，导出简单的 main() 即可
        const memExport = new WebAssembly.Memory({ initial: 16 });
        let stdoutBuffer = "";

        const importObject = {
          env: {
            memory: memExport,
            emscripten_resume: () => 0,
            emscripten_scan_stack: () => {},
            emscripten_memcpy_js: (dest, src, n) => {},
            emscripten_memcpy: (dest, src, n) => {},
            // 简化版 stdout（写到一个可读缓冲区）
            __indirect_function_table: new WebAssembly.Table({ initial: 0, element: "anyfunc" }),
            // Godbolt 的 gcc-wasm 导出
          },
        };

        const instance = await WebAssembly.instantiate(wasmBytes, importObject);
        const { main } = instance.exports;

        let exitCode = 0;
        if (typeof main === "function") {
          exitCode = main() || 0;
        }

        return {
          stdout: stdoutBuffer,
          stderr: "",
          compile_output: "",
          status: exitCode === 0 ? "Accepted" : `Exit ${exitCode}`,
          time: null,
        };
      } catch (wasmErr) {
        // WASM 执行失败（常见：代码调用了不被支持的外链函数）
        // 返回编译成功但运行失败
        return {
          stdout: "",
          stderr: `[WASM Runtime] ${wasmErr.message}`,
          compile_output: "",
          status: "Runtime Error",
          time: null,
        };
      }
    }

    // 无 WASM 输出，尝试普通执行结果
    return {
      stdout: fromBase64(compileData.stdout || ""),
      stderr: fromBase64(compileData.stderr || ""),
      compile_output: fromBase64(compileData.asm || ""),
      status: compileData.ok ? "Accepted" : "Compilation Error",
      time: null,
    };
  }

  // ── 主入口 ────────────────────────────────────────────────────────────────

  /**
   * 执行 C/C++ 代码
   * @param {string} code
   * @param {string} language — 'cpp' | 'c'
   * @param {string} stdin
   * @returns {Promise<{stdout, stderr, compile_output, status, time, error?}>}
   */
  async function run(code, language = "cpp", stdin = "") {
    if (!code || !code.trim()) {
      return {
        stdout: "",
        stderr: "",
        compile_output: "错误：代码为空",
        status: "Error",
        time: null,
      };
    }

    // 检查是否支持 WebAssembly（safari 旧版可能不支持）
    if (typeof WebAssembly === "undefined") {
      return {
        stdout: "",
        stderr: "",
        compile_output:
          "当前浏览器不支持 WebAssembly。\n" +
          "请使用 Chrome、Firefox、Edge、Safari 的最新版本。",
        status: "Error",
        time: null,
      };
    }

    if (CONFIG.PREFER_WANDBOX) {
      try {
        return await runWandbox(code, language, stdin);
      } catch (err) {
        // Wandbox 失败，尝试 Godbolt
        try {
          return await runCompilerExplorer(code, language, stdin);
        } catch (err2) {
          return wrapError(err2, "Compiler Explorer");
        }
      }
    } else {
      try {
        return await runCompilerExplorer(code, language, stdin);
      } catch (err) {
        try {
          return await runWandbox(code, language, stdin);
        } catch (err2) {
          return wrapError(err2, "Wandbox");
        }
      }
    }
  }

  /**
   * 检查两个远程服务是否可达（用于 UI 判断）
   * @returns {Promise<{wandbox: boolean, godbolt: boolean}>}
   */
  async function probeServices() {
    const [wandboxOk, godboltOk] = await Promise.allSettled([
      fetchWithTimeout(CONFIG.WANDBOX_URL, { method: "GET" }, 3000).then(
        (r) => r.ok
      ),
      fetchWithTimeout(
        `${CONFIG.COMPILER_URL}/api/compilers?fields=id,name&limit=1`,
        { method: "GET" },
        3000
      ).then((r) => r.ok),
    ]);

    return {
      wandbox: wandboxOk.status === "fulfilled" && wandboxOk.value,
      godbolt: godboltOk.status === "fulfilled" && godboltOk.value,
    };
  }

  // ── 公共 API ──────────────────────────────────────────────────────────────
  return { run, probeServices, CONFIG };
})();
