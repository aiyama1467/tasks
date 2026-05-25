import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskPageHeader } from "@/components/tasks/task-page-header";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; sort?: string }>;
}) {
  const params = await searchParams;

  const conditions = [];
  if (params.status && params.status !== "all") {
    conditions.push(eq(tasks.status, params.status));
  }
  if (params.priority && params.priority !== "all") {
    conditions.push(eq(tasks.priority, params.priority));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [taskList, projectList] = await Promise.all([
    db.query.tasks.findMany({
      where,
      with: { project: true },
      orderBy: [asc(tasks.status), desc(tasks.createdAt)],
    }),
    db.query.projects.findMany({
      where: eq(projects.status, "active"),
      columns: { id: true, name: true },
    }),
  ]);

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
      <TaskPageHeader projects={projectList} />
      <TaskTable tasks={mappedTasks} projects={projectList} />
    </div>
  );
}
