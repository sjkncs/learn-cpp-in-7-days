import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

describe("WasmRunner — API 形状", () => {
  it("暴露 run / probeServices / CONFIG", () => {
    expect(typeof window.WasmRunner.run).toBe("function");
    expect(typeof window.WasmRunner.probeServices).toBe("function");
    expect(typeof window.WasmRunner.CONFIG).toBe("object");
  });

  it("CONFIG 包含必要的远程地址", () => {
    expect(window.WasmRunner.CONFIG.WANDBOX_URL).toMatch(/^https?:\/\//);
    expect(window.WasmRunner.CONFIG.COMPILER_URL).toMatch(/^https?:\/\//);
    expect(typeof window.WasmRunner.CONFIG.TIMEOUT_MS).toBe("number");
  });
});

describe("WasmRunner — run() 行为", () => {
  it("空代码直接返回错误结构，不抛异常", async () => {
    const result = await window.WasmRunner.run("", "cpp");
    expect(result.status).toBe("Error");
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
    expect(typeof result.compile_output).toBe("string");
  });

  it("纯空白代码也走错误路径", async () => {
    const result = await window.WasmRunner.run("   \n\t  \n", "cpp");
    expect(result.status).toBe("Error");
  });

  it("返回结构包含所有 Judge0 兼容字段", async () => {
    // 模拟 fetch 失败 → 走 fallback
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("网络不可达")));

    try {
      const result = await window.WasmRunner.run(
        '#include <iostream>\nint main() { std::cout << "hi"; return 0; }',
        "cpp"
      );
      // 不管 Wandbox 还是 Godbolt，最终都得返回这个形状
      expect(result).toHaveProperty("stdout");
      expect(result).toHaveProperty("stderr");
      expect(result).toHaveProperty("compile_output");
      expect(result).toHaveProperty("status");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("默认 language 缺失时按 cpp 处理", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("网络不可达")));

    try {
      const result = await window.WasmRunner.run(
        '#include <iostream>\nint main() { return 0; }'
        // 故意不传 language
      );
      expect(result).toHaveProperty("status");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe("WasmRunner — probeServices", () => {
  it("返回 wandbox 和 godbolt 布尔字段", async () => {
    const originalFetch = globalThis.fetch;
    // 模拟 fetch 超时失败
    globalThis.fetch = vi.fn(() =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 100)
      )
    );

    try {
      const result = await window.WasmRunner.probeServices();
      expect(result).toHaveProperty("wandbox");
      expect(result).toHaveProperty("godbolt");
      expect(typeof result.wandbox).toBe("boolean");
      expect(typeof result.godbolt).toBe("boolean");
      // 网络全失败情况下，两个都应是 false
      expect(result.wandbox).toBe(false);
      expect(result.godbolt).toBe(false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("fetch 成功时返回 true", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) })
    );

    try {
      const result = await window.WasmRunner.probeServices();
      expect(result.wandbox).toBe(true);
      expect(result.godbolt).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe("WasmRunner — 与 Judge0 API 兼容", () => {
  it("返回对象字段名与 Judge0.run() 一致", async () => {
    // 核心契约：app.js 可以直接拿 WasmRunner 替代 Judge0
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("offline")));

    try {
      const result = await window.WasmRunner.run("int main(){return 0;}", "cpp");
      const expectedFields = ["stdout", "stderr", "compile_output", "status"];
      for (const f of expectedFields) {
        expect(result).toHaveProperty(f);
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
