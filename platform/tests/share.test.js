import { describe, it, expect } from "vitest";

describe("Share — 导出与分享", () => {
  const sample = {
    topic: {
      title: "你好世界",
      description: "Hello",
      goal: "Learn printf",
      difficulty: "入门",
      language: "cpp",
      skeleton: "//",
      steps: [{ title: "1", explain: "e", options: [], match: /include/ }],
      pitfalls: ["陷阱1"],
      stretch: ["拓展1"],
    },
    code: `#include <iostream>
int main() { std::cout << "hi"; return 0; }`,
    stepIdx: 0,
    doneCount: 1,
    totalSteps: 1,
    reviewIssues: [
      { severity: "warn", line: 2, message: "缺 endl", suggestion: "加 endl" },
    ],
  };

  it("exportMarkdown 返回非空字符串", () => {
    const md = window.Share.exportMarkdown(sample);
    expect(typeof md).toBe("string");
    expect(md.length).toBeGreaterThan(0);
    expect(md).toContain("你好世界");
    expect(md).toContain("```cpp");
    expect(md).toContain("陷阱1");
    expect(md).toContain("拓展1");
  });

  it("exportMarkdown 在没有 issues 时显示 '没有发现问题'", () => {
    const md = window.Share.exportMarkdown({ ...sample, reviewIssues: [] });
    expect(md).toContain("没有发现问题");
  });

  it("exportMarkdown 在没有 issues 字段时也健壮", () => {
    const md = window.Share.exportMarkdown({ ...sample, reviewIssues: null });
    expect(md).toContain("没有发现问题");
  });

  it("buildShareURL 包含 topic + code 参数", () => {
    const url = window.Share.buildShareURL("hello", "my-topic");
    expect(url).toContain("topic=my-topic");
    expect(url).toContain("code=");
  });

  it("parseShareURL 还原 buildShareURL 的内容", () => {
    const code = "#include <iostream>\nint main() { return 0; }";
    const url = window.Share.buildShareURL(code, "hello-world");
    // 模拟 location.hash
    const oldHash = window.location.hash;
    window.location.hash = url.split("#")[1] || "";
    const parsed = window.Share.parseShareURL();
    expect(parsed).not.toBeNull();
    expect(parsed.topicId).toBe("hello-world");
    expect(parsed.code).toBe(code);
    window.location.hash = oldHash;
  });

  it("parseShareURL 在空 hash 时返回 null", () => {
    const oldHash = window.location.hash;
    window.location.hash = "";
    expect(window.Share.parseShareURL()).toBeNull();
    window.location.hash = oldHash;
  });

  it("parseShareURL 在没有 code 参数时返回 null", () => {
    const oldHash = window.location.hash;
    window.location.hash = "topic=hello-world";
    expect(window.Share.parseShareURL()).toBeNull();
    window.location.hash = oldHash;
  });

  it("UTF-8 中文往返编码一致", () => {
    const code = "// 你好世界：注释含中文\nint main(){}";
    const url = window.Share.buildShareURL(code, "x");
    const oldHash = window.location.hash;
    window.location.hash = url.split("#")[1] || "";
    const parsed = window.Share.parseShareURL();
    expect(parsed.code).toBe(code);
    window.location.hash = oldHash;
  });
});