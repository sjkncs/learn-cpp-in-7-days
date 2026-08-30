/* eslint-disable */
/**
 * judge0-proxy.js — Judge0 反向代理（Node + Express）
 *
 * 部署：
 *   cd platform/server
 *   npm install express cors
 *   node judge0-proxy.js
 *
 * 环境变量：
 *   PORT=4000                    # 监听端口
 *   JUDGE0_URL=https://judge0... # Judge0 实例 URL（自部署）
 *   JUDGE0_KEY=...               # 如果实例需要认证
 *
 * 平台调用：
 *   POST  http://localhost:4000/api/judge0/submissions
 *   GET   http://localhost:4000/api/judge0/submissions/:token
 *   GET   http://localhost:4000/api/judge0/health
 */

const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 4000;
const JUDGE0_URL = process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.JUDGE0_KEY || "";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ── 健康检查 ───────────────────────────────────────────────
app.get("/api/judge0/health", (_req, res) => {
  res.json({
    ok: true,
    judge0_url: JUDGE0_URL,
    has_key: Boolean(JUDGE0_KEY),
    time: new Date().toISOString(),
  });
});

// ── 创建 submission ────────────────────────────────────────
app.post("/api/judge0/submissions", async (req, res) => {
  try {
    const url = new URL("/submissions", JUDGE0_URL);
    url.searchParams.set("base64_encoded", "true");
    url.searchParams.set("wait", "false");

    const headers = { "Content-Type": "application/json" };
    if (JUDGE0_KEY) {
      headers["X-RapidAPI-Key"] = JUDGE0_KEY;
      headers["X-RapidAPI-Host"] = new URL(JUDGE0_URL).host;
    }

    const judge0Resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(req.body),
    });

    if (!judge0Resp.ok) {
      const text = await judge0Resp.text();
      return res.status(judge0Resp.status).send(text);
    }

    const data = await judge0Resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── 查询结果 ──────────────────────────────────────────────
app.get("/api/judge0/submissions/:token", async (req, res) => {
  try {
    const url = new URL(`/submissions/${req.params.token}`, JUDGE0_URL);
    url.searchParams.set("base64_encoded", "true");

    const headers = {};
    if (JUDGE0_KEY) {
      headers["X-RapidAPI-Key"] = JUDGE0_KEY;
      headers["X-RapidAPI-Host"] = new URL(JUDGE0_URL).host;
    }

    const judge0Resp = await fetch(url, { method: "GET", headers });
    if (!judge0Resp.ok) {
      const text = await judge0Resp.text();
      return res.status(judge0Resp.status).send(text);
    }

    const data = await judge0Resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── 启动 ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Judge0 proxy listening on http://localhost:${PORT}`);
  console.log(`   Judge0 URL: ${JUDGE0_URL}`);
  console.log(`   Has API key: ${Boolean(JUDGE0_KEY)}`);
});
