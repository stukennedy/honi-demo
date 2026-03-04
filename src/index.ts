import { velaFetch, VelaSupportDO } from './agent';
import { getChatHTML } from './ui';

export { VelaSupportDO };

export default {
  async fetch(
    request: Request,
    env: Record<string, unknown>,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Serve chat UI at root
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(getChatHTML(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Everything else goes to the agent (POST /chat, GET /history, DELETE /history)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return velaFetch(request as any, env, ctx);
  },
};
