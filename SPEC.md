# PRD: tav — AI Search Platform

## Introduction

tav is a focused, fast AI search engine built from scratch. Users type a query, get a streamed answer synthesized from live web results with inline source citations — similar to Perplexity or Scira. The product bets on speed: Cerebras inference (the fastest available LLM provider) paired with Tavily search (optimized for LLM-grounded retrieval). No accounts, no clutter — just search.

## Goals

- Deliver fast time-to-first-token (target <2s) on search answers via Cerebras `gpt-oss-120b`
- Ground every answer in real-time web sources via Tavily Search API
- Provide a minimal, distraction-free UI focused entirely on the search experience
- Support multi-turn follow-up questions within the same thread
- Render rich markdown answers with inline source citations
- Deploy to Vercel with zero infrastructure management

---

## Tech Stack

| Layer           | Choice                                         | Version / Notes                                                                                    |
| --------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Framework       | Next.js (App Router)                           | Latest stable. RSC, streaming, route handlers, Vercel-native                                       |
| AI Inference    | Cerebras `gpt-oss-120b`                        | Reasoning model with thinking tokens. `reasoningEffort: "low"` for speed                           |
| AI SDK          | Vercel AI SDK 5.x                              | `ai` + `@ai-sdk/cerebras` + `@ai-sdk/react`. Uses `streamText`, `createUIMessageStream`, `useChat` |
| Search API      | Tavily Search                                  | `@tavily/core` (v0.7.2+). `search_depth: "basic"`, 1 credit/call, 1000 free credits/month          |
| Styling         | Tailwind CSS v4 + shadcn/ui                    | Dark theme only. Global CSS file                                                                   |
| Animation       | Motion (formerly framer-motion)                | For layout transitions (input center → bottom)                                                     |
| Markdown        | react-markdown + remark-gfm + rehype-highlight | GitHub Dark code theme                                                                             |
| Linting         | Biome                                          | All-in-one linter + formatter                                                                      |
| TypeScript      | Strict mode                                    | `strict: true` in tsconfig                                                                         |
| Package Manager | Bun                                            | For all installs and scripts                                                                       |
| Deployment      | Vercel                                         | Default config, push-to-deploy                                                                     |

### Environment Variables

```
CEREBRAS_API_KEY=   # from https://cloud.cerebras.ai
TAVILY_API_KEY=     # from https://app.tavily.com
```

Validate on startup using `zod` or `t3-env`. If either key is missing, the app must fail fast with a clear error message — not silently fail at runtime.

### Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "ai": "latest",
    "@ai-sdk/cerebras": "latest",
    "@ai-sdk/react": "latest",
    "@tavily/core": "latest",
    "react-markdown": "latest",
    "remark-gfm": "latest",
    "rehype-highlight": "latest",
    "highlight.js": "latest",
    "geist": "latest",
    "motion": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@biomejs/biome": "latest",
    "typescript": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "tailwindcss": "latest",
    "@tailwindcss/postcss": "latest"
  }
}
```

**Important:** `useChat` is imported from `@ai-sdk/react` (not from `ai/react`). The `geist` package provides Geist Sans + Geist Mono font files for `next/font`. The `highlight.js` package is required by `rehype-highlight` for the GitHub Dark CSS theme.

---

## Visual Identity & Design System

### Theme

- **Dark only.** No light mode, no toggle.
- Background: near-black (`#0a0a0a` or similar) with a subtle film grain / noise texture overlay on the landing page
- Text: high-contrast white/off-white for body, muted gray for secondary text

### Typography

- **Primary font:** Geist Sans. Load via `import { GeistSans } from 'geist/font/sans'` and apply to `<html>` in root layout.
- Headings: bold weight of Geist Sans
- Code: Geist Mono. Load via `import { GeistMono } from 'geist/font/mono'`. Apply to code blocks and the thinking block.
- Import `highlight.js/styles/github-dark.css` in `globals.css` for code syntax highlighting theme.

### Color

