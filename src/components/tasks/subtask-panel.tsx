"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import type { SubtaskRow } from "@/app/(app)/tasks/subtask-actions";
import {
  createSubtask,
  deleteSubtask,
  toggleSubtask,
  updateSubtask,
} from "@/app/(app)/tasks/subtask-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface SubtaskPanelProps {
  taskId: string;
  initialSubtasks?: SubtaskRow[];
  onSubtasksChange?: (updated: SubtaskRow[]) => void;
}

export function SubtaskPanel({ taskId, initialSubtasks, onSubtasksChange }: SubtaskPanelProps) {
  const [subtasks, setSubtasks] = useState<SubtaskRow[]>(initialSubtasks ?? []);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const editInputRef = useRef<HTMLInputElement>(null);
  const onSubtasksChangeRef = useRef(onSubtasksChange);
  useEffect(() => {
    onSubtasksChangeRef.current = onSubtasksChange;
  });
  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const update = (next: SubtaskRow[]) => {
    setSubtasks(next);
    onSubtasksChangeRef.current?.(next);
  };

  const handleToggle = (id: string, checked: boolean) => {
    const next = subtasks.map((s) => (s.id === id ? { ...s, completed: checked } : s));
    update(next);
    startTransition(async () => {
      await toggleSubtask(id, checked);
    });
  };

  const handleStartEdit = (subtask: SubtaskRow) => {
    setEditingId(subtask.id);
    setEditingTitle(subtask.title);
  };

  const handleSaveEdit = (id: string) => {
    const title = editingTitle.trim();
    setEditingId(null);
    if (!title) return;
    update(subtasks.map((s) => (s.id === id ? { ...s, title } : s)));
    startTransition(async () => {
      await updateSubtask(id, title);
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleDelete = (id: string) => {
    update(subtasks.filter((s) => s.id !== id));
    startTransition(async () => {
      await deleteSubtask(id);
    });
  };

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title || isPending) return;
    setNewTitle("");
    startTransition(async () => {
      const created = await createSubtask({ taskId, title });
      update([...subtasks, created]);
    });
  };

  const completedCount = subtasks.filter((s) => s.completed).length;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">
        サブタスク
        {subtasks.length > 0 && (
          <span className="ml-1.5 text-muted-foreground">
            ({completedCount}/{subtasks.length})
          </span>
        )}
      </p>

      <div className="max-h-48 overflow-y-auto space-y-1">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-2 group">
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={(checked) => handleToggle(subtask.id, checked === true)}
            />
            {editingId === subtask.id ? (
              <input
                ref={editInputRef}
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onFocus={(e) => e.target.select()}
                onBlur={() => handleSaveEdit(subtask.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSaveEdit(subtask.id);
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancelEdit();
                  }
                }}
                className="flex-1 text-sm bg-transparent border-b border-border outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => handleStartEdit(subtask)}
                className={`flex-1 text-left text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {subtask.title}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDelete(subtask.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              aria-label="削除"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="サブタスクを追加..."
          className="h-8 text-sm"
          disabled={isPending}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={!newTitle.trim() || isPending}
          className="h-8 shrink-0"
        >
          追加
        </Button>
      </div>
    </div>
  );
}
