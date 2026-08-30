# C++ 编程辅助平台

> **零门槛 · 边写边学 · 提示引擎 + 规则审查 + Judge0 真编译 + LLM 智能提示**

一个为 C/C++ 小白设计的交互式编程辅助平台。选择一个学习主题，平台会：

- 自动加载**骨架代码**（留空的 TODO，你来填）
- 实时**检测你的代码进度**，每一步都有提示
- 点一下按钮就能把**推荐代码片段**直接插入编辑器
- **规则级代码审查**，指出常见错误
- **Judge0 真编译**（需启动后端），一键运行看 stdout
- **WebAssembly 编译**（零依赖可选方案）：浏览器内直接编译运行
- **LLM 智能提示**（BYOK：自带 OpenAI / Claude / DeepSeek Key），像私人助教一样对话
- **导出 Markdown 报告**或 **复制可分享链接**

## 在线演示

打开仓库的 GitHub Pages（需在 Settings > Pages 启用 GitHub Actions 部署）：

```
https://<your-github-username>.github.io/learn-cpp-in-7-days/
```

例如你的用户名是 `sjkncs`，则访问：
https://sjkncs.github.io/learn-cpp-in-7-days/

**启用步骤**（首次）：
1. 进入仓库的 Settings > Pages
2. Source 选 **GitHub Actions**
3. 推送代码后会自动部署，每次 push 到 `main` 都会更新

代码仓库：https://github.com/sjkncs/learn-cpp-in-7-days

---

## 快速开始

### 方法一：双击打开（最简单，离线也可用）

```bash
platform/
└── index.html    ← 直接用浏览器打开
```

支持浏览器：**Chrome / Edge / Firefox / Safari**（最新版本）

> 首次打开需联网（CodeMirror CDN ~300KB），之后浏览器缓存，**离线也能用**。

### 方法二：VS Code Live Server（推荐给小白）

```bash
# 在 VS Code 里右键 index.html → "Open with Live Server"
```

---

## 内置学习主题（15 个）

| #  | 主题 | 难度 | 核心技能 |
|----|------|------|---------|
| 1  | 你好，世界 | 入门 | `#include`，`cout`，`return 0` |
| 2  | 变量与输入 | 入门 | `int`，`cin`，`cout`，`using namespace std` |
| 3  | 猜数字游戏 | 进阶 | `while` 循环，`if/else`，`rand()` |
| 4  | 机械臂正运动学（2 连杆） | 挑战 | `std::pair`，三角函数，结构化返回值 |
| 5  | 指针入门 | 进阶 | `&` / `*`，野指针，解引用改值 |
| 6  | STL vector + string | 进阶 | 动态数组，范围 for，迭代器 |
| 7  | 函数模板 | 进阶 | `template <typename T>`，类型推断 |
| 8  | 文件 I/O | 进阶 | `ifstream` / `ofstream`，`std::getline` |
| 9  | 单链表 | 挑战 | struct + 指针串联，遍历/插入 |
| 10 | 递归 | 挑战 | base case + 递推关系 |
| 11 | 指针进阶（二级指针 + 函数指针） | 挑战 | `int*&`，`int (*op)(int)` |
| 12 | STL 进阶（map / algorithm） | 进阶 | 词频统计，stringstream |
| 13 | 类与对象 | 进阶 | 构造函数、`const` 方法、封装 |
| 14 | 智能指针 | 进阶 | `unique_ptr`、`shared_ptr`、所有权 |
| 15 | 移动语义 | 挑战 | `noexcept`、`std::move`、右值引用 |

每个主题包含：
- **骨架代码**（`skeleton` 字段）
- **2–6 个步骤化提示**（`steps` 字段，可按「下一条」逐步解锁）
- **推荐代码选项**（点一下插入编辑器）
- **常见陷阱列表**（`pitfalls`）
- **拓展挑战**（`stretch`）

---

## 平台功能

### 三栏布局

```
┌──────────────┬──────────────────────────┬──────────────┐
│  主题列表     │     代码编辑器           │ 提示 / 审查 / │
│  (侧边栏)    │   (CodeMirror 语法高亮)   │ 运行 / AI     │
└──────────────┴──────────────────────────┴──────────────┘
```

### 四个 Tab