- **Accent:** Electric blue / cyan (e.g., `#00d4ff` or similar). Used for: brand mark, focus glow, interactive elements, link hover states
- **Surface:** slightly elevated cards use `#141414` or `#1a1a1a`
- **Border:** subtle `#2a2a2a` for input borders, card edges
- **Error:** muted red (e.g., `#ff4444`)
- Define all as CSS custom properties in the global CSS file

### Brand Mark

- **Wordmark only.** The word "tav" displayed in the primary font, bold weight.
- No icon, no symbol — purely typographic.
- Accent color on the wordmark, or white with accent on hover.

### Favicon

- Geometric shape (rounded square or circle) in the accent color with the letter "t" in white/dark.

---

## Page Structure & Layout

### Landing State

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│                                                 │
│                     tav                         │  ← Wordmark, accent color
│          Search at the speed of thought         │  ← Tagline, muted text
│                                                 │
│         ┌─────────────────────────────┐         │
│         │ Ask anything... (cycling)   │ →│      │  ← Input with icon + shortcut hint
│         └─────────────────────────────┘         │
│                                                 │
│                                                 │
│                                                 │  ← Film grain texture bg
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Logo ("tav") + tagline ("Search at the speed of thought") vertically centered, above the input
- Search input centered below the tagline
- **No footer, no nav, no sidebar.** Absolutely nothing else on the page.
- Background: solid dark with subtle film grain/noise texture overlay (CSS or tiny SVG pattern)

### Search State

```
┌─────────────────────────────────────────────────┐
│  tav                                            │  ← Logo top-left, click to reset
│                                                 │
│         ┌─────────────────────────────┐         │
│         │ User query displayed here   │         │
│         │                             │         │
│         │ ┌─Thinking──────────────┐   │         │  ← Collapsible, muted
│         │ │ (reasoning tokens)    │   │         │
│         │ └───────────────────────┘   │         │
│         │                             │         │
│         │ Streamed answer with        │         │
│         │ markdown rendering and      │         │
│         │ inline citations [1] [2]... │         │
│         │                             │         │
│         │ ┌──────┐ ┌──────┐ ┌──────┐ │         │
│  ~25%   │ │ 🌐 s1│ │ 🌐 s2│ │ 🌐 s3│ │  ~25%  │  ← Source cards: favicon + domain
│  pad    │ └──────┘ └──────┘ └──────┘ │  pad    │
│         │                             │         │
│         │        [Copy answer]        │         │
│         └─────────────────────────────┘         │
│                                                 │
│         ┌─────────────────────────────┐         │
│         │ Follow-up question...   → │ ■│        │  ← Fixed bottom input
│         └─────────────────────────────┘         │
└─────────────────────────────────────────────────┘
```

- Logo moves to top-left corner. Clicking it resets to landing state (no confirmation).
- Results area: centered, **max-width ~50% of viewport on desktop** (25% padding each side)
- Responsive breakpoints:
  - Desktop (≥1280px): 50% content width
  - Tablet (≥768px): 70% content width
  - Mobile (<768px): full width with 16-24px horizontal padding
- Input pinned to bottom (fixed position), same width as content area
- Input remains fixed on mobile too

---

## Search Input Specification

### Visual Style

- Thin border (`1px solid #2a2a2a`), transparent background
- On focus: border glows with accent color (box-shadow with accent, e.g., `0 0 0 2px rgba(0,212,255,0.3)`)
- Rounded corners (e.g., `rounded-xl`)

### Behavior

- **Auto-expanding textarea**: starts as a single line, grows vertically as the user types more text (up to ~5 lines, then scrolls)
- **Placeholder**: ghost text that cycles through example queries. Examples:
  - "What happened in the news today?"
  - "Explain quantum computing simply"
  - "Best restaurants in Tokyo"
  - "How does photosynthesis work?"
  - Cycle every ~3 seconds with a fade transition
