"use client";

import { useState } from "react";

interface SourceCardProps {
  id: string;
  url: string;
  title: string;
  index: number;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function parseCategoryTitle(title: string): { category?: string; cleanTitle: string } {
  const match = title.match(/^\[([^\]]+)\]\s*/);
  if (match) {
    return { category: match[1], cleanTitle: title.slice(match[0].length) };
  }
  return { cleanTitle: title };
}

export function SourceCard({ id, url, title, index }: SourceCardProps) {
  const [faviconError, setFaviconError] = useState(false);
  const { category, cleanTitle } = parseCategoryTitle(title);

  return (
    <a
      id={id}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={cleanTitle}
      data-source-index={index}
      className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-text-dim)] transition-colors text-sm no-underline group"
      style={{ minWidth: "140px", maxWidth: "200px" }}
    >
      <span className="text-[var(--color-text-muted)] text-xs font-mono flex-shrink-0">
        {index}
      </span>
      {faviconError ? (
        <span className="text-xs flex-shrink-0">🌐</span>
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=32`}
          alt=""
          width={14}
          height={14}
          className="flex-shrink-0 rounded-sm"
          loading="lazy"
          onError={() => setFaviconError(true)}
        />
      )}
      <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors truncate text-xs">
        {getDomain(url)}
      </span>
      {category && <span className="text-[10px] text-[var(--color-text-dim)]">{category}</span>}
    </a>
  );
}
