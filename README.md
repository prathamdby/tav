<p align="center">
  <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" />
  <img src="https://img.shields.io/badge/cerebras-000000?style=for-the-badge" alt="Cerebras" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge" alt="License" />
</p>

<h1 align="center">tav</h1>
<p align="center"><strong>Fast AI search engine. No accounts. No clutter. Just answers.</strong></p>

<p align="center">
  <i>Query to streamed answer from live web results with inline source citations, built for speed.</i>
</p>

<br />

---

## Features

- **Blazing fast inference** -- Powered by Cerebras `gpt-oss-120b` for sub-2s time-to-first-token
- **Live web grounding** -- Every answer backed by real-time Tavily Search results
- **Multi-turn conversations** -- Ask follow-ups with full thread context
- **Rich markdown answers** -- Headings, lists, code blocks with syntax highlighting, tables, and more
- **Inline source citations** -- Every claim cites its source; click to jump to the card
- **Minimal dark theme** -- Clean, distraction-free UI with Geist typography
- **Keyboard-first** -- Full keyboard shortcuts for power users
- **Streaming responses** -- See answers token-by-token as they're generated
- **No accounts** -- No sign-up, no login, no tracking

---

## Stack

| Layer               | Technology                                                                     |
| ------------------- | ------------------------------------------------------------------------------ |
| **Framework**       | [Next.js](https://nextjs.org) (App Router) + RSC                               |
| **AI Inference**    | [Cerebras](https://cloud.cerebras.ai) `gpt-oss-120b` via `@ai-sdk/cerebras`    |
| **AI SDK**          | [Vercel AI SDK](https://sdk.vercel.ai) 5.x -- `streamText`, `UIMessageStream`  |
| **Search API**      | [Tavily](https://tavily.com) -- LLM-optimized web search                       |
| **Styling**         | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| **Typography**      | [Geist](https://vercel.com/font) -- Sans + Mono                                |
| **Markdown**        | `react-markdown` + `remark-gfm` + `rehype-highlight` (GitHub Dark theme)       |
| **Animation**       | [Motion](https://motion.dev) (formerly Framer Motion)                          |
| **Linting**         | [Biome](https://biomejs.dev)                                                   |
| **Package Manager** | [Bun](https://bun.sh)                                                          |
| **Deployment**      | [Vercel](https://vercel.com) -- push-to-deploy                                 |

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (>= 1.0)

### Setup

```bash
# Clone the repository
git clone https://github.com/prathamdby/tav
cd tav

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
CEREBRAS_API_KEY=   # Get yours at https://cloud.cerebras.ai
TAVILY_API_KEY=     # Get yours at https://app.tavily.com
```

### Development

```bash
bun dev        # Start the dev server (http://localhost:3000)
```

### Production

```bash
bun build      # Production build
bun start      # Run the production server
```

---

## Commands

| Command            | Description                   |
| ------------------ | ----------------------------- |
| `bun dev`          | Start development server      |
| `bun build`        | Create a production build     |
| `bun start`        | Run the production server     |
| `bun lint`         | Run Biome linter              |
| `bun format`       | Format code with Biome        |
| `bun typecheck`    | Run TypeScript type checking  |

---

## Project Structure

```
tav/
├── app/
│   ├── page.tsx                        # Landing page to SearchPage
│   ├── layout.tsx                      # Root layout with Geist fonts
│   ├── globals.css                     # Global styles, dark theme, CSS vars
│   ├── favicon.ico                     # Geometric "t" favicon
│   ├── opengraph-image.tsx             # OG image generation
│   └── api/
│       └── search/
│           └── route.ts                # POST handler: Tavily to Cerebras stream
├── components/
│   ├── search-page.tsx                 # Main UI shell
│   ├── search-thread.tsx               # Chat thread with useChat
│   ├── search-input.tsx                # Auto-expanding textarea with shortcuts
│   ├── answer-block.tsx                # Single Q&A turn composition
│   ├── markdown-renderer.tsx           # Markdown with inline citation parsing
│   ├── source-card.tsx                 # Individual source card
│   ├── source-cards.tsx                # Horizontal source card row
│   ├── thinking-block.tsx              # Collapsible reasoning tokens
│   ├── copy-button.tsx                 # Clipboard copy button
│   ├── stop-button.tsx                 # Stop generation button
│   └── scroll-to-bottom.tsx            # Scroll-to-bottom floating button
├── lib/
│   ├── env.ts                          # Environment variable validation (zod)
│   ├── tavily.ts                       # Tavily search utility
│   ├── prompts.ts                      # System prompt template
│   ├── decompose.ts                    # Query decomposition planner
│   ├── rewrite.ts                      # Follow-up query rewriting
│   ├── search-orchestrator.ts          # Multi-query parallel search orchestrator
│   └── types.ts                        # Shared type definitions
├── .env.example                        # Template for API keys
├── SPEC.md                             # Full product specification
├── package.json
├── tsconfig.json
├── next.config.ts
├── biome.json
└── postcss.config.ts
```

---

## How It Works

1. **You type a query** -- the search input captures your question
2. **Query is decomposed** -- for complex queries (3+ words), Cerebras breaks the question into targeted sub-queries for comprehensive coverage
3. **Parallel search** -- the orchestrator runs searches across all sub-queries simultaneously, deduplicates results, and filters for quality
4. **Answer generation** -- Cerebras `gpt-oss-120b` synthesizes a grounded response with inline citations from the aggregated results
5. **Results stream to you** -- sources appear first, then the answer streams token-by-token
6. **Ask follow-ups** -- each follow-up is rewritten into a standalone search query, decomposed, and searched fresh with conversation context maintained

---

## Keyboard Shortcuts

| Shortcut              | Action                              |
| --------------------- | ----------------------------------- |
| `Enter`               | Submit query                        |
| `Shift + Enter`       | Insert newline                      |
| `Ctrl + Enter`        | Submit query (alternative)          |
| `/`                   | Focus the search input              |
| `Esc` (with text)     | Clear the input                     |
| `Esc` (empty input)   | Reset to landing page               |

---

## Deployment

Deploy instantly on [Vercel](https://vercel.com):

1. Push the repo to GitHub
2. Import into Vercel
3. Set `CEREBRAS_API_KEY` and `TAVILY_API_KEY` in project settings
4. Deploy -- that's it!

---

## License

**MIT** -- see [LICENSE](./LICENSE) for details.

---

<p align="center">
  <sub>Built by <a href="https://github.com/prathamdby">Pratham Dubey</a> -- full spec in <a href="./SPEC.md">SPEC.md</a></sub>
</p>