- **Submit**: Icon button inside the input (right-aligned arrow icon). Also shows keyboard shortcut hint (⌘+Enter on Mac, Ctrl+Enter on Windows/Linux)
- **Enter** submits the query. **Shift+Enter** adds a newline.
- **Empty query**: if user tries to submit empty input, show a subtle validation hint — briefly shake the input or flash a red border, then return to normal
- **Long queries**: no character limit. Send the full query to APIs, let them handle truncation

### Keyboard Shortcuts (Global)

- `/` — focuses the search input from anywhere on the page
- `Esc` — clears the input text; if already empty, resets to landing page state

---

## Answer Block Specification

Each Q&A turn in the thread renders as an "answer block" with these parts, in order:

### 1. User Query

- Displayed as plain text above the answer, slightly muted
- Not editable after submission

### 2. Thinking/Reasoning (Collapsible)

- `gpt-oss-120b` emits reasoning tokens before the final answer
- Access via `message.parts.filter(p => p.type === 'reasoning')` from `useChat`
- Display a collapsible block labeled "Thinking..." (or "Reasoned for X seconds" once complete)
- **Collapsed by default.** User clicks to expand and see the raw reasoning text.
- Reasoning text styled in muted/dim color, Geist Mono font to distinguish from the answer
- If the message has no reasoning parts, don't show this block at all

### 3. Answer (Streamed Markdown)

- Tokens stream in real-time via AI SDK 5.x UI Message Stream Protocol
- Text parts accessed via `message.parts.filter(p => p.type === 'text')` from `useChat`
- Rendered as markdown using `react-markdown` + `remark-gfm` + `rehype-highlight`
- **Markdown features supported:** headings, bold, italic, strikethrough, links, ordered/unordered lists, tables (GFM), code blocks with syntax highlighting (GitHub Dark theme via `highlight.js/styles/github-dark.css`), inline code, blockquotes, horizontal rules
- **LaTeX/math:** not supported in v1
- **Inline citations:** the system prompt instructs the model to cite sources as `[1]`, `[2]`, etc. These must be post-processed into interactive elements:
  - **Implementation:** In `markdown-renderer.tsx`, use a custom `components` prop on `react-markdown` to override the default paragraph/text rendering, or use a regex to find `\[(\d+)\]` patterns in the rendered output and replace them with `<button>` or `<a>` elements styled as small superscript accent-colored badges
  - Clicking a citation number scrolls to the corresponding source card (use `id="source-N"` on each source card element and `scrollIntoView({ behavior: 'smooth' })`)
  - `react-markdown` does NOT parse `[1]` as anything special by default — this custom handling is required
- **Links in answers:** open in a new tab (`target="_blank" rel="noopener noreferrer"`). Override via `react-markdown`'s `components={{ a: CustomLink }}` prop. No hover preview in v1 — just standard link behavior with new-tab on click.
- Streaming cursor: a pulsing accent-colored dot or block at the end of the streaming text

### 4. Source Cards (Below Answer)

- Displayed in a horizontal scrollable row beneath the answer
- **Each card shows:** favicon image + domain name (e.g., `wikipedia.org`). That's it — minimal.
- Cards are numbered [1], [2], etc. to match inline citations
- Clicking a card opens the source URL in a new tab
- Source cards appear once the Tavily search completes — they are streamed as `type: 'source'` parts via the AI SDK and arrive in `message.parts` before text tokens. Render them as soon as they appear in the parts array.
- Each source card element must have `id="source-N"` (e.g., `id="source-1"`) for citation scroll targeting.
- If Tavily returns 0 results: show a muted warning "No web sources found" in place of cards

### 5. Copy Button

- Small "Copy" button (or clipboard icon) at the bottom-right of the answer text
- Copies the full markdown answer text to clipboard
- Shows brief "Copied!" confirmation on click

### 6. Stop Button

- While the answer is actively streaming, show a "Stop" button (square icon or "Stop generating" text)
- Clicking it aborts the stream. The partial answer remains displayed as-is.
- Button disappears once streaming completes

---

## Thread Behavior

### Multi-Turn Conversation

