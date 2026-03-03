import { cerebras } from "@ai-sdk/cerebras";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { buildSystemPrompt } from "@/lib/prompts";
import { searchTavily } from "@/lib/tavily";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const lastUserMessage = messages.filter((m) => m.role === "user").at(-1);
  const query =
    (
      lastUserMessage?.parts?.find((p) => p.type === "text") as
        | { type: "text"; text: string }
        | undefined
    )?.text ?? "";

  if (!query) {
    return new Response("No query provided", { status: 400 });
  }

  let searchResults: Awaited<ReturnType<typeof searchTavily>> = [];
  try {
    searchResults = await searchTavily(query);
  } catch {
    return new Response("Search failed", { status: 502 });
  }

  const systemPrompt = buildSystemPrompt(searchResults);
  console.log(
    `[route] searchResults count: ${searchResults.length}, systemPrompt length: ${systemPrompt.length}`
  );
  const windowedMessages = messages.slice(-6);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      searchResults.forEach((result, i) => {
        writer.write({
          type: "source-url",
          sourceId: `source-${i + 1}`,
          url: result.url,
          title: result.title,
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
