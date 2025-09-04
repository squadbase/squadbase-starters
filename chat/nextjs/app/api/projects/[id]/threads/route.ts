import { NextRequest, NextResponse } from 'next/server';
import { getProjectThreads } from '@/src/db/queries/projects';
import { createThread } from '@/src/db/queries/threads';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    
    const threads = await getProjectThreads(projectId);
    return NextResponse.json(threads);
  } catch (error) {
    console.error('Failed to fetch project threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    const body = await request.json().catch(() => ({}));
    const title = body.title || 'New Chat';
    
    const thread = await createThread(title, projectId);
    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Failed to create project thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}