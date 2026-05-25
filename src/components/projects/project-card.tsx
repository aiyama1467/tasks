"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PROJECT_STATUS, PROJECT_STATUS_COLOR } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { deleteProject } from "@/app/projects/actions";
import { useTransition } from "react";
import type { ProjectData } from "./project-form";

const COLOR_MAP: Record<string, string> = {
  blue: "border-l-blue-500",
  green: "border-l-green-500",
  purple: "border-l-purple-500",
  orange: "border-l-orange-500",
  red: "border-l-red-500",
  pink: "border-l-pink-500",
};

interface ProjectCardProps {
  project: ProjectData & {
    taskCount: number;
    doneCount: number;
  };
  onEdit: (project: ProjectData) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const [isPending, startTransition] = useTransition();
  const progress =
    project.taskCount > 0
      ? Math.round((project.doneCount / project.taskCount) * 100)
      : 0;

  const handleDelete = () => {
    startTransition(() => {
      deleteProject(project.id);
    });
  };

  return (
    <Card
      className={`border-l-4 ${COLOR_MAP[project.color ?? "blue"] ?? COLOR_MAP.blue} ${isPending ? "opacity-50" : ""}`}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <Link href={`/projects/${project.id}`} className="flex-1">
          <CardTitle className="text-base hover:underline">
            {project.name}
          </CardTitle>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={PROJECT_STATUS_COLOR[project.status]}>
            {PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Pencil className="mr-2 h-4 w-4" />
                編集
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {project.doneCount} / {project.taskCount} タスク完了
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
