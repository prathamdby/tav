# tav

Fast AI search engine. Query → streamed answer from live web results with inline source citations. No accounts, no clutter.

## Features

- Cerebras `gpt-oss-120b` for fast inference
- Tavily Search for real-time grounding
- Multi-turn follow-up questions
- Rich markdown with code highlighting
- Dark theme, minimal UI

## Stack

- Next.js App Router + RSC
- Vercel AI SDK + `@ai-sdk/cerebras` + `@ai-sdk/react`
- Tavily Search API
- Tailwind v4 + shadcn/ui
- Biome + Bun

## Setup

**Prerequisites:** [Bun](https://bun.sh)

```bash
bun install
cp .env.example .env
```

Edit `.env`:

```
CEREBRAS_API_KEY=   # https://cloud.cerebras.ai
TAVILY_API_KEY=     # https://app.tavily.com
```

## Commands

| Command         | Description           |
| --------------- | --------------------- |
| `bun dev`       | Start dev server      |
| `bun build`     | Production build      |
| `bun start`     | Run production server |
| `bun lint`      | Biome check           |
| `bun format`    | Biome format          |
| `bun typecheck` | TypeScript check      |

## Structure

```
app/
  page.tsx           # Home → SearchPage
  layout.tsx         # Root layout, Geist fonts
  api/search/route.ts
components/
  search-page.tsx    # Main UI
  search-thread.tsx  # Chat thread
  search-input.tsx
  answer-block.tsx
  markdown-renderer.tsx
  source-cards.tsx
  thinking-block.tsx
lib/
  env.ts             # Env validation
  tavily.ts
  prompts.ts
```

## Deploy

Vercel. Push to deploy. Set env vars in project settings.

## License

MIT — see [LICENSE](./LICENSE).

---

Full spec: [SPEC.md](./SPEC.md)
