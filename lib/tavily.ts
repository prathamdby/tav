import { tavily } from "@tavily/core";
import { getEnv } from "./env";

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  favicon: string;
}

export async function searchTavily(query: string): Promise<SearchResult[]> {
  const tvly = tavily({ apiKey: getEnv().TAVILY_API_KEY });

  const response = await tvly.search(query, {
    searchDepth: "basic",
    maxResults: 5,
    includeFavicon: true,
  });

  return (response.results ?? []).map((r) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    content: r.content ?? "",
    score: r.score ?? 0,
    favicon: (r as { favicon?: string }).favicon ?? "",
  }));
}
