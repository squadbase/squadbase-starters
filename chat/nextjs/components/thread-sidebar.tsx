"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useThread } from "@/contexts/thread-context";
import { useProjects } from "@/contexts/projects-context";
import { useProject } from "@/contexts/project-context";
import { MessageSquare, Plus, Trash2, Folder, FolderPlus, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ThreadSidebar() {
  const {
    threads,
    currentThread,
    createNewThread,
    selectThread,
    deleteThread,
    isLoading,
  } = useThread();
  
  const {
    projects,
    createProject,
    deleteProject,
    isLoading: projectsLoading,
  } = useProjects();
  
  const { isInProject, currentProject } = useProject();
  
  const router = useRouter();
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const handleNewThread = async () => {
    try {
      const thread = await createNewThread();
      const href = isInProject 
        ? `/projects/${currentProject?.id}/threads/${thread.id}`
        : `/threads/${thread.id}`;
      router.push(href);
    } catch (error) {
      console.error("Failed to create thread:", error);
    }
  };

  const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    try {
      await deleteThread(threadId);
    } catch (error) {
      console.error("Failed to delete thread:", error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      const project = await createProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
      setNewProjectName("");
      setNewProjectDescription("");
      setIsCreateProjectOpen(false);
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      await deleteProject(projectId);
      router.push('/');
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const getThreadHref = (threadId: string) => {
    return isInProject 
      ? `/projects/${currentProject?.id}/threads/${threadId}`
      : `/threads/${threadId}`;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="space-y-2">
          <Button onClick={handleNewThread} className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {isInProject ? "New Chat" : "New Chat"}
          </Button>
          
          <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" size="sm">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Projects help you organize related conversations with custom context and instructions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Brief description of the project"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateProjectOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                >
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Projects Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <Link href="/projects" className="flex items-center gap-2 hover:underline">
              <Folder className="h-4 w-4" />
              Projects
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectsLoading ? (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  No projects yet
                </div>
              ) : (
                projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={currentProject?.id === project.id}
                    >
                      <Link href={`/projects/${project.id}`}>
                        <Folder className="h-4 w-4" />
                        <span className="truncate">{project.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    <SidebarMenuAction showOnHover>
                      <Link href={`/projects/${project.id}/settings`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </SidebarMenuAction>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <Trash2 className="h-4 w-4" />
                        </SidebarMenuAction>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{project.name}"? 
                            This will permanently delete all conversations in this project. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => handleDeleteProject(e, project.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Project
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Current Threads Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {isInProject ? `${currentProject?.name} Conversations` : "All Conversations"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  Loading conversations...
                </div>
              ) : threads.length === 0 ? (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                threads.map((thread) => (
                  <SidebarMenuItem key={thread.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={currentThread?.id === thread.id}
                      className="group h-fit"
                    >
                      <Link href={getThreadHref(thread.id)}>
                        <MessageSquare className="h-4 w-4" />
                        <div className="flex-1 truncate">
                          <div className="truncate text-sm">{thread.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(thread.lastMessageAt),
                              { addSuffix: true }
                            )}
                          </div>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <Trash2 className="h-4 w-4" />
                        </SidebarMenuAction>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{thread.title}"? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => handleDeleteThread(e, thread.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
