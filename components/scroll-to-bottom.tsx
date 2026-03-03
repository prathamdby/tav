"use client";

interface ScrollToBottomProps {
  onClick: () => void;
}

export function ScrollToBottom({ onClick }: ScrollToBottomProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 text-xs text-[var(--color-text)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-full shadow-lg hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors z-40"
    >
      <span>↓</span>
      <span>Scroll to bottom</span>
    </button>
  );
}
