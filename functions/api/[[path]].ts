// functions/api/[[path]].ts
interface Env {
    API_ORIGIN: string; // 例如 https://api.example.com
  }
  
  export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const target = new URL(url.pathname + url.search, env.API_ORIGIN);
    return fetch(target.toString(), request);
  };