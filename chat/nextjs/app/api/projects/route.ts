import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { projects, type NewProject } from '@/src/db/schema';
import { nanoid } from 'nanoid';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));

    return NextResponse.json(allProjects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, instructions, memoryMode = 'default' } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const newProject: NewProject = {
      id: nanoid(),
      name: name.trim(),
      description: description?.trim() || null,
      instructions: instructions?.trim() || null,
      memoryMode: memoryMode as 'project-only' | 'default',
    };

    const [createdProject] = await db
      .insert(projects)
      .values(newProject)
      .returning();

    return NextResponse.json(createdProject);
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}