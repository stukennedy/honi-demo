# Vela Support Bot

A customer support chatbot for **Vela** — a fictional project management SaaS. Built with [@stukennedy/honi](https://www.npmjs.com/package/@stukennedy/honi).

## What this demo shows

- **Agent creation** — `createAgent()` with system prompt, tools, and memory
- **Tool use** — Three tools: get project status, list tasks, create tasks
- **Streaming** — Real-time SSE responses rendered word-by-word
- **Memory** — Durable Object-backed conversation history
- **Chat UI** — Dark-themed interface served from the same Worker

## Quick start

```bash
# Install dependencies
bun install

# Set your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .dev.vars

# Start local dev server
bunx wrangler dev
```

Open [http://localhost:8787](http://localhost:8787) in your browser.

## Try asking

- "What's the status of Project Alpha?"
- "List open tasks for Beta"
- "Create a high priority task for Alpha: Review API docs"
- "Which projects are at risk?"

## Project structure

```
src/
  index.ts   — Worker entry point, serves UI + routes to agent
  agent.ts   — Agent definition with tools
  ui.ts      — Chat interface HTML
```

## Architecture

The app runs as a single Cloudflare Worker. The agent uses a Durable Object for persistent memory, so conversations survive across requests. Tools return mock data for the demo — in production you'd connect these to real APIs.
