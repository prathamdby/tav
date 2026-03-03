import { cerebras } from "@ai-sdk/cerebras";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  type UIMessage,
} from "ai";
import { buildSystemPrompt } from "@/lib/prompts";
import { searchTavily } from "@/lib/tavily";

function extractText(msg: UIMessage): string {
  return (
    (msg.parts?.find((p) => p.type === "text") as { type: "text"; text: string } | undefined)
      ?.text ?? ""
  );
}

async function rewriteFollowUp(messages: UIMessage[], query: string): Promise<string> {
  const history = messages
    .slice(-6)
    .map((m) => `${m.role}: ${extractText(m)}`)
    .filter((line) => !line.endsWith(": "))
    .join("\n");

  const { text } = await generateText({
    model: cerebras("gpt-oss-120b"),
    system:
      "Rewrite the user's follow-up question into a standalone web search query. Use the conversation history for context. Output ONLY the search query, nothing else.",
    prompt: `Conversation history:\n${history}\n\nFollow-up question: ${query}`,
  });

  const rewritten = text.trim();
  console.log(`[route] rewrite: "${query}" → "${rewritten}"`);
  return rewritten || query;
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const lastUserMessage = messages.filter((m) => m.role === "user").at(-1);
  const query = lastUserMessage ? extractText(lastUserMessage) : "";

  if (!query) {
    return new Response("No query provided", { status: 400 });
  }

  const isFollowUp = messages.filter((m) => m.role === "user").length > 1;
  const searchQuery = isFollowUp ? await rewriteFollowUp(messages, query) : query;

  let searchResults: Awaited<ReturnType<typeof searchTavily>> = [];
  try {
    searchResults = await searchTavily({ query: searchQuery });
  } catch {
    return new Response("Search failed", { status: 502 });
  }

  const systemPrompt = buildSystemPrompt(searchResults);
  console.log(
    `[route] searchResults count: ${searchResults.length}, systemPrompt length: ${systemPrompt.length}`
  );

  const turnId = crypto.randomUUID().slice(0, 8);
  const windowedMessages = messages.slice(-6);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      searchResults.forEach((result, i) => {
        writer.write({
          type: "source-url",
          sourceId: `src-${turnId}-${i + 1}`,
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
