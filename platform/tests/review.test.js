import { describe, it, expect } from "vitest";

describe("ReviewEngine — 代码审查规则", () => {
  it("review 返回数组", () => {
    const issues = window.ReviewEngine.review("int main() {}", "cpp");
    expect(Array.isArray(issues)).toBe(true);
  });

  it("检测 gets() 废弃", () => {
    const code = `#include <cstdio>
int main() { char buf[100]; gets(buf); return 0; }`;
    const issues = window.ReviewEngine.review(code, "cpp");
    const has = issues.some((i) => i.message && i.message.includes("gets"));
    expect(has).toBe(true);
  });

  it("干净的 hello world 不报错", () => {
    const code = `#include <iostream>
int main() { std::cout << "hi" << std::endl; return 0; }`;
    const issues = window.ReviewEngine.review(code, "cpp");
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors.length).toBe(0);
  });

  it("扫描非 cpp 代码时宽容处理", () => {
    expect(() => window.ReviewEngine.review("print('hi')", "py")).not.toThrow();
  });

  it("using namespace std 触发警告", () => {
    const code = `#include <iostream>
using namespace std;
int main() { cout << "hi" << endl; return 0; }`;
    const issues = window.ReviewEngine.review(code, "cpp");
    const has = issues.some((i) => (i.id || "").includes("namespace"));
    expect(has).toBe(true);
  });
});