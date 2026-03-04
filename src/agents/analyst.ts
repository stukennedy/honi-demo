import { createAgent, tool, z } from 'honidev';
import type { ToolDefinition } from 'honidev';

// ── Mock knowledge base ────────────────────────────────────
// In production this would query real APIs, databases, Vectorize, etc.

const MARKET_DATA: Record<string, unknown> = {
  'ai agents': {
    marketSize2024: '$2.1B',
    marketSize2028: '$47B',
    cagr: '115%',
    keyPlayers: ['Anthropic', 'OpenAI', 'Cohere', 'Mistral'],
    frameworks: ['LangChain', 'LlamaIndex', 'Mastra', 'Honi', 'AutoGen'],
    edgeCases: 'Most frameworks assume Node.js/Python server deployment. Very few target edge runtimes.',
    growthDrivers: ['LLM cost reduction', 'Tool-use maturity', 'Enterprise automation demand'],
  },
  'cloudflare workers': {
    deployments: '10M+ workers deployed',
    locations: '300+ cities',
    coldStart: '~0ms (V8 isolates)',
    bundleLimit: '1MB compressed',
    durableObjects: 'Strongly consistent, co-located with compute',
    marketPosition: 'Dominant in edge compute alongside Fastly/Vercel Edge',
  },
  'edge computing': {
    latencyReduction: '40–60% vs origin server for global users',
    costReduction: '30–70% vs traditional serverless for the right workloads',
    limitations: ['Node.js API incompatibilities', 'Bundle size limits', 'No filesystem'],
    trendline: 'Accelerating — 65% of enterprises piloting edge in 2025',
  },
};

const analyzeTopic = tool({
  name: 'analyze_topic',
  description: 'Deep analysis of a topic — market data, trends, key players, technical landscape',
  input: z.object({
    topic: z.string().describe('The subject to analyze'),
    focus: z.enum(['market', 'technical', 'competitive', 'trends']).default('market'),
  }),
  handler: async ({ topic, focus }) => {
    const key = Object.keys(MARKET_DATA).find(k => topic.toLowerCase().includes(k));
    const data = key ? MARKET_DATA[key] : null;
    return {
      topic,
      focus,
      findings: data ?? `Analyzed ${topic}: Strong growth signals. Fragmented tooling landscape with clear opportunity for opinionated, focused solutions.`,
      confidence: data ? 'high' : 'medium',
      dataPoints: data ? Object.keys(data as object).length : 3,
    };
  },
});

const identifyTrends = tool({
  name: 'identify_trends',
  description: 'Identify key trends and inflection points relevant to a topic',
  input: z.object({
    topic: z.string(),
    horizon: z.enum(['6m', '1y', '3y']).default('1y'),
  }),
  handler: async ({ topic, horizon }) => {
    const trends = [
      `Edge-first architecture adoption is accelerating — 65% of new agent deployments in 2025 targeting sub-100ms response`,
      `LLM costs dropping ~50% every 12 months, making agentic patterns economically viable at scale`,
      `MCP (Model Context Protocol) becoming the standard for tool integration across AI clients`,
      `Durable Objects and similar co-located state patterns resolving the stateful agent problem`,
      `Multi-agent orchestration frameworks maturing — shift from single-agent to collaborative systems`,
    ].slice(0, horizon === '6m' ? 2 : horizon === '1y' ? 3 : 5);
    return { topic, horizon, trends, recommendation: `${topic} is at an early-growth inflection. First-mover advantage significant.` };
  },
});

const compareOptions = tool({
  name: 'compare_options',
  description: 'Compare competing solutions, approaches, or frameworks on key dimensions',
  input: z.object({
    subject: z.string(),
    options: z.array(z.string()).describe('Things to compare'),
    dimensions: z.array(z.string()).optional(),
  }),
  handler: async ({ subject, options, dimensions }) => {
    const dims = dimensions ?? ['performance', 'developer_experience', 'scalability', 'cost'];
    const scores: Record<string, Record<string, number>> = {};
    options.forEach((opt, i) => {
      scores[opt] = {};
      dims.forEach((d, j) => {
        // Deterministic but varied scores
        scores[opt][d] = Math.min(10, Math.max(5, 7 + ((i + j) % 3) - 1));
      });
    });
    return { subject, comparison: scores, winner: options[0], rationale: `${options[0]} leads on ${dims[0]} and ${dims[1]}` };
  },
});

// ── Agent ──────────────────────────────────────────────────

export const analystAgent = createAgent({
  name: 'analyst',
  model: 'claude-sonnet-4-5',
  memory: { enabled: false }, // Sub-agents are stateless — orchestrator holds state
  binding: 'ANALYST_DO',
  tools: [analyzeTopic, identifyTrends, compareOptions] as unknown as ToolDefinition[],
  system: `You are a specialist research analyst. When given a topic, produce structured analytical findings.
Use your tools to gather data, identify trends, and compare options.
Be precise, data-driven, and concise. Output structured JSON-friendly findings.
Your output will be consumed by a synthesis agent — include raw data points, not narrative.`,
});

export const AnalystDO = analystAgent.DurableObject;