- After the first answer, the bottom input accepts follow-up queries
- Previous Q&A pairs remain fully visible and expanded above — user scrolls up to see them
- **No collapse, no truncation** of old answers in the UI
- No limit on the number of follow-ups. Thread grows indefinitely.
- Thread state is purely client-side. Refreshing the page loses everything — that's fine.

### Context Window Strategy

- **Sliding window:** send the last 6 messages (3 user + 3 assistant turns) to the model
- Always include the system prompt + current Tavily search results for the latest query
- Older messages beyond the window are silently dropped from the API call (but remain visible in the UI)

### Follow-Up Search Behavior

- **Every follow-up triggers a fresh Tavily search.** No exceptions.
- The follow-up query is sent to Tavily as-is (not combined with conversation history)
- Fresh source cards appear for each answer block

### Scroll Behavior

- Auto-scroll to track the latest streaming token
- **If the user scrolls up** (manual scroll detected), auto-scroll pauses
- Show a small "↓ Scroll to bottom" button when auto-scroll is paused
- Clicking the button or submitting a new query resumes auto-scroll

---

## API Route: `POST /api/search`

### Runtime

- Default Next.js runtime (let the framework decide based on dependencies)

### Request

The route receives `UIMessage[]` from the `useChat` hook (sent automatically by AI SDK 5.x).

### Flow (AI SDK 5.x Pattern)

```
1. Parse request body: { messages } (UIMessage[])
2. Extract the latest user message text
3. Call Tavily Search:
   - query: latest user message content
   - search_depth: "basic"
   - max_results: 5
   - include_favicon: true
4. Build system prompt (from lib/prompts.ts):
   - Inject search results as numbered context
   - Instruct model to cite sources as [1], [2], etc.
5. Create a UIMessageStream via createUIMessageStream:
   a. Write each Tavily result as a source part:
      writer.write({ type: 'source', value: { type: 'source', sourceType: 'url', id: 'source-N', url, title } })
   b. Call streamText with Cerebras model + system prompt + sliding window messages
   c. Merge the streamText result: writer.merge(result.toUIMessageStream())
6. Return createUIMessageStreamResponse({ stream })
```

### Reference Implementation

```typescript
import { cerebras } from "@ai-sdk/cerebras";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  convertToModelMessages,
} from "ai";
import { searchTavily } from "@/lib/tavily";
import { buildSystemPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Extract latest user query
  const lastUserMessage = messages.filter((m: any) => m.role === "user").at(-1);
  const query =
    lastUserMessage?.content ??
    lastUserMessage?.parts?.find((p: any) => p.type === "text")?.text ??
    "";

  // Search (runs before streaming starts)
  const searchResults = await searchTavily(query);

  // Build prompt with sources
  const systemPrompt = buildSystemPrompt(searchResults);

  // Sliding window: last 6 messages
  const windowedMessages = messages.slice(-6);

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      // 1. Stream source cards immediately
      searchResults.forEach((result, i) => {
        writer.write({
          type: "source",
          value: {
            type: "source",
            sourceType: "url",
            id: `source-${i + 1}`,
            url: result.url,
            title: result.title,
          },
        });
      });

      // 2. Stream LLM response (text + reasoning tokens)
      const result = streamText({
        model: cerebras("gpt-oss-120b"),
        providerOptions: { cerebras: { reasoningEffort: "low" } },
        system: systemPrompt,
        messages: convertToModelMessages(windowedMessages),
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}
```

### Error Handling

- **No automatic retries.** If Tavily fails, return an error response to the client (standard `Response` with error status).
- If Tavily returns 0 results, proceed anyway — pass an empty sources list to the model, let it answer from its own knowledge. Don't write any source parts to the stream.
- If Cerebras fails (500, rate limit, etc.), return an error response to the client.
- Client shows the error message + a "Try again" button that re-submits the same query.

### Streaming Protocol

