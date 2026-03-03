import type { SearchResult } from "./types";

function formatResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return "(No search results available — answer from your own knowledge and note this.)";
  }

  return results
    .map(
      (r, i) => `[${i + 1}] ${r.title} (${r.url})
${r.content}`
    )
    .join("\n\n");
}

export function buildSystemPrompt(results: SearchResult[]): string {
  const filtered = results.filter((r) => r.content.length >= 50);

  console.log(`[prompts] results before filter: ${results.length}, after: ${filtered.length}`);

  const prompt = `You are tav, a fast and accurate AI search engine. Your job is to answer the user's question using the provided web search results.

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
${formatResults(filtered)}`;

  console.log("[prompts] system prompt length:", prompt.length);

  return prompt;
}
