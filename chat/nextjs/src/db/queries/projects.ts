import { db } from '@/src/db';
import { projects, threads, type Project, type Thread } from '@/src/db/schema';
import { eq, desc, isNull, and } from 'drizzle-orm';

export async function getProjects(): Promise<Project[]> {
  return await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt));
}

export async function getProject(id: string): Promise<Project | undefined> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));
  return project;
}

export async function getProjectThreads(projectId: string): Promise<Thread[]> {
  return await db
    .select()
    .from(threads)
    .where(eq(threads.projectId, projectId))
    .orderBy(desc(threads.lastMessageAt));
}

export async function getThreadsOutsideProjects(): Promise<Thread[]> {
  return await db
    .select()
    .from(threads)
    .where(isNull(threads.projectId))
    .orderBy(desc(threads.lastMessageAt));
}

export async function moveThreadToProject(
  threadId: string,
  projectId: string | null
): Promise<Thread | undefined> {
  const [updated] = await db
    .update(threads)
    .set({
      projectId,
      updatedAt: new Date(),
    })
    .where(eq(threads.id, threadId))
    .returning();
  return updated;
}