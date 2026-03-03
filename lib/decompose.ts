import { cerebras } from "@ai-sdk/cerebras";
import { generateObject } from "ai";
import { z } from "zod";
import { DECOMPOSITION_PROMPT } from "./prompts";
import type { Subtask } from "./types";

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms)
  );
  return Promise.race([promise, timeout]);
}

const subtaskSchema = z.object({
  subtasks: z.array(
    z.object({
      label: z.string().describe("2-3 word lowercase category label"),
      searchQuery: z.string().describe("Targeted web search query"),
    })
  ),
});

export async function decomposeQuery(query: string): Promise<Subtask[]> {
  try {
    const { object } = await withTimeout(
      generateObject({
        model: cerebras("gpt-oss-120b"),
        schema: subtaskSchema,
        prompt: `${DECOMPOSITION_PROMPT}\n\nUser query: ${query}`,
        temperature: 0.2,
      }),
      5000
    );
    console.log("[decompose] subtasks:", object.subtasks);
    return object.subtasks;
  } catch (err) {
    console.error("[decompose] fallback to direct search:", err);
    return [{ label: "direct", searchQuery: query }];
  }
}
