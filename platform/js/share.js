/* ============================================================================
 * share.js — 导出 + 分享
 * ============================================================================
 *   - exportMarkdown(code, topic, stepIdx, done): 生成含代码 + 进度的 Markdown
 *   - buildShareURL(code, topicId): 把代码压缩到 URL hash（LZ-string 风格）
 *   - parseShareURL(): 从 location.hash 恢复代码
 *   - download(filename, content, mime): 触发浏览器下载
 *   - copyShareLink(): 复制当前 URL 到剪贴板
 *
 * URL hash 方案：
 *   #topic=hello-world&code=<base64-lz-string>
 *   编码：把代码用 base64 编码塞进 hash，体积小可读性好。
 *   没有引入外部库（保持单文件离线可用）。
 * ========================================================================== */

window.Share = (function () {
  /**
   * 生成 Markdown 报告
   */
  function exportMarkdown(opts) {
    const { code, topic, stepIdx, doneCount, totalSteps, reviewIssues } = opts;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    let md = "";
    md += `# ${topic.title}\n\n`;
    md += `> ${topic.description}\n\n`;
    md += `**学习目标**：${topic.goal}\n\n`;
    md += `**难度**：${topic.difficulty}　**语言**：${topic.language.toUpperCase()}\n\n`;
    md += `**进度**：${doneCount}/${totalSteps} 步已完成　　`;
    md += `**导出时间**：${now}\n\n`;
    md += `---\n\n`;

    md += `## 📝 代码\n\n`;
    md += `\`\`\`${topic.language === "cpp" ? "cpp" : "c"}\n`;
    md += code + "\n";
    md += `\`\`\`\n\n`;

    md += `## 🪜 提示步骤\n\n`;
    topic.steps.forEach((s, i) => {
      const check = s.match && s.match.test(code) ? "[x]" : "[ ]";
      md += `- ${check} **${s.title}** — ${s.explain}\n`;
    });
    md += `\n`;

    if (reviewIssues && reviewIssues.length) {
      md += `## 🔍 代码审查\n\n`;
      const grouped = { error: [], warn: [], info: [] };
      for (const it of reviewIssues) grouped[it.severity].push(it);
      for (const sev of ["error", "warn", "info"]) {
        if (!grouped[sev].length) continue;
        const labels = { error: "❌ 错误", warn: "⚠️ 警告", info: "💡 提示" };
        md += `### ${labels[sev]}（${grouped[sev].length}）\n\n`;
        for (const it of grouped[sev]) {
          md += `- **行 ${it.line || "全局"}**：${it.message}\n`;
          if (it.suggestion) md += `  - 建议：${it.suggestion}\n`;
        }
        md += `\n`;
      }
    } else {
      md += `## 🔍 代码审查\n\n✅ 没有发现问题\n\n`;
    }

    md += `## � 常见陷阱\n\n`;
    for (const p of topic.pitfalls || []) md += `- ${p}\n`;
    md += `\n`;

    md += `## 🚀 拓展挑战\n\n`;
    for (const s of topic.stretch || []) md += `- ${s}\n`;
    md += `\n`;

    md += `---\n\n`;
    md += `*由 [C++ 编程辅助平台](https://github.com/sjkncs/learn-cpp-in-7-days) 自动生成*\n`;

    return md;
  }

  /**
   * 简单 base64 编码（兼容中文）
   */
  function utf8ToBase64(str) {
    return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
  }

  function base64ToUtf8(b64) {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  /**
   * 生成可分享 URL：把代码用 base64 编码到 hash
   */
  function buildShareURL(code, topicId) {
    const encoded = utf8ToBase64(code);
    const base = window.location.origin + window.location.pathname;
    return `${base}#topic=${encodeURIComponent(topicId)}&code=${encoded}`;
  }

  /**
   * 从 URL hash 恢复代码（页面加载时调用）
   */
  function parseShareURL() {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    const params = {};
    hash.split("&").forEach((kv) => {
      const [k, v] = kv.split("=");
      params[decodeURIComponent(k)] = decodeURIComponent(v || "");
    });
    if (!params.code) return null;
    try {
      return {
        topicId: params.topic,
        code: base64ToUtf8(params.code),
      };
    } catch (_) {
      return null;
    }
  }

  /**
   * 触发浏览器下载
   */
  function download(filename, content, mime = "text/plain") {
    const blob = new Blob([content], { type: mime + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  /**
   * 复制到剪贴板（带 fallback）
   */
  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    // fallback：临时 textarea
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }

  return {
    exportMarkdown,
    buildShareURL,
    parseShareURL,
    download,
    copyToClipboard,
  };
})();
