/* ============================================================================
 * hints.js — 提示引擎：让 "边写边提示" 成为现实
 * ============================================================================
 * 核心职责:
 *  1. 根据当前主题 + 当前步骤号，渲染该步骤的解释和选项
 *  2. 当用户编辑代码时，检测当前步骤的 match 谓词，自动标记 "已完成"
 *  3. "下一条" 按钮：跳到第一个还没完成的步骤
 *  4. "卡住了"：暴露当前步骤的默认推荐代码片段
 * ========================================================================== */

window.HintEngine = (function () {
  const state = {
    topic: null, // 当前主题对象
    stepIdx: 0, // 当前步骤索引
  };

  /** DOM 引用 */
  const els = {};

  /** 初始化提示引擎，绑定 DOM */
  function init(elements) {
    Object.assign(els, elements);
  }

  /** 加载一个主题，重置进度 */
  function loadTopic(topic) {
    state.topic = topic;
    state.stepIdx = 0;
    render();
  }

  /** 重置当前主题（回到第 0 步） */
  function reset() {
    state.stepIdx = 0;
    render();
  }

  /** 当前步骤索引 */
  function currentStep() {
    return state.topic && state.topic.steps[state.stepIdx];
  }

  /** 检查某一步是否已完成 — 用步骤上的 match 正则在当前代码里找 */
  function isStepDone(step, code) {
    if (!step || !step.match) return false;
    return step.match.test(code);
  }

  /** 重渲染提示面板 */
  function render() {
    if (!state.topic) return;
    const topic = state.topic;
    const steps = topic.steps;
    const step = steps[state.stepIdx];

    // 顶部进度条
    if (els.progressText) {
      const doneCount = steps.filter((s) => isStepDone(s, getEditorCode())).length;
      els.progressText.textContent = `第 ${state.stepIdx + 1}/${steps.length} 步（已完成 ${doneCount}/${steps.length}）`;
    }

    if (!step) {
      els.body.innerHTML = `
        <div class="hint-card hint-card--done">
          <h3>🎉 全部完成！</h3>
          <p>你已经走完了这个主题的所有提示。可以：</p>
          <ul>
            <li>切换到下一个主题</li>
            <li>在「代码审查」里跑一遍，让 AI 助教看看你的代码</li>
          </ul>
        </div>`;
      return;
    }

    // 检查当前步骤是否已完成，如果完成则给到反馈 + 下一条
    const code = getEditorCode();
    const done = isStepDone(step, code);
    const statusBadge = done
      ? `<span class="badge badge--ok">✅ 已完成</span>`
      : `<span class="badge badge--todo">📝 待完成</span>`;

    els.body.innerHTML = `
      <div class="hint-card">
        <div class="hint-card__head">
          <h3>${escapeHtml(step.title)} ${statusBadge}</h3>
        </div>
        <p class="hint-card__explain">${escapeHtml(step.explain)}</p>

        ${step.options && step.options.length
          ? `<h4>推荐代码（点一下直接插入）</h4>
             <div class="hint-options">
                ${step.options
                  .map(
                    (o, i) =>
                      `<button class="hint-option" data-opt="${i}">
                         <span class="hint-option__label">${escapeHtml(o.label)}</span>
                         <pre class="hint-option__code"><code>${escapeHtml(
                           o.code
                         )}</code></pre>
                       </button>`
                  )
                  .join("")}
             </div>`
          : ""
        }

        ${done
          ? `<div class="hint-card__hint hint-card__hint--ok">
               ${escapeHtml(step.hint || "本步骤看起来已经完成 ✨")}
             </div>`
          : `<div class="hint-card__hint">
               💡 提示：${escapeHtml(step.hint || "按上面的代码提示试试")}
             </div>`
        }
      </div>
    `;

    // 绑定选项点击
    els.body.querySelectorAll(".hint-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.opt, 10);
        const opt = step.options[idx];
        if (opt && els.onApplyCode) els.onApplyCode(opt.code);
      });
    });
  }

  /** "下一条" 按钮：找第一个还没完成的步骤 */
  function next() {
    if (!state.topic) return;
    const code = getEditorCode();
    const steps = state.topic.steps;

    // 从当前步骤 +1 开始往后找第一个未完成
    for (let i = state.stepIdx + 1; i < steps.length; i++) {
      if (!isStepDone(steps[i], code)) {
        state.stepIdx = i;
        render();
        return;
      }
    }
    // 后面都完成了，从头再找一次
    for (let i = 0; i <= state.stepIdx; i++) {
      if (!isStepDone(steps[i], code)) {
        state.stepIdx = i;
        render();
        return;
      }
    }
    // 全部完成，跳到末尾
    state.stepIdx = steps.length;
    render();
  }

  /** "上一步" 按钮：单纯回退索引 */
  function prev() {
    if (!state.topic) return;
    if (state.stepIdx > 0) {
      state.stepIdx--;
      render();
    }
  }

  /** 编辑器代码变化时，重渲染顶部进度 + 当前步骤状态 */
  function onCodeChange() {
    render();
  }

  /** 当前主题（外部读取） */
  function getTopic() {
    return state.topic;
  }
  function getStepIdx() {
    return state.stepIdx;
  }

  function getEditorCode() {
    return (els.getCode && els.getCode()) || "";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  return {
    init,
    loadTopic,
    reset,
    next,
    prev,
    onCodeChange,
    render,
    getTopic,
    getStepIdx,
  };
})();
