"use client";

import Image from "next/image";

interface SourceCardProps {
  id: string;
  url: string;
  title: string;
  index: number;
  favicon?: string;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SourceCard({ id, url, title, index, favicon }: SourceCardProps) {
  return (
    <a
      id={id}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      data-source-index={index}
      className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-text-dim)] transition-colors text-sm no-underline group"
      style={{ minWidth: "140px", maxWidth: "200px" }}
    >
      <span className="text-[var(--color-text-muted)] text-xs font-mono flex-shrink-0">
        {index}
      </span>
      {favicon ? (
        <Image
          src={favicon}
          alt=""
          width={14}
          height={14}
          className="flex-shrink-0 rounded-sm"
          unoptimized
        />
      ) : (
        <span className="text-xs flex-shrink-0">🌐</span>
      )}
      <span className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors truncate text-xs">
        {getDomain(url)}
      </span>
    </a>
  );
}
