import { createAgent, tool, z } from 'honidev';
import type { ToolDefinition } from 'honidev';

// ── Incident store ─────────────────────────────────────────
// Incidents are stored in-memory (persist while Worker is warm).
// The conversation history is stored durably in the DO — so the agent
// always has full context of past incidents even across cold starts.

export interface Incident {
  id: string;
  title: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  responders: string[];
  affectedServices: string[];
  timeline: { ts: string; note: string; author: string }[];
  createdAt: string;
  resolvedAt?: string;
}

const incidents = new Map<string, Incident>();
let incidentCounter = 100;

// Seed with one in-progress incident for demo interest
incidents.set('INC-099', {
  id: 'INC-099',
  title: 'Elevated error rates on EU payments gateway',
  severity: 'P2',
  status: 'monitoring',
  responders: ['ops-team', 'payments-squad'],
  affectedServices: ['payments-eu', 'checkout-api'],
  createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  timeline: [
    { ts: new Date(Date.now() - 3600 * 1000).toISOString(), note: 'Incident declared — 5xx rate on /api/charge spiked to 12%', author: 'alerting-bot' },
    { ts: new Date(Date.now() - 2700 * 1000).toISOString(), note: 'Root cause identified: TLS cert expiry on upstream PSP. Rollover in progress.', author: 'alice' },
    { ts: new Date(Date.now() - 900 * 1000).toISOString(), note: 'Error rate now below 1%. Monitoring for 30 min before resolving.', author: 'marcus' },
  ],
});

// ── Tools ──────────────────────────────────────────────────

const declareIncident = tool({
  name: 'declare_incident',
  description: 'Declare a new incident. Call this as soon as an issue is identified.',
  input: z.object({
    title: z.string().describe('Short, clear description of the incident'),
    severity: z.enum(['P1', 'P2', 'P3', 'P4']).describe('P1=critical/all-down, P2=major, P3=degraded, P4=minor'),
    affectedServices: z.array(z.string()).describe('List of affected services or components'),
    initialNote: z.string().describe('Initial observations or context'),
    reportedBy: z.string().default('user').describe('Who reported this'),
  }),
  handler: async ({ title, severity, affectedServices, initialNote, reportedBy }) => {
    incidentCounter++;
    const id = `INC-${incidentCounter}`;
    const now = new Date().toISOString();
    const incident: Incident = {
      id,
      title,
      severity,
      status: 'investigating',
      responders: [],
      affectedServices,
      createdAt: now,
      timeline: [{ ts: now, note: initialNote, author: reportedBy }],
    };
    incidents.set(id, incident);
    const eta = severity === 'P1' ? '15 min' : severity === 'P2' ? '30 min' : '2 hours';
    return {
      id,
      severity,
      status: 'investigating',
      message: `Incident ${id} declared. Target resolution: ${eta}. Add responders with assign_responder.`,
    };
  },
});

const updateStatus = tool({
  name: 'update_incident_status',
  description: 'Update the status of an active incident',
  input: z.object({
    incidentId: z.string(),
    status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
    note: z.string().describe('What changed — what was found or fixed'),
    author: z.string().default('user'),
  }),
  handler: async ({ incidentId, status, note, author }) => {
    const inc = incidents.get(incidentId);
    if (!inc) return { error: `Incident ${incidentId} not found. Active incidents: ${[...incidents.keys()].join(', ') || 'none'}` };
    inc.status = status;
    inc.timeline.push({ ts: new Date().toISOString(), note, author });
    if (status === 'resolved') inc.resolvedAt = new Date().toISOString();
    return {
      id: incidentId,
      newStatus: status,
      duration: inc.resolvedAt ? `${Math.round((new Date(inc.resolvedAt).getTime() - new Date(inc.createdAt).getTime()) / 60000)} min` : 'ongoing',
      timelineEntries: inc.timeline.length,
    };
  },
});

const addTimelineNote = tool({
  name: 'add_timeline_note',
  description: 'Add a timestamped update to an incident timeline',
  input: z.object({
    incidentId: z.string(),
    note: z.string().describe('What you found, tried, or observed'),
    author: z.string().default('user'),
  }),
  handler: async ({ incidentId, note, author }) => {
    const inc = incidents.get(incidentId);
    if (!inc) return { error: `Incident ${incidentId} not found` };
    const entry = { ts: new Date().toISOString(), note, author };
    inc.timeline.push(entry);
    return { added: true, incidentId, entry, totalEntries: inc.timeline.length };
  },
});

const assignResponder = tool({
  name: 'assign_responder',
  description: 'Assign a team or person to an incident',
  input: z.object({
    incidentId: z.string(),
    responder: z.string().describe('Team name or individual (e.g. "backend-team", "alice")'),
  }),
  handler: async ({ incidentId, responder }) => {
    const inc = incidents.get(incidentId);
    if (!inc) return { error: `Incident ${incidentId} not found` };
    if (inc.responders.includes(responder)) return { message: `${responder} already assigned` };
    inc.responders.push(responder);
    inc.timeline.push({ ts: new Date().toISOString(), note: `${responder} assigned as responder`, author: 'system' });
    return { assigned: true, incidentId, responder, allResponders: inc.responders };
  },
});

const getIncident = tool({
  name: 'get_incident',
  description: 'Get full details and timeline for a specific incident',
  input: z.object({ incidentId: z.string() }),
  handler: async ({ incidentId }) => {
    const inc = incidents.get(incidentId);
    if (!inc) return { error: `Incident ${incidentId} not found. Active: ${[...incidents.keys()].join(', ') || 'none'}` };
    return inc;
  },
});

const listIncidents = tool({
  name: 'list_incidents',
  description: 'List all incidents, optionally filtered by status',
  input: z.object({
    status: z.enum(['investigating', 'identified', 'monitoring', 'resolved', 'active', 'all']).default('all'),
  }),
  handler: async ({ status }) => {
    const all = [...incidents.values()];
    const filtered = status === 'all' ? all
      : status === 'active' ? all.filter(i => i.status !== 'resolved')
      : all.filter(i => i.status === status);
    return {
      count: filtered.length,
      incidents: filtered.map(i => ({
        id: i.id,
        title: i.title,
        severity: i.severity,
        status: i.status,
        responders: i.responders,
        affectedServices: i.affectedServices,
        createdAt: i.createdAt,
        timelineEntries: i.timeline.length,
      })),
    };
  },
});

// ── Agent ──────────────────────────────────────────────────

export const incidentAgent = createAgent({
  name: 'incident-commander',
  model: 'gemini-2.5-flash',
  memory: { enabled: true },
  binding: 'INCIDENT_DO',
  tools: [declareIncident, updateStatus, addTimelineNote, assignResponder, getIncident, listIncidents] as unknown as ToolDefinition[],
  system: `You are Incident Commander — an AI-powered ops assistant for managing production incidents.

Your job is to help engineers declare, track, and resolve incidents quickly and systematically.

Incident lifecycle: investigating → identified → monitoring → resolved

On each interaction:
- If someone reports an issue, help them declare it with declare_incident
- Always capture what's known, affected services, and initial observations
- Suggest adding responders immediately for P1/P2
- Track all updates in the timeline with add_timeline_note
- Guide the team through to resolution

There is already one active incident (INC-099) to demonstrate the system.

Severity guide:
- P1: All users affected, core functionality down
- P2: Significant degradation, workaround exists
- P3: Minor degradation, most users unaffected  
- P4: Cosmetic/non-urgent

Demo prompts: "What incidents are active?", "Declare P2: database slow queries on prod", "Add a note to INC-099"`,
});

export const IncidentDO = incidentAgent.DurableObject;
