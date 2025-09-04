'use client';

import { useProjects } from '@/contexts/projects-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Folder, Plus, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function ProjectsPage() {
  const { projects, isLoading } = useProjects();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-muted-foreground">
              Organize your conversations into projects for better context management.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-lg font-semibold mb-2">No projects yet</div>
            <div className="text-muted-foreground text-center mb-6 max-w-sm">
              Create your first project to organize related conversations with custom context and instructions.
            </div>
            <div className="text-sm text-muted-foreground">
              Use the "New Project" button in the sidebar to get started.
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Folder className="h-5 w-5" />
                      <Link 
                        href={`/projects/${project.id}`}
                        className="hover:underline truncate"
                      >
                        {project.name}
                      </Link>
                    </CardTitle>
                    <Link href={`/projects/${project.id}/settings`}>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  {project.description && (
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </span>
                    <span className="capitalize">
                      {project.memoryMode === 'project-only' ? 'Isolated' : 'Connected'}
                    </span>
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