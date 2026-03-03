"use client";

import type { SourceUrlUIPart } from "ai";
import { SourceCard } from "./source-card";

interface SourceCardsProps {
  sources: SourceUrlUIPart[];
}

export function SourceCards({ sources }: SourceCardsProps) {
  if (sources.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)] italic">No web sources found.</p>;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 pr-1" style={{ scrollbarWidth: "thin" }}>
      {sources.map((source, i) => (
        <SourceCard
          key={source.sourceId}
          id={source.sourceId}
          url={source.url}
          title={source.title ?? source.url}
          index={i + 1}
        />
      ))}
    </div>
  );
}
