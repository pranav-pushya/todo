/* ==========================================================================
   DAILY BYTES MODULE (GROK API INTEL & SECURITY FEED)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  DailyBytesModule.init();
});

const DailyBytesModule = {
  activeCategory: 'all',
  searchQuery: '',

  articles: [
    {
      id: 'art-1',
      category: 'aiml',
      badge: 'AI/ML Paper',
      badgeClass: 'badge-purple',
      title: 'FlashAttention-3: Ultra-Fast Attention for Long-Context LLMs',
      author: 'Stanford AI Lab & Tri Dao',
      date: 'Oct 01, 2026',
      readTime: '6 min read',
      snippet: 'New GPU kernels leverage Tensor Core asynchronous instructions to achieve 75% peak FLOPS on H100s for 128k context lengths.',
      fullContent: `
### Abstract
FlashAttention-3 introduces GPU hardware-aware optimizations specifically engineered for NVIDIA Hopper architectures. By overlapping GEMM operations with softmax reduction via warp-group asynchronous transfers, FlashAttention-3 achieves up to 840 TFLOPS FP16 performance.

### Key Innovations:
1. **Asynchronous Tensor Core Pipelining**: Decouples memory loads from matrix multiplications.
2. **Low-Precision FP8 Attention**: Reduces memory bandwidth bottleneck without perplexity degradation.
3. **Variable Sequence Length Batching**: Eliminates zero-padding overhead in multi-turn conversational agents.

\`\`\`python
import torch
from flash_attn import flash_attn_func

# Query, Key, Value shapes: (batch, seqlen, nheads, headdim)
output = flash_attn_func(q, k, v, dropout_p=0.0, softmax_scale=None, causal=True)
\`\`\`
      `
    },
    {
      id: 'art-2',
      category: 'zeroday',
      badge: 'CRITICAL CVE',
      badgeClass: 'badge-coral',
      title: 'CVE-2026-8819: Linux Kernel eBPF Subsystem Privilege Escalation',
      author: 'CyberThreat Research Unit',
      date: 'Oct 01, 2026',
      readTime: '4 min read',
      snippet: 'An out-of-bounds bounds tracking bug in kernel/bpf/verifier.c allows local unprivileged users to overwrite kernel memory.',
      fullContent: `
### Vulnerability Overview
The eBPF verifier incorrectly calculates register bounds during ALU operations involving 32-bit signed shift operations. This leads to improper pointer arithmetic verification, permitting arbitrary kernel memory write.

### Impact Assessment
- **CVSS Score**: 9.8 (CRITICAL)
- **Affected Kernel Versions**: v6.8.0 through v6.14.2
- **Exploit Vector**: Local privilege escalation to root (\`uid=0\`).

### Mitigation Steps
Disable unprivileged eBPF access immediately via sysctl:
\`\`\`bash
sudo sysctl -w kernel.unprivileged_bpf_disabled=1
\`\`\`
      `
    },
    {
      id: 'art-3',
      category: 'cyber',
      badge: 'Threat Intel',
      badgeClass: 'badge-cyan',
      title: 'PickleDeserializer Attack Vector Target PyTorch Weights in HuggingFace',
      author: 'AI Security Foundation',
      date: 'Sep 30, 2026',
      readTime: '8 min read',
      snippet: 'Threat actors have uploaded malicious .bin model weights executing arbitrary code during torch.load() deserialization.',
      fullContent: `
### Threat Analysis
Python's \`pickle\` module allows arbitrary object construction during deserialization via the \`__reduce__\` method. When users execute \`torch.load("weights.bin")\`, malicious bytecode triggers command execution inside the host machine.

### Blue Team Defense Checklist
1. **Migrate to Safetensors**: Always load weights using \`safetensors\` which guarantees zero code execution.
2. **Static Analysis**: Scan model files with \`picklescan\` CLI prior to instantiation.
\`\`\`bash
pip install picklescan
picklescan --path ./model_weights/
\`\`\`
      `
    },
    {
      id: 'art-4',
      category: 'aiml',
      badge: 'LLM Architecture',
      badgeClass: 'badge-emerald',
      title: 'DeepSeek-V3 Architecture: Sparse Mixture of Experts with 671B Params',
      author: 'DeepSeek AI Group',
      date: 'Sep 29, 2026',
      readTime: '10 min read',
      snippet: 'Multi-head Latent Attention (MLA) and DeepSeekMoE architecture achieve state-of-the-art performance with sub-$6M training cost.',
      fullContent: `
### Architectural Highlights
DeepSeek-V3 utilizes **Multi-head Latent Attention (MLA)** to compress Key-Value caches into low-rank latent vectors, drastically reducing memory footprint during inference.

### Key Metrics:
- **Total Parameters**: 671B
- **Activated Params per Token**: 37B
- **Context Window**: 128k tokens
- **Training Efficiency**: FP8 Mixed Precision Training via Dual-Pipe Parallelism.
      `
    },
    {
      id: 'art-5',
      category: 'cyber',
      badge: 'Zero Trust',
      badgeClass: 'badge-cyan',
      title: 'Implementing OAuth 2.1 & ZKP for Decentralized AI Agent Auth',
      author: 'Identity & Security Lab',
      date: 'Sep 28, 2026',
      readTime: '5 min read',
      snippet: 'Combining Zero-Knowledge Proofs with token introspection to secure autonomous AI agent-to-agent REST API calls.',
      fullContent: `
### Modern Auth Paradigm
Autonomous AI agents require scoped cryptographic identity. By pairing OAuth 2.1 Mutual-TLS with ZK-SNARK attestations, agents verify identity without disclosing underlying API keys or sensitive prompt context.
      `
    }
  ],

  init() {
    this.renderArticles();
    this.initCategoryPills();
    this.initSearch();
  },

  getBookmarks() {
    const saved = localStorage.getItem('bookmarked_intel_ids');
    return saved ? JSON.parse(saved) : [];
  },

  toggleBookmark(articleId) {
    let bookmarks = this.getBookmarks();
    if (bookmarks.includes(articleId)) {
      bookmarks = bookmarks.filter(id => id !== articleId);
      if (window.AppController) AppController.showToast('Bookmark removed');
    } else {
      bookmarks.push(articleId);
      if (window.AppController) AppController.showToast('Article bookmarked!');
    }
    localStorage.setItem('bookmarked_intel_ids', JSON.stringify(bookmarks));
    this.renderArticles();
  },

  initCategoryPills() {
    const pills = document.querySelectorAll('#intel-category-pills .pill-btn');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeCategory = pill.getAttribute('data-category') || 'all';
        this.renderArticles();
      });
    });
  },

  initSearch() {
    const searchInput = document.getElementById('intel-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderArticles();
      });
    }
  },

  renderArticles() {
    const grid = document.getElementById('intel-grid-feed');
    if (!grid) return;

    const bookmarks = this.getBookmarks();

    let filtered = this.articles.filter(art => {
      const matchCat = this.activeCategory === 'all' ? true :
                       this.activeCategory === 'saved' ? bookmarks.includes(art.id) :
                       art.category === this.activeCategory;

      const matchSearch = !this.searchQuery ||
        art.title.toLowerCase().includes(this.searchQuery) ||
        art.snippet.toLowerCase().includes(this.searchQuery) ||
        art.author.toLowerCase().includes(this.searchQuery);

      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="clay-card col-12" style="text-align:center; padding:40px;">
          <p style="color:var(--text-muted); font-size:1.1rem;">No intelligence items match your search or filter.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(art => {
      const isBookmarked = bookmarks.includes(art.id);
      return `
        <div class="clay-card intel-card">
          <div class="intel-card-body">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="badge ${art.badgeClass}">${art.badge}</span>
              <button class="btn-clay" onclick="DailyBytesModule.toggleBookmark('${art.id}')" style="padding:4px 8px; font-size:0.8rem;">
                ${isBookmarked ? '★ Saved' : '☆ Save'}
              </button>
            </div>
            <h4>${art.title}</h4>
            <p>${art.snippet}</p>
          </div>

          <div class="intel-card-footer">
            <div style="font-size:0.75rem; color:var(--text-muted);">
              <span>${art.author}</span> • <span>${art.date}</span>
            </div>
            <button class="btn-clay btn-clay-primary" onclick="DailyBytesModule.openReader('${art.id}')" style="padding:6px 14px; font-size:0.8rem;">
              Read Intel
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  openReader(articleId) {
    const article = this.articles.find(a => a.id === articleId);
    if (!article) return;

    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    // Use settings modal container for reader view dynamically
    const modalBox = modal.querySelector('.modal-box');
    if (!modalBox) return;

    modalBox.innerHTML = `
      <div class="modal-header">
        <div>
          <span class="badge ${article.badgeClass}">${article.badge}</span>
          <h3 style="margin-top:6px;">${article.title}</h3>
          <p style="font-size:0.8rem; color:var(--text-muted);">${article.author} • ${article.date}</p>
        </div>
        <button class="modal-close" onclick="document.getElementById('settings-modal').classList.remove('active')">&times;</button>
      </div>

      <div style="max-height:450px; overflow-y:auto; font-size:0.92rem; line-height:1.6; color:var(--text-main);" class="markdown-content">
        ${article.fullContent.replace(/\n/g, '<br>')}
      </div>

      <div style="margin-top:20px; display:flex; justify-content:flex-end;">
        <button class="btn-clay btn-clay-primary" onclick="document.getElementById('settings-modal').classList.remove('active')">Close Intel Reader</button>
      </div>
    `;

    modal.classList.add('active');
  }
};
