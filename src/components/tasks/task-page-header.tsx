"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TaskFilters } from "./task-filters";
import { TaskForm } from "./task-form";

interface TaskPageHeaderProps {
  projects: { id: string; name: string }[];
}

export function TaskPageHeader({ projects }: TaskPageHeaderProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">タスク</h1>
      </div>
      <div className="flex items-center gap-3">
        <TaskFilters />
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規タスク
        </Button>
      </div>
      <TaskForm open={showForm} onOpenChange={setShowForm} projects={projects} />
    </div>
  );
}
