"use client";

import { GeistMono } from "geist/font/mono";
import { useState } from "react";

interface ThinkingBlockProps {
  text: string;
  durationSeconds?: number;
  streaming?: boolean;
}

export function ThinkingBlock({ text, durationSeconds, streaming = false }: ThinkingBlockProps) {
  const [open, setOpen] = useState(false);

  const label = streaming
    ? "Thinking..."
    : durationSeconds !== undefined
      ? `Reasoned for ${durationSeconds}s`
      : "Reasoning";

  return (
    <div className="mb-3 border border-[var(--color-border)] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--color-surface)] transition-colors"
      >
        <span
          className="text-xs"
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            display: "inline-block",
            transition: "transform 0.15s",
          }}
        >
          ▶
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
        {streaming && (
          <span
            className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"
            style={{ animation: "pulse-cursor 1s ease-in-out infinite" }}
          />
        )}
      </button>
      {open && (
        <div
          className={`px-3 py-2 text-xs text-[var(--color-text-dim)] whitespace-pre-wrap border-t border-[var(--color-border)] bg-[var(--color-surface)] ${GeistMono.className}`}
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            fontFamily: "var(--font-geist-mono), monospace",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
