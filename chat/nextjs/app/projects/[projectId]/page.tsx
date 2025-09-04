'use client';

import { useProject } from '@/contexts/project-context';
import { useThread } from '@/contexts/thread-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MessageSquare, Plus, Settings, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function ProjectPage({ params: paramsPromise }: ProjectPageProps) {
  const { currentProject, isLoading: projectLoading } = useProject();
  const { threads, isLoading: threadsLoading, createNewThread } = useThread();
  const router = useRouter();

  const handleNewThread = async () => {
    try {
      const thread = await createNewThread();
      router.push(`/projects/${currentProject?.id}/threads/${thread.id}`);
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  if (projectLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Project not found</div>
          <div className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </div>
          <Link href="/projects">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  All Projects
                </Button>
              </Link>
            </div>
            <h1 className="text-2xl font-semibold">{currentProject.name}</h1>
            {currentProject.description && (
              <p className="text-muted-foreground mt-1">
                {currentProject.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewThread}>
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
            <Link href={`/projects/${currentProject.id}/settings`}>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Memory Mode: <span className="font-medium">
              {currentProject.memoryMode === 'project-only' ? 'Project Only' : 'Default'}
            </span></div>
            {currentProject.instructions && (
              <div>Custom Instructions: <span className="font-medium">Configured</span></div>
            )}
          </div>
        </div>

        {threadsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading conversations...</div>
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-lg font-semibold mb-2">No conversations yet</div>
            <div className="text-muted-foreground text-center mb-6 max-w-sm">
              Start your first conversation in this project. All chats will follow the project's context and instructions.
            </div>
            <Button onClick={handleNewThread}>
              <Plus className="h-4 w-4 mr-2" />
              Start First Conversation
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {threads.map((thread) => (
              <Card key={thread.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <Link 
                      href={`/projects/${currentProject.id}/threads/${thread.id}`}
                      className="hover:underline truncate"
                    >
                      {thread.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Last updated {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}