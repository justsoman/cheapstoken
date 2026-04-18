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

## 自定义域名与 DNS（指向 Pages）

### 推荐：在 Pages 里绑定域名（优先）

1. 打开 Cloudflare Dashboard → **Workers & Pages** → 选中你的 **Pages 项目**。  
2. 进入 **自定义域名 / Custom domains** → **设置自定义域名 / Set up a custom domain**（或 **添加**）。  
3. 输入要使用的域名，例如 `www.example.com` 或 `example.com`，按提示完成验证。  
4. 若该域名 **已在当前 Cloudflare 账号下托管 DNS**，多数情况下 Cloudflare 会 **自动创建或更新 DNS 记录**，无需再手抄。

绑定成功后，访问会指向该 Pages 部署；HTTPS 证书一般由 Cloudflare 自动签发。在自定义域名列表中可查看是否已为 **Active** 状态。

### 需要手动添加 DNS 记录时

在 **该域名的 DNS**（选择站点 → **DNS** → **记录**）中新增或核对：

| 记录类型 | 名称 | 目标 | 代理 |
|---------|------|------|------|
| **CNAME** | 子域前缀（如 `www`、`app`） | `你的项目名.pages.dev`（以 Pages 项目概览或自定义域名页显示为准） | **已代理**（橙色云）通常为推荐选项 |

- **子域名**（如 `www`）：使用 **CNAME** 指向 **`项目名.pages.dev`**。  
- **根域名**（`@` / 裸域）：在 Cloudflare 上一般也可对根域配置 **CNAME** 到 **`项目名.pages.dev`**（通过 **CNAME 展平**）；具体以控制台在添加自定义域名时给出的记录类型与目标为准。

已在 Pages 中成功绑定某主机名时，请勿再为同一主机名随意指向其它 IP 或冲突记录，以免解析异常。

### 注意

- **域名与 Pages 项目在同一 Cloudflare 账号**时，用「自定义域名」向导最省事。  
- DNS 变更后全球生效可能需要 **数分钟至数小时**；以 Pages 自定义域名状态与 DNS 传播为准。  
- 若仅使用第三方 DNS、不走 Cloudflare 代理，步骤会不同；Pages 自定义域名通常与 **Cloudflare 代理（橙色云）** 搭配使用。
