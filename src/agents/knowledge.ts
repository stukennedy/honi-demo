import { createAgent, z } from 'honidev';
import type { ToolDefinition, ToolContext } from 'honidev';

// ── Seed data (written to graph on first run) ──────────────

const SEED_NODES = [
  { id: 'alice-chen', label: 'Person', props: { name: 'Alice Chen', role: 'CTO', company: 'TechCorp', linkedin: 'linkedin.com/in/alice-chen' } },
  { id: 'bob-martinez', label: 'Person', props: { name: 'Bob Martinez', role: 'VP Engineering', company: 'TechCorp' } },
  { id: 'carol-white', label: 'Person', props: { name: 'Carol White', role: 'CEO', company: 'StartupXYZ' } },
  { id: 'dave-kim', label: 'Person', props: { name: 'Dave Kim', role: 'Partner', company: 'Horizon Ventures' } },
  { id: 'priya-patel', label: 'Person', props: { name: 'Priya Patel', role: 'Head of Product', company: 'TechCorp' } },
  { id: 'techcorp', label: 'Company', props: { name: 'TechCorp', industry: 'Developer Tools', stage: 'Series B', hq: 'San Francisco' } },
  { id: 'startupxyz', label: 'Company', props: { name: 'StartupXYZ', industry: 'AI/ML', stage: 'Seed', hq: 'London' } },
  { id: 'horizon', label: 'Company', props: { name: 'Horizon Ventures', industry: 'Venture Capital', stage: 'Fund III' } },
];

const SEED_EDGES: { from: string; to: string; type: string; props?: Record<string, unknown> }[] = [
  { from: 'alice-chen', to: 'techcorp', type: 'works_at', props: { since: '2021', level: 'C-Suite' } },
  { from: 'bob-martinez', to: 'techcorp', type: 'works_at', props: { since: '2022' } },
  { from: 'priya-patel', to: 'techcorp', type: 'works_at', props: { since: '2023' } },
  { from: 'bob-martinez', to: 'alice-chen', type: 'reports_to' },
  { from: 'priya-patel', to: 'alice-chen', type: 'reports_to' },
  { from: 'carol-white', to: 'startupxyz', type: 'works_at', props: { since: '2023', level: 'Founder' } },
  { from: 'dave-kim', to: 'horizon', type: 'works_at' },
  { from: 'horizon', to: 'techcorp', type: 'invested_in', props: { round: 'Series B', year: 2024 } },
  { from: 'horizon', to: 'startupxyz', type: 'invested_in', props: { round: 'Seed', year: 2024 } },
  { from: 'alice-chen', to: 'carol-white', type: 'knows', props: { met_at: 'HTMX Conf 2024', context: 'Conference keynote speakers' } },
  { from: 'alice-chen', to: 'dave-kim', type: 'knows', props: { met_at: 'Series B closing dinner', context: 'Lead investor' } },
  { from: 'carol-white', to: 'dave-kim', type: 'knows', props: { met_at: 'Seed pitch 2023', context: 'Seed investor' } },
];

// ── Tools (using direct ToolDefinition objects to support ctx in handlers) ──

type Handler<T> = (input: T, ctx?: ToolContext) => Promise<unknown>;

function mkTool<S extends z.ZodType>(
  name: string,
  description: string,
  input: S,
  handler: Handler<z.infer<S>>,
): ToolDefinition {
  return { name, description, input, handler } as unknown as ToolDefinition;
}

const addPersonInput = z.object({
  id: z.string().describe('Unique slug ID e.g. "john-smith"'),
  name: z.string(),
  role: z.string(),
  company: z.string().optional(),
  notes: z.string().optional().describe('Any extra context about this person'),
});

