// functions/api/[[path]].ts
// 仅 /api/v1/chat/completions → /v1/chat/completions；其它 /api/... 原样转发到 API_ORIGIN
interface Env {
  API_ORIGIN: string; // 例如 https://api.example.com
}

type ApiContext = { request: Request; env: Env };

function rewritePath(pathname: string): string {
  if (pathname === "/api/v1/chat/completions") {
    return "/v1/chat/completions";
  }
  return pathname;
}

export const onRequest = async (context: ApiContext): Promise<Response> => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = rewritePath(url.pathname);
  const target = new URL(path + url.search, env.API_ORIGIN);
  console.log(target.toString());
  return fetch(target.toString(), request);
};
