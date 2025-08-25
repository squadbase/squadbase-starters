"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
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
import { useThread } from "@/contexts/thread-context";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function ThreadSidebar() {
  const {
    threads,
    currentThread,
    createNewThread,
    selectThread,
    deleteThread,
    isLoading,
  } = useThread();

  const handleNewThread = async () => {
    try {
      await createNewThread();
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

  return (
    <Sidebar>
      <SidebarHeader>
        <Button onClick={handleNewThread} className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="px-2 py-4 text-sm text-muted-foreground">
                  Loading threads...
                </div>
              ) : threads.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                threads.map((thread) => (
                  <SidebarMenuItem key={thread.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={currentThread?.id === thread.id}
                      className="group h-fit"
                      onClick={() => selectThread(thread.id)}
                    >
                      <Link href={`/threads/${thread.id}`}>
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
                          <AlertDialogTitle>Delete Thread</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the thread{" "}
                            {thread.title}? This action cannot be undone.
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
