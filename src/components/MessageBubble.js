// MessageBubble.jsx
import React, { useMemo } from "react";

/**
 * MessageBubble
 * - Renders a message (assistant or user) with markdown-like features.
 * - Code fences, inline code, headers, lists, tables, blockquotes, links, bold/italic/strike.
 *
 * Props:
 * - message: { role: 'user'|'assistant', content: string }
 * - isLast: boolean (optional)
 * - onRegenerate: function (optional)
 */
const MessageBubble = ({ message, isLast, onRegenerate }) => {
  if (!message || typeof message.content !== "string") return null;
  const content = message.content;
  const isUser = message.role === "user";

  /***********************
   * 1) Tokenize into block-level AST
   ***********************/
  const ast = useMemo(() => {
    if (!content) return [];

    const lines = content.replace(/\r\n/g, "\n").split("\n");
    const nodes = [];
    let i = 0;

    const peek = (offset = 0) => lines[i + offset];
    const consume = () => lines[i++];

    while (i < lines.length) {
      let line = peek();

      // skip blank lines
      if (!line.trim()) {
        i++;
        continue;
      }

      // 1) Code fence ```lang (multiline)
      if (line.startsWith("```")) {
        const lang = line.slice(3).trim() || null;
        consume(); // skip opening ```
        const codeLines = [];
        while (i < lines.length && !peek().startsWith("```")) {
          codeLines.push(consume());
        }
        if (i < lines.length && peek().startsWith("```")) consume(); // skip closing ```
        nodes.push({ type: "code", lang, text: codeLines.join("\n") });
        continue;
      }

      // 2) Header # ... (1-6)
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        consume();
        nodes.push({ type: "header", level, text });
        continue;
      }

      // 3) Blockquote >
      if (line.trim().startsWith(">")) {
        const quoteLines = [];
        while (i < lines.length && (peek()?.trim().startsWith(">") || peek()?.trim() === "")) {
          const ln = consume();
          if (ln.trim().startsWith(">")) quoteLines.push(ln.replace(/^>\s?/, ""));
        }
        nodes.push({ type: "blockquote", text: quoteLines.join("\n") });
        continue;
      }

      // 4) Table detection: header contains '|' and next line looks like |-:-|
      if (line.includes("|") && lines[i + 1] && /^\s*\|?[:\- ]+\|[:\- ]+/.test(lines[i + 1])) {
        const tableLines = [];
        while (i < lines.length && peek()?.includes("|")) {
          tableLines.push(consume());
        }
        // parse header and rows
        const headerCols = tableLines[0].split("|").map((s) => s.trim()).filter(Boolean);
        const rows = tableLines.slice(2).map((r) => r.split("|").map((c) => c.trim()).filter(Boolean));
        nodes.push({ type: "table", header: headerCols, rows });
        continue;
      }

      // 5) List (ordered or unordered). We'll collect contiguous list items (simple nesting not fully recursive)
      if (/^\s*([-*+])\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
        const items = [];
        const ordered = /^\s*\d+\.\s+/.test(line);
        while (i < lines.length && (/^\s*([-*+])\s+/.test(peek()) || /^\s*\d+\.\s+/.test(peek()))) {
          const m = peek().match(/^\s*([-*+])\s+(.*)$/) || peek().match(/^\s*\d+\.\s+(.*)$/);
          items.push(consume().replace(/^\s*([-*+]|\d+\.)\s+/, ""));
        }
        nodes.push({ type: "list", ordered, items });
        continue;
      }

      // 6) Paragraph (collect contiguous lines that are not other blocks)
      const paraLines = [];
      while (
        i < lines.length &&
        peek()?.trim() !== "" &&
        !peek().startsWith("```") &&
        !peek()?.match(/^(#{1,6})\s+/) &&
        !peek()?.trim().startsWith(">") &&
        !peek()?.includes("|") &&
        !peek()?.match(/^\s*([-*+])\s+/) &&
        !peek()?.match(/^\s*\d+\.\s+/)
      ) {
        paraLines.push(consume());
      }
      if (paraLines.length > 0) {
        nodes.push({ type: "paragraph", text: paraLines.join("\n") });
      }
    }

    return nodes;
  }, [content]);

  /***********************
   * 2) Inline renderer (returns array of React nodes)
   *    Support order: inline code `...`, links [text](url), bold **, italic *, strike ~~.
   ***********************/
  const renderInline = (text, baseKey = "") => {
    if (text == null) return null;
    // Protect against empty string
    if (text === "") return null;

    // We'll split by inline code first (backticks)
    const parts = text.split(/(`[^`]+`)/g);

    let keyIdx = 0;
    const out = [];

    parts.forEach((part) => {
      if (/^`[^`]+`$/.test(part)) {
        out.push(
          <code key={`${baseKey}-code-${keyIdx++}`} className="bg-white/15 text-white/95 px-2 py-1 rounded-md text-sm font-mono border border-white/20">
            {part.slice(1, -1)}
          </code>
        );
        return;
      }

      // Links [text](url)
      const linkParts = part.split(/(\[[^\]]+\]\([^)]+\))/g);
      linkParts.forEach((lp) => {
        if (!lp) return;
        const lm = lp.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (lm) {
          out.push(
            <a key={`${baseKey}-link-${keyIdx++}`} href={lm[2]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
              {renderInline(lm[1], `${baseKey}-linktext-${keyIdx}`)}
            </a>
          );
          return;
        }

        // strikethrough
        if (lp.includes("~~")) {
          const segs = lp.split(/(~~[^~]+~~)/g);
          segs.forEach((s) =>
            /^~~[^~]+~~$/.test(s)
              ? out.push(<span key={`${baseKey}-strike-${keyIdx++}`} className="line-through text-white/70">{s.slice(2, -2)}</span>)
              : pushEmphasis(s)
          );
          return;
        }

        pushEmphasis(lp);
      });
    });

    function pushEmphasis(str) {
      if (!str) return;
      // bold
      if (str.includes("**")) {
        const segs = str.split(/(\*\*[^*]+\*\*)/g);
        segs.forEach((s) =>
          /^\*\*[^*]+\*\*$/.test(s)
            ? out.push(<strong key={`${baseKey}-b-${keyIdx++}`} className="font-bold text-white/95">{s.slice(2, -2)}</strong>)
            : pushItalic(s)
        );
        return;
      }
      pushItalic(str);
    }

    function pushItalic(str) {
      if (!str) return;
      if (str.includes("*") && !str.includes("**")) {
        const segs = str.split(/(\*[^*]+\*)/g);
        segs.forEach((s) =>
          /^\*[^*]+\*$/.test(s)
            ? out.push(<em key={`${baseKey}-i-${keyIdx++}`} className="italic text-white/85">{s.slice(1, -1)}</em>)
            : out.push(<span key={`${baseKey}-t-${keyIdx++}`}>{s}</span>)
        );
        return;
      }
      out.push(<span key={`${baseKey}-t-${keyIdx++}`}>{str}</span>);
    }

    return out;
  };

  /***********************
   * 3) Render AST to JSX
   ***********************/
  const rendered = useMemo(() => {
    const elements = [];
    let idx = 0;
    const headerSizes = ["text-3xl", "text-2xl", "text-xl", "text-lg", "text-base", "text-sm"];

    for (const node of ast) {
      switch (node.type) {
        case "header":
          elements.push(
            <div key={`h-${idx++}`} className={`${headerSizes[Math.max(0, Math.min(5, node.level - 1))]} font-bold text-white/95 mb-4 mt-6`}>
              {renderInline(node.text, `h-${idx}`)}
            </div>
          );
          break;

        case "code":
          elements.push(
            <div key={`code-${idx++}`} className="my-4 rounded-xl overflow-hidden bg-white/8 border border-white/20 backdrop-blur-sm">
              <div className="bg-white/10 px-4 py-2 border-b border-white/10 flex justify-between items-center">
                <span className="text-white/80 text-sm font-medium">{node.lang || "text"}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(node.text)}
                  className="px-3 py-1 bg-white/15 border border-white/20 rounded-lg text-white/90 text-xs hover:bg-white/25 transition-all duration-200"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 text-white/95 text-sm overflow-x-auto"><code>{node.text}</code></pre>
            </div>
          );
          break;

        case "blockquote":
          elements.push(
            <blockquote key={`q-${idx++}`} className="my-4 p-4 bg-white/8 border-l-4 border-blue-400/60 rounded-r-xl backdrop-blur-sm">
              <div className="text-white/85 italic">{renderInline(node.text, `q-${idx}`)}</div>
            </blockquote>
          );
          break;

        case "table":
          elements.push(
            <div key={`t-${idx++}`} className="my-6 overflow-x-auto">
              <table className="w-full bg-white/8 border border-white/20 rounded-xl backdrop-blur-sm overflow-hidden">
                <thead>
                  <tr className="bg-white/10 border-b border-white/20">
                    {node.header.map((h, i) => (
                      <th key={i} className="px-4 py-3 text-left text-white/95 font-semibold">{renderInline(h, `th-${idx}-${i}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {node.rows.map((r, ri) => (
                    <tr key={ri} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      {r.map((c, ci) => <td key={ci} className="px-4 py-3 text-white/90">{renderInline(c, `td-${idx}-${ri}-${ci}`)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          break;

        case "list":
          elements.push(
            node.ordered ? (
              <ol key={`ol-${idx++}`} className="list-decimal ml-6 my-4 space-y-1 text-white/90">
                {node.items.map((it, i) => <li key={i}>{renderInline(it, `li-${idx}-${i}`)}</li>)}
              </ol>
            ) : (
              <ul key={`ul-${idx++}`} className="list-disc ml-6 my-4 space-y-1 text-white/90">
                {node.items.map((it, i) => <li key={i}>{renderInline(it, `li-${idx}-${i}`)}</li>)}
              </ul>
            )
          );
          break;

        case "paragraph":
        default:
          elements.push(
            <p key={`p-${idx++}`} className="mb-4 text-white/90 leading-relaxed">
              {renderInline(node.text, `p-${idx}`)}
            </p>
          );
          break;
      }
    }

    return elements;
  }, [ast]);

  /***********************
   * 4) Render container UI (assistant vs user)
   ***********************/
  return (
    <div className={`w-full mb-6 ${isUser ? "flex justify-end" : ""}`}>
      {!isUser ? (
        <div className="flex items-start space-x-4 w-full max-w-4xl">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white/30 flex items-center justify-center text-white font-bold text-sm shadow-lg backdrop-blur-sm">
            AI
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white/8 border border-white/20 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <div className="prose prose-invert max-w-none">{rendered}</div>

              <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-white/15">
                <button
                  onClick={() => navigator.clipboard.writeText(content)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white/90 text-sm font-medium hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                  title="Copy message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </button>

                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white/90 text-sm font-medium hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                    title="Regenerate response"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Regenerate</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-4 max-w-3xl">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/25 rounded-2xl px-6 py-4 backdrop-blur-sm shadow-lg">
            <div className="text-white/95 text-sm leading-relaxed whitespace-pre-wrap font-medium">{content}</div>
          </div>

          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 border-2 border-white/30 flex items-center justify-center text-white font-bold text-sm shadow-lg backdrop-blur-sm">
            You
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
