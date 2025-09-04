import { NextResponse } from 'next/server';
import { getThread, updateThread, deleteThread } from '@/src/db/queries/threads';
import { getMessages, convertToUIMessages } from '@/src/db/queries/messages';

type Params = Promise<{ id: string }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const thread = await getThread(id);
    
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const messages = await getMessages(id);
    const uiMessages = await convertToUIMessages(messages);

    return NextResponse.json({ thread, messages: uiMessages });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const thread = await updateThread(id, body);
    
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error updating thread:', error);
    return NextResponse.json(
      { error: 'Failed to update thread' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    await deleteThread(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
}