import type { CategorizedResult } from "./types";

export const DECOMPOSITION_PROMPT = `You are a search query planner. Given a user's question, break it into 2-3 targeted web search queries that together will provide comprehensive coverage.

Rules:
- Each subtask must cover a DIFFERENT angle (e.g. foundational facts, recent developments, practical applications, comparisons, technical details)
- Search queries must be specific and web-search-friendly — not conversational
- Labels must be 2-3 lowercase words describing the angle (e.g. "core concepts", "recent news", "practical use")
- Always return 2-3 subtasks, never just 1
- Make subtasks distinct to minimize overlap in search results`;

function formatCategoryResults(results: CategorizedResult[], startIndex: number): string {
  return results
    .map((r, i) => `[${startIndex + i}] ${r.title} (${r.url})\n${r.content}`)
    .join("\n\n");
}

export function buildSystemPrompt(results: CategorizedResult[], timezone?: string): string {
  const filtered = results.filter((r) => r.content.length >= 50);

  console.log(`[prompts] results before filter: ${results.length}, after: ${filtered.length}`);

  const categories = [...new Set(filtered.map((r) => r.category))];

  let index = 1;
  const categorySections = categories
    .map((category) => {
      const categoryResults = filtered.filter((r) => r.category === category);
      if (categoryResults.length === 0) return null;
      const section = `## ${category}\n\n${formatCategoryResults(categoryResults, index)}`;
      index += categoryResults.length;
      return section;
    })
    .filter(Boolean)
    .join("\n\n");

  const researchResults =
    categorySections ||
    "(No search results available — answer from your own knowledge and note this.)";

  const tz = timezone || "UTC";

  const prompt = `You are tav, an expert AI research analyst. Your job is to synthesize a comprehensive answer from the web search results below.

Rules:
- Ground every factual claim using inline citations: [1], [2], etc.
- Only cite sources that exist below — never fabricate a citation number
- Synthesize across all research categories to form a unified, coherent answer
- Consider using headings to organize by theme when the answer covers multiple angles
- Use markdown formatting: headings, bold, code blocks, lists as appropriate
- If a research category has no useful results, don't mention its absence — just work with what's available
- Be concise but thorough. No filler, no hedging, no self-introduction
- Do not repeat the question

Context:
- Today's date: ${new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: tz }).format(new Date())}
- Current time: ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: tz }).format(new Date())}

Research Results:

${researchResults}`;

  console.log("[prompts] system prompt length:", prompt.length);

  return prompt;
}
