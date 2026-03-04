export function getDemoHTML(): string {
  return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Honi — Demo Showcase</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#080A0E;--surface:#0F1219;--surface2:#141824;--border:#1E2433;
  --text:#F8FAFC;--dim:#94A3B8;--muted:#475569;
  --amber:#F59E0B;--amber-dim:rgba(245,158,11,0.12);--amber-glow:rgba(245,158,11,0.25);
  --blue:#60A5FA;--green:#34D399;--red:#F87171;--purple:#A78BFA;
  --support:#F59E0B;--incident:#F87171;--research:#60A5FA;
  --radius:8px;--mono:'JetBrains Mono','Fira Code',monospace;
  --body:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
}
html,body{height:100%;overflow:hidden;background:var(--bg);color:var(--text);font-family:var(--body)}
a{color:inherit;text-decoration:none}

/* ── Layout ── */
.shell{display:grid;grid-template-rows:56px 1fr;height:100vh;overflow:hidden}
.topbar{display:flex;align-items:center;gap:16px;padding:0 20px;border-bottom:1px solid var(--border);background:var(--surface);flex-shrink:0}
.logo{display:flex;align-items:center;gap:8px}
.logo-hex{flex-shrink:0}
.logo-name{font-family:'Bebas Neue',system-ui,sans-serif;font-size:20px;letter-spacing:.15em;color:var(--text)}
.topbar-meta{font-size:12px;color:var(--muted);font-family:var(--mono)}
.topbar-link{margin-left:auto;font-size:12px;color:var(--dim);font-family:var(--mono);padding:6px 12px;border:1px solid var(--border);border-radius:4px;transition:border-color .2s,color .2s}
.topbar-link:hover{border-color:var(--amber);color:var(--amber)}

/* ── Main grid ── */
.main{display:grid;grid-template-columns:220px 1fr 260px;overflow:hidden;height:100%;min-height:0}
@media(max-width:900px){.main{grid-template-columns:1fr}.sidebar,.info-panel{display:none}}

/* ── Sidebar ── */
.sidebar{border-right:1px solid var(--border);background:var(--surface);padding:20px 0;overflow-y:auto}
.sidebar-section{padding:0 16px;margin-bottom:24px}
.sidebar-label{font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:10px}
.agent-btn{width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:6px;border:none;background:none;color:var(--dim);cursor:pointer;font-size:13px;font-family:var(--body);text-align:left;transition:background .15s,color .15s;margin-bottom:2px}
.agent-btn:hover{background:var(--surface2);color:var(--text)}
.agent-btn.active{background:var(--amber-dim);color:var(--text)}
.agent-btn.active .agent-dot{background:var(--amber)}
.agent-btn[data-agent=incident].active{background:rgba(248,113,113,0.1);color:var(--text)}
.agent-btn[data-agent=incident].active .agent-dot{background:var(--red)}
.agent-btn[data-agent=research].active{background:rgba(96,165,250,0.1);color:var(--text)}
.agent-btn[data-agent=research].active .agent-dot{background:var(--blue)}
.agent-dot{width:8px;height:8px;border-radius:50%;background:var(--border);flex-shrink:0;transition:background .2s}
.agent-name{font-weight:500}
.agent-sub{font-size:11px;color:var(--muted);margin-top:1px}

