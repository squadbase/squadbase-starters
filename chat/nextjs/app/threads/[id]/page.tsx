"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ThreadTitle } from "@/components/thread-title";
import { ChatInterface } from "@/components/chat-interface";
import { useThread } from "@/contexts/thread-context";
import { Loader } from "@/components/ai-elements/loader";
import type { Thread } from "@/src/db/schema";

export default function ThreadPage() {
  const { id } = useParams();
  const threadId = typeof id === "string" ? id : "";
  const { getThreadById, selectThread, updateThreadInList } = useThread();
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
        <p className="text-muted-foreground">Thread not found</p>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col">
      <div className="px-4 py-2 border-b flex-shrink-0">
        <ThreadTitle threadId={thread.id} title={thread.title} />
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <ChatInterface threadId={thread.id} />
      </div>
    </div>
  );
}
