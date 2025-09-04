'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/contexts/project-context';
import { useProjects } from '@/contexts/projects-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ProjectSettingsPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function ProjectSettingsPage({ params: paramsPromise }: ProjectSettingsPageProps) {
  const { currentProject, isLoading } = useProject();
  const { updateProject, deleteProject } = useProjects();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [memoryMode, setMemoryMode] = useState<'default' | 'project-only'>('default');
  const [isSaving, setIsSaving] = useState(false);
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    paramsPromise.then(({ projectId }) => {
      setProjectId(projectId);
    });
  }, [paramsPromise]);

  useEffect(() => {
    if (currentProject) {
      setName(currentProject.name);
      setDescription(currentProject.description || '');
      setInstructions(currentProject.instructions || '');
      setMemoryMode(currentProject.memoryMode);
    }
  }, [currentProject]);

  const handleSave = async () => {
    if (!currentProject || !name.trim()) return;
    
    setIsSaving(true);
    try {
      await updateProject(currentProject.id, {
        name: name.trim(),
        description: description.trim() || null,
        instructions: instructions.trim() || null,
        memoryMode,
      });
      router.push(`/projects/${currentProject.id}`);
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProject) return;
    
    try {
      await deleteProject(currentProject.id);
      router.push('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading project settings...</div>
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
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${projectId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Project Settings</h1>
            <p className="text-muted-foreground">
              Configure settings for "{currentProject.name}"
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Basic information about your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the project (optional)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Context Management</CardTitle>
            <CardDescription>
              Configure how the AI handles context and memory for this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="memoryMode">Memory Mode</Label>
              <Select value={memoryMode} onValueChange={(value: 'default' | 'project-only') => setMemoryMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    Default - Can reference personal memory and other chats
                  </SelectItem>
                  <SelectItem value="project-only">
                    Project Only - Only reference chats within this project
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose how the AI should handle context when responding in this project.
                Project-only mode provides more focused, isolated conversations.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructions">Project Instructions</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Custom instructions for this project (optional)&#10;&#10;Example:&#10;- Always respond in Japanese&#10;- Focus on technical implementation details&#10;- Use formal tone"
                rows={8}
              />
              <p className="text-sm text-muted-foreground">
                These instructions will be automatically included in all conversations within this project.
                They override your global custom instructions for this project only.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{currentProject.name}"? 
                  This will permanently delete all conversations in this project. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button 
            onClick={handleSave} 
            disabled={isSaving || !name.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}