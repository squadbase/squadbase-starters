import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { saveUIMessages } from "@/src/db/queries/messages";
import { updateThread } from "@/src/db/queries/threads";

// Node runtime for database operations
export const runtime = "nodejs";
// ストリーミング許可時間（秒）
export const maxDuration = 90;

export async function POST(req: Request) {
  const { messages, threadId }: { messages: UIMessage[]; threadId: string } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: "You are a helpful assistant.",
    messages: convertToModelMessages(messages),
  });

  // Auto-generate thread title from first message if needed
  if (messages.length === 1) {
    const firstMessage = messages[0];
    if (firstMessage.role === 'user') {
      const content = firstMessage.parts
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('');
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      await updateThread(threadId, { title });
    }
  }

  // parts（text/reasoning/source/tool など）でUI向けに返す
  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    sendReasoning: true,
    sendSources: true,
    onFinish: async ({ messages: allMessages }) => {
      // Save messages to database
      await saveUIMessages(threadId, allMessages);
    },
  });
}