- Uses **AI SDK 5.x UI Message Stream Protocol** (Server-Sent Events)
- Sources are streamed as first-class `type: 'source'` parts — they arrive before text tokens and appear in `message.parts` on the client
- Reasoning tokens are automatically carried in the stream and appear as `type: 'reasoning'` in `message.parts`
- The `useChat` hook on the client handles all of this automatically

---

## Client-Side: `useChat` Integration (AI SDK 5.x)

The `search-thread.tsx` component manages conversation state. Key differences from AI SDK 4.x:

- `useChat` is imported from `@ai-sdk/react` (not `ai/react`)
- Input state is NOT managed by `useChat` — use a local `useState` for the input value
- Messages are submitted via `sendMessage({ text })`, not `handleSubmit`
- A `transport` must be provided: `new DefaultChatTransport({ api: '/api/search' })`

### Reference Implementation

```typescript
'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export function SearchThread() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, isLoading, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/search' }),
  });

  const handleSubmit = () => {
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <>
      {messages.filter(m => m.role === 'assistant').map(message => (
        // For each assistant message, render:
        // 1. Reasoning: message.parts.filter(p => p.type === 'reasoning')
        // 2. Text/answer: message.parts.filter(p => p.type === 'text')
        // 3. Sources: message.parts.filter(p => p.type === 'source')
      ))}
    </>
  );
}
```

### Message Parts Structure

Each assistant `UIMessage` from the AI SDK contains a `parts` array with these types:

| `part.type`   | Content                                                | Use                        |
| ------------- | ------------------------------------------------------ | -------------------------- |
| `'reasoning'` | `part.text` — reasoning/thinking text                  | Collapsible thinking block |
| `'text'`      | `part.text` — the answer content                       | Markdown-rendered answer   |
| `'source'`    | `part.url`, `part.title`, `part.sourceType`, `part.id` | Source cards               |

Render parts in order: reasoning first (if any), then text, then sources below.

---

## System Prompt (`lib/prompts.ts`)

```
You are tav, a fast and accurate AI search engine. Your job is to answer the user's question using the provided web search results.

Rules:
- Use the search results below to ground your answer in real, up-to-date information
- Cite sources inline using numbered references like [1], [2], etc.
- Every factual claim must have at least one citation
- Be neutral and factual. No opinions, no filler, no hedging
- Use markdown formatting: headings for structure, bold for emphasis, code blocks for code, lists where appropriate
- If the search results don't contain relevant information, say so clearly and answer from your own knowledge with a disclaimer
- Keep answers concise but thorough. Prefer clarity over length
- Do not introduce yourself or repeat the question

Search Results:
{results formatted as:
[1] {title} ({url})
{content}

[2] {title} ({url})
{content}
...}
```

---

## File Architecture

```
├── biome.json                      # Biome linter + formatter config (project root)
├── package.json
├── tsconfig.json                   # strict: true
├── next.config.ts
├── postcss.config.ts
├── .env.local                      # CEREBRAS_API_KEY, TAVILY_API_KEY (gitignored)
├── .env.example                    # Template with empty values (committed)
├── app/
│   ├── page.tsx                    # Landing page (RSC shell + client search component)
│   ├── layout.tsx                  # Root layout: Geist fonts, metadata, global styles
│   ├── globals.css                 # Tailwind directives + CSS vars + grain texture + highlight.js theme
│   ├── favicon.ico                 # Geometric 't' favicon
│   ├── opengraph-image.tsx         # OG image generation (Next.js ImageResponse)
│   └── api/
│       └── search/
│           └── route.ts            # POST handler: Tavily → Cerebras stream (AI SDK 5.x)
├── components/
│   ├── search-input.tsx            # Auto-expanding textarea with submit, shortcuts, placeholder cycling
│   ├── search-thread.tsx           # Full thread: useChat + message rendering + scroll management
│   ├── answer-block.tsx            # Single Q&A turn: query + thinking + answer + sources + copy
│   ├── thinking-block.tsx          # Collapsible reasoning tokens display
│   ├── source-card.tsx             # Single source card: favicon + domain
│   ├── source-cards.tsx            # Horizontal scrollable source card row
│   ├── markdown-renderer.tsx       # react-markdown wrapper with citation parsing
│   ├── copy-button.tsx             # Clipboard copy button with confirmation
│   ├── scroll-to-bottom.tsx        # "↓ Scroll to bottom" floating button
│   └── stop-button.tsx             # Stop generation button
└── lib/
    ├── tavily.ts                   # Tavily search utility (server-side only)
    ├── prompts.ts                  # System prompt template with source injection
    └── env.ts                      # Environment variable validation (zod)
```

