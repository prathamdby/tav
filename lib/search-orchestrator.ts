import { searchTavily } from "./tavily";
import type { CategorizedResult, OrchestrateResult, Subtask } from "./types";

export async function orchestrateSearch(subtasks: Subtask[]): Promise<OrchestrateResult> {
  const settled = await Promise.allSettled(
    subtasks.map((subtask) =>
      searchTavily({
        query: subtask.searchQuery,
        maxResults: 4,
        searchDepth: "advanced",
      }).then((results) => results.map((r) => ({ ...r, category: subtask.label })))
    )
  );

  const allFailed = settled.every((s) => s.status === "rejected");
  if (allFailed) {
    return { status: "all_failed", results: [] };
  }

  const allResults: CategorizedResult[] = settled
    .filter((s): s is PromiseFulfilledResult<CategorizedResult[]> => s.status === "fulfilled")
    .flatMap((s) => s.value);

  settled.forEach((s, i) => {
    if (s.status === "rejected") {
      console.error(`[orchestrator] subtask ${i} failed:`, s.reason);
    }
  });

  const seen = new Map<string, CategorizedResult>();
  for (const result of allResults) {
    const existing = seen.get(result.url);
    if (!existing || result.score > existing.score) {
      seen.set(result.url, result);
    }
  }

  const deduped = [...seen.values()]
    .filter((r) => r.content.length >= 50)
    .sort((a, b) => b.score - a.score);

  return { status: "ok", results: deduped };
}