| Tab | 触发 | 说明 |
|-----|------|------|
| 提示 | 自动 | 边写边检测进度，每步有推荐代码 + 选项 |
| 审查 | 按钮 / Ctrl+Enter | 10 条本地静态规则 |
| 运行 | 按钮 | Judge0 真编译 + 运行（需启动后端） / WASM 浏览器内编译 |
| AI   | 按钮 | LLM 对话（需 BYOK） |

### 提示引擎（规则级 · 离线可用）

- 切换主题后，自动显示当前步骤
- 编辑器代码变化时，**实时检测**进度，自动标记已完成步骤
- 点击「下一条」跳到第一个未完成的步骤
- 每个步骤配有 **2–3 个推荐代码选项**，点一下直接插入

### 代码审查（10 条内置规则）

| 严重度 | 规则 |
|--------|------|
| error | `gets()` 废弃 |
| error | 括号不匹配 |
| error | 缺少 `main()` |
| warn | `scanf %s` 不安全 |
| warn | `using namespace std;` 全局污染 |
| info | 魔法数字 |
| info | `endl` vs `'\n'` |
| info | Tab vs 空格 |

按 `Ctrl+Enter` 或点击「代码审查」触发。

### Judge0 真编译（可选高级功能）

把代码实际编译并运行，显示 stdout / stderr / 编译错误。

需要启动后端代理：

```bash
# 1. 启动 Judge0（自部署）
docker compose up -d
# 等待 1-2 分钟数据库初始化完成

# 2. 启动 Node 代理
cd platform/server
npm install
JUDGE0_URL=http://localhost:2358 node judge0-proxy.js
# 默认监听 :4000

# 3. 在 index.html 上方加这一行（默认已配好）：
#    <script>window.Judge0Config = { PROXY_URL: "http://localhost:4000/api/judge0" };</script>
```

如果不想用 Judge0，平台默认禁用「运行」按钮，其他功能完全不受影响。

### WebAssembly 浏览器内编译（零依赖方案）

如果不想装 Docker，可以用 WASM 版本的 clang + lld 在浏览器里直接编译：

```bash
cd platform
npx serve    # 或任何静态服务器
# 打开页面后点「运行」Tab → 自动加载 ~10MB 的 clang.wasm
# 首次加载需要 5-10 秒，之后浏览器缓存秒开
```

限制：
- 编译慢（约 1-5 秒/次，取决于代码量）
- 内存限制 ~256 MB
- 不能 fork 进程、读本地文件
- 适合教学演示，不适合大项目

详见 `platform/wasm/README.md`。

### LLM 智能提示（BYOK）

自带 API Key 即可启用。支持：

- **OpenAI**（gpt-4o-mini, gpt-4o, ...）
- **Anthropic Claude**（claude-3-5-sonnet, ...）
- **DeepSeek**（deepseek-chat）
- **自定义 OpenAI 兼容服务**（本地 vLLM / Ollama / 中转 API）

填 Key 后点「测试连接」，通了再点「保存」。

Key 存于 **sessionStorage**（关页面就清），不会持久化到本地。

可问 AI 的典型问题：

- "我想把 while 改成 for，怎么改？"
- "这段代码哪里有问题？"
- "给我讲讲 std::pair 和 struct 的区别"
- "用中文给这个函数加注释"

AI 自动拿到你的「当前主题 + 当前代码」作上下文，回答更准。

### 导出 Markdown

点「导出」按钮，会下载一个 `cpp-<主题名>.md`，里面包含：

- 代码 + 进度 + 提示步骤
- 代码审查结果（按 error / warn / info 分组）
- 常见陷阱 + 拓展挑战

适合发博客 / 留档 / 给老师看作业。

### 分享链接

点「分享」会把当前主题和代码压缩到 URL hash，复制出来发给朋友直接打开。

朋友点开会自动加载这个主题并填上你的代码。

### 主题切换

右上角「亮色 / 暗色」一键切换。状态保存在 localStorage。

---

## 如何添加新主题

在 `js/topics.js` 末尾追加对象即可，无需改其他代码：