---

## Loading & Error States

### Loading (Shimmer Skeleton)

While Tavily search is in flight and before tokens start streaming:

- Show animated shimmer blocks mimicking the answer layout:
  - 3-4 gray rectangle lines of varying width (60%, 80%, 45%, 70%)
  - Subtle left-to-right shimmer animation
- Shimmer appears in the answer area immediately on submit
- Shimmer is replaced by real content as soon as the first token arrives

### Streaming Indicator

- While tokens are actively streaming: pulsing accent-colored dot at the end of the text
- The dot disappears when streaming completes or is stopped

### Error States

- **Tavily failure:** "Couldn't fetch search results. Please try again." + Try Again button
- **Cerebras failure:** "Answer generation failed. Please try again." + Try Again button
- **Rate limit:** "Too many requests. Please wait a moment and try again."
- **Network error:** "Connection lost. Check your internet and try again."
- All errors display in the answer area where the answer would have appeared
- "Try Again" button re-submits the exact same query

---

## Open Graph Image

- Generate using Next.js `ImageResponse` (built-in, no external dependency)
- Design: dark background, "tav" wordmark in accent color, tagline below in white
- Size: 1200x630px
- Served at `/opengraph-image`

---

## Keyboard Shortcuts Summary

| Shortcut       | Context                 | Action                     |
| -------------- | ----------------------- | -------------------------- |
| `Enter`        | Input focused           | Submit query               |
| `Shift+Enter`  | Input focused           | New line in textarea       |
| `⌘/Ctrl+Enter` | Input focused           | Submit query (alternative) |
| `/`            | Anywhere                | Focus the search input     |
| `Esc`          | Input focused, has text | Clear input text           |
| `Esc`          | Input focused, empty    | Reset to landing page      |

---

## Responsive Behavior Summary

| Breakpoint      | Content Width | Input Position                      | Notes                  |
| --------------- | ------------- | ----------------------------------- | ---------------------- |
| Desktop ≥1280px | 50% viewport  | Fixed bottom, same width as content | 25% padding each side  |
| Tablet ≥768px   | 70% viewport  | Fixed bottom, same width as content | 15% padding each side  |
| Mobile <768px   | 100% - 32px   | Fixed bottom, full width - 32px     | 16px padding each side |

---

## Transition: Landing → Search State

This is the single hero animation moment in the product.

1. User submits a query from the centered landing input
2. The input **animates** from its centered position to the fixed-bottom position using Motion (layout animation)
3. The logo slides from center to top-left corner
4. The tagline fades out
5. The film grain background remains
6. The answer area fades in above the input
7. Total transition duration: 300-400ms, ease-out curve

Use Motion's `layoutId` for the input element to get a smooth shared layout transition.

---

## Non-Goals (Out of Scope)

- No user authentication or accounts
- No search history persistence (stateless, lost on refresh)
- No image search or image generation
- No model picker UI (hardcoded to `gpt-oss-120b`)
- No browser extension or mobile app
- No SEO for individual search results (this is a tool, not a content site)
- No rate limiting on the app layer (rely on API provider limits)
- No analytics or telemetry in v1
- No LaTeX/math rendering in v1
- No light mode
- No i18n / internationalization
- No offline support or service worker
- No auto-retry on API failures

---

## Success Metrics

- Time-to-first-token under 2 seconds for 90% of queries
- Answer includes at least 2 cited sources for 95% of queries
- Full answer generation completes in under 10 seconds for typical queries
- Zero client-side JS errors in the core search flow
- Lighthouse performance score > 90 on landing page
- All environment variables validated at build/startup time

