"use client";

import { useEffect, useRef, useState } from "react";

const PLACEHOLDER_EXAMPLES = [
  "What happened in the news today?",
  "Explain quantum computing simply",
  "Best restaurants in Tokyo",
  "How does photosynthesis work?",
];

interface SearchInputProps {
  onSubmit: (query: string) => void;
  onReset?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function SearchInput({
  onSubmit,
  onReset,
  disabled = false,
  autoFocus = false,
}: SearchInputProps) {
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [shakeError, setShakeError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== textareaRef.current) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 24;
    const maxHeight = lineHeight * 5;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    autoResize();
  }

  function handleSubmit() {
    if (!value.trim()) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      return;
    }
    const query = value.trim();
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    onSubmit(query);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
      return;
    }
    if (e.key === "Escape") {
      if (value) {
        setValue("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      } else {
        onReset?.();
      }
    }
  }

  const isMac =
    typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");
  const shortcutHint = isMac ? "⌘↵" : "Ctrl↵";

  return (
    <div
      className={`search-input-wrapper relative flex items-end gap-2 px-4 py-3 border rounded-xl bg-transparent transition-all${shakeError ? " search-input-error" : ""}`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder={placeholderVisible ? PLACEHOLDER_EXAMPLES[placeholderIndex] : ""}
        className="flex-1 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-dim)] resize-none outline-none text-sm leading-6 min-h-6"
        style={{ fontFamily: "inherit" }}
      />
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="hidden sm:block text-xs text-[var(--color-text-dim)]">{shortcutHint}</span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--color-accent)] text-black hover:opacity-90 active:opacity-75 disabled:opacity-40 transition-opacity flex-shrink-0"
        >
          <span className="text-xs font-bold">→</span>
        </button>
      </div>
    </div>
  );
}
