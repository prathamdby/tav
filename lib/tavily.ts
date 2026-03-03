import { tavily } from "@tavily/core";
import { getEnv } from "./env";
import type { SearchConfig, SearchResult } from "./types";

export async function searchTavily(config: SearchConfig): Promise<SearchResult[]> {
  const { query, maxResults = 5, searchDepth = "advanced" } = config;
  const tvly = tavily({ apiKey: getEnv().TAVILY_API_KEY });

  const response = await tvly.search(query, {
    searchDepth,
    maxResults,
    includeFavicon: true,
  });

  const results = (response.results ?? []).map((r) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    content: r.content ?? "",
    score: r.score ?? 0,
    favicon: (r as { favicon?: string }).favicon ?? "",
  }));

  console.log(
    "[tavily] raw results:",
    results.map((r) => ({
      title: r.title,
      url: r.url,
      contentLength: r.content.length,
      preview: r.content.slice(0, 120),
    }))
  );

  return results;
}
