import { createAgent, tool, z } from 'honidev';
import type { ToolDefinition } from 'honidev';

// ── Mock data ──────────────────────────────────────────────

const ACCOUNTS: Record<string, { name: string; email: string; plan: string; mrr: number; status: string; since: string; seats: number; }> = {
  'ACC-001': { name: 'Stu Kennedy', email: 'stu@continuata.com', plan: 'Pro', mrr: 299, status: 'active', since: '2024-01-15', seats: 5 },
  'ACC-002': { name: 'Alice Chen', email: 'alice@techcorp.io', plan: 'Team', mrr: 799, status: 'active', since: '2023-06-01', seats: 25 },
  'ACC-003': { name: 'Marcus Webb', email: 'marcus@acmeinc.com', plan: 'Starter', mrr: 49, status: 'payment_overdue', since: '2024-08-20', seats: 1 },
  'ACC-004': { name: 'Priya Sharma', email: 'priya@novalabs.dev', plan: 'Enterprise', mrr: 2499, status: 'active', since: '2023-02-10', seats: 100 },
};

const TICKETS: Record<string, { id: string; account: string; title: string; priority: string; status: string; created: string; category: string; notes?: string; }[]> = {
  'ACC-001': [
    { id: 'TKT-1042', account: 'ACC-001', title: 'API rate limits hitting on burst traffic', priority: 'high', status: 'open', created: '2026-03-01', category: 'performance' },
    { id: 'TKT-1015', account: 'ACC-001', title: 'Webhook signature verification failing', priority: 'medium', status: 'resolved', created: '2026-02-20', category: 'integration', notes: 'Resolved — HMAC secret was base64-encoded, needed raw string.' },
  ],
  'ACC-002': [
    { id: 'TKT-1051', account: 'ACC-002', title: 'SAML SSO setup guide', priority: 'low', status: 'open', created: '2026-03-03', category: 'auth' },
  ],
  'ACC-004': [
    { id: 'TKT-998', account: 'ACC-004', title: 'Custom SLA reporting — Q1 data', priority: 'medium', status: 'in_progress', created: '2026-02-28', category: 'reporting' },
  ],
};

// In-session ticket store (persists via DO memory across requests)
const newTickets: { id: string; account: string; title: string; priority: string; status: string; created: string; category: string; }[] = [];

// ── Tools ──────────────────────────────────────────────────

const lookupAccount = tool({
  name: 'lookup_account',
  description: 'Look up a customer account by ID or email address',
  input: z.object({
    query: z.string().describe('Account ID (e.g. ACC-001) or email address'),
  }),
  handler: async ({ query }) => {
    const q = query.toLowerCase();
    const account = Object.values(ACCOUNTS).find(
      (a) => a.email.toLowerCase() === q || Object.keys(ACCOUNTS).find(k => ACCOUNTS[k] === a)?.toLowerCase() === q
    ) ?? Object.values(ACCOUNTS).find((a) => a.email.toLowerCase().includes(q));
    const id = Object.keys(ACCOUNTS).find(k => ACCOUNTS[k] === account || k.toLowerCase() === q);
    if (!account || !id) return { error: `No account found for "${query}"`, hint: 'Try: ACC-001, ACC-002, ACC-003, or ACC-004, or an email like stu@continuata.com' };
    return { id, ...account };
  },
});

const checkSubscription = tool({
  name: 'check_subscription',
  description: 'Check subscription status, plan details and usage for an account',
  input: z.object({
    accountId: z.string().describe('Account ID like ACC-001'),
  }),
  handler: async ({ accountId }) => {
    const account = ACCOUNTS[accountId];
    if (!account) return { error: `Account ${accountId} not found` };
    const usagePct = Math.floor(Math.random() * 60) + 30; // 30–90%
    return {
      accountId,
      plan: account.plan,
      mrr: account.mrr,
      status: account.status,
      seats: account.seats,
      seatsUsed: Math.floor(account.seats * (usagePct / 100)),
      apiCallsThisMonth: Math.floor(Math.random() * 80000) + 5000,
      renewalDate: '2026-04-01',
      ...(account.status === 'payment_overdue' && { warning: 'Payment overdue — account will be suspended in 7 days' }),
    };
  },
});

const listTickets = tool({
  name: 'list_tickets',
  description: 'List support tickets for an account, optionally filtered by status',
  input: z.object({
    accountId: z.string(),
    status: z.enum(['open', 'resolved', 'in_progress', 'all']).optional().default('all'),
  }),
  handler: async ({ accountId, status }) => {
    const base = TICKETS[accountId] ?? [];
    const mine = newTickets.filter(t => t.account === accountId);
    const all = [...base, ...mine];
    const filtered = status === 'all' ? all : all.filter(t => t.status === status);
    if (!filtered.length) return { message: `No ${status === 'all' ? '' : status + ' '}tickets found for ${accountId}` };
    return { count: filtered.length, tickets: filtered };
  },
});

const createTicket = tool({
  name: 'create_ticket',
  description: 'Create a new support ticket for a customer account',
  input: z.object({
    accountId: z.string(),
    title: z.string().describe('Clear, concise description of the issue'),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    category: z.enum(['billing', 'performance', 'integration', 'auth', 'bug', 'feature', 'other']).default('other'),
  }),
  handler: async ({ accountId, title, priority, category }) => {
    if (!ACCOUNTS[accountId] && !Object.values(ACCOUNTS).find(a => a.email === accountId)) {
      return { error: `Account ${accountId} not found` };
    }
    const id = `TKT-${1100 + Math.floor(Math.random() * 900)}`;
    const ticket = { id, account: accountId, title, priority, status: 'open', created: new Date().toISOString().split('T')[0], category };
    newTickets.push(ticket);
    return { created: true, ticket, message: `Ticket ${id} created with ${priority} priority. Expected response: ${priority === 'critical' ? '1 hour' : priority === 'high' ? '4 hours' : '1 business day'}` };
  },
});

const getTicket = tool({
  name: 'get_ticket',
  description: 'Get details and notes for a specific support ticket',
  input: z.object({ ticketId: z.string() }),
  handler: async ({ ticketId }) => {
    const all = [...Object.values(TICKETS).flat(), ...newTickets];
    const ticket = all.find(t => t.id === ticketId);
    if (!ticket) return { error: `Ticket ${ticketId} not found` };
    return ticket;
  },
});

// ── Agent ──────────────────────────────────────────────────

export const supportAgent = createAgent({
  name: 'nexus-support',
  model: 'gemini-2.5-flash',
  memory: { enabled: true },
  binding: 'SUPPORT_DO',
  tools: [lookupAccount, checkSubscription, listTickets, createTicket, getTicket] as unknown as ToolDefinition[],
  system: `You are the AI support agent for Nexus — a developer infrastructure SaaS platform.
Be helpful, concise, and professional. Always use tools to look up real data rather than guessing.

When a user mentions an account or email, immediately look it up with lookup_account.
When creating tickets, confirm the issue description before proceeding.
Surface actionable next steps. Keep responses focused and short.

Demo accounts you can look up:
- stu@continuata.com (ACC-001) — Pro plan
- alice@techcorp.io (ACC-002) — Team plan  
- marcus@acmeinc.com (ACC-003) — Starter, payment overdue
- priya@novalabs.dev (ACC-004) — Enterprise

Tip for demos: "Check my account stu@continuata.com" or "What tickets does ACC-002 have open?"`,
});

export const SupportDO = supportAgent.DurableObject;
