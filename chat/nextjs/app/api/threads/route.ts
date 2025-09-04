import { NextResponse } from 'next/server';
import { createThread } from '@/src/db/queries/threads';
import { getThreadsOutsideProjects } from '@/src/db/queries/projects';

export async function GET() {
  try {
    const threads = await getThreadsOutsideProjects();
    return NextResponse.json(threads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const title = body.title || 'New Chat';
    const projectId = body.projectId || null;
    
    const thread = await createThread(title, projectId);
    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}