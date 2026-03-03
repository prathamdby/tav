import { cerebras } from "@ai-sdk/cerebras";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { decomposeQuery } from "@/lib/decompose";
import { buildSystemPrompt } from "@/lib/prompts";
import { extractText, rewriteFollowUp } from "@/lib/rewrite";
import { orchestrateSearch } from "@/lib/search-orchestrator";

export async function POST(req: Request) {
  const { messages, timezone }: { messages: UIMessage[]; timezone?: string } = await req.json();

  const lastUserMessage = messages.filter((m) => m.role === "user").at(-1);
  const query = lastUserMessage ? extractText(lastUserMessage) : "";

  if (!query) {
    return new Response("No query provided", { status: 400 });
  }

  const isFollowUp = messages.filter((m) => m.role === "user").length > 1;
  const searchQuery = isFollowUp ? await rewriteFollowUp(messages, query) : query;

  const wordCount = searchQuery.split(/\s+/).length;
  const subtasks =
    wordCount >= 3 ? await decomposeQuery(searchQuery) : [{ label: "direct", searchQuery }];

  const { status, results: categorizedResults } = await orchestrateSearch(subtasks);

  if (status === "all_failed") {
    return new Response(
      JSON.stringify({
        error: "search_failed",
        message: "Couldn't fetch search results. Please try again.",
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemPrompt = buildSystemPrompt(categorizedResults, timezone);
  console.log(
    `[route] results: ${categorizedResults.length}, systemPrompt length: ${systemPrompt.length}`
  );

  const turnId = crypto.randomUUID().slice(0, 8);
  const windowedMessages = messages.slice(-6);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      categorizedResults.forEach((result, i) => {
        writer.write({
          type: "source-url",
          sourceId: `src-${turnId}-${i + 1}`,
          url: result.url,
          title: `[${result.category}] ${result.title}`,
        });
      });

      const result = streamText({
        model: cerebras("gpt-oss-120b"),
        providerOptions: { cerebras: { reasoningEffort: "medium" } },
        system: systemPrompt,
        messages: await convertToModelMessages(windowedMessages),
      });

      writer.merge(result.toUIMessageStream());
    },
    onError: () => "An error occurred during generation",
  });

  return createUIMessageStreamResponse({ stream });
}
