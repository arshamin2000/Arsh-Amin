import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isStreaming = false,
}) => {
  // Parse blocks: code fences vs regular text
  const blocks = parseContentToBlocks(content);

  return (
    <div className="markdown-body space-y-3 leading-relaxed text-zinc-800 dark:text-zinc-200 text-[15px]">
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return (
            <CodeBlock
              key={idx}
              language={block.language || 'text'}
              code={block.content}
            />
          );
        }

        return (
          <TextBlock
            key={idx}
            text={block.content}
            isLast={idx === blocks.length - 1}
            isStreaming={isStreaming}
          />
        );
      })}

      {isStreaming && content.trim().length === 0 && (
        <span className="inline-flex items-center gap-1.5 py-1 text-zinc-400 dark:text-zinc-500 animate-pulse text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Thinking...
        </span>
      )}
    </div>
  );
};

// Code block with copy button, header, and clean syntax style
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-sm font-mono text-sm">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="uppercase tracking-wider font-semibold">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-zinc-800 active:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-[13.5px] leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700">
        <pre className="m-0 font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

// Text block parser for headers, lists, tables, quotes, bold, links, inline code
const TextBlock: React.FC<{ text: string; isLast: boolean; isStreaming: boolean }> = ({
  text,
  isLast,
  isStreaming,
}) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let listItems: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const flushList = (keyPrefix: string) => {
    if (inList === 'ul') {
      elements.push(
        <ul key={`${keyPrefix}-ul`} className="list-disc pl-6 space-y-1.5 my-2.5">
          {listItems}
        </ul>
      );
    } else if (inList === 'ol') {
      elements.push(
        <ol key={`${keyPrefix}-ol`} className="list-decimal pl-6 space-y-1.5 my-2.5">
          {listItems}
        </ol>
      );
    }
    inList = null;
    listItems = [];
  };

  const flushTable = (keyPrefix: string) => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(1).filter((r) => !r.every((cell) => cell.match(/^[-:| ]+$/)));
      elements.push(
        <div key={`${keyPrefix}-table`} className="my-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                {header.map((col, idx) => (
                  <th key={idx} className="px-3 py-2 font-semibold text-zinc-900 dark:text-zinc-100">
                    {parseInlineMarkdown(col.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {body.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                      {parseInlineMarkdown(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check Table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (inList) flushList(`line-${i}`);
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable(`table-${i}`);
    }

    // Check Headers
    if (trimmed.startsWith('#')) {
      if (inList) flushList(`line-${i}`);
      const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const textContent = headerMatch[2];
        if (level === 1) {
          elements.push(
            <h1 key={i} className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-5 mb-2.5">
              {parseInlineMarkdown(textContent)}
            </h1>
          );
        } else if (level === 2) {
          elements.push(
            <h2 key={i} className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-4 mb-2">
              {parseInlineMarkdown(textContent)}
            </h2>
          );
        } else if (level === 3) {
          elements.push(
            <h3 key={i} className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5">
              {parseInlineMarkdown(textContent)}
            </h3>
          );
        } else {
          elements.push(
            <h4 key={i} className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-2 mb-1">
              {parseInlineMarkdown(textContent)}
            </h4>
          );
        }
        continue;
      }
    }

    // Check Blockquote
    if (trimmed.startsWith('>')) {
      if (inList) flushList(`line-${i}`);
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-emerald-500 pl-4 py-1 italic text-zinc-600 dark:text-zinc-400 my-2"
        >
          {parseInlineMarkdown(quoteText)}
        </blockquote>
      );
      continue;
    }

    // Check Unordered List
    if (trimmed.match(/^[-*+]\s+/)) {
      const itemContent = trimmed.replace(/^[-*+]\s+/, '');
      if (inList !== 'ul') {
        flushList(`switch-${i}`);
        inList = 'ul';
      }
      listItems.push(
        <li key={`item-${i}`} className="text-zinc-700 dark:text-zinc-300">
          {parseInlineMarkdown(itemContent)}
        </li>
      );
      continue;
    }

    // Check Ordered List
    if (trimmed.match(/^\d+\.\s+/)) {
      const itemContent = trimmed.replace(/^\d+\.\s+/, '');
      if (inList !== 'ol') {
        flushList(`switch-${i}`);
        inList = 'ol';
      }
      listItems.push(
        <li key={`item-${i}`} className="text-zinc-700 dark:text-zinc-300">
          {parseInlineMarkdown(itemContent)}
        </li>
      );
      continue;
    }

    // Regular line / Paragraph
    if (inList) {
      flushList(`endlist-${i}`);
    }

    if (trimmed.length === 0) {
      // Empty line spacer
      continue;
    }

    elements.push(
      <p key={i} className="my-1.5">
        {parseInlineMarkdown(rawLine)}
      </p>
    );
  }

  if (inList) flushList('final');
  if (inTable) flushTable('final');

  return (
    <div>
      {elements}
      {isLast && isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 align-middle animate-pulse" />
      )}
    </div>
  );
};

// Inline markdown parser: **bold**, *italic*, `code`, [links](url)
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Tokenize regex for inline code, links, bold, italic
  const regex = /(`[^`]+`|\[[^\]]+\]\([^\)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g;
  const splitTokens = text.split(regex);

  splitTokens.forEach((token, idx) => {
    if (!token) return;

    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      // Inline code
      parts.push(
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-mono text-[13.5px] border border-zinc-200/60 dark:border-zinc-700/60"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      // Bold
      parts.push(
        <strong key={idx} className="font-semibold text-zinc-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      // Italic
      parts.push(
        <em key={idx} className="italic text-zinc-800 dark:text-zinc-200">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('~~') && token.endsWith('~~') && token.length >= 4) {
      // Strikethrough
      parts.push(
        <del key={idx} className="line-through text-zinc-500">
          {token.slice(2, -2)}
        </del>
      );
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      // Link [text](url)
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-500 transition-colors"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    } else {
      parts.push(token);
    }
  });

  return parts;
}

// Split text into code blocks and normal markdown blocks
interface ContentBlock {
  type: 'text' | 'code';
  language?: string;
  content: string;
}

function parseContentToBlocks(raw: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = raw.substring(lastIndex, match.index);
      if (textChunk.trim().length > 0) {
        blocks.push({ type: 'text', content: textChunk });
      }
    }

    blocks.push({
      type: 'code',
      language: match[1]?.trim() || 'plaintext',
      content: match[2]?.replace(/\n$/, '') || '',
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < raw.length) {
    const remaining = raw.substring(lastIndex);
    // If there's an unclosed code block during streaming
    const unclosedCodeMatch = remaining.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*)$/);
    if (unclosedCodeMatch) {
      const beforeCode = remaining.substring(0, unclosedCodeMatch.index);
      if (beforeCode.trim().length > 0) {
        blocks.push({ type: 'text', content: beforeCode });
      }
      blocks.push({
        type: 'code',
        language: unclosedCodeMatch[1]?.trim() || 'plaintext',
        content: unclosedCodeMatch[2] || '',
      });
    } else {
      blocks.push({ type: 'text', content: remaining });
    }
  }

  return blocks;
}
