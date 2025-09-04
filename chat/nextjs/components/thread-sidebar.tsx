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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import {
  MessageSquare,
  Plus,
  Trash2,
  Folder,
  FolderPlus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Thread } from "@/src/db/schema";

export function ThreadSidebar() {
  const {
    threads,
    currentThread,
    createNewThread,
    deleteThread,
    isLoading,
  } = useThread();

  const {
    projects,
    createProject,
    isLoading: projectsLoading,
  } = useProjects();

  const { currentProject } = useProject();

  const router = useRouter();
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [projectThreads, setProjectThreads] = useState<Record<string, Thread[]>>({});
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Create thread without project (global)
  const handleNewThread = async () => {
    try {
      const thread = await createNewThread();
      router.push(`/threads/${thread.id}`);
    } catch (error) {
      console.error("Failed to create thread:", error);
    }
  };

  // Create thread in specific project
  const handleNewThreadInProject = async (projectId: string) => {
    try {
      const thread = await createNewThread("New Chat", projectId);
      router.push(`/projects/${projectId}/threads/${thread.id}`);
    } catch (error) {
      console.error("Failed to create thread:", error);
    }
  };

  // Fetch threads for a specific project
  const fetchProjectThreads = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/threads`);
      if (response.ok) {
        const threads = await response.json();
        setProjectThreads(prev => ({
          ...prev,
          [projectId]: threads.slice(0, 5) // Limit to 5 most recent
        }));
      }
    } catch (error) {
      console.error("Failed to fetch project threads:", error);
    }
  };

  // Toggle project expansion
  const toggleProject = async (projectId: string) => {
    const newExpandedProjects = new Set(expandedProjects);
    if (newExpandedProjects.has(projectId)) {
      newExpandedProjects.delete(projectId);
    } else {
      newExpandedProjects.add(projectId);
      // Fetch threads when expanding if not already loaded
      if (!projectThreads[projectId]) {
        await fetchProjectThreads(projectId);
      }
    }
    setExpandedProjects(newExpandedProjects);
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
      const project = await createProject(
        newProjectName.trim(),
        newProjectDescription.trim() || undefined
      );
      setNewProjectName("");
      setNewProjectDescription("");
      setIsCreateProjectOpen(false);
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const getThreadHref = (threadId: string, projectId?: string) => {
    return projectId
      ? `/projects/${projectId}/threads/${threadId}`
      : `/threads/${threadId}`;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="space-y-2">
          <div className="divide-primary-foreground/30 inline-flex w-full divide-x rounded-md shadow-xs rtl:space-x-reverse">
            <Button 
              onClick={handleNewThread}
              className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10 flex-1" 
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
                  size="sm"
                  aria-label="Choose project"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <DropdownMenuItem 
                      key={project.id} 
                      onClick={() => handleNewThreadInProject(project.id)}
                    >
                      <Folder className="mr-2 h-4 w-4" />
                      {project.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-muted-foreground">
                    No projects available
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Dialog
            open={isCreateProjectOpen}
            onOpenChange={setIsCreateProjectOpen}
          >
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
                  Projects help you organize related conversations with custom
                  context and instructions.
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
            <Link
              href="/projects"
              className="flex items-center gap-2 hover:underline"
            >
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
                  <Collapsible
                    key={project.id}
                    open={expandedProjects.has(project.id)}
                    onOpenChange={() => toggleProject(project.id)}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentProject?.id === project.id}
                      >
                        <Link href={`/projects/${project.id}`}>
                          <Folder className="h-4 w-4" />
                          <span className="truncate">{project.name}</span>
                        </Link>
                      </SidebarMenuButton>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          {expandedProjects.has(project.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {projectThreads[project.id]?.map((thread) => (
                          <SidebarMenuSubItem key={thread.id}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={currentThread?.id === thread.id}
                            >
                              <Link href={getThreadHref(thread.id, project.id)}>
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
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                        {(!projectThreads[project.id] || projectThreads[project.id].length === 0) && (
                          <div className="px-4 py-2 text-xs text-muted-foreground">
                            No conversations yet
                          </div>
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Current Threads Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            All Conversations
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
                          <AlertDialogTitle>
                            Delete Conversation
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{thread.title}
                            &quot;? This action cannot be undone.
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
