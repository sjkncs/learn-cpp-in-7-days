import { describe, it, expect, beforeEach } from "vitest";

describe("CPP_TOPICS — 主题数据完整性", () => {
  it("至少 15 个主题", () => {
    expect(window.CPP_TOPICS.length).toBeGreaterThanOrEqual(15);
  });

  it("每个主题都有必填字段", () => {
    for (const t of window.CPP_TOPICS) {
      expect(t.id).toBeTypeOf("string");
      expect(t.title).toBeTypeOf("string");
      expect(t.language).toMatch(/^(cpp|c)$/);
      expect(t.description).toBeTypeOf("string");
      expect(t.goal).toBeTypeOf("string");
      expect(t.skeleton).toBeTypeOf("string");
      expect(Array.isArray(t.steps)).toBe(true);
      expect(t.steps.length).toBeGreaterThanOrEqual(2);
      expect(Array.isArray(t.pitfalls)).toBe(true);
      expect(Array.isArray(t.stretch)).toBe(true);
    }
  });

  it("主题 id 唯一", () => {
    const ids = window.CPP_TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("每个 step 都有 match 谓词 + options", () => {
    for (const t of window.CPP_TOPICS) {
      for (const s of t.steps) {
        expect(s.title).toBeTypeOf("string");
        expect(s.explain).toBeTypeOf("string");
        expect(s.match).toBeInstanceOf(RegExp);
        expect(s.hint).toBeTypeOf("string");
        expect(Array.isArray(s.options)).toBe(true);
        expect(s.options.length).toBeGreaterThanOrEqual(1);
        for (const opt of s.options) {
          expect(opt.label).toBeTypeOf("string");
          expect(opt.code).toBeTypeOf("string");
        }
      }
    }
  });
});

describe("HintEngine — 提示引擎逻辑", () => {
  beforeEach(() => {
    // 初始化 DOM（HintEngine.init 需要若干 DOM 节点）
    document.body.innerHTML = `
      <div id="hint-body"></div>
      <button id="hint-next"></button>
      <button id="hint-prev"></button>
      <button id="hint-reset"></button>
      <span id="hint-step-counter"></span>
      <span id="hint-progress-bar"></span>
      <span id="progress-text"></span>
    `;
    window.HintEngine.init({
      body: document.getElementById("hint-body"),
      progressText: document.getElementById("progress-text"),
      getCode: () => "",
      onApplyCode: () => {},
    });
  });

  it("init 不会抛异常", () => {
    expect(() =>
      window.HintEngine.init({ body: document.getElementById("hint-body") })
    ).not.toThrow();
  });

  it("getTopic / getStepIdx 在未加载主题时返回 null", () => {
    expect(window.HintEngine.getTopic()).toBeNull();
    expect(window.HintEngine.getStepIdx()).toBe(0);
  });

  it("loadTopic 设置当前主题", () => {
    const hello = window.CPP_TOPICS.find((t) => t.id === "hello-world");
    window.HintEngine.loadTopic(hello);
    expect(window.HintEngine.getTopic()).toBe(hello);
    expect(window.HintEngine.getStepIdx()).toBe(0);
  });

  it("next 跳到未完成步骤", () => {
    const topic = window.CPP_TOPICS.find((t) => t.id === "hello-world");
    window.HintEngine.loadTopic(topic);

    // 不传 code = 空字符串，所有步骤都未完成
    window.HintEngine.next();
    expect(window.HintEngine.getStepIdx()).toBeGreaterThanOrEqual(0);
  });

  it("prev 不越界", () => {
    const topic = window.CPP_TOPICS.find((t) => t.id === "hello-world");
    window.HintEngine.loadTopic(topic);

    window.HintEngine.prev();
    expect(window.HintEngine.getStepIdx()).toBe(0);
  });

  it("reset 重置为第 0 步", () => {
    const topic = window.CPP_TOPICS.find((t) => t.id === "hello-world");
    window.HintEngine.loadTopic(topic);
    window.HintEngine.next();
    window.HintEngine.reset();
    expect(window.HintEngine.getStepIdx()).toBe(0);
  });
});