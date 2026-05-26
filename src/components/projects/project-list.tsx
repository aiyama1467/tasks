"use client";

import { useState } from "react";
import { ProjectCard } from "./project-card";
import { type ProjectData, ProjectForm } from "./project-form";

interface ProjectWithStats extends ProjectData {
  taskCount: number;
  doneCount: number;
}

interface ProjectListProps {
  projects: ProjectWithStats[];
}

export function ProjectList({ projects }: ProjectListProps) {
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">プロジェクトがありません</p>
        <p className="mt-1 text-sm text-muted-foreground">
          「新規プロジェクト」ボタンからプロジェクトを追加しましょう
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onEdit={setEditingProject} />
        ))}
      </div>

      <ProjectForm
        open={editingProject !== null}
        onOpenChange={(open) => {
          if (!open) setEditingProject(null);
        }}
        project={editingProject}
      />
    </>
  );
}
