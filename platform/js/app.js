/* ============================================================================
 * app.js — C++ 编程辅助平台：主入口
 * ============================================================================
 * 职责：
 *  1. 初始化 CodeMirror 编辑器
 *  2. 渲染主题列表到侧边栏
 *  3. 把 HintEngine / ReviewEngine 与编辑器联动
 *  4. 处理保存/重置/主题切换
 * ========================================================================== */

(function () {
  "use strict";

  // ── 全局状态 ──────────────────────────────────────────────────────────────
  let editor = null;
  let currentTopicId = null;

  // Judge0 配置：可由用户在 index.html 上方 script 标签覆盖
  window.Judge0Config = window.Judge0Config || {
    PROXY_URL: "/api/judge0", // 默认指向同源代理（Node 服务）
  };

  // ── DOM 引用 ──────────────────────────────────────────────────────────────
  const $ = (s) => document.querySelector(s);

  // ── 初始化 ────────────────────────────────────────────────────────────────
  function init() {
    renderSidebar();
    initEditor();
    bindEvents();
    initHintEngineDOM();
    probeJudge0();
    initLLMPanel();

    // 优先级：URL hash 分享 > localStorage 上次会话 > 空状态
    const shared = window.Share.parseShareURL();
    if (shared && shared.topicId) {
      const topic = window.CPP_TOPICS.find((t) => t.id === shared.topicId);
      if (topic) {
        selectTopic(topic.id);
        // 共享链接中的代码覆盖当前编辑器
        setTimeout(() => {
          if (editor) {
            editor.setValue(shared.code);
            window.HintEngine.onCodeChange();
          }
        }, 100);
      } else {
        restoreLastSession();
      }
    } else {
      restoreLastSession();
    }
  }

  /** 健康检查 Judge0 代理，更新 UI */
  async function probeJudge0() {
    const status = $("#run-status");
    const execBtn = $("#btn-run-execute");
    const toolbarBtn = $("#btn-run");

    try {
      const ok = await window.Judge0.ping();
      if (ok) {
        status.textContent = "✅ 后端代理已连接，可以编译运行";
        status.style.color = "var(--accent)";
        execBtn.disabled = false;
        toolbarBtn.disabled = false;
        toolbarBtn.title = "切换到运行 Tab";
        toolbarBtn.addEventListener("click", () => activateTab("run"), { once: true });
        // 改成可切换 Tab 模式
        toolbarBtn.onclick = () => activateTab("run");
      }
    } catch (_) {
      // 保持禁用状态
    }
  }

  // ── 侧边栏渲染 ────────────────────────────────────────────────────────────
  function renderSidebar() {
    const list = $(".topic-list");
    list.innerHTML = "";

    for (const topic of window.CPP_TOPICS) {
      const el = document.createElement("div");
      el.className = "topic-item";
      el.dataset.id = topic.id;

      el.innerHTML = `
        <div class="topic-item__title">${esc(topic.title)}</div>
        <div class="topic-item__meta">
          <span class="badge-lang">${topic.language.toUpperCase()}</span>
          <span class="badge-difficulty-${topic.difficulty}">${topic.difficulty}</span>
        </div>
        <div class="topic-item__desc">${esc(topic.description)}</div>
      `;

      el.addEventListener("click", () => selectTopic(topic.id));
      list.appendChild(el);
    }
  }

  // ── CodeMirror 初始化 ─────────────────────────────────────────────────────
  function initEditor() {
    editor = CodeMirror.fromTextArea($("#code-area"), {
      mode: "text/x-c++src",
      theme: "default",
      lineNumbers: true,
      indentUnit: 4,
      tabSize: 4,
      indentWithTabs: false,
      autoCloseBrackets: true,
      matchBrackets: true,
      styleActiveLine: true,
      viewportMargin: Infinity,
      extraKeys: {
        "Ctrl-/": "toggleComment",
        "Ctrl-S": saveSession,
        "Ctrl-Enter": runReview,
      },
    });

    // 编辑时同步提示引擎
    editor.on("change", () => {
      window.HintEngine.onCodeChange();
      updateProgressUI();
    });

    // 显示 onboarding
    showOnboarding();
  }

  function showOnboarding() {
    $(".editor-container").innerHTML = `
      <div class="onboarding">
        <div class="onboarding__icon">🤖</div>
        <h2>欢迎使用 C++ 辅助平台</h2>
        <p>选择一个主题，侧边栏会自动加载示例代码骨架，
           然后跟着提示一步步写出完整程序。</p>
        <div class="onboarding__steps">
          <div class="onboarding__step">
            <div class="onboarding__step__num">1</div>
            <div>选主题</div>
          </div>
          <div class="onboarding__step">
            <div class="onboarding__step__num">2</div>
            <div>跟提示</div>
          </div>
          <div class="onboarding__step">
            <div class="onboarding__step__num">3</div>
            <div>点审查</div>
          </div>
        </div>
        <p style="font-size:12px; color:var(--text3); margin-top:4px;">
          提示区会实时检测你的代码进度，自动标记已完成步骤
        </p>
      </div>`;
  }

  // ── 提示引擎 DOM 初始化 ───────────────────────────────────────────────────
  function initHintEngineDOM() {
    window.HintEngine.init({
      body: $(".hint-body"),
      progressText: $("#progress-text"),
      getCode: () => (editor ? editor.getValue() : ""),
      onApplyCode: (code) => {
        if (!editor) return;
        const cur = editor.getCursor();
        editor.replaceSelection(code + "\n");
        // 移动光标到插入内容行首
        const line = editor.getCursor().line;
        editor.setCursor({ line: line - 1, ch: 0 });
        editor.focus();
        window.HintEngine.onCodeChange();
        saveSession();
      },
    });
  }

  // ── 主题选择 ───────────────────────────────────────────────────────────────
  function selectTopic(id) {
    const topic = window.CPP_TOPICS.find((t) => t.id === id);
    if (!topic) return;

    currentTopicId = id;

    // 高亮侧边栏
    $(".topic-list").querySelectorAll(".topic-item").forEach((el) => {
      el.classList.toggle("active", el.dataset.id === id);
    });

    // 渲染编辑器
    $(".editor-container").innerHTML = "";
    const ta = document.createElement("textarea");
    ta.id = "code-area";
    $(".editor-container").appendChild(ta);
    initEditorOneShot(topic);

    // 加载提示引擎
    window.HintEngine.loadTopic(topic);

    // 更新编辑器工具栏语言标签
    $(".editor-toolbar__lang").textContent =
      topic.language === "cpp" ? "C++" : "C";

    // 切换到「提示」Tab
    activateTab("hints");

    updateProgressUI();
    saveSession();
  }

  function initEditorOneShot(topic) {
    // 销毁旧实例
    if (editor) {
      editor.toTextArea();
      editor = null;
    }

    editor = CodeMirror.fromTextArea($("#code-area"), {
      mode: "text/x-c++src",
      theme: "default",
      lineNumbers: true,
      indentUnit: 4,
      tabSize: 4,
      indentWithTabs: false,
      autoCloseBrackets: true,
      matchBrackets: true,
      styleActiveLine: true,
      viewportMargin: Infinity,
      extraKeys: {
        "Ctrl-/": "toggleComment",
        "Ctrl-S": saveSession,
        "Ctrl-Enter": runReview,
      },
    });

    // 加载骨架代码
    if (topic.skeleton) {
      editor.setValue(topic.skeleton);
      editor.setCursor({ line: 0, ch: 0 });
    }

    editor.on("change", () => {
      window.HintEngine.onCodeChange();
      updateProgressUI();
    });

    // 重新绑定 HintEngine 的 getCode
    window.HintEngine.init({
      body: $(".hint-body"),
      progressText: $("#progress-text"),
      getCode: () => (editor ? editor.getValue() : ""),
      onApplyCode: (code) => {
        if (!editor) return;
        const cur = editor.getCursor();
        editor.replaceSelection(code + "\n");
        const line = editor.getCursor().line;
        editor.setCursor({ line: line - 1, ch: 0 });
        editor.focus();
        window.HintEngine.onCodeChange();
        saveSession();
      },
    });
  }

  // ── 进度 UI ────────────────────────────────────────────────────────────────
  function updateProgressUI() {
    const topic = window.HintEngine.getTopic();
    if (!topic) return;
    const steps = topic.steps;
    const code = editor ? editor.getValue() : "";

    let done = 0;
    for (const s of steps) {
      if (s.match && s.match.test(code)) done++;
    }

    const stepIdx = window.HintEngine.getStepIdx();
    const current = steps[stepIdx] ? steps[stepIdx].title : "全部完成";
    $("#progress-text").textContent =
      stepIdx < steps.length
        ? `第 ${stepIdx + 1}/${steps.length} 步（已完成 ${done}/${steps.length}）`
        : "全部完成 ✅";
  }

  // ── 代码审查 ───────────────────────────────────────────────────────────────
  function runReview() {
    if (!editor) return;
    const code = editor.getValue();
    const topic = window.HintEngine.getTopic();
    const lang = topic ? topic.language : "cpp";

    const issues = window.ReviewEngine.review(code, lang);

    activateTab("review");
    renderReview(issues);
  }

  function renderReview(issues) {
    const body = $(".review-body");

    if (issues.length === 0) {
      body.innerHTML = `
        <div class="review-empty">
          <div class="review-empty__icon">✅</div>
          <p>代码审查通过！<br>没有发现明显问题，继续加油 💪</p>
        </div>`;
      return;
    }

    body.innerHTML = issues
      .map((issue) => {
        const icon = { error: "❌", warn: "⚠️", info: "💡" }[issue.severity];
        return `
      <div class="review-issue review-issue--${issue.severity}">
        <div class="review-issue__meta">
          <span class="review-issue__icon">${icon}</span>
          <span class="review-issue__line">${issue.line > 0 ? "行 " + issue.line : "全局"}</span>
        </div>
        <div class="review-issue__msg">${esc(issue.message)}</div>
        <div class="review-issue__suggestion">💡 ${esc(issue.suggestion)}</div>
        ${
          issue.snippet
            ? `<div class="review-issue__code">${esc(issue.snippet)}</div>`
            : ""
        }
      </div>`;
      })
      .join("");
  }

  // ── Tab 切换 ───────────────────────────────────────────────────────────────
  function activateTab(id) {
    $(".tab-btn, .tab-content").forEach((el) => {
      el.classList.toggle("active", el.dataset.tab === id);
    });
  }

  // ── 持久化（localStorage）──────────────────────────────────────────────────
  function saveSession() {
    if (!editor || !currentTopicId) return;
    localStorage.setItem(
      "cpp-platform-session",
      JSON.stringify({
        topicId: currentTopicId,
        code: editor.getValue(),
        stepIdx: window.HintEngine.getStepIdx(),
      })
    );
  }

  function restoreLastSession() {
    try {
      const raw = localStorage.getItem("cpp-platform-session");
      if (!raw) return;
      const session = JSON.parse(raw);
      if (session.topicId) selectTopic(session.topicId);
    } catch (_) {
      /* ignore corrupt storage */
    }
  }

  // ── 事件绑定 ───────────────────────────────────────────────────────────────
  function bindEvents() {
    // Tab 切换
    $(".tab-btn", document).addEventListener
      ? $(".tab-btn").forEach((b) =>
          b.addEventListener("click", () => activateTab(b.dataset.tab))
        )
      : null;

    // 委托方式（更稳）
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab-btn");
      if (btn) activateTab(btn.dataset.tab);
    });

    // 底部按钮
    $("#btn-next").addEventListener("click", () => {
      window.HintEngine.next();
      updateProgressUI();
    });

    $("#btn-prev").addEventListener("click", () => {
      window.HintEngine.prev();
      updateProgressUI();
    });

    $("#btn-reset").addEventListener("click", () => {
      const topic = window.HintEngine.getTopic();
      if (!topic) return;
      if (confirm("重置会清空当前编辑器内容，确认？")) {
        if (editor) editor.setValue(topic.skeleton);
        window.HintEngine.reset();
        saveSession();
      }
    });

    $("#btn-review").addEventListener("click", runReview);

    // Judge0 编译运行
    $("#btn-run-execute").addEventListener("click", runOnJudge0);

    // LLM 配置
    $("#btn-llm-test").addEventListener("click", testLLM);
    $("#btn-llm-save").addEventListener("click", saveLLMConfig);
    $("#btn-llm-clear").addEventListener("click", clearLLMConfig);
    $("#btn-llm-send").addEventListener("click", sendLLMMessage);

    // LLM 预设切换时自动填充
    $("#llm-provider").addEventListener("change", () => {
      const preset = window.LLM.PRESETS[$("#llm-provider").value];
      if (preset && preset.baseURL) $("#llm-baseurl").value = preset.baseURL;
      if (preset && preset.model) $("#llm-model").value = preset.model;
      if (preset && preset.placeholder) $("#llm-key").placeholder = preset.placeholder;
    });

    // Ctrl+Enter 发送
    $("#llm-prompt").addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        sendLLMMessage();
      }
    });

    // 导出 Markdown
    $("#btn-export").addEventListener("click", () => {
      const topic = window.HintEngine.getTopic();
      if (!topic) {
        alert("请先选择一个主题");
        return;
      }
      const code = editor ? editor.getValue() : "";
      const steps = topic.steps;
      let doneCount = 0;
      for (const s of steps) if (s.match && s.match.test(code)) doneCount++;
      const issues = window.ReviewEngine.review(code, topic.language);

      const md = window.Share.exportMarkdown({
        code,
        topic,
        stepIdx: window.HintEngine.getStepIdx(),
        doneCount,
        totalSteps: steps.length,
        reviewIssues: issues,
      });

      const safeName = topic.id.replace(/[^a-z0-9-]/gi, "-");
      window.Share.download(`cpp-${safeName}.md`, md, "text/markdown");
    });

    // 复制可分享链接
    $("#btn-share").addEventListener("click", async () => {
      if (!currentTopicId) {
        alert("请先选择一个主题");
        return;
      }
      const code = editor ? editor.getValue() : "";
      const url = window.Share.buildShareURL(code, currentTopicId);
      const ok = await window.Share.copyToClipboard(url);
      if (ok) {
        showToast("🔗 链接已复制到剪贴板！");
      } else {
        prompt("复制失败，请手动复制：", url);
      }
    });

    // 主题切换（header 快捷）
    $("#btn-reset-session").addEventListener("click", () => {
      localStorage.removeItem("cpp-platform-session");
      location.reload();
    });

    // 主题切换（header 按钮）
    // 暗色模式切换
    $("#btn-theme").addEventListener("click", () => {
      const dark = document.documentElement.dataset.theme === "dark";
      document.documentElement.dataset.theme = dark ? "" : "dark";
      $("#btn-theme").textContent = dark ? "🌙 暗色" : "☀️ 亮色";
    });

    // Ctrl+Enter 审查快捷键
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runReview();
      }
    });
  }

  // ── Judge0 编译运行 ───────────────────────────────────────────────────────
  async function runOnJudge0() {
    if (!editor) return;
    const topic = window.HintEngine.getTopic();
    const lang = topic ? topic.language : "cpp";
    const code = editor.getValue();
    const stdin = $("#run-stdin") ? $("#run-stdin").value : "";

    const out = $("#run-output");
    const status = $("#run-status");
    const execBtn = $("#btn-run-execute");

    out.style.display = "block";
    out.className = "run-output";
    out.textContent = "� 正在编译运行…\n";
    execBtn.disabled = true;
    status.textContent = "⏳ 运行中…";
    status.style.color = "var(--warn)";

    try {
      const result = await window.Judge0.run(code, lang, stdin);
      renderRunResult(result);
      status.textContent = `✅ 完成：${result.status}（${result.time || "?"}s, ${result.memory || "?"}KB）`;
      status.style.color = "var(--accent)";
    } catch (err) {
      out.textContent = `❌ 错误\n${err.message}\n\n` +
        `可能原因：\n` +
        `1. 后端服务没启动：cd platform/server && node judge0-proxy.js\n` +
        `2. Judge0 自部署没运行：docker compose up -d\n` +
        `3. 网络不通`;
      out.className = "run-output run-output--err";
      status.textContent = "❌ 失败";
      status.style.color = "var(--err)";
    } finally {
      execBtn.disabled = false;
    }
  }

  function renderRunResult(result) {
    const out = $("#run-output");
    let txt = "";
    if (result.compile_output) {
      txt += "── 编译信息 ──\n" + result.compile_output + "\n\n";
    }
    if (result.stderr) {
      txt += "── 运行时错误 ──\n" + result.stderr + "\n\n";
    }
    if (result.stdout) {
      txt += "── 标准输出 ──\n" + result.stdout + "\n";
    }
    if (!txt) {
      txt = "(无输出)";
    }
    txt += `\n── 状态 ──\n${result.status}（${result.time || "?"}s, ${result.memory || "?"}KB）`;

    out.textContent = txt;
    out.className = result.stderr || result.compile_output
      ? "run-output run-output--err"
      : "run-output run-output--ok";
  }

  // ── LLM 智能提示（BYOK）────────────────────────────────────────────────────
  function initLLMPanel() {
    const cfg = window.LLM.loadConfig();
    if (cfg) {
      $("#llm-provider").value = cfg.provider || "openai";
      $("#llm-key").value = cfg.apiKey || "";
      $("#llm-model").value = cfg.model || "";
      $("#llm-baseurl").value = cfg.baseURL || "";
    } else {
      // 触发一次 change 填 placeholder
      const evt = new Event("change");
      $("#llm-provider").dispatchEvent(evt);
    }
  }

  function readLLMForm() {
    return {
      provider: $("#llm-provider").value,
      apiKey: $("#llm-key").value.trim(),
      model: $("#llm-model").value.trim(),
      baseURL: $("#llm-baseurl").value.trim(),
    };
  }

  function saveLLMConfig() {
    const cfg = readLLMForm();
    if (!cfg.apiKey) {
      alert("请先填 API Key");
      return;
    }
    window.LLM.saveConfig(cfg);
    const r = $("#llm-test-result");
    r.textContent = "✅ 已保存（仅本会话有效）";
    r.style.color = "var(--accent)";
    showToast("✅ LLM 配置已保存到 sessionStorage");
  }

  function clearLLMConfig() {
    if (!confirm("清空 LLM 配置？")) return;
    window.LLM.clearConfig();
    $("#llm-key").value = "";
    $("#llm-model").value = "";
    $("#llm-baseurl").value = "";
    const r = $("#llm-test-result");
    r.textContent = "已清空";
    r.style.color = "var(--text3)";
  }

  async function testLLM() {
    const cfg = readLLMForm();
    const r = $("#llm-test-result");
    r.textContent = "⏳ 测试中…";
    r.style.color = "var(--warn)";

    const result = await window.LLM.testConnection(cfg);
    if (result.ok) {
      r.textContent = `✅ 连接成功：${result.reply.slice(0, 50)}`;
      r.style.color = "var(--accent)";
    } else {
      r.textContent = `❌ 失败：${result.error.slice(0, 150)}`;
      r.style.color = "var(--err)";
    }
  }

  /** 聊天历史（不持久化，关闭即清） */
  const llmHistory = [];

  async function sendLLMMessage() {
    const cfg = readLLMForm();
    if (!cfg.apiKey) {
      alert("请先填 API Key 并保存");
      return;
    }
    const promptText = $("#llm-prompt").value.trim();
    if (!promptText) return;

    const topic = window.HintEngine.getTopic();
    const code = editor ? editor.getValue() : "";

    // 1. 渲染用户消息
    appendLLMMessage("user", promptText);
    $("#llm-prompt").value = "";

    // 2. 拼装上下文：当前主题 + 代码
    const sys = `你是一个 C/C++ 教学助手，帮助初学者理解代码、改进写法。\n` +
      `当前学习主题：${topic ? topic.title : "自由编辑"}\n` +
      `主题目标：${topic ? topic.goal : ""}\n` +
      `用户当前代码：\n\`\`\`cpp\n${code}\n\`\`\`\n` +
      `回答要简洁，必要时给出代码片段。用中文回复。`;

    llmHistory.push({ role: "user", content: promptText });

    // 3. 创建 assistant 占位
    const assistantMsg = appendLLMMessage("assistant", "⏳ 思考中…");

    // 4. 禁用发送按钮
    const sendBtn = $("#btn-llm-send");
    sendBtn.disabled = true;

    try {
      const reply = await window.LLM.chat({
        ...cfg,
        systemPrompt: sys,
        messages: llmHistory.slice(-10), // 最近 10 条
      });
      assistantMsg.textContent = reply;
      llmHistory.push({ role: "assistant", content: reply });
    } catch (err) {
      assistantMsg.textContent = `❌ ${err.message}\n\n请检查：\n1. Key 是否正确\n2. 模型名是否支持\n3. 网络是否可达`;
      assistantMsg.classList.add("llm-msg--err");
    } finally {
      sendBtn.disabled = false;
    }
  }

  function appendLLMMessage(role, text) {
    const list = $("#llm-messages");
    // 清掉首次的引导气泡
    if (list.querySelector(".llm-empty")) list.innerHTML = "";

    const div = document.createElement("div");
    div.className = `llm-msg ${role === "user" ? "llm-msg--user" : "llm-msg--assistant"}`;
    div.innerHTML =
      `<div class="llm-msg__role">${role === "user" ? "我" : "AI"}</div>` +
      `<div class="llm-msg__body">${esc(text)}</div>`;
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
    return div.querySelector(".llm-msg__body");
  }

  // ── Toast 提示 ─────────────────────────────────────────────────────────────
  function showToast(msg, durationMs = 2000) {
    let toast = document.getElementById("global-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "global-toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("toast--show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("toast--show"), durationMs);
  }

  // ── 工具 ───────────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ── DOM ready ──────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", init);
})();
