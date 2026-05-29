import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { ProjectDetailHeader } from "@/components/projects/project-detail-header";
import { TaskTable } from "@/components/tasks/task-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PROJECT_STATUS, PROJECT_STATUS_COLOR } from "@/lib/constants";
import { getActiveProjects, getProjectById, getProjectTaskStats } from "@/usecases/projects";
import { getTasksByProject } from "@/usecases/tasks";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const project = await getProjectById(userId, id);
  if (!project) notFound();

  const [{ taskCount, doneCount }, taskList, allProjects] = await Promise.all([
    getProjectTaskStats(userId, id),
    getTasksByProject(userId, id),
    getActiveProjects(userId),
  ]);

  const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

  const mappedTasks = taskList.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    projectId: t.projectId,
    project: t.project ? { name: t.project.name } : null,
    subtasks: t.subtasks.toSorted((a, b) => a.position - b.position),
    subtaskCount:
      t.subtasks.length > 0
        ? {
            total: t.subtasks.length,
            completed: t.subtasks.filter((s) => s.completed).length,
          }
        : undefined,
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <ProjectDetailHeader
          project={{
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            color: project.color,
          }}
          allProjects={allProjects}
        />

        {project.description && <p className="text-muted-foreground">{project.description}</p>}

        <div className="flex items-center gap-4">
          <Badge variant="outline" className={PROJECT_STATUS_COLOR[project.status]}>
            {PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]}
          </Badge>
          <div className="flex flex-1 items-center gap-3">
            <Progress value={progress} className="h-2 max-w-xs" />
            <span className="text-sm text-muted-foreground">
              {doneCount} / {taskCount} タスク完了 ({progress}%)
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">タスク</h2>
        <TaskTable tasks={mappedTasks} projects={allProjects} />
      </div>
    </div>
  );
}
