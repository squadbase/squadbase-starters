'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Thread } from '@/src/db/schema';

interface ThreadContextValue {
  threads: Thread[];
  currentThread: Thread | null;
  isLoading: boolean;
  createNewThread: (title?: string, projectId?: string) => Promise<Thread>;
  deleteThread: (threadId: string) => Promise<void>;
  refreshThreads: () => Promise<void>;
  selectThread: (threadId: string) => void;
  getThreadById: (threadId: string) => Thread | undefined;
  updateThreadInList: (threadId: string, updates: Partial<Thread>) => void;
}

const ThreadContext = createContext<ThreadContextValue | undefined>(undefined);

export function ThreadProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshThreads = useCallback(async () => {
    try {
      // Always fetch global threads, not project-scoped
      const response = await fetch('/api/threads');
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewThread = useCallback(async (title: string = 'New Chat', targetProjectId?: string) => {
    try {
      let url = '/api/threads';
      let body: any = { title };
      
      // Only use project URL if explicitly specified
      if (targetProjectId) {
        url = `/api/projects/${targetProjectId}/threads`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        const newThread = await response.json();
        setThreads(prev => [newThread, ...prev]);
        return newThread;
      }
      throw new Error('Failed to create thread');
    } catch (error) {
      console.error('Failed to create thread:', error);
      throw error;
    }
  }, []);

  const deleteThread = useCallback(async (threadId: string) => {
    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setThreads(prev => prev.filter(t => t.id !== threadId));
        if (currentThread?.id === threadId) {
          setCurrentThread(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete thread:', error);
      throw error;
    }
  }, [currentThread]);

  const selectThread = useCallback((threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setCurrentThread(thread);
    }
  }, [threads]);

  const getThreadById = useCallback((threadId: string) => {
    return threads.find(t => t.id === threadId);
  }, [threads]);

  const updateThreadInList = useCallback((threadId: string, updates: Partial<Thread>) => {
    setThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, ...updates } : t
    ));
    if (currentThread?.id === threadId) {
      setCurrentThread(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [currentThread]);

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  return (
    <ThreadContext.Provider
      value={{
        threads,
        currentThread,
        isLoading,
        createNewThread,
        deleteThread,
        refreshThreads,
        selectThread,
        getThreadById,
        updateThreadInList,
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
}

export function useThread() {
  const context = useContext(ThreadContext);
  if (!context) {
    throw new Error('useThread must be used within ThreadProvider');
  }
  return context;
}