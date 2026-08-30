/* ============================================================================
 * llm.js — LLM 客户端（BYOK：自带 Key）
 * ============================================================================
 * 支持三种主流 OpenAI 兼容格式：
 *   1. OpenAI 官方：https://api.openai.com/v1/chat/completions
 *   2. Anthropic Claude：https://api.anthropic.com/v1/messages（自定义适配）
 *   3. 自定义：用户填 baseURL + model
 *
 * Key 存在 sessionStorage（关页面就清，不持久化 — 安全考量）
 * 默认预设：
 *   - OpenAI:    baseURL = https://api.openai.com/v1,     model = gpt-4o-mini
 *   - Anthropic: baseURL = https://api.anthropic.com/v1,  model = claude-3-5-sonnet
 *   - 自定义:    用户填写
 *
 * 注意：
 *   Anthropic 原生格式与 OpenAI 不同；为简化默认走 OpenAI 兼容接口
 *   （很多第三方中转服务都用 OpenAI 格式）
 * ========================================================================== */

window.LLM = (function () {
  const PRESETS = {
    openai: {
      label: "OpenAI",
      baseURL: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
      placeholder: "sk-...",
    },
    anthropic: {
      label: "Anthropic (Claude)",
      baseURL: "https://api.anthropic.com/v1",
      model: "claude-3-5-sonnet-20241022",
      placeholder: "sk-ant-...",
    },
    deepseek: {
      label: "DeepSeek",
      baseURL: "https://api.deepseek.com/v1",
      model: "deepseek-chat",
      placeholder: "sk-...",
    },
    custom: {
      label: "自定义（OpenAI 兼容）",
      baseURL: "",
      model: "",
      placeholder: "API Key",
    },
  };

  /**
   * 调用 LLM
   * @param {Object} opts
   *   - provider: 'openai' | 'anthropic' | 'deepseek' | 'custom'
   *   - apiKey:   string
   *   - baseURL:  string
   *   - model:    string
   *   - messages: [{role:'system|user|assistant', content:'...'}]
   *   - systemPrompt: string (单独传入，会拼到第一条)
   * @returns {Promise<string>}
   */
  async function chat(opts) {
    const { provider, apiKey, baseURL, model, messages, systemPrompt, temperature = 0.7 } = opts;
    if (!apiKey) throw new Error("请先填入 API Key");
    if (!baseURL) throw new Error("请填写 API baseURL");
    if (!model) throw new Error("请填写模型名");

    const finalMessages = [];
    if (systemPrompt) finalMessages.push({ role: "system", content: systemPrompt });
    for (const m of messages) finalMessages.push(m);

    const url = `${baseURL.replace(/\/$/, "")}/chat/completions`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
        temperature,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text.slice(0, 300)}`);
    }
    const data = await resp.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error("返回格式异常：" + JSON.stringify(data).slice(0, 200));
    }
    return data.choices[0].message.content;
  }

  /** 测试连接是否通 */
  async function testConnection(opts) {
    try {
      const reply = await chat({
        ...opts,
        messages: [{ role: "user", content: '回我一句话："pong"' }],
        max_tokens: 20,
        temperature: 0,
      });
      return { ok: true, reply };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // ── sessionStorage 存取 ──────────────────────────────────────────────────
  const SS_KEY = "cpp-platform-llm";

  function saveConfig(cfg) {
    sessionStorage.setItem(SS_KEY, JSON.stringify(cfg));
  }
  function loadConfig() {
    try {
      return JSON.parse(sessionStorage.getItem(SS_KEY) || "null");
    } catch (_) {
      return null;
    }
  }
  function clearConfig() {
    sessionStorage.removeItem(SS_KEY);
  }

  return { PRESETS, chat, testConnection, saveConfig, loadConfig, clearConfig };
})();