const addPerson = mkTool('add_person', 'Add a new person to the knowledge graph with their role and company', addPersonInput,
  async ({ id, name, role, company, notes }, ctx) => {
    if (!ctx?.graph) return { error: 'Graph not available' };
    const props: Record<string, unknown> = { name, role };
    if (company) props.company = company;
    if (notes) props.notes = notes;
    await ctx.graph.upsertNode(id, 'Person', props);
    return { ok: true, message: `Added ${name} (${role}${company ? ' @ ' + company : ''}) to the knowledge graph`, nodeId: id };
  },
);

const addCompanyInput = z.object({
  id: z.string().describe('Unique slug ID e.g. "acme-corp"'),
  name: z.string(),
  industry: z.string().optional(),
  stage: z.string().optional().describe('e.g. Seed, Series A, Public'),
  notes: z.string().optional(),
});

const addCompany = mkTool('add_company', 'Add a new company to the knowledge graph', addCompanyInput,
  async ({ id, name, industry, stage, notes }, ctx) => {
    if (!ctx?.graph) return { error: 'Graph not available' };
    const props: Record<string, unknown> = { name };
    if (industry) props.industry = industry;
    if (stage) props.stage = stage;
    if (notes) props.notes = notes;
    await ctx.graph.upsertNode(id, 'Company', props);
    return { ok: true, message: `Added ${name} to the knowledge graph`, nodeId: id };
  },
);

const addRelationshipInput = z.object({
  fromId: z.string().describe('Source node ID'),
  toId: z.string().describe('Target node ID'),
  type: z.enum(['knows', 'works_at', 'reports_to', 'invested_in', 'advised_by', 'collaborated_with', 'introduced_by', 'competes_with']),
  context: z.string().optional().describe('How/where this relationship formed'),
});

const addRelationship = mkTool('add_relationship', 'Add a relationship (edge) between two entities in the knowledge graph', addRelationshipInput,
  async ({ fromId, toId, type, context }, ctx) => {
    if (!ctx?.graph) return { error: 'Graph not available' };
    const props: Record<string, unknown> = {};
    if (context) props.context = context;
    await ctx.graph.upsertEdge(fromId, toId, type, props);
    return { ok: true, message: `Relationship added: ${fromId} → [${type}] → ${toId}` };
  },
);

const getNetworkInput = z.object({
  nodeId: z.string().describe('Person or company ID to explore'),
  depth: z.number().min(1).max(3).default(2).describe('How many hops to traverse'),
});

const getNetwork = mkTool('get_network', 'Get the network/connections around a person or company', getNetworkInput,
  async ({ nodeId, depth }, ctx) => {
    if (!ctx?.graph) return { error: 'Graph not available' };
    try {
      const sub = await ctx.graph.subgraph(nodeId, depth, 'both');
      if (!sub.nodes.length) return { error: `No entity found with ID "${nodeId}". Try listing people first.` };
      const root = sub.nodes.find(n => n.id === nodeId);
      const connections = sub.edges.map(e => {
        const from = sub.nodes.find(n => n.id === e.fromId);
        const to = sub.nodes.find(n => n.id === e.toId);
        const fromName = (from?.properties?.name as string) ?? e.fromId;
        const toName = (to?.properties?.name as string) ?? e.toId;
        const ctxStr = e.properties?.context ? ` (${e.properties.context})` : '';
        return `${fromName} → [${e.type}] → ${toName}${ctxStr}`;
      });
      return { entity: root?.properties ?? { id: nodeId }, connections, nodeCount: sub.nodeCount, edgeCount: sub.edgeCount };
    } catch (err) {
      return { error: (err as Error).message };
    }
  },
);

const findPathInput = z.object({
  fromId: z.string().describe('Start node ID'),
  toId: z.string().describe('End node ID'),
});

