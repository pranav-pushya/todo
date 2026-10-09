import React, { useState } from 'react';
import katex from 'katex';
import { Copy, Check, Terminal, Square, CheckSquare } from 'lucide-react';

/**
 * Syntax highlighter helper for code blocks.
 */
function highlightCode(code, lang = '') {
  // Simple, robust regex-based token highlighting
  const tokens = [];
  const lines = code.split('\n');

  return lines.map((line, lineIdx) => {
    // Escape HTML entities
    let escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Comments (# or //)
    if (/^\s*(#|\/\/)/.test(escaped)) {
      return (
        <div key={lineIdx} className="text-slate-500 italic">
          {line || ' '}
        </div>
      );
    }

    // Strings ("..." or '...')
    escaped = escaped.replace(
      /(["'`])(.*?)\1/g,
      '<span class="text-emerald-400 font-medium">$1$2$1</span>'
    );

    // Reserved Keywords
    const keywords = [
      'def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif',
      'for', 'while', 'in', 'try', 'except', 'with', 'as', 'lambda',
      'const', 'let', 'var', 'function', 'async', 'await', 'export', 'default',
      'torch', 'nn', 'optim', 'self', 'True', 'False', 'None',
    ];
    const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    escaped = escaped.replace(
      kwRegex,
      '<span class="text-cobalt-400 font-bold">$1</span>'
    );

    // Function calls e.g. model.forward()
    escaped = escaped.replace(
      /\b([a-zA-Z_]\w*)\s*\(/g,
      '<span class="text-amber-300 font-semibold">$1</span>('
    );

    // Numbers
    escaped = escaped.replace(
      /\b(\d+(\.\d+)?)\b/g,
      '<span class="text-indigo-300 font-mono">$1</span>'
    );

    return (
      <div
        key={lineIdx}
        dangerouslySetInnerHTML={{ __html: escaped || '&nbsp;' }}
      />
    );
  });
}

function CodeBlock({ code, lang = 'text' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-white/[0.08] bg-obsidian-950 overflow-hidden shadow-lg group">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-obsidian-900 border-b border-white/[0.06] text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <Terminal className="w-3.5 h-3.5 text-cobalt-400" />
          <span className="uppercase text-cobalt-300 font-semibold">{lang || 'CODE'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 font-mono text-xs overflow-x-auto leading-relaxed select-text">
        {highlightCode(code, lang)}
      </div>
    </div>
  );
}

function renderKaTeX(tex, displayMode = false) {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
    });
  } catch (e) {
    return tex;
  }
}

export default function MarkdownNotePreview({ content = '', onContentChange }) {
  // Checkbox toggle handler inside preview
  const handleToggleChecklist = (lineIndex, isChecked) => {
    if (!onContentChange) return;
    const lines = content.split('\n');
    const targetLine = lines[lineIndex];
    if (!targetLine) return;

    if (isChecked) {
      lines[lineIndex] = targetLine.replace(/^(\s*[-*]\s+\[)x(\]\s+)/i, '$1 $2');
    } else {
      lines[lineIndex] = targetLine.replace(/^(\s*[-*]\s+\[)\s(\]\s+)/, '$1x$2');
    }
    onContentChange(lines.join('\n'));
  };

  if (!content.trim()) {
    return (
      <div className="h-full flex items-center justify-center text-slate-600 italic text-xs py-12">
        Nothing to preview. Start writing on the left!
      </div>
    );
  }

  // Parse lines
  const lines = content.split('\n');
  const renderedElements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = '';
  let inDisplayMath = false;
  let mathBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced Code Blocks (```lang ... ```)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        renderedElements.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeBuffer.join('\n')}
            lang={codeLang}
          />
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Display Math ($$...$$)
    if (line.trim().startsWith('$$') && line.trim().endsWith('$$') && line.trim().length > 4) {
      const math = line.trim().slice(2, -2).trim();
      renderedElements.push(
        <div
          key={`math-block-${i}`}
          className="my-4 p-4 rounded-xl bg-cobalt-950/40 border border-cobalt-600/30 overflow-x-auto flex justify-center text-white"
          dangerouslySetInnerHTML={{ __html: renderKaTeX(math, true) }}
        />
      );
      continue;
    }

    if (line.trim() === '$$') {
      if (inDisplayMath) {
        renderedElements.push(
          <div
            key={`math-multiline-${i}`}
            className="my-4 p-4 rounded-xl bg-cobalt-950/40 border border-cobalt-600/30 overflow-x-auto flex justify-center text-white"
            dangerouslySetInnerHTML={{ __html: renderKaTeX(mathBuffer.join('\n'), true) }}
          />
        );
        inDisplayMath = false;
        mathBuffer = [];
      } else {
        inDisplayMath = true;
      }
      continue;
    }

    if (inDisplayMath) {
      mathBuffer.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      renderedElements.push(
        <h1
          key={`h1-${i}`}
          className="text-2xl font-bold text-white mt-6 mb-3 pb-2 border-b border-cobalt-500/30 flex items-center gap-2"
        >
          {parseInlineFormatting(line.slice(2))}
        </h1>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2
          key={`h2-${i}`}
          className="text-xl font-bold text-slate-100 mt-5 mb-2 pb-1 border-b border-white/[0.06]"
        >
          {parseInlineFormatting(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3
          key={`h3-${i}`}
          className="text-base font-semibold text-cobalt-300 mt-4 mb-2"
        >
          {parseInlineFormatting(line.slice(4))}
        </h3>
      );
      continue;
    }

    // Interactive Checklists: `- [ ] ` or `- [x] `
    const checkMatch = line.match(/^(\s*[-*]\s+\[)( |x)(\]\s+)(.+)$/i);
    if (checkMatch) {
      const isChecked = checkMatch[2].toLowerCase() === 'x';
      const text = checkMatch[4];
      const lineIdx = i;

      renderedElements.push(
        <div
          key={`chk-${i}`}
          onClick={() => handleToggleChecklist(lineIdx, isChecked)}
          className={`flex items-start gap-2.5 my-1.5 p-1 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.03] ${
            isChecked ? 'text-slate-500 line-through' : 'text-slate-200'
          }`}
        >
          <div className="mt-0.5 flex-shrink-0">
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-emerald-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 hover:text-cobalt-400" />
            )}
          </div>
          <span className="text-xs leading-relaxed select-text">
            {parseInlineFormatting(text)}
          </span>
        </div>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      renderedElements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 pl-4 py-1 border-l-4 border-cobalt-500 bg-cobalt-950/20 text-slate-300 text-xs italic rounded-r-lg"
        >
          {parseInlineFormatting(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***') {
      renderedElements.push(
        <hr key={`hr-${i}`} className="my-5 border-white/[0.08]" />
      );
      continue;
    }

    // Bullet points
    if (line.startsWith('- ') || line.startsWith('* ')) {
      renderedElements.push(
        <li key={`li-${i}`} className="text-xs text-slate-300 ml-4 list-disc my-0.5">
          {parseInlineFormatting(line.slice(2))}
        </li>
      );
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      renderedElements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Standard Paragraph with inline math and formatting
    renderedElements.push(
      <p key={`p-${i}`} className="text-xs text-slate-300 leading-relaxed my-1">
        {parseInlineFormatting(line)}
      </p>
    );
  }

  return (
    <div className="prose prose-invert max-w-none text-slate-200 select-text font-sans">
      {renderedElements}
    </div>
  );
}

/**
 * Parses inline `$latex$` formulas, `code`, **bold**, *italic*, and `[link](url)`.
 */
function parseInlineFormatting(text) {
  // First split by inline math `$math$`
  const parts = [];
  const mathRegex = /\$([^\$]+)\$/g;
  let lastIndex = 0;
  let match;

  while ((match = mathRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const tex = match[1];
    parts.push(
      <span
        key={`tex-${match.index}`}
        className="inline-block px-1 font-mono text-cobalt-300"
        dangerouslySetInnerHTML={{ __html: renderKaTeX(tex, false) }}
      />
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // Next format code and bold for string elements
  return parts.map((part, idx) => {
    if (typeof part !== 'string') return part;

    // Split by inline code `...`
    const codeSegments = part.split(/(`[^`]+`)/g);

    return codeSegments.map((seg, cIdx) => {
      if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
        return (
          <code
            key={`${idx}-${cIdx}`}
            className="px-1.5 py-0.5 rounded bg-cobalt-950 border border-cobalt-800 text-cobalt-300 font-mono text-[11px]"
          >
            {seg.slice(1, -1)}
          </code>
        );
      }

      // Bold **bold**
      let formatted = seg.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic *italic*
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

      return (
        <span
          key={`${idx}-${cIdx}`}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  });
}