/* ── Chat panel ── */
.chat-panel{display:flex;flex-direction:column;overflow:hidden;min-height:0;height:100%}
.chat-header{padding:16px 20px 12px;border-bottom:1px solid var(--border);background:var(--surface);flex-shrink:0}
.chat-header-top{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.chat-agent-indicator{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.chat-agent-name{font-size:14px;font-weight:600;letter-spacing:.02em}
.chat-agent-desc{font-size:12px;color:var(--dim);line-height:1.5;margin-bottom:10px}
.prompts{display:flex;gap:6px;flex-wrap:wrap}
.prompt-chip{padding:4px 10px;border-radius:20px;border:1px solid var(--border);background:none;color:var(--dim);font-size:12px;cursor:pointer;font-family:var(--body);transition:border-color .15s,color .15s,background .15s}
.prompt-chip:hover{border-color:var(--amber);color:var(--amber);background:var(--amber-dim)}
.chat-messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px}
.msg{display:flex;gap:12px;max-width:100%;animation:fadeIn .2s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.msg-avatar{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-top:2px}
.msg.user .msg-avatar{background:var(--surface2);border:1px solid var(--border);color:var(--dim)}
.msg.assistant .msg-avatar{background:var(--amber-dim);border:1px solid rgba(245,158,11,0.25);font-size:14px}
.msg[data-agent=incident] .msg-avatar{background:rgba(248,113,113,0.1);border-color:rgba(248,113,113,0.25)}
.msg[data-agent=research] .msg-avatar{background:rgba(96,165,250,0.1);border-color:rgba(96,165,250,0.25)}
.msg-body{flex:1;min-width:0}
.msg-meta{font-size:11px;color:var(--muted);margin-bottom:4px;font-family:var(--mono)}
.msg-text{font-size:14px;line-height:1.7;color:var(--text)}
.msg.user .msg-text{color:var(--dim)}
.msg-text p{margin-bottom:8px}.msg-text p:last-child{margin-bottom:0}
.msg-text ul,.msg-text ol{padding-left:18px;margin-bottom:8px}
.msg-text li{margin-bottom:3px}
.msg-text code{font-family:var(--mono);font-size:12px;background:var(--surface2);border:1px solid var(--border);padding:1px 5px;border-radius:3px;color:var(--amber)}
.msg-text pre{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:12px;margin:8px 0;overflow-x:auto}
.msg-text pre code{background:none;border:none;padding:0;color:var(--text);font-size:12px}
.msg-text strong{color:var(--text);font-weight:600}
.msg-text h3{font-size:14px;font-weight:600;margin:12px 0 6px}
.msg-text table{width:100%;border-collapse:collapse;font-size:12px;margin:8px 0}
.msg-text th,.msg-text td{padding:6px 10px;border:1px solid var(--border);text-align:left}
.msg-text th{background:var(--surface2);color:var(--dim);font-family:var(--mono);font-size:11px;text-transform:uppercase}

/* Tool indicator */
.tool-indicator{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:4px;background:var(--surface2);border:1px solid var(--border);font-family:var(--mono);font-size:11px;color:var(--dim);margin:4px 0;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:.7}50%{opacity:1}}
.tool-indicator.done{animation:none;border-color:var(--green);color:var(--green)}
.tool-icon{font-size:12px}

/* Typing indicator */
.typing{display:flex;gap:4px;align-items:center;padding:4px 0}
.typing span{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:bounce .8s infinite}
.typing span:nth-child(2){animation-delay:.15s}
.typing span:nth-child(3){animation-delay:.3s}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}

