export interface Subtask {
  label: string;
  searchQuery: string;
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  favicon: string;
}

export interface CategorizedResult extends SearchResult {
  category: string;
}

export interface SearchConfig {
  query: string;
  maxResults?: number;
  searchDepth?: "basic" | "advanced";
}

export interface OrchestrateResult {
  status: "ok" | "all_failed";
  results: CategorizedResult[];
}
