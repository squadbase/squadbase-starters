import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { saveUIMessages } from "@/src/db/queries/messages";
import { updateThread } from "@/src/db/queries/threads";
import { getProject } from "@/src/db/queries/projects";

// Node runtime for database operations
export const runtime = "nodejs";
// ストリーミング許可時間（秒）
export const maxDuration = 90;

export async function POST(req: Request) {
  const { messages, threadId, projectId }: { 
    messages: UIMessage[]; 
    threadId: string;
    projectId?: string | null;
  } = await req.json();

  // Get project instructions if in a project
  let systemMessage = "You are a helpful assistant.";
  if (projectId) {
    const project = await getProject(projectId);
    if (project?.instructions) {
      systemMessage = `You are a helpful assistant. 

Project Context: You are operating within a project called "${project.name}". Please follow these project-specific instructions:

${project.instructions}

${project.memoryMode === 'project-only' 
  ? 'Note: You should only reference information from conversations within this project.' 
  : 'Note: You can reference information from previous conversations and general knowledge as appropriate.'
}`;
    }
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemMessage,
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