---

## API Reference: Cerebras (`@ai-sdk/cerebras`)

- **API base:** `https://api.cerebras.ai/v1`
- **Model:** `gpt-oss-120b` — reasoning model with thinking tokens
- **Provider options:** `{ cerebras: { reasoningEffort: 'low' } }`
- **Env var:** `CEREBRAS_API_KEY`
- **Capabilities:** streaming, object generation, reasoning tokens
- **SDK usage (AI SDK 5.x):**

```typescript
import { cerebras } from "@ai-sdk/cerebras";
import { streamText, convertToModelMessages } from "ai";

const result = streamText({
  model: cerebras("gpt-oss-120b"),
  providerOptions: { cerebras: { reasoningEffort: "low" } },
  system: systemPrompt,
  messages: convertToModelMessages(uiMessages),
});

// Use result.toUIMessageStream() to merge into a createUIMessageStream writer
```

- **Reasoning tokens:** automatically streamed as `type: 'reasoning'` parts in the UI Message Stream. On the client, access via `message.parts.filter(p => p.type === 'reasoning')`. No manual collection needed — the AI SDK handles this.
- **`convertToModelMessages()`:** required in AI SDK 5.x to convert `UIMessage[]` (from the client) into the model-compatible message format. Always call this before passing to `streamText`.

## API Reference: Tavily (`@tavily/core`)

- **Endpoint:** `POST https://api.tavily.com/search`
- **Env var:** `TAVILY_API_KEY`
- **Free tier:** 1000 API credits/month. Basic search = 1 credit.
- **SDK usage:**

```typescript
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! });

const response = await tvly.search(query, {
  searchDepth: "basic",
  maxResults: 5,
  includeFavicon: true,
});

// response.results: Array<{ title, url, content, score, favicon }>
```

**Param casing note:** The REST API uses snake_case (`search_depth`, `max_results`), but the `@tavily/core` JS SDK accepts camelCase as shown above. If the SDK rejects camelCase params at runtime, fall back to snake_case: `{ search_depth: 'basic', max_results: 5, include_favicon: true }`.

- **Response shape:**

```typescript
interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  favicon: string;
}

interface TavilyResponse {
  query: string;
  results: TavilyResult[];
  responseTime: number;
}
```

---

## Development & Commit Protocol

The building agent must commit changes incrementally in the order below. Each commit must be a self-contained, typechecking unit. Never commit a file that imports from an uncommitted file.

### Commit Workflow (Every Commit)

```
1. Stage files:            git add <files>
2. Inspect staged changes: git diff --cached
3. Analyze what changed
4. Write commit message:
   - Format: type: description
   - First line: ≤50 characters (hard limit)
   - Mandatory blank line after first line
   - Body (if needed): bullet points starting with -
   - Capitalize first word of each bullet, no periods
   - Types: feat, fix, refactor, docs, test, chore, style, perf
   - No scope notation (e.g., feat: add search input — not feat(ui): add search input)
5. Commit:                 git commit -m "[message]"
6. Verify:                 git log -1
```

### Commit Order (Dependency Graph)

Each row is one commit. Rows must execute top-to-bottom. Files within a single commit can be staged together.

