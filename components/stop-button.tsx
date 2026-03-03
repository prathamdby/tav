"use client";

interface StopButtonProps {
  onStop: () => void;
}

export function StopButton({ onStop }: StopButtonProps) {
  return (
    <button
      type="button"
      onClick={onStop}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-error)] border border-[var(--color-border)] hover:border-[var(--color-error)] rounded-md transition-colors"
    >
      <span className="w-2.5 h-2.5 bg-current rounded-sm inline-block" />
      <span>Stop</span>
    </button>
  );
}
