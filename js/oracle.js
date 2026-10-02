/* ==========================================================================
   AI ORACLE MODULE (CYBER & AI ASSISTANT CHAT WITH API INTEGRATION)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  OracleModule.init();
});

const OracleModule = {
  chatHistory: [],

  knowledgeBase: {
    attention: `
### 🧠 Transformer Self-Attention Mechanism
The core of Transformer models relies on Scaled Dot-Product Attention defined mathematically as:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

#### Where:
- **$Q$ (Query)**: Vector representing the current token looking for context.
- **$K$ (Key)**: Vector representing tokens being compared against.
- **$V$ (Value)**: Vector containing the actual feature information.
- **$\\sqrt{d_k}$**: Scaling factor to prevent vanishing gradients during softmax.

\`\`\`python
import torch
import torch.nn.functional as F

def self_attention(Q, K, V):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    attention_weights = F.softmax(scores, dim=-1)
    return torch.matmul(attention_weights, V)
\`\`\`
    `,
    cve: `
### 🛡️ CVE Exploit Breakdown & Zero-Day Analysis
**Target**: Memory corruption & Privilege Escalation in Linux Kernel eBPF Subsystem.

#### Root Cause:
During 32-bit register shift operations, the eBPF verifier calculates incorrect upper/lower bounds. An attacker can construct a payload that passes static verifier analysis while triggering out-of-bounds array indexing at runtime.

#### Mitigation Vector:
1. Apply kernel security patch v6.14.3+
2. Enforce eBPF unprivileged restriction:
\`\`\`bash
sysctl kernel.unprivileged_bpf_disabled=1
\`\`\`
    `,
    python_sec: `
### 💻 Asynchronous Port & Vulnerability Scanner Script

\`\`\`python
import asyncio
import socket

async def scan_port(ip, port):
    try:
        reader, writer = await asyncio.open_connection(ip, port)
        print(f"[+] Port {port} OPEN on {ip}")
        writer.close()
        await writer.wait_closed()
    except (ConnectionRefusedError, asyncio.TimeoutError):
        pass

async def main(target_ip, ports):
    print(f"[*] Scanning {target_ip}...")
    tasks = [scan_port(target_ip, p) for p in ports]
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main("127.0.0.1", [22, 80, 443, 8080, 3306]))
\`\`\`
    `,
    study_plan: `
### 📅 7-Day Intensive AI & Cybersecurity Roadmap

- **Day 1**: PyTorch Tensor Operations & Autograd Engine Deep-Dive
- **Day 2**: Building Transformer Encoder-Decoder from scratch
- **Day 3**: Fine-tuning Llama-3 / Mistral with LoRA & QLoRA
- **Day 4**: Reverse Engineering & x86-64 Assembly Stack Canaries
- **Day 5**: Web Security: JWT Vulnerabilities, SSRF & GraphQL Injections
- **Day 6**: Binary Exploitation: Buffer Overflows & ROP Chains
- **Day 7**: Full System Integration Test & Portfolio Project Push
    `
  },

  init() {
    this.initChatControls();
    this.initPresets();
  },

  initChatControls() {
    const sendBtn = document.getElementById('oracle-send-btn');
    const inputEl = document.getElementById('oracle-input');
    const clearBtn = document.getElementById('clear-oracle-chat');

    if (sendBtn && inputEl) {
      sendBtn.addEventListener('click', () => this.sendMessage());
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const historyEl = document.getElementById('oracle-chat-history');
        if (historyEl) {
          historyEl.innerHTML = `
            <div class="chat-bubble oracle-msg">
              👋 Greetings Alex. Chat history cleared. How can I assist your research or coding today?
            </div>
          `;
        }
        this.chatHistory = [];
        if (window.AppController) AppController.showToast('Chat history cleared.');
      });
    }
  },

  initPresets() {
    const chips = document.querySelectorAll('.oracle-presets .preset-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const promptText = chip.getAttribute('data-prompt');
        const inputEl = document.getElementById('oracle-input');
        if (inputEl && promptText) {
          inputEl.value = promptText;
          this.sendMessage();
        }
      });
    });
  },

  async sendMessage() {
    const inputEl = document.getElementById('oracle-input');
    if (!inputEl) return;
    const query = inputEl.value.trim();
    if (!query) return;

    inputEl.value = '';

    // Append User Message
    this.appendMessage('user', query);

    // Show Typing Indicator
    const typingId = this.appendTypingIndicator();

    // Check if API Key is available in CONFIG
    let responseText = null;
    if (window.CONFIG && typeof CONFIG.fetchAICompletion === 'function') {
      responseText = await CONFIG.fetchAICompletion(
        query,
        "You are Oracle v4.0, an expert AI and Cybersecurity copilot. Provide clear, technical markdown formatted answers with code snippets."
      );
    }

    this.removeTypingIndicator(typingId);

    // Fallback to offline knowledge base if API response is null
    if (!responseText) {
      responseText = this.generateOracleResponse(query);
    }

    this.appendMessage('oracle', responseText);
  },

  appendMessage(sender, content) {
    const historyEl = document.getElementById('oracle-chat-history');
    if (!historyEl) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender === 'user' ? 'user-msg' : 'oracle-msg'}`;

    if (sender === 'user') {
      bubble.textContent = content;
    } else {
      const formatted = content
        .replace(/```python([\s\S]*?)```/g, '<pre><code class="language-python">$1</code></pre>')
        .replace(/```bash([\s\S]*?)```/g, '<pre><code class="language-bash">$1</code></pre>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/\n/g, '<br>');
      bubble.innerHTML = formatted;
    }

    historyEl.appendChild(bubble);
    historyEl.scrollTop = historyEl.scrollHeight;
  },

  appendTypingIndicator() {
    const historyEl = document.getElementById('oracle-chat-history');
    if (!historyEl) return null;

    const id = 'typing-' + Date.now();
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble oracle-msg';
    bubble.id = id;
    bubble.innerHTML = '⚡ <em>Oracle v4.0 is processing query...</em>';
    historyEl.appendChild(bubble);
    historyEl.scrollTop = historyEl.scrollHeight;
    return id;
  },

  removeTypingIndicator(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
  },

  generateOracleResponse(query) {
    const q = query.toLowerCase();
    if (q.includes('attention') || q.includes('transformer') || q.includes('qkv')) {
      return this.knowledgeBase.attention;
    } else if (q.includes('cve') || q.includes('exploit') || q.includes('vulnerability') || q.includes('zero-day')) {
      return this.knowledgeBase.cve;
    } else if (q.includes('python') || q.includes('script') || q.includes('scanner') || q.includes('code')) {
      return this.knowledgeBase.python_sec;
    } else if (q.includes('study') || q.includes('schedule') || q.includes('roadmap') || q.includes('plan')) {
      return this.knowledgeBase.study_plan;
    } else {
      return `
### 🤖 Oracle Intelligence Telemetry Response
Analyzing query: **"${query}"**

- **Context Protocol**: CSE AI/ML & Cybersecurity
- **Status**: Synthesis complete

For advanced neural architecture design or custom CVE vulnerability analysis, select one of the preset prompts above or provide specific parameters!
      `.trim();
    }
  }
};
