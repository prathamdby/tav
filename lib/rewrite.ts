import { cerebras } from "@ai-sdk/cerebras";
import { generateText, type UIMessage } from "ai";

export function extractText(msg: UIMessage): string {
  return (
    (msg.parts?.find((p) => p.type === "text") as { type: "text"; text: string } | undefined)
      ?.text ?? ""
  );
}

export async function rewriteFollowUp(messages: UIMessage[], query: string): Promise<string> {
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
