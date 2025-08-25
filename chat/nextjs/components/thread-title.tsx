"use client";

import { useState, useTransition, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateThreadTitle } from "@/app/threads/[id]/actions";
import { useThread } from "@/contexts/thread-context";

interface ThreadTitleProps {
  threadId: string;
  title: string;
}

export function ThreadTitle({
  threadId,
  title: initialTitle,
}: ThreadTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [editedTitle, setEditedTitle] = useState(initialTitle);
  const [isPending, startTransition] = useTransition();
  const { updateThreadInList } = useThread();

  useEffect(() => {
    setTitle(initialTitle);
    setEditedTitle(initialTitle);
  }, [initialTitle]);

  const handleSave = () => {
    if (editedTitle.trim() && editedTitle !== title) {
      const newTitle = editedTitle.trim();

      // Optimistic update
      setTitle(newTitle);
      updateThreadInList(threadId, { title: newTitle });

      startTransition(async () => {
        const result = await updateThreadTitle(threadId, newTitle);
        if (result.success) {
          setIsEditing(false);
        } else {
          // Revert on failure
          setTitle(title);
          updateThreadInList(threadId, { title });
        }
      });
    } else {
      setIsEditing(false);
      setEditedTitle(title);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="font-semibold h-auto py-1"
          disabled={isPending}
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isPending}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className="font-semibold">{title}</h1>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
