import { createAgent, tool, z } from 'honidev';
import type { ToolDefinition } from 'honidev';

const structureReport = tool({
  name: 'structure_report',
  description: 'Structure analytical findings into a clear, actionable report',
  input: z.object({
    title: z.string(),
    findings: z.string().describe('Raw findings from the analyst'),
    format: z.enum(['executive', 'technical', 'investor']).default('executive'),
  }),
  handler: async ({ title, findings, format }) => {
    const sections = {
      executive: ['Summary', 'Key Findings', 'Opportunity', 'Recommendation'],
      technical: ['Overview', 'Technical Analysis', 'Architecture Implications', 'Implementation Path'],
      investor: ['Thesis', 'Market Size', 'Competitive Landscape', 'Risk Factors'],
    };
    return {
      title,
      format,
      sections: sections[format],
      structure: 'Report structure generated — synthesise findings into these sections',
      wordTarget: format === 'executive' ? 300 : 500,
    };
  },
});

const extractKeyInsights = tool({
  name: 'extract_key_insights',
  description: 'Extract the 3–5 most important insights from research findings',
  input: z.object({
    rawFindings: z.string(),
    maxInsights: z.number().min(2).max(7).default(4),
  }),
  handler: async ({ maxInsights }) => {
    // In production: use LLM structured extraction or embedding similarity
    return {
      extracted: maxInsights,
      note: 'Top insights identified from analyst findings — ready for synthesis',
    };
  },
});

// ── Agent ──────────────────────────────────────────────────

export const synthesisAgent = createAgent({
  name: 'synthesis',
  model: 'gemini-2.5-flash',
  memory: { enabled: false }, // Stateless — orchestrated per-request
  binding: 'SYNTHESIS_DO',
  tools: [structureReport, extractKeyInsights] as unknown as ToolDefinition[],
  system: `You are a specialist synthesis writer. You receive structured research findings and produce clear, polished reports.

Given analyst findings, your job is to:
1. Extract the key insights (3–5 max)
2. Structure them into a coherent narrative
3. Add actionable recommendations

Be concise. Lead with the most important insight. Use bullet points for key findings.
Format your output as a polished report that a senior decision-maker could act on immediately.`,
});

export const SynthesisDO = synthesisAgent.DurableObject;
