/* ============================================================================
 * judge0.js — Judge0 编译运行客户端
 * ============================================================================
 * 工作流：
 *   1. POST /proxy/submissions → 后端代理转发到 Judge0
 *   2. 轮询 GET /proxy/submissions/:token 拿编译/运行结果
 *   3. 把 stdout / stderr / compile_output 渲染到平台
 *
 * 后端：platform/server/judge0-proxy.js （Phase 4 配套）
 * 公共实例：https://judge0.com （需要自部署）
 * ========================================================================== */

window.Judge0 = (function () {
  /**
   * 提交编译任务
   * @param {string} code
   * @param {string} language - 'cpp' | 'c'
   * @param {string} stdin
   * @returns {Promise<{stdout, stderr, compile_output, status}>}
   */
  async function run(code, language, stdin = "") {
    const langId = language === "cpp" ? 54 : 50; // 54 = C++ (gcc 9.2), 50 = C (gcc 9.2)
    const proxyBase = window.Judge0Config?.PROXY_URL || "/api/judge0";

    // 1. 创建 submission
    const createResp = await fetch(`${proxyBase}/submissions?base64_encoded=true&wait=false`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: btoa(unescape(encodeURIComponent(code))),
        language_id: langId,
        stdin: btoa(unescape(encodeURIComponent(stdin))),
      }),
    });

    if (!createResp.ok) {
      throw new Error(`提交失败: HTTP ${createResp.status}`);
    }
    const { token } = await createResp.json();

    // 2. 轮询结果（最多 30 秒）
    const start = Date.now();
    while (Date.now() - start < 30000) {
      await sleep(1000);
      const pollResp = await fetch(
        `${proxyBase}/submissions/${token}?base64_encoded=true`,
        { method: "GET" }
      );
      if (!pollResp.ok) {
        throw new Error(`查询失败: HTTP ${pollResp.status}`);
      }
      const result = await pollResp.json();

      // status.id: 1=In Queue, 2=Processing, 3=Accepted
      if (result.status && result.status.id >= 3) {
        return {
          stdout: decodeB64(result.stdout) || "",
          stderr: decodeB64(result.stderr) || "",
          compile_output: decodeB64(result.compile_output) || "",
          status: result.status.description || "Done",
          time: result.time,
          memory: result.memory,
        };
      }
    }
    throw new Error("⏰ 运行超时（>30 秒）");
  }

  /** Base64 解码 + UTF-8 还原 */
  function decodeB64(s) {
    if (!s) return "";
    try {
      return decodeURIComponent(escape(atob(s)));
    } catch (_) {
      return s;
    }
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  /** 检查后端是否可达 */
  async function ping() {
    try {
      const resp = await fetch(
        (window.Judge0Config?.PROXY_URL || "/api/judge0") + "/health"
      );
      return resp.ok;
    } catch (_) {
      return false;
    }
  }

  return { run, ping };
})();