const findPath = mkTool('find_path', 'Find the shortest connection path between two people or companies', findPathInput,
  async ({ fromId, toId }, ctx) => {
    if (!ctx?.graph) return { error: 'Graph not available' };
    try {
      const path = await ctx.graph.shortestPath(fromId, toId);
      if (!path) return { connected: false, message: `No connection found between ${fromId} and ${toId}` };
      const steps = path.edges.map((e, i) => {
        const fromNode = path.nodes[i];
        const toNode = path.nodes[i + 1];
        const fromName = (fromNode?.properties?.name as string) ?? e.fromId;
        const toName = (toNode?.properties?.name as string) ?? e.toId;
        return `${fromName} → [${e.type}] → ${toName}`;
      });
      return { connected: true, hops: path.length, path: steps,
        explanation: `Connected in ${path.length} hop${path.length !== 1 ? 's' : ''}: ${steps.join(' → ')}` };
    } catch (err) {
      return { error: (err as Error).message };
    }
  },
);

const listPeople = mkTool('list_people', 'List all people and companies in the knowledge graph', z.object({}),
  async (_args, ctx) => {
    if (!ctx?.graph) return { error: 'Graph not available' };
    const people = await ctx.graph.listNodes({ label: 'Person', limit: 50 });
    const companies = await ctx.graph.listNodes({ label: 'Company', limit: 50 });
    return {
      people: people.map(p => ({ id: p.id, ...p.properties })),
      companies: companies.map(c => ({ id: c.id, ...c.properties })),
    };
  },
);

// ── Agent ──────────────────────────────────────────────────

export const knowledgeAgent = createAgent({
  name: 'people-intelligence',
  model: 'gemini-2.5-flash',
  memory: {
    enabled: true,
    graph: {
      enabled: true,
      graphId: 'demo-knowledge',
      binding: 'EDGRAPH',
      apiKeyEnvVar: 'EDGRAPH_API_KEY',
      contextDepth: 1,
    },
  },
  binding: 'KNOWLEDGE_DO',
  tools: [addPerson, addCompany, addRelationship, getNetwork, findPath, listPeople],
  system: `You are a People Intelligence agent — you maintain and query a knowledge graph of people, companies, and their relationships.

Your knowledge graph currently contains a network of people in the tech/VC world. Use tools to answer questions about:
- Who someone is connected to (use get_network)
- How two people are connected (use find_path)  
- Who works at what company, reports to whom
- Investment relationships between VCs and companies
- Who knows who and how they met

When users ask about relationships, ALWAYS use tools — never guess. The graph has the real data.
When users want to add someone or a relationship, collect the details and use add_person / add_company / add_relationship.

After calling a tool, summarise the result conversationally — don't just dump raw data.

The graph starts with: Alice Chen (CTO, TechCorp), Bob Martinez, Priya Patel, Carol White (CEO, StartupXYZ), Dave Kim (Horizon Ventures), and their relationships.

Tips for demos:
- "Who is Alice connected to?" → get_network('alice-chen')
- "How is Bob connected to Carol?" → find_path('bob-martinez', 'carol-white')
- "Who does Horizon Ventures invest in?" → get_network('horizon')
- "Add Sarah — she's Head of Sales at TechCorp and reports to Alice" → add_person + add_relationship`,
  maxSteps: 5,
});

export const KnowledgeDO = knowledgeAgent.DurableObject;

// ── Graph seed ─────────────────────────────────────────────
// Called once on first deploy to pre-populate the graph

export async function seedGraph(edgraphUrl: string, apiKey: string): Promise<void> {
  const { GraphMemory } = await import('honidev');
  const graph = new GraphMemory({ graphId: 'demo-knowledge', url: edgraphUrl, apiKey });

  // Check if already seeded
  const existing = await graph.listNodes({ label: 'Person', limit: 1 });
  if (existing.length > 0) return; // Already seeded

  console.log('[honi-demo] Seeding knowledge graph…');
  for (const node of SEED_NODES) {
    await graph.upsertNode(node.id, node.label, node.props);
  }
  for (const edge of SEED_EDGES) {
    await graph.upsertEdge(edge.from, edge.to, edge.type, edge.props ?? {});
  }
  console.log(`[honi-demo] Seeded ${SEED_NODES.length} nodes, ${SEED_EDGES.length} edges`);
}
