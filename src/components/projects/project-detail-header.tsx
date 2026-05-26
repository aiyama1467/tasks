"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import type { ProjectData } from "./project-form";

interface ProjectDetailHeaderProps {
  project: ProjectData;
  allProjects: { id: string; name: string }[];
}

export function ProjectDetailHeader({ project, allProjects }: ProjectDetailHeaderProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);

  const defaultTask = {
    id: "",
    title: "",
    description: null,
    status: "todo",
    priority: "medium",
    dueDate: null,
    projectId: project.id,
    project: { name: project.name },
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{project.name}</h1>
      </div>
      <Button onClick={() => setShowTaskForm(true)}>
        <Plus className="mr-2 h-4 w-4" />
        タスクを追加
      </Button>
      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        task={defaultTask}
        projects={allProjects}
      />
    </div>
  );
}