```js
{
  id: "my-topic",
  title: "我的第 16 个主题",
  language: "cpp",
  difficulty: "入门",
  description: "一句话描述",
  goal: "学习目标",
  skeleton: `// 骨架代码 ...`,
  steps: [
    {
      line: 5,
      title: "1. 做某件事",
      explain: "解释为什么这么做 ...",
      options: [
        { label: "推荐写法", code: `/* 代码 */` },
        { label: "备选写法", code: `/* 代码 */` },
      ],
      match: /关键词/,         // 检测用户是否完成
      hint: "完成后看到的鼓励语",
    },
  ],
  pitfalls: ["陷阱1", "陷阱2"],
  stretch: ["拓展1", "拓展2"],
}
```

---

## 项目结构

```
learn-cpp-in-7-days/
├── platform/
│   ├── index.html            ← 入口（双击打开）
│   ├── css/
│   │   └── app.css           ← 全部样式（深浅主题 + Toast + LLM）
│   ├── js/
│   │   ├── topics.js         ← 15 个内置主题数据
│   │   ├── hints.js          ← 提示引擎
│   │   ├── review.js         ← 审查引擎（10 条规则）
│   │   ├── share.js          ← 导出 Markdown + URL hash 分享
│   │   ├── judge0.js         ← Judge0 客户端
│   │   ├── llm.js            ← LLM 客户端（OpenAI 兼容）
│   │   └── app.js            ← 主入口（编辑器 + 事件 + 持久化）
│   ├── server/
│   │   ├── judge0-proxy.js   ← Node 反向代理
│   │   ├── package.json
│   │   └── README.md
│   ├── wasm/                 ← (可选) WebAssembly clang 集成
│   │   └── README.md
│   └── tests/                ← 单元测试 (vitest)
│       ├── hints.test.js
│       ├── review.test.js
│       ├── share.test.js
│       └── setup.js
├── .github/
│   └── workflows/
│       ├── deploy-pages.yml  ← GitHub Pages 自动部署
│       └── ci.yml            ← CI：lint + 测试
├── docker-compose.yml        ← Judge0 自部署栈
├── .gitignore
└── README.md
```

---

## 技术栈

| 组件 | 选型 | 理由 |
|------|------|------|
| 编辑器 | CodeMirror 5 (CDN) | C++ 语法高亮、开箱即用、CDN 缓存离线可用 |
| 样式 | 纯 CSS + CSS 变量 | 零依赖，深浅主题切换 |
| 提示引擎 | 原生 JS，规则正则 | 离线可用，无 API 依赖 |
| 代码审查 | 原生 JS，AST-lite | 同上 |
| 导出/分享 | 原生 JS + base64 | 单文件，无外部库 |
| 真编译（Docker） | Judge0 + Express 代理 | 工业级代码执行引擎 |
| 真编译（零依赖） | clang.wasm + lld.wasm | 浏览器内编译，无需服务器 |
| LLM | OpenAI 兼容协议 | 同时支持 GPT/Claude/DeepSeek/自部署 |
| 数据存储 | localStorage + sessionStorage | 无后端，浏览器自带 |
| 测试 | vitest | 现代、快速、原生 ES Module |
| 部署 | GitHub Actions + Pages | 零成本自动 CI/CD |

---

## CI/CD

仓库自带两个 GitHub Actions workflow：

| Workflow | 触发 | 作用 |
|----------|------|------|
| `ci.yml`     | push / PR | 跑 vitest 单元测试 |
| `deploy-pages.yml` | push 到 main | 自动部署 `platform/` 到 GitHub Pages |

---

## 隐私

- 用户代码不离开本地（除非启用 Judge0、WASM 服务或 LLM）
- LLM Key 仅存 sessionStorage（关页面即清）
- Judge0 自部署可完全离线运行
- WASM 编译完全在浏览器内，无网络请求

---

## 开发路线图

- v1.0：CodeMirror 编辑器 + 提示引擎 + 静态审查
- v1.1：4 个主题 → 10 个主题
- v1.2：导出 Markdown + URL 分享
- v1.3：Judge0 真编译 + Node 代理 + docker-compose
- v1.4：LLM BYOK（OpenAI/Claude/DeepSeek/自定义）
- v1.5：5 个高级主题 + GitHub Pages + vitest CI + WASM clang 方案

---

## 许可证

MIT License — 可自由使用、修改、分发。

> 如果这个平台对你有帮助，欢迎在 GitHub 上 star