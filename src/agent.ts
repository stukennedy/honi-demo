import { createAgent, tool, z } from 'honi-cf';
import type { ToolDefinition } from 'honi-cf';

const getProjectStatus = tool({
  name: 'get_project_status',
  description: 'Get the current status of a project by ID or name',
  input: z.object({ project: z.string() }),
  handler: async ({ project }) => {
    const projects: Record<string, unknown> = {
      alpha: {
        name: 'Project Alpha',
        status: 'on-track',
        completion: 72,
        dueDate: '2026-04-15',
        team: ['Alice', 'Bob', 'Carol'],
      },
      beta: {
        name: 'Project Beta',
        status: 'at-risk',
        completion: 34,
        dueDate: '2026-03-20',
        team: ['Dave', 'Eve'],
      },
      gamma: {
        name: 'Project Gamma',
        status: 'blocked',
        completion: 15,
        dueDate: '2026-05-01',
        team: ['Frank'],
      },
    };
    const key = project.toLowerCase().replace('project ', '');
    return (
      projects[key] || {
        error: 'Project not found. Available: Alpha, Beta, Gamma',
      }
    );
  },
});

const listTasks = tool({
  name: 'list_tasks',
  description: 'List open tasks for a project',
  input: z.object({
    project: z.string(),
    status: z.enum(['open', 'done', 'all']).optional(),
  }),
  handler: async ({ project, status = 'open' }) => {
    const tasks: Record<string, { id: string; title: string; assignee: string; priority: string; status: string }[]> = {
      alpha: [
        { id: 'A-1', title: 'API integration', assignee: 'Alice', priority: 'high', status: 'open' },
        { id: 'A-2', title: 'Write unit tests', assignee: 'Bob', priority: 'medium', status: 'open' },
        { id: 'A-3', title: 'Deploy to staging', assignee: 'Carol', priority: 'high', status: 'done' },
      ],
      beta: [
        { id: 'B-1', title: 'Fix auth bug', assignee: 'Dave', priority: 'critical', status: 'open' },
        { id: 'B-2', title: 'Performance audit', assignee: 'Eve', priority: 'medium', status: 'open' },
      ],
    };
    const key = project.toLowerCase().replace('project ', '');
    const projectTasks = tasks[key] || [];
    return status === 'all'
      ? projectTasks
      : projectTasks.filter((t) => t.status === status);
  },
});

const createTask = tool({
  name: 'create_task',
  description: 'Create a new task in a project',
  input: z.object({
    project: z.string(),
    title: z.string(),
    assignee: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  }),
  handler: async ({ project, title, assignee, priority = 'medium' }) => {
    return {
      created: true,
      id: 'TASK-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      project,
      title,
      assignee: assignee || 'Unassigned',
      priority,
      status: 'open',
    };
  },
});

const agent = createAgent({
  name: 'vela-support',
  model: 'claude-3-5-haiku-20241022',
  memory: { enabled: true },
  tools: [getProjectStatus, listTasks, createTask] as unknown as ToolDefinition[],
  binding: 'VELA_SUPPORT_DO',
  system: `You are Vela's AI assistant — helpful, concise, and friendly.
You help users manage their projects and tasks.
When asked about projects, always use the get_project_status tool.
When asked about tasks, use the list_tasks tool.
When creating tasks, confirm the details before using create_task.
Keep responses short and actionable.`,
});

export const velaFetch: ExportedHandlerFetchHandler = agent.fetch;
export const VelaSupportDO: { new (ctx: DurableObjectState, env: unknown): { fetch(request: Request): Promise<Response> } } = agent.DurableObject;
