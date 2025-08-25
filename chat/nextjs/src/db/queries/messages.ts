import { db } from '@/src/db';
import { messages, type Message, type NewMessage } from '@/src/db/schema';
import { eq, asc } from 'drizzle-orm';
import { generateId } from 'ai';
import type { UIMessage } from 'ai';
import { updateThreadLastMessage } from './threads';

export async function createMessage(
  threadId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<Message> {
  const newMessage: NewMessage = {
    id: generateId(),
    threadId,
    role,
    content,
    createdAt: new Date(),
  };

  const [message] = await db.insert(messages).values(newMessage).returning();
  
  // Update thread's last message timestamp
  await updateThreadLastMessage(threadId);
  
  return message;
}

export async function getMessages(threadId: string): Promise<Message[]> {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.threadId, threadId))
    .orderBy(asc(messages.createdAt));
}

export async function deleteMessage(id: string): Promise<void> {
  await db.delete(messages).where(eq(messages.id, id));
}

export async function saveUIMessages(
  threadId: string,
  uiMessages: UIMessage[]
): Promise<void> {
  // Convert UI messages to database messages
  const newMessages: NewMessage[] = uiMessages.map((msg) => ({
    id: msg.id,
    threadId,
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.parts
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join(''),
    createdAt: new Date(),
  }));

  if (newMessages.length > 0) {
    await db.insert(messages).values(newMessages).onConflictDoNothing();
    await updateThreadLastMessage(threadId);
  }
}

export async function convertToUIMessages(dbMessages: Message[]): Promise<UIMessage[]> {
  return dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as UIMessage['role'],
    parts: [{ type: 'text', text: msg.content }],
    createdAt: msg.createdAt,
  }));
}