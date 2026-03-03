"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnswerBlock } from "./answer-block";
import { ScrollToBottom } from "./scroll-to-bottom";
import { SearchInput } from "./search-input";

interface SearchThreadProps {
  initialQuery?: string;
  onReset: () => void;
}

export function SearchThread({ initialQuery, onReset }: SearchThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const initialSubmitted = useRef(false);

  const { messages, sendMessage, stop, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/search" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setAutoScroll(true);
    setShowScrollBtn(false);
  }, []);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      if (!atBottom) {
        setAutoScroll(false);
        setShowScrollBtn(true);
      } else {
        setAutoScroll(true);
        setShowScrollBtn(false);
      }
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (initialQuery && !initialSubmitted.current) {
      initialSubmitted.current = true;
      sendMessage({ text: initialQuery });
    }
  }, [initialQuery, sendMessage]);

  function handleSubmit(query: string) {
    setAutoScroll(true);
    sendMessage({ text: query });
  }

  const realAssistant = messages.filter(
    (m) =>
      m.role === "assistant" && m.parts.some((p) => p.type === "text" || p.type === "reasoning")
  );
  const userMsgs = messages.filter((m) => m.role === "user");

  const turns = realAssistant.map((msg, i) => ({
    userQuery:
      (
        userMsgs[i]?.parts?.find((p) => p.type === "text") as
          | { type: "text"; text: string }
          | undefined
      )?.text ?? "",
    assistantMsg: msg,
  }));

  const pendingQuery =
    isLoading && realAssistant.length < userMsgs.length
      ? ((
          userMsgs.at(-1)?.parts?.find((p) => p.type === "text") as
            | { type: "text"; text: string }
            | undefined
        )?.text ?? "")
      : null;

  return (
    <div className="flex flex-col h-screen">
      {/* Thread scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-16 pb-32">
        <div
          className="mx-auto px-4"
          style={{ maxWidth: "min(50vw, 100% - 32px)", minWidth: "320px" }}
        >
          {/* Rendered turns */}
          {turns.map(({ userQuery, assistantMsg }, idx) => {
            const isLast = idx === turns.length - 1;
            return (
              <React.Fragment key={assistantMsg.id}>
                {idx > 0 && <hr className="border-[var(--color-border)] my-6" />}
                <AnswerBlock
                  message={assistantMsg}
                  userQuery={userQuery}
                  isStreaming={isLast && isLoading}
                  onStop={isLast ? stop : undefined}
                />
              </React.Fragment>
            );
          })}

          {/* Pending shimmer for submitted-but-no-response-yet */}
          {pendingQuery && (
            <div className="mb-8">
              <p className="text-sm text-[var(--color-text-muted)] mb-4 font-medium">
                {pendingQuery}
              </p>
              <div className="space-y-3 mb-4">
                {[60, 80, 45, 70].map((w, i) => (
                  <div key={i} className="shimmer h-4 rounded" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed bottom input */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 pb-6 pt-3"
        style={{
          background: "linear-gradient(transparent, var(--color-bg) 40%)",
        }}
      >
        <div
          className="mx-auto px-4"
          style={{ maxWidth: "min(50vw, 100% - 32px)", minWidth: "320px" }}
        >
          <SearchInput onSubmit={handleSubmit} onReset={onReset} disabled={isLoading} />
        </div>
      </div>

      {showScrollBtn && <ScrollToBottom onClick={scrollToBottom} />}
    </div>
  );
}
