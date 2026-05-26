import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { ProjectDetailHeader } from "@/components/projects/project-detail-header";
import { TaskTable } from "@/components/tasks/task-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { PROJECT_STATUS, PROJECT_STATUS_COLOR } from "@/lib/constants";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, userId)),
  });

  if (!project) notFound();

  const [taskCountResult] = await db
    .select({ value: count() })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.projectId, id)));

  const [doneCountResult] = await db
    .select({ value: count() })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.projectId, id), eq(tasks.status, "done")));

  const taskCount = taskCountResult.value;
  const doneCount = doneCountResult.value;
  const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

  const taskList = await db.query.tasks.findMany({
    where: and(eq(tasks.userId, userId), eq(tasks.projectId, id)),
    with: { project: true },
    orderBy: (tasks, { asc, desc }) => [asc(tasks.status), desc(tasks.createdAt)],
  });

  const allProjects = await db.query.projects.findMany({
    where: and(eq(projects.userId, userId), eq(projects.status, "active")),
    columns: { id: true, name: true },
  });

  const mappedTasks = taskList.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    projectId: t.projectId,
    project: t.project ? { name: t.project.name } : null,
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