| #   | Type  | Files                                                                                                              | Message Guidance                     |
| --- | ----- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| 1   | chore | `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.ts`, `biome.json`, `.env.example`, `.gitignore` | Scaffold Next.js project with deps   |
| 2   | feat  | `lib/env.ts`                                                                                                       | Add env validation with zod          |
| 3   | style | `app/globals.css`, `app/layout.tsx`                                                                                | Add global styles, fonts, dark theme |
| 4   | feat  | `lib/tavily.ts`                                                                                                    | Add Tavily search utility            |
| 5   | feat  | `lib/prompts.ts`                                                                                                   | Add system prompt template           |
| 6   | feat  | `app/api/search/route.ts`                                                                                          | Add search API route handler         |
| 7   | feat  | `components/markdown-renderer.tsx`                                                                                 | Add markdown renderer with citations |
| 8   | feat  | `components/source-card.tsx`, `components/source-cards.tsx`                                                        | Add source card components           |
| 9   | feat  | `components/thinking-block.tsx`                                                                                    | Add collapsible reasoning block      |
| 10  | feat  | `components/copy-button.tsx`, `components/stop-button.tsx`, `components/scroll-to-bottom.tsx`                      | Add answer action buttons            |
| 11  | feat  | `components/search-input.tsx`                                                                                      | Add search input with shortcuts      |
| 12  | feat  | `components/answer-block.tsx`                                                                                      | Add answer block composition         |
| 13  | feat  | `components/search-thread.tsx`                                                                                     | Add search thread with useChat       |
| 14  | feat  | `app/page.tsx`                                                                                                     | Add landing page with transition     |
| 15  | feat  | `app/favicon.ico`, `app/opengraph-image.tsx`                                                                       | Add favicon and OG image             |
| 16  | chore | Any remaining files                                                                                                | Lint pass and cleanup                |

### Commit Rules

- **Never skip a row.** Each row depends on all rows above it.
- **Never combine rows** unless both are trivially small AND have no cross-dependency.
- **Run `bunx biome check .` before each commit** after row 1. Fix any errors before committing.
- **Run `bun run build` (or `bunx next build`) at minimum after rows 6, 13, and 16** to catch type errors early. If it fails, fix before committing.
- **If a commit fails** (pre-commit hook, type error, lint error): fix the issue and create a NEW commit. Never amend.
- **Never commit `.env.local`** — it contains secrets. Only `.env.example` is committed.
- **Each commit message first line must be ≤50 characters.** This is a hard limit. GitHub truncates beyond this.

### Commit Message Examples

Good:

```
chore: scaffold project with dependencies

- Initialize Next.js with App Router
- Add AI SDK, Tavily, and UI dependencies
- Configure TypeScript strict mode
- Add Biome for linting
```

```
feat: add search API route handler

- Wire Tavily search to Cerebras streaming
- Use AI SDK 5.x createUIMessageStream
- Stream sources before text tokens
- Apply sliding window context strategy
```

Bad:

```
added stuff          ← vague, lowercase type
feat(api): add search route  ← has scope notation
feat: add the search API route handler for the search endpoint  ← >50 chars
```

---

## Peer Review Log

**Reviewed:** 2026-03-03. All gaps addressed:

- **[CRITICAL] AI SDK version mismatch fixed.** All code examples, route handler, and client-side patterns updated from 4.x to 5.x (`createUIMessageStream`, `convertToModelMessages`, `@ai-sdk/react` import, transport-based `useChat`, self-managed input state).
- **[CRITICAL] Source streaming mechanism specified.** Using first-class `type: 'source'` parts via `writer.write()` — no custom hacks needed.
- **[CRITICAL] Reasoning token access specified.** `message.parts.filter(p => p.type === 'reasoning')` on client, automatic streaming via AI SDK protocol.
- **Citation parsing specified.** Custom regex in `markdown-renderer.tsx` to transform `[N]` into interactive superscript badges with `scrollIntoView` to source cards.
- **Missing dependencies added.** `@ai-sdk/react`, `geist` (fonts), `highlight.js` (code theme CSS).
- **`biome.json` moved to project root.** Was incorrectly inside `app/` tree.
- **`highlight.js` CSS import noted.** `highlight.js/styles/github-dark.css` in `globals.css`.
- **Goal wording fixed.** "Sub-second TTFT" → "target <2s" (sync Tavily + reasoning overhead = 2-4s realistically).
- **Tavily param casing fallback documented.** camelCase primary, snake_case fallback.
- **`convertToModelMessages` specified.** Required in AI SDK 5.x for UIMessage → model message conversion.
- **Link hover preview descoped.** Simplified to open-in-new-tab only (custom preview tooltip is low-ROI for v1).
