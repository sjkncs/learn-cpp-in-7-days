/* ============================================================================
 * review.js — 规则级代码审查引擎
 * ============================================================================
 * 不依赖外部 LLM，纯本地正则 + AST-lite 规则检测常见 C++ 问题。
 * 输出格式: Array<{severity, line, message, code_snippet, suggestion}>
 * ========================================================================== */

window.ReviewEngine = (function () {
  const RULES = [
    // ── 严重 ──────────────────────────────────────────────────────────────
    {
      id: "gets-deprecated",
      severity: "error",
      pattern: /\bgets\s*\(/,
      message: "gets() 已从 C++11 废弃，容易造成缓冲区溢出",
      suggestion: "用 fgets() 或 std::getline() 替代",
    },
    {
      id: "unsafe-scanf-s",
      severity: "warn",
      pattern: /scanf\s*\(\s*%[^,]*[sxdi]/,
      message: "scanf 的 %s 不做边界检查，可能越界",
      suggestion: "用 fgets() 读字符串，或用 scanf_s()",
    },
    {
      id: "unclosed-brace",
      severity: "error",
      check: "brace-balance",
      message: "左右大括号数量不匹配",
      suggestion: "检查每对 { } 是否成对出现",
    },
    {
      id: "unclosed-paren",
      severity: "error",
      check: "paren-balance",
      message: "左右圆括号数量不匹配",
      suggestion: "检查每对 ( ) 是否成对出现",
    },
    // ── 警告 ─────────────────────────────────────────────────────────────
    {
      id: "using-namespace-std-in-header",
      severity: "warn",
      pattern: /^\s*using\s+namespace\s+std\s*;/m,
      message: "在 .cpp 文件中使用 using namespace std; 容易造成名字空间污染",
      suggestion: "推荐每次用 std:: 前缀；或在局部作用域内 using std::cout;",
    },
    {
      id: "magic-number",
      severity: "info",
      pattern: /\b(100|1000|365)\b/,
      message: "发现硬编码的数字（魔法数字），建议用 const 或 enum 命名",
      suggestion: "例如: const int MAX_TRIES = 100;",
    },
    {
      id: "endl-vs-newline",
      severity: "info",
      pattern: /<<\s*endl\s*;/,
      message: "endl 会刷新缓冲区，在循环中频繁使用可能影响性能",
      suggestion: "在循环中输出大量数据时，用 '\\n' 替代 endl",
    },
    {
      id: "missing-return-main",
      severity: "info",
      pattern: /int\s+main\s*\([^)]*\)\s*\{[^}]*$/,
      message: "main 函数末尾没有显式 return 0;",
      suggestion: "C++ 编译器会默认返回 0，但显式写 return 0; 更清晰",
    },
    {
      id: "tab-vs-space",
      severity: "info",
      pattern: /\t/,
      message: "代码中使用了 Tab 字符，建议统一用空格缩进（4 空格）",
      suggestion: "IDE 里通常可以设置：Tab = 插入 4 个空格",
    },
    {
      id: "no-iostream-include",
      severity: "error",
      pattern: /#include\s*<(iostream|stdio\.h)>/,
      message: "",
      // message 由下面的 no-iostream-case 补充，这里不重复
    },
    {
      id: "no-main",
      severity: "error",
      pattern: /int\s+main\s*\(/,
      message: "",
    },
    {
      id: "printf-no-format",
      severity: "warn",
      pattern: /printf\s*\(\s*"[^"]*"\s*\)/,
      message: "printf 的格式字符串里没有占位符，检查是否漏写了变量",
      suggestion: "例如: printf(\"%d\", x);",
    },
  ];

  /**
   * 主审查函数
   * @param {string} code
   * @param {string} language - 'cpp' | 'c'
   * @returns {Array} issues
   */
  function review(code, language) {
    const issues = [];
    const lines = code.split("\n");
    const rawIssues = [];

    // 1. 通用正则规则
    for (const rule of RULES) {
      if (rule.check) continue; // 特殊规则在下面处理
      if (rule.message === "") continue; // 占位规则
      // 保留原始 regex 上的所有 flags（m/i 等），追加 g 用于全局匹配
      const flags = (rule.pattern.flags || "") + "g";
      const matches = code.match(new RegExp(rule.pattern.source, flags));
      if (!matches) continue;

      for (const match of matches) {
        const lineNum = findLineOfMatch(code, match, rule.pattern);
        rawIssues.push({
          id: rule.id,
          severity: rule.severity,
          line: lineNum,
          message: rule.message,
          suggestion: rule.suggestion,
          snippet: getLineSnippet(lines, lineNum),
        });
      }
    }

    // 2. 特殊：括号平衡检查
    const braceIssues = checkBracketBalance(code, "{", "}");
    rawIssues.push(...braceIssues.brace);
    const parenIssues = checkBracketBalance(code, "(", ")");
    rawIssues.push(...parenIssues.brace);

    // 3. 特殊：无 iostream 头文件警告（仅 C++）
    if (language === "cpp") {
      const hasIo = /#include\s*<(iostream|stdio\.h)>/.test(code);
      if (!hasIo) {
        rawIssues.push({
          severity: "error",
          line: 0,
          message: "没有包含任何输入输出库（<iostream> 或 <stdio.h>）",
          suggestion: "如果程序需要输入输出，添加 #include <iostream>",
          snippet: "",
        });
      }
    }

    // 4. 特殊：main 函数缺失
    if (!/\bint\s+main\s*\(/.test(code)) {
      rawIssues.push({
        severity: "error",
        line: 0,
        message: "找不到 main() 函数入口",
        suggestion: "C++ 程序必须有 int main() { ... }",
        snippet: "",
      });
    }

    // 去重 + 合并同类
    const seen = new Set();
    for (const issue of rawIssues) {
      const key = `${issue.line}-${issue.message}`;
      if (!seen.has(key)) {
        seen.add(key);
        issues.push(issue);
      }
    }

    // 排序：error → warn → info，同级按行号
    const ORDER = { error: 0, warn: 1, info: 2 };
    issues.sort((a, b) => {
      const d = ORDER[a.severity] - ORDER[b.severity];
      return d !== 0 ? d : a.line - b.line;
    });

    return issues;
  }

  /** 括号平衡检查 */
  function checkBracketBalance(code, open, close) {
    const issues = [];
    let depth = 0;
    let line = 1;
    let lastUnbalancedLine = 0;
    const lines = code.split("\n");

    for (let i = 0; i < code.length; i++) {
      if (code[i] === "\n") {
        line++;
        continue;
      }
      if (code[i] === open) {
        depth++;
        lastUnbalancedLine = line;
      }
      if (code[i] === close) {
        depth--;
        if (depth < 0) {
          issues.push({
            severity: "error",
            line: line,
            message: `多余的闭合符号 '${close}'，没有匹配的 '${open}'`,
            suggestion: "检查此处是否多余或前面有 '${open}' 未配对",
            snippet: getLineSnippet(lines, line),
          });
          depth = 0;
        }
      }
    }

    if (depth > 0) {
      issues.push({
        severity: "error",
        line: lastUnbalancedLine,
        message: `缺少 ${depth} 个闭合符号 '${close}'`,
        suggestion: "检查第 " + lastUnbalancedLine + " 行附近的 '${open}' 是否闭合",
        snippet: getLineSnippet(lines, lastUnbalancedLine),
      });
    }

    return { brace: issues };
  }

  /** 找到匹配内容所在的行号 */
  function findLineOfMatch(code, match, pattern) {
    // 保留 pattern 上的所有 flags（m/i 等），追加 g 用于全局搜索
    const flags = (pattern.flags || "") + "g";
    const regex = new RegExp(pattern.source, flags);
    let m;
    while ((m = regex.exec(code)) !== null) {
      if (m[0] === match) {
        return code.substring(0, m.index).split("\n").length;
      }
    }
    return 0;
  }

  /** 获取某一行代码片段（截取前后内容） */
  function getLineSnippet(lines, lineNum) {
    if (lineNum <= 0 || lineNum > lines.length) return "";
    return lines[lineNum - 1].trim();
  }

  return { review };
})();
