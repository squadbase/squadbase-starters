import { db } from '@/src/db';
import { threads, messages, type Thread, type NewThread } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateId } from 'ai';

export async function createThread(title?: string, projectId?: string): Promise<Thread> {
  const id = generateId();
  const newThread: NewThread = {
    id,
    title: title || 'New Chat',
    projectId: projectId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessageAt: new Date(),
  };

  const [thread] = await db.insert(threads).values(newThread).returning();
  return thread;
}

export async function getThreads(): Promise<Thread[]> {
  return await db
    .select()
    .from(threads)
    .orderBy(desc(threads.lastMessageAt));
}

export async function getThread(id: string): Promise<Thread | undefined> {
  const [thread] = await db
    .select()
    .from(threads)
    .where(eq(threads.id, id));
  return thread;
}

export async function updateThread(
  id: string,
  data: Partial<Omit<Thread, 'id' | 'createdAt'>>
): Promise<Thread | undefined> {
  const [updated] = await db
    .update(threads)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(threads.id, id))
    .returning();
  return updated;
}

export async function deleteThread(id: string): Promise<void> {
  await db.delete(threads).where(eq(threads.id, id));
}

export async function updateThreadLastMessage(threadId: string): Promise<void> {
  await db
    .update(threads)
    .set({
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(threads.id, threadId));
}