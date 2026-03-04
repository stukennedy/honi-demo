export function getChatHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Vela — AI Support</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #13131a;
    --surface-2: #1a1a24;
    --border: #2a2a3a;
    --text: #e8e8f0;
    --text-dim: #8888a0;
    --amber: #f5a623;
    --amber-dim: rgba(245, 166, 35, 0.15);
    --amber-glow: rgba(245, 166, 35, 0.3);
    --user-bg: #1e1e30;
    --assistant-bg: #151520;
    --radius: 12px;
    --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --mono: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
  }

  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text);
    height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }

  .logo {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
  }

  .header-text h1 {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .header-text p {
    font-size: 12px;
    color: var(--text-dim);
    margin-top: 1px;
  }

  .clear-btn {
    margin-left: auto;
    background: none;
    border: 1px solid var(--border);
    color: var(--text-dim);
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-btn:hover {
    border-color: var(--amber);
    color: var(--amber);
  }

  /* Quick prompts */
  .prompts {
    display: flex;
    gap: 8px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
    overflow-x: auto;
  }

  .prompt-btn {
    background: var(--amber-dim);
    border: 1px solid rgba(245, 166, 35, 0.25);
    color: var(--amber);
    font-size: 13px;
    padding: 6px 14px;
    border-radius: 20px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    font-family: var(--font);
  }

  .prompt-btn:hover {
    background: rgba(245, 166, 35, 0.25);
    border-color: var(--amber);
  }

  /* Messages area */
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    scroll-behavior: smooth;
  }

  .messages::-webkit-scrollbar { width: 6px; }
  .messages::-webkit-scrollbar-track { background: transparent; }
  .messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  .msg {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: var(--radius);
    font-size: 14px;
    line-height: 1.55;
    animation: fadeIn 0.2s ease;
    word-wrap: break-word;
  }

  .msg-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  }

  .msg-group.user {
    align-items: flex-end;
  }

  .msg-group.assistant {
    align-items: flex-start;
  }

  .msg.user {
    background: var(--amber-dim);
    border: 1px solid rgba(245, 166, 35, 0.2);
    color: var(--text);
  }

  .msg.assistant {
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text);
  }

  .msg.tool-use {
    background: rgba(245, 166, 35, 0.08);
    border: 1px dashed rgba(245, 166, 35, 0.3);
    color: var(--amber);
    font-size: 12px;
    font-family: var(--mono);
    padding: 6px 12px;
    border-radius: 8px;
    max-width: 80%;
  }

  .msg code {
    background: rgba(255,255,255,0.06);
    padding: 1px 5px;
    border-radius: 4px;
    font-family: var(--mono);
    font-size: 13px;
  }

  .msg pre {
    background: rgba(0,0,0,0.3);
    padding: 10px 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 6px 0;
    font-size: 13px;
  }

  .msg pre code {
    background: none;
    padding: 0;
  }

  .msg strong { color: var(--amber); font-weight: 600; }
  .msg em { color: var(--text-dim); }
  .msg ul, .msg ol { padding-left: 18px; margin: 4px 0; }
  .msg li { margin: 2px 0; }
  .msg p { margin: 4px 0; }
  .msg p:first-child { margin-top: 0; }
  .msg p:last-child { margin-bottom: 0; }

  /* Typing indicator */
  .typing {
    display: none;
    align-items: center;
    gap: 4px;
    padding: 10px 14px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    max-width: 80%;
    margin-bottom: 12px;
  }

  .typing.visible { display: inline-flex; }

  .typing-dot {
    width: 6px;
    height: 6px;
    background: var(--amber);
    border-radius: 50%;
    animation: bounce 1.4s infinite both;
  }

  .typing-dot:nth-child(2) { animation-delay: 0.16s; }
  .typing-dot:nth-child(3) { animation-delay: 0.32s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Input area */
  .input-area {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }

  .input-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }

  #input {
    flex: 1;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-size: 14px;
    font-family: var(--font);
    padding: 12px 16px;
    resize: none;
    outline: none;
    min-height: 44px;
    max-height: 120px;
    line-height: 1.4;
    transition: border-color 0.2s;
  }

  #input:focus { border-color: var(--amber); }

  #input::placeholder { color: var(--text-dim); }

  #send {
    background: var(--amber);
    border: none;
    color: #0a0a0f;
    font-weight: 600;
    font-size: 14px;
    padding: 12px 20px;
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    font-family: var(--font);
    height: 44px;
  }

  #send:hover { background: #ffb833; }
  #send:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Badge */
  .badge {
    text-align: center;
    padding: 10px;
    font-size: 12px;
    color: var(--text-dim);
    background: var(--surface);
    flex-shrink: 0;
  }

  .badge a {
    color: var(--amber);
    text-decoration: none;
  }

  .badge a:hover { text-decoration: underline; }

  /* Welcome message */
  .welcome {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-dim);
    animation: fadeIn 0.4s ease;
  }

  .welcome .logo-large {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
  }

  .welcome h2 {
    color: var(--text);
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .welcome p {
    font-size: 14px;
    max-width: 360px;
    margin: 0 auto;
    line-height: 1.5;
  }

  @media (max-width: 600px) {
    .msg { max-width: 92%; }
    .prompts { padding: 10px 12px; gap: 6px; }
    .prompt-btn { font-size: 12px; padding: 5px 10px; }
    .header { padding: 12px 14px; }
    .messages { padding: 14px; }
    .input-area { padding: 12px 14px; }
  }
</style>
</head>
<body>

<div class="header">
  <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <polygon points="50,2 93,27 93,73 50,98 7,73 7,27" fill="none" stroke="#f5a623" stroke-width="4"/>
    <polygon points="50,12 83,32 83,68 50,88 17,68 17,32" fill="rgba(245,166,35,0.1)"/>
    <text x="50" y="62" text-anchor="middle" font-size="42" font-weight="700" fill="#f5a623" font-family="-apple-system, sans-serif">V</text>
  </svg>
  <div class="header-text">
    <h1>Vela Support</h1>
    <p>AI-powered project assistant</p>
  </div>
  <button class="clear-btn" onclick="clearChat()">Clear chat</button>
</div>

<div class="prompts">
  <button class="prompt-btn" onclick="sendPrompt('What\\'s the status of Project Alpha?')">Project Alpha status</button>
  <button class="prompt-btn" onclick="sendPrompt('List open tasks for Beta')">List open tasks for Beta</button>
  <button class="prompt-btn" onclick="sendPrompt('Create a high priority task for Project Alpha: Review API docs')">Create a task</button>
  <button class="prompt-btn" onclick="sendPrompt('Which projects are at risk?')">At-risk projects</button>
</div>

<div class="messages" id="messages">
  <div class="welcome">
    <svg class="logo-large" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,2 93,27 93,73 50,98 7,73 7,27" fill="none" stroke="#f5a623" stroke-width="3"/>
      <polygon points="50,12 83,32 83,68 50,88 17,68 17,32" fill="rgba(245,166,35,0.08)"/>
      <text x="50" y="62" text-anchor="middle" font-size="42" font-weight="700" fill="#f5a623" font-family="-apple-system, sans-serif">V</text>
    </svg>
    <h2>Welcome to Vela</h2>
    <p>I can help you check project statuses, manage tasks, and more. Try one of the prompts above or ask anything!</p>
  </div>
  <div class="typing" id="typing">
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  </div>
</div>

<div class="input-area">
  <div class="input-row">
    <textarea id="input" rows="1" placeholder="Ask about your projects..." onkeydown="handleKey(event)"></textarea>
    <button id="send" onclick="send()">Send</button>
  </div>
</div>

<div class="badge">Powered by <a href="https://www.npmjs.com/package/honi-cf" target="_blank">Honi</a> &#x1F41D;</div>

<script>
const threadId = 'thread-' + Math.random().toString(36).slice(2, 10);
let sending = false;

const messagesEl = document.getElementById('messages');
const typingEl = document.getElementById('typing');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');

// Auto-resize textarea
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}

function sendPrompt(text) {
  inputEl.value = text;
  send();
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function removeWelcome() {
  const w = messagesEl.querySelector('.welcome');
  if (w) w.remove();
}

function addMessage(role, html) {
  removeWelcome();
  const group = document.createElement('div');
  group.className = 'msg-group ' + role;
  const msg = document.createElement('div');
  msg.className = 'msg ' + role;
  msg.innerHTML = html;
  group.appendChild(msg);
  messagesEl.insertBefore(group, typingEl);
  scrollToBottom();
  return msg;
}

function addToolIndicator(toolName) {
  removeWelcome();
  const msg = document.createElement('div');
  msg.className = 'msg tool-use';
  msg.textContent = '\\u2192 using ' + toolName + '...';
  messagesEl.insertBefore(msg, typingEl);
  scrollToBottom();
  return msg;
}

function showTyping(show) {
  typingEl.classList.toggle('visible', show);
  scrollToBottom();
}

// Simple markdown to HTML
function md(text) {
  let s = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  s = s.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');
  // Inline code
  s = s.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
  // Bold
  s = s.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
  // Italic
  s = s.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
  // Line breaks to paragraphs
  s = s.replace(/\\n\\n/g, '</p><p>');
  s = s.replace(/\\n/g, '<br>');
  // Unordered lists
  s = s.replace(/(?:^|<br>)- (.+?)(?=<br>|<\\/p>|$)/g, '<li>$1</li>');
  s = s.replace(/(<li>.*?<\\/li>)+/g, '<ul>$&</ul>');

  if (!s.startsWith('<')) s = '<p>' + s + '</p>';
  return s;
}

async function send() {
  const text = inputEl.value.trim();
  if (!text || sending) return;

  sending = true;
  sendBtn.disabled = true;
  inputEl.value = '';
  inputEl.style.height = 'auto';

  addMessage('user', md(text));
  showTyping(true);

  let assistantEl = null;
  let fullText = '';
  const activeTool = {};

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Thread-Id': threadId,
      },
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
          // Text delta
          try {
            const chunk = JSON.parse(payload);
            if (typeof chunk === 'string') {
              if (!assistantEl) {
                showTyping(false);
                assistantEl = addMessage('assistant', '');
              }
              fullText += chunk;
              assistantEl.innerHTML = md(fullText);
              scrollToBottom();
            }
          } catch {}
        } else if (type === '9') {
          // Tool call start
          try {
            const data = JSON.parse(payload);
            if (data.toolName) {
              const el = addToolIndicator(data.toolName);
              activeTool[data.toolCallId] = el;
            }
          } catch {}
        } else if (type === 'b') {
          // Tool call complete
          try {
            const data = JSON.parse(payload);
            const el = activeTool[data.toolCallId];
            if (el) el.textContent = '\\u2192 used ' + data.toolName;
          } catch {}
        } else if (type === 'e') {
          // Step finish — might continue with more text
          if (assistantEl) {
            assistantEl = null;
            fullText = '';
          }
        }
      }
    }
  } catch (err) {
    showTyping(false);
    addMessage('assistant', '<em>Something went wrong. Please try again.</em>');
    console.error(err);
  }

  showTyping(false);
  sending = false;
  sendBtn.disabled = false;
  inputEl.focus();
}

async function clearChat() {
  try {
    await fetch('/history?threadId=' + threadId, { method: 'DELETE' });
  } catch {}
  // Clear UI
  const msgs = messagesEl.querySelectorAll('.msg-group, .msg.tool-use, .welcome');
  msgs.forEach(el => el.remove());
  // Re-add welcome
  const w = document.createElement('div');
  w.className = 'welcome';
  w.innerHTML = \`
    <svg class="logo-large" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,2 93,27 93,73 50,98 7,73 7,27" fill="none" stroke="#f5a623" stroke-width="3"/>
      <polygon points="50,12 83,32 83,68 50,88 17,68 17,32" fill="rgba(245,166,35,0.08)"/>
      <text x="50" y="62" text-anchor="middle" font-size="42" font-weight="700" fill="#f5a623" font-family="-apple-system, sans-serif">V</text>
    </svg>
    <h2>Welcome to Vela</h2>
    <p>I can help you check project statuses, manage tasks, and more. Try one of the prompts above or ask anything!</p>
  \`;
  messagesEl.insertBefore(w, typingEl);
}

inputEl.focus();
</script>
</body>
</html>`;
}
