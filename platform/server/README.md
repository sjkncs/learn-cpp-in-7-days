# Judge0 代理服务

轻量 Express 反向代理，解决两个问题：
1. **CORS**：浏览器直接调 Judge0 会被同源策略阻止
2. **API Key 保护**：如果用 RapidAPI 的付费实例，Key 不能暴露在前端

## 快速启动

```bash
cd platform/server
npm install
node judge0-proxy.js
# 默认监听 :4000
```

## 配置（环境变量）

```bash
export PORT=4000
export JUDGE0_URL=https://judge0-ce.p.rapidapi.com    # RapidAPI 公共实例
# 或自部署：export JUDGE0_URL=http://localhost:2358
export JUDGE0_KEY=your_rapidapi_key_here               # 自部署则不需要
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/api/judge0/health` | 健康检查 |
| POST | `/api/judge0/submissions` | 创建编译任务 |
| GET  | `/api/judge0/submissions/:token` | 轮询结果 |

## Judge0 自部署（docker-compose.yml）

仓库根目录有 `docker-compose.yml`，一行启动完整栈：

```bash
docker compose up -d
# 等待 1-2 分钟初始化数据库
# 然后：
export JUDGE0_URL=http://localhost:2358
node judge0-proxy.js
```
