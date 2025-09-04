'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Thread } from '@/src/db/schema';

interface ThreadContextValue {
  threads: Thread[];
  currentThread: Thread | null;
  isLoading: boolean;
  createNewThread: (title?: string) => Promise<Thread>;
  deleteThread: (threadId: string) => Promise<void>;
  refreshThreads: () => Promise<void>;
  selectThread: (threadId: string) => void;
  getThreadById: (threadId: string) => Thread | undefined;
  updateThreadInList: (threadId: string, updates: Partial<Thread>) => void;
}

const ThreadContext = createContext<ThreadContextValue | undefined>(undefined);

export function ThreadProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;

  const refreshThreads = useCallback(async () => {
    try {
      let url = '/api/threads';
      if (projectId) {
        url = `/api/projects/${projectId}/threads`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const createNewThread = useCallback(async (title: string = 'New Chat') => {
    try {
      let url = '/api/threads';
      let body: any = { title };
      
      if (projectId) {
        url = `/api/projects/${projectId}/threads`;
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
  }, [projectId]);

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