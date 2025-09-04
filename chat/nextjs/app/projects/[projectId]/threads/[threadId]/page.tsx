"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ThreadTitle } from "@/components/thread-title";
import { ChatInterface } from "@/components/chat-interface";
import { useThread } from "@/contexts/thread-context";
import { useProject } from "@/contexts/project-context";
import { Loader } from "@/components/ai-elements/loader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Thread } from "@/src/db/schema";

export default function ProjectThreadPage() {
  const params = useParams();
  const projectId = typeof params.projectId === "string" ? params.projectId : "";
  const threadId = typeof params.threadId === "string" ? params.threadId : "";
  
  const { getThreadById, selectThread, updateThreadInList } = useThread();
  const { currentProject } = useProject();
  const [thread, setThread] = useState<Thread | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!threadId) return;

    // Stage 1: Use cached thread data from context
    const cachedThread = getThreadById(threadId);
    if (cachedThread) {
      setThread(cachedThread);
      selectThread(threadId);
    }
    setIsInitializing(false);

    // Stage 2: Fetch fresh data in background
    fetch(`/api/threads/${threadId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch thread");
        return res.json();
      })
      .then((data) => {
        const freshThread = data.thread;
        // Only update if there are actual changes
        if (
          freshThread &&
          (!cachedThread ||
            cachedThread.title !== freshThread.title ||
            cachedThread.updatedAt !== freshThread.updatedAt)
        ) {
          setThread(freshThread);
          updateThreadInList(threadId, freshThread);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch fresh thread data:", error);
        // If we don't have cached data and fetch failed, show not found
        if (!cachedThread) {
          setThread(null);
        }
      });
  }, [threadId, getThreadById, selectThread, updateThreadInList]);

  if (isInitializing) {
    return (
      <div className="container mx-auto p-6 h-dvh flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="container mx-auto p-6 h-dvh flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Thread not found</p>
          <p className="text-muted-foreground mb-4">
            The conversation you're looking for doesn't exist or has been deleted.
          </p>
          {currentProject && (
            <Link href={`/projects/${projectId}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {currentProject.name}
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col">
      <div className="px-4 py-2 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentProject && (
              <Link href={`/projects/${projectId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {currentProject.name}
                </Button>
              </Link>
            )}
            <ThreadTitle threadId={thread.id} title={thread.title} />
          </div>
          {currentProject?.instructions && (
            <div className="text-xs text-muted-foreground">
              Project Instructions Active
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <ChatInterface threadId={thread.id} />
      </div>
    </div>
  );
}