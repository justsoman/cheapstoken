# Cloudflare Pages Functions 说明

本仓库在根目录包含 `functions/`，用于 **Cloudflare Pages Functions**：在边缘把浏览器对 `/api/*` 的请求转发到后端 API，实现同源访问或隐藏真实 API 地址。

## `functions/api/[[path]].ts` 做什么

- **路由**：`functions/api/[[path]].ts` 对应线上路径 **`/api/*`**（`[[path]]` 为捕获剩余路径）。
- **行为**：收到请求后，把路径与查询串拼到后端基地址上，用 `fetch` 转发（可视为反向代理）。

当前实现里，后端基地址在代码中写为 `https://api.cheapstoken.ai`。`Env` 接口中声明了 `API_ORIGIN`，若要在控制台用环境变量配置基地址，需把目标 URL 改为基于 `env.API_ORIGIN` 构造（与 `Env` 保持一致）。

## 必须用 Pages 部署，不要用「仅静态资源的 Worker」

这些文件是 **Cloudflare Pages** 的 Functions 形态，不是单独一个「只托管静态文件、没有 Worker 脚本」的 Worker 项目。

- 请在 **Workers & Pages → Pages** 中连接本 Git 仓库并部署。
- 若使用 **仅静态资源的 Worker**，控制台不会出现正常的 Functions 能力，也可能无法为该项目配置 **环境变量 / 密钥**（界面会提示类似：Variables cannot be added to a Worker that only has static assets）。

**环境变量**：请到 **该 Pages 项目 → 设置 → 环境变量**（及密钥）中配置，而不是去纯静态 Worker 页面添加。

## 构建与输出目录（本仓库为已构建的静态资源）

仓库根目录已有 `index.html` 与 `assets/`，属于**构建产物已进仓库**的常见情况。在 Pages 项目里可类似配置：

| 配置项 | 建议 |
|--------|------|
| 构建命令 | 可留空，或 `echo skip`（不在云端再执行前端构建） |
| 构建输出目录 | `/`（或指向包含 `index.html` 的目录） |
| 根目录 | 单仓库一般为仓库根；子目录项目则填子路径 |

部署时需保证 **`functions/` 在 Pages 认定的项目根下**（与 `index.html` 同级的一层），以便 Cloudflare 打包并挂载 Functions。

## 本地调试（可选）

在仓库根目录（静态资源根）执行：

```bash
npx wrangler pages dev . --compatibility-date=2024-01-01
```

浏览器访问本地站点下的 `/api/...` 可验证是否进入该 Function。

## 与前端的关系

前端若请求 **`/api/v1/...`** 等同源路径，则会由上述 Function 处理并转发到配置的后端 origin。请确保生产环境的 API 基路径与这里代理规则一致。
