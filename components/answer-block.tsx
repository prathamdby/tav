"use client";

import type { ReasoningUIPart, SourceUrlUIPart, TextUIPart, UIMessage } from "ai";
import { CopyButton } from "./copy-button";
import { MarkdownRenderer } from "./markdown-renderer";
import { SourceCards } from "./source-cards";
import { StopButton } from "./stop-button";
import { ThinkingBlock } from "./thinking-block";

interface AnswerBlockProps {
  message: UIMessage;
  userQuery: string;
  isStreaming: boolean;
  onStop?: () => void;
}

function getTextParts(message: UIMessage): TextUIPart[] {
  return message.parts.filter((p): p is TextUIPart => p.type === "text");
}

function getReasoningParts(message: UIMessage): ReasoningUIPart[] {
  return message.parts.filter((p): p is ReasoningUIPart => p.type === "reasoning");
}

function getSourceParts(message: UIMessage): SourceUrlUIPart[] {
  const seen = new Set<string>();
  return message.parts.filter((p): p is SourceUrlUIPart => {
    if (p.type !== "source-url") return false;
    if (seen.has(p.sourceId)) return false;
    seen.add(p.sourceId);
    return true;
  });
}

export function AnswerBlock({ message, userQuery, isStreaming, onStop }: AnswerBlockProps) {
  const textParts = getTextParts(message);
  const reasoningParts = getReasoningParts(message);
  const sourceParts = getSourceParts(message);

  const fullText = textParts.map((p) => p.text).join("");
  const reasoningText = reasoningParts.map((p) => p.text).join("");

  return (
    <div className="mb-4">
      {/* User query */}
      <p className="text-base text-[var(--color-text)] mb-3 font-semibold">{userQuery}</p>

      {/* Thinking block */}
      {reasoningText && (
        <ThinkingBlock
          text={reasoningText}
          streaming={isStreaming && reasoningParts.length > 0 && !fullText}
        />
      )}

      {/* Shimmer skeleton while loading */}
      {isStreaming && !fullText && !reasoningText && (
        <div className="space-y-3 mb-4">
          {[60, 80, 45, 70].map((w, i) => (
            <div key={i} className="shimmer h-4 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {/* Streamed answer */}
      {fullText && <MarkdownRenderer content={fullText} streaming={isStreaming} />}

      {/* Source cards */}
      {sourceParts.length > 0 && (
        <div className="mt-3">
          <SourceCards sources={sourceParts} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3">
        {isStreaming && onStop && <StopButton onStop={onStop} />}
        {!isStreaming && fullText && <CopyButton text={fullText} />}
      </div>
    </div>
  );
}
