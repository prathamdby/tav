"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  streaming?: boolean;
}

function parseCitations(text: string, onCitationClick: (n: number) => void): React.ReactNode[] {
  const parts = text.split(/(\[\d+\]|【\d+】)/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/) ?? part.match(/^【(\d+)】$/);
    if (match) {
      const n = Number.parseInt(match[1], 10);
      return (
        <button
          key={i}
          type="button"
          className="citation-badge"
          onClick={() => onCitationClick(n)}
          aria-label={`Source ${n}`}
        >
          {n}
        </button>
      );
    }
    return part;
  });
}

function scrollToSource(n: number) {
  const el = document.querySelector(`[data-source-index="${n}"]`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

export function MarkdownRenderer({ content, streaming = false }: MarkdownRendererProps) {
  const components: Components = {
    a({ href, children }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    p({ children }) {
      const processChildren = (nodes: React.ReactNode): React.ReactNode => {
        if (typeof nodes === "string") {
          return parseCitations(nodes, scrollToSource);
        }
        if (Array.isArray(nodes)) {
          return nodes.flatMap((child, i) => {
            if (typeof child === "string") {
              return parseCitations(child, scrollToSource).map((el, j) => (
                <span key={`${i}-${j}`}>{el}</span>
              ));
            }
            return [child];
          });
        }
        return nodes;
      };

      return <p>{processChildren(children)}</p>;
    },
  };

  return (
    <div className={`prose${streaming ? " streaming-cursor" : ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