/* Input */
.chat-footer{padding:16px 20px;border-top:1px solid var(--border);background:var(--surface);flex-shrink:0}
.input-wrap{display:flex;gap:10px;align-items:flex-end}
.input-area{flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:14px;font-family:var(--body);color:var(--text);resize:none;outline:none;transition:border-color .2s;max-height:120px;min-height:42px;line-height:1.5}
.input-area::placeholder{color:var(--muted)}
.input-area:focus{border-color:var(--amber)}
.send-btn{width:42px;height:42px;border-radius:8px;border:none;background:var(--amber);color:#080A0E;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;transition:background .15s,opacity .15s}
.send-btn:hover{background:#FCD34D}
.send-btn:disabled{opacity:.4;cursor:not-allowed}
.clear-btn{background:none;border:1px solid var(--border);color:var(--muted);font-size:11px;padding:5px 10px;border-radius:4px;cursor:pointer;font-family:var(--mono);transition:border-color .2s,color .2s;margin-right:4px}
.clear-btn:hover{border-color:var(--red);color:var(--red)}

/* ── Research pipeline view ── */
.research-panel{display:flex;flex-direction:column;overflow:hidden;min-height:0;height:100%}
.research-header{padding:16px 20px 12px;border-bottom:1px solid var(--border);background:var(--surface);flex-shrink:0}
.research-body{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px}
.pipeline-viz{display:flex;flex-direction:column;gap:8px;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:8px}
.pipeline-step{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--dim);padding:6px 0}
.pipeline-step.active{color:var(--blue)}
.pipeline-step.done{color:var(--green)}
.step-icon{width:20px;height:20px;border-radius:50%;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}
.pipeline-step.active .step-icon{border-color:var(--blue);background:rgba(96,165,250,0.1);animation:pulse 1s infinite}
.pipeline-step.done .step-icon{border-color:var(--green);background:rgba(52,211,153,0.1)}
.result-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;overflow:hidden}
.result-card-header{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--border);background:var(--surface2)}
.result-card-title{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--dim)}
.result-card-body{padding:14px;font-size:13px;line-height:1.7;color:var(--dim);white-space:pre-wrap}
.result-card-body strong{color:var(--text)}
.research-input-wrap{display:flex;gap:10px;padding:16px 20px;border-top:1px solid var(--border);background:var(--surface);flex-shrink:0}
.research-input{flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px 14px;font-size:14px;font-family:var(--body);color:var(--text);outline:none;transition:border-color .2s}
.research-input:focus{border-color:var(--blue)}
.research-input::placeholder{color:var(--muted)}
.research-btn{padding:10px 20px;border-radius:8px;border:none;background:var(--blue);color:#080A0E;font-size:13px;font-weight:600;font-family:var(--mono);cursor:pointer;white-space:nowrap;transition:opacity .15s}
.research-btn:hover{opacity:.85}
.research-btn:disabled{opacity:.4;cursor:not-allowed}

/* ── Info panel ── */
.info-panel{border-left:1px solid var(--border);background:var(--surface);overflow-y:auto;padding:16px}
.info-section{margin-bottom:24px}
.info-title{font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:10px}
.feature-badge{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:6px;background:var(--surface2);border:1px solid var(--border);margin-bottom:6px;font-size:12px}
.feature-badge.active-feature{border-color:var(--amber);background:var(--amber-dim)}
.feature-badge.active-feature .badge-dot{background:var(--amber)}
.feature-badge[data-type=incident].active-feature{border-color:var(--red);background:rgba(248,113,113,0.1)}
.feature-badge[data-type=incident].active-feature .badge-dot{background:var(--red)}
.feature-badge[data-type=research].active-feature{border-color:var(--blue);background:rgba(96,165,250,0.1)}
.feature-badge[data-type=research].active-feature .badge-dot{background:var(--blue)}
.badge-dot{width:6px;height:6px;border-radius:50%;background:var(--muted);flex-shrink:0;margin-top:4px}
.badge-text{color:var(--dim);line-height:1.5}
.badge-text strong{color:var(--text);display:block;margin-bottom:2px}
.code-snippet{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px;font-family:var(--mono);font-size:11px;color:var(--dim);line-height:1.6;overflow-x:auto;white-space:pre}
.code-snippet .kw{color:var(--blue)}
.code-snippet .str{color:var(--amber)}
.code-snippet .fn{color:var(--green)}
.code-snippet .cm{color:var(--muted)}
</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
<div class="shell">

  <!-- Top bar -->
  <header class="topbar">
    <div class="logo">
      <svg class="logo-hex" width="28" height="28" viewBox="0 0 40 40" fill="none">
        <polygon points="20,2 36.66,11 36.66,29 20,38 3.34,29 3.34,11" fill="#F59E0B" opacity=".9"/>
      </svg>
      <span class="logo-name">HONI</span>
    </div>
    <span class="topbar-meta">demo showcase · 4 durable objects · 3 agents</span>
    <a href="https://honi.dev/docs/getting-started" target="_blank" class="topbar-link">docs ↗</a>
  </header>

  <!-- Main -->
  <div class="main">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-section">
        <div class="sidebar-label">Agents</div>
        <button class="agent-btn active" data-agent="support" onclick="switchAgent('support')">
          <span class="agent-dot"></span>
          <div>
            <div class="agent-name">Nexus Support</div>
            <div class="agent-sub">Stateful · DO memory</div>
          </div>
        </button>
        <button class="agent-btn" data-agent="incident" onclick="switchAgent('incident')">
          <span class="agent-dot"></span>
          <div>
            <div class="agent-name">Incident Commander</div>
            <div class="agent-sub">Persistent state · Long-running</div>
          </div>
        </button>
        <button class="agent-btn" data-agent="research" onclick="switchAgent('research')">
          <span class="agent-dot"></span>
          <div>
            <div class="agent-name">Research Pipeline</div>
            <div class="agent-sub">Multi-agent · Orchestration</div>
          </div>
        </button>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">Architecture</div>
        <div style="font-size:11px;color:var(--muted);line-height:1.7;font-family:var(--mono)">
          SUPPORT_DO<br>
          INCIDENT_DO<br>
          ANALYST_DO<br>
          SYNTHESIS_DO
        </div>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label">npm</div>
        <div style="font-size:11px;color:var(--amber);font-family:var(--mono)">npm i honidev</div>
      </div>
    </aside>

    <!-- Support chat -->
    <div id="panel-support" class="chat-panel" style="display:flex">
      <div class="chat-header">
        <div class="chat-header-top">
          <div class="chat-agent-indicator" style="background:var(--support)"></div>
          <div class="chat-agent-name">Nexus AI Support</div>
        </div>
        <div class="chat-agent-desc">Customer support agent with persistent DO memory. Your conversation persists across browser refreshes — the agent remembers you.</div>
        <div class="prompts">
          <button class="prompt-chip" onclick="sendPrompt('support','Check my account stu@continuata.com')">My account status</button>
          <button class="prompt-chip" onclick="sendPrompt('support','What open tickets does ACC-002 have?')">Open tickets</button>
          <button class="prompt-chip" onclick="sendPrompt('support','I need help with API rate limits for ACC-001')">File a ticket</button>
          <button class="prompt-chip" onclick="sendPrompt('support','What plan is marcus@acmeinc.com on?')">Check plan</button>
        </div>
      </div>
      <div id="messages-support" class="chat-messages"></div>
      <div class="chat-footer">
        <div class="input-wrap">
          <button class="clear-btn" onclick="clearHistory('support')">clear</button>
          <textarea id="input-support" class="input-area" placeholder="Ask about an account, subscription, or ticket…" rows="1"
            onkeydown="handleKey(event,'support')" oninput="autoResize(this)"></textarea>
          <button class="send-btn" id="send-support" onclick="sendMessage('support')">↑</button>
        </div>
      </div>
    </div>

    <!-- Incident chat -->
    <div id="panel-incident" class="chat-panel" style="display:none">
      <div class="chat-header">
        <div class="chat-header-top">
          <div class="chat-agent-indicator" style="background:var(--incident)"></div>
          <div class="chat-agent-name">Incident Commander</div>
        </div>
        <div class="chat-agent-desc">Long-running operational agent. Declare incidents, track timelines, assign responders. State persists durably in a Durable Object — come back hours later, INC-099 will still be there.</div>
        <div class="prompts">
          <button class="prompt-chip" onclick="sendPrompt('incident','What incidents are active right now?')">Active incidents</button>
          <button class="prompt-chip" onclick="sendPrompt('incident','Show me the full details and timeline for INC-099')">INC-099 timeline</button>
          <button class="prompt-chip" onclick="sendPrompt('incident','Declare P2: high latency on checkout service, affecting ~30% of users')">Declare incident</button>
          <button class="prompt-chip" onclick="sendPrompt('incident','Mark INC-099 as resolved — cert rollover completed, monitoring clean')">Resolve INC-099</button>
        </div>
      </div>
      <div id="messages-incident" class="chat-messages"></div>
      <div class="chat-footer">
        <div class="input-wrap">
          <button class="clear-btn" onclick="clearHistory('incident')">clear</button>
          <textarea id="input-incident" class="input-area" placeholder="Declare an incident, check status, add timeline notes…" rows="1"
            onkeydown="handleKey(event,'incident')" oninput="autoResize(this)"></textarea>
          <button class="send-btn" id="send-incident" onclick="sendMessage('incident')">↑</button>
        </div>
      </div>
    </div>

    <!-- Research pipeline -->
    <div id="panel-research" class="research-panel" style="display:none">
      <div class="research-header">
        <div class="chat-header-top">
          <div class="chat-agent-indicator" style="background:var(--research)"></div>
          <div class="chat-agent-name">Research Pipeline</div>
        </div>
        <div class="chat-agent-desc">Worker-level multi-agent orchestration: your query is routed to an <strong>Analyst DO</strong> (research + analysis), then a <strong>Synthesis DO</strong> (polished report). Two specialist agents, one result.</div>
        <div class="prompts">
          <button class="prompt-chip" onclick="setResearchQuery('What is the market opportunity for AI agents in 2025?')">AI agents market</button>
          <button class="prompt-chip" onclick="setResearchQuery('Compare Cloudflare Workers vs traditional serverless for AI workloads')">Edge vs serverless</button>
          <button class="prompt-chip" onclick="setResearchQuery('Analyse the competitive landscape for edge-native AI frameworks')">Framework landscape</button>
        </div>
      </div>
      <div id="research-body" class="research-body">
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;color:var(--muted);text-align:center;padding:20px">
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none"><polygon points="20,2 36.66,11 36.66,29 20,38 3.34,29 3.34,11" fill="none" stroke="#1E2433" stroke-width="2"/></svg>
          <div style="font-size:14px">Enter a research query to run the pipeline</div>
          <div style="font-size:12px;font-family:var(--mono);color:var(--border)">ANALYST_DO → SYNTHESIS_DO</div>
        </div>
      </div>
      <div class="research-input-wrap">
        <input id="research-input" class="research-input" placeholder="What do you want to research?" 
          onkeydown="if(event.key==='Enter')runResearch()">
        <button class="research-btn" id="research-btn" onclick="runResearch()">RUN PIPELINE →</button>
      </div>
    </div>

    <!-- Info panel -->
    <aside class="info-panel" id="info-panel">
      <!-- Populated by JS -->
    </aside>

  </div>
</div>

<script>
// ── State ──────────────────────────────────────────────────
const threadIds = {
  support: 'demo-support-' + Math.random().toString(36).slice(2,8),
  incident: 'demo-incident-main',
};
let currentAgent = 'support';
let sending = {};

// ── Markdown (minimal) ────────────────────────────────────
function md(text) {
  const BT = String.fromCharCode(96);
  const tripleRe = new RegExp(BT+BT+BT+'([\\\\s\\\\S]*?)'+BT+BT+BT,'g');
  const inlineRe = new RegExp(BT+'([^'+BT+']+)'+BT,'g');
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(tripleRe, (_,c)=>'<pre><code>'+c.trim()+'</code></pre>')
    .replace(inlineRe, (_,c)=>'<code>'+c+'</code>')
    .replace(/\\*\\*([^*]+)\\*\\*/g,'<strong>$1</strong>')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h3>$1</h3>')
    .replace(/^\\* (.+)$/gm,'<li>$1</li>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/^\\d+\\. (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>.*<\\/li>\\n?)+/g, m=>'<ul>'+m+'</ul>')
    .replace(/\\n\\n/g,'</p><p>')
    .replace(/\\n/g,'<br>')
    .replace(/^(.+)$/, '<p>$1</p>');
}

// ── Agent configs ─────────────────────────────────────────
const AGENTS = {
  support: {
    label: 'Nexus Support', color: 'var(--support)', emoji: '🛠',
    endpoint: '/support/chat', historyEndpoint: '/support/history',
    features: [
      { label: 'DO Memory', desc: 'memory: { enabled: true } — conversation persists across browser sessions via Durable Object storage', active: true },
      { label: 'Tool Calling', desc: 'lookup_account, check_subscription, list_tickets, create_ticket, get_ticket — 5 real tools', active: true },
      { label: 'MCP Endpoint', desc: '/support/mcp/tools exposes all tools for Claude Desktop / Cursor', active: false },
    ],
    snippet: '<span class="kw">const</span> agent = <span class="fn">createAgent</span>({\n  name: <span class="str">\\'nexus-support\\'</span>,\n  model: <span class="str">\\'claude-sonnet-4-5\\'</span>,\n  memory: { enabled: <span class="kw">true</span> },\n  tools: [lookupAccount, checkSubscription,\n          listTickets, createTicket],\n  binding: <span class="str">\\'SUPPORT_DO\\'</span>,\n})',
  },
  incident: {
    label: 'Incident Commander', color: 'var(--incident)', emoji: '🚨',
    endpoint: '/incident/chat', historyEndpoint: '/incident/history',
    features: [
      { label: 'Persistent State', desc: 'Incident data survives across sessions — DO stores full history durably', active: true, type: 'incident' },
      { label: 'Long-Running Context', desc: 'Agent maintains full incident timeline in DO memory, resumable at any time', active: true, type: 'incident' },
      { label: 'Stateful Tool Calls', desc: 'Tools mutate shared incident state (declare, update, add notes, resolve)', active: true, type: 'incident' },
    ],
    snippet: '<span class="kw">const</span> agent = <span class="fn">createAgent</span>({\n  name: <span class="str">\\'incident-commander\\'</span>,\n  model: <span class="str">\\'claude-sonnet-4-5\\'</span>,\n  memory: { enabled: <span class="kw">true</span> },\n  binding: <span class="str">\\'INCIDENT_DO\\'</span>,\n  tools: [declareIncident, updateStatus,\n          addTimelineNote, assignResponder],\n})',
  },
  research: {
    label: 'Research Pipeline', color: 'var(--research)', emoji: '🔬',
    features: [
      { label: 'Multi-Agent', desc: 'Worker orchestrates ANALYST_DO and SYNTHESIS_DO in sequence', active: true, type: 'research' },
      { label: 'routeToAgent', desc: 'routeToAgent(env, { binding: "ANALYST_DO" }, query) — direct DO-to-DO calls', active: true, type: 'research' },
      { label: 'Specialist Agents', desc: 'Each DO has a focused system prompt + dedicated toolset for its role', active: true, type: 'research' },
    ],
    snippet: '<span class="cm">// Worker-level orchestration</span>\n<span class="kw">const</span> analyst = <span class="kw">await</span> <span class="fn">routeToAgent</span>(\n  env, { binding: <span class="str">\\'ANALYST_DO\\'</span> }, query\n)\n<span class="kw">const</span> report = <span class="kw">await</span> <span class="fn">routeToAgent</span>(\n  env, { binding: <span class="str">\\'SYNTHESIS_DO\\'</span> },\n  analyst.response\n)',
  },
};

// ── Info panel ────────────────────────────────────────────
function renderInfoPanel(agent) {
  const cfg = AGENTS[agent];
  const panel = document.getElementById('info-panel');
  panel.innerHTML = \`
    <div class="info-section">
      <div class="info-title">Active Features</div>
      \${cfg.features.map(f => \`
        <div class="feature-badge \${f.active ? 'active-feature' : ''}" \${f.type ? 'data-type="'+f.type+'"' : ''}>
          <div class="badge-dot"></div>
          <div class="badge-text"><strong>\${f.label}</strong>\${f.desc}</div>
        </div>
      \`).join('')}
    </div>
    <div class="info-section">
      <div class="info-title">Agent Definition</div>
      <div class="code-snippet">\${cfg.snippet}</div>
    </div>
    <div class="info-section">
      <div class="info-title">Install</div>
      <div class="code-snippet" style="color:var(--amber)">npm install honidev</div>
    </div>
  \`;
}

// ── Switch agent ──────────────────────────────────────────
function switchAgent(agent) {
  currentAgent = agent;
  document.querySelectorAll('.agent-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(\`[data-agent=\${agent}]\`).classList.add('active');
  ['support','incident','research'].forEach(a => {
    document.getElementById('panel-'+a).style.display = a === agent ? 'flex' : 'none';
  });
  renderInfoPanel(agent);
}

// ── Add message ───────────────────────────────────────────
function addMessage(agent, role, text) {
  const container = document.getElementById('messages-'+agent);
  const cfg = AGENTS[agent];
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  if(role==='assistant') div.dataset.agent = agent;
  div.innerHTML = \`
    <div class="msg-avatar">\${role==='user'?'you':cfg.emoji}</div>
    <div class="msg-body">
      <div class="msg-meta">\${role==='user'?'you':cfg.label} · just now</div>
      <div class="msg-text">\${role==='user'?'<p>'+text.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</p>':md(text)}</div>
    </div>
  \`;
  container.appendChild(div);
  scrollTo(agent);
  return div.querySelector('.msg-text');
}

function addTyping(agent) {
  const container = document.getElementById('messages-'+agent);
  const div = document.createElement('div');
  div.className = 'msg assistant'; div.id = 'typing-'+agent;
  div.dataset.agent = agent;
  div.innerHTML = \`
    <div class="msg-avatar">\${AGENTS[agent].emoji}</div>
    <div class="msg-body">
      <div class="msg-meta">\${AGENTS[agent].label} · typing</div>
      <div class="typing"><span></span><span></span><span></span></div>
    </div>
  \`;
  container.appendChild(div);
  scrollTo(agent);
  return div;
}

function scrollTo(agent) {
  const c = document.getElementById('messages-'+agent);
  c.scrollTop = c.scrollHeight;
}

// ── Tool indicators ───────────────────────────────────────
const activeTools = {};
function addToolIndicator(agent, name, callId) {
  const container = document.getElementById('messages-'+agent);
  const div = document.createElement('div');
  div.className = 'tool-indicator';
  div.innerHTML = \`<span class="tool-icon">⚡</span> \${name.replace(/_/g,' ')}\`;
  container.appendChild(div);
  activeTools[callId] = div;
  scrollTo(agent);
  return div;
}

// ── Send message ──────────────────────────────────────────
async function sendMessage(agent) {
  if (sending[agent]) return;
  const input = document.getElementById('input-'+agent);
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  autoResize(input);

  addMessage(agent, 'user', text);
  const typingEl = addTyping(agent);
  sending[agent] = true;
  document.getElementById('send-'+agent).disabled = true;

  let fullText = '';
  let textEl = null;

  try {
    const res = await fetch(AGENTS[agent].endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Thread-Id': threadIds[agent] },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) throw new Error('Request failed: ' + res.status);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const colonIdx = line.indexOf(':');
        if (colonIdx < 1) continue;
        const type = line.slice(0, colonIdx);
        const payload = line.slice(colonIdx + 1);

        if (type === '0') {
          try {
            const chunk = JSON.parse(payload);
            if (typeof chunk === 'string') {
              if (!textEl) { typingEl.remove(); textEl = addMessage(agent, 'assistant', ''); }
              fullText += chunk;
              textEl.innerHTML = md(fullText);
              scrollTo(agent);
            }
          } catch {}
        } else if (type === '9') {
          try {
            const data = JSON.parse(payload);
            if (data.toolName) addToolIndicator(agent, data.toolName, data.toolCallId);
          } catch {}
        } else if (type === 'b') {
          try {
            const data = JSON.parse(payload);
            if (data.toolCallId && activeTools[data.toolCallId]) {
              activeTools[data.toolCallId].classList.add('done');
              activeTools[data.toolCallId].querySelector('.tool-icon').textContent = '✓';
            }
          } catch {}
        }
      }
    }
    if (!textEl) { typingEl.remove(); textEl = addMessage(agent, 'assistant', fullText || '…'); }
  } catch (err) {
    typingEl.remove();
    addMessage(agent, 'assistant', 'Error: ' + err.message);
  }

  sending[agent] = false;
  document.getElementById('send-'+agent).disabled = false;
}

function sendPrompt(agent, text) {
  if (agent !== currentAgent) switchAgent(agent);
  document.getElementById('input-'+agent).value = text;
  sendMessage(agent);
}

async function clearHistory(agent) {
  await fetch(AGENTS[agent].historyEndpoint + '?threadId=' + threadIds[agent], { method: 'DELETE' }).catch(()=>{});
  document.getElementById('messages-'+agent).innerHTML = '';
}

// ── Research pipeline ─────────────────────────────────────
function setResearchQuery(q) {
  if (currentAgent !== 'research') switchAgent('research');
  document.getElementById('research-input').value = q;
}

async function runResearch() {
  const input = document.getElementById('research-input');
  const query = input.value.trim();
  if (!query) return;

  const btn = document.getElementById('research-btn');
  btn.disabled = true;
  btn.textContent = 'RUNNING…';

  const body = document.getElementById('research-body');
  body.innerHTML = \`
    <div class="pipeline-viz">
      <div class="info-title" style="margin-bottom:8px">Pipeline running</div>
      <div class="pipeline-step active" id="step-0">
        <div class="step-icon">1</div>
        <div>Analyst DO — researching: "\${query.slice(0,60)}\${query.length>60?'…':''}"</div>
      </div>
      <div class="pipeline-step" id="step-1">
        <div class="step-icon">2</div>
        <div>Synthesis DO — waiting for analyst findings…</div>
      </div>
    </div>
  \`;

  try {
    const res = await fetch('/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();

    document.getElementById('step-0').className = 'pipeline-step done';
    document.getElementById('step-0').querySelector('.step-icon').textContent = '✓';
    document.getElementById('step-1').className = 'pipeline-step done';
    document.getElementById('step-1').querySelector('.step-icon').textContent = '✓';

    body.innerHTML += \`
      <div class="result-card">
        <div class="result-card-header">
          <span style="color:var(--blue);font-size:14px">🔍</span>
          <span class="result-card-title">Analyst Findings · ANALYST_DO</span>
        </div>
        <div class="result-card-body">\${data.analystFindings || 'No findings returned'}</div>
      </div>
      <div class="result-card">
        <div class="result-card-header">
          <span style="color:var(--green);font-size:14px">✍</span>
          <span class="result-card-title">Synthesis Report · SYNTHESIS_DO</span>
        </div>
        <div class="result-card-body">\${data.report || 'No report generated'}</div>
      </div>
      <div style="font-size:11px;color:var(--muted);font-family:var(--mono);padding:4px 0">
        Agents used: \${(data.agents||[]).join(', ')}
      </div>
    \`;
  } catch (err) {
    body.innerHTML += \`<div style="color:var(--red);font-size:13px;padding:8px">Error: \${err.message}</div>\`;
  }

  btn.disabled = false;
  btn.textContent = 'RUN PIPELINE →';
}

// ── Helpers ───────────────────────────────────────────────
function handleKey(e, agent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(agent); }
}
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ── Init ──────────────────────────────────────────────────
renderInfoPanel('support');
</script>
</body>
</html>`;
}
