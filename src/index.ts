import { routeToAgent } from 'honidev';
import { supportAgent, SupportDO } from './agents/support';
import { incidentAgent, IncidentDO } from './agents/incident';
import { AnalystDO } from './agents/analyst';
import { SynthesisDO } from './agents/synthesis';
import { getDemoHTML } from './ui';

export { SupportDO, IncidentDO, AnalystDO, SynthesisDO };

// ── Env type ───────────────────────────────────────────────
interface Env {
  SUPPORT_DO: DurableObjectNamespace;
  INCIDENT_DO: DurableObjectNamespace;
  ANALYST_DO: DurableObjectNamespace;
  SYNTHESIS_DO: DurableObjectNamespace;
}

// ── Research pipeline ──────────────────────────────────────
// Worker-level multi-agent orchestration:
// User query → Analyst DO (research + analysis) → Synthesis DO (polished report)
// This demonstrates routeToAgent and the power of composing specialist agents.

async function runResearchPipeline(query: string, env: Env): Promise<{
  query: string;
  analystFindings: string;
  report: string;
  agents: string[];
  pipeline: string[];
}> {
  const pipeline: string[] = [];

  // Step 1: Analyst agent researches the topic
  pipeline.push(`[1/2] Analyst agent researching: "${query}"`);
  const analystResponse = await routeToAgent(
    env as unknown as Record<string, DurableObjectNamespace>,
    { binding: 'ANALYST_DO', threadId: `research-${Date.now()}` },
    `Research this topic and provide structured analytical findings with data points, trends, and key insights: ${query}`,
  );

  pipeline.push(`[2/2] Synthesis agent writing report from ${analystResponse.messages.length} analyst messages`);

  // Step 2: Synthesis agent turns findings into a polished report
  const synthResponse = await routeToAgent(
    env as unknown as Record<string, DurableObjectNamespace>,
    { binding: 'SYNTHESIS_DO', threadId: `synthesis-${Date.now()}` },
    `Here are the analyst's research findings:\n\n${analystResponse.response}\n\nPlease synthesise this into a concise, polished executive report with clear key insights and a recommendation.`,
  );

  return {
    query,
    analystFindings: analystResponse.response,
    report: synthResponse.response,
    agents: ['Analyst (ANALYST_DO)', 'Synthesis (SYNTHESIS_DO)'],
    pipeline,
  };
}

// ── Main Worker ────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // ── Serve UI ──
    if (pathname === '/' && request.method === 'GET') {
      return new Response(getDemoHTML(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // ── Support agent ──
    // Routes: /support/chat, /support/history
    if (pathname.startsWith('/support/')) {
      const subReq = new Request(
        request.url.replace('/support', ''),
        request,
      );
      return supportAgent.fetch(subReq as any, env, ctx);
    }

    // ── Incident agent ──
    // Routes: /incident/chat, /incident/history
    if (pathname.startsWith('/incident/')) {
      const subReq = new Request(
        request.url.replace('/incident', ''),
        request,
      );
      return incidentAgent.fetch(subReq as any, env, ctx);
    }

    // ── Research pipeline ──
    // POST /research — Worker orchestrates Analyst + Synthesis DOs
    if (pathname === '/research' && request.method === 'POST') {
      try {
        const body = await request.json() as { query: string };
        if (!body.query?.trim()) {
          return Response.json({ error: 'query is required' }, { status: 400 });
        }
        const result = await runResearchPipeline(body.query, env);
        return Response.json(result, { headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        return Response.json({ error: (err as Error).message }, { status: 500 });
      }
    }

    // ── MCP endpoints — expose all agent tools ──
    if (pathname === '/support/mcp/tools') {
      const subReq = new Request(request.url.replace('/support', ''), request);
      return supportAgent.fetch(subReq as any, env, ctx);
    }

    return new Response('Not found', { status: 404 });
  },
};
