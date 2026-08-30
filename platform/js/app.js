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

  // ── DOM 引用 ──────────────────────────────────────────────────────────────
  const $ = (s) => document.querySelector(s);

  // ── 初始化 ────────────────────────────────────────────────────────────────
  function init() {
    renderSidebar();
    initEditor();
    bindEvents();
    restoreLastSession();
    initHintEngineDOM();
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
