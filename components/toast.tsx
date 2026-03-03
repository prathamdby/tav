"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export function Toast({ message, visible, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border text-sm max-w-md"
      style={{
        background: "var(--color-surface-elevated)",
        borderColor: "var(--color-error)",
        color: "var(--color-text)",
      }}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
