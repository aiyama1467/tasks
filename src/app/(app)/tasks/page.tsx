import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { TaskPageHeader } from "@/components/tasks/task-page-header";
import { TaskTable } from "@/components/tasks/task-table";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; sort?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;

  const conditions = [eq(tasks.userId, userId)];
  if (params.status && params.status !== "all") {
    conditions.push(eq(tasks.status, params.status));
  }
  if (params.priority && params.priority !== "all") {
    conditions.push(eq(tasks.priority, params.priority));
  }

  const [taskList, projectList] = await Promise.all([
    db.query.tasks.findMany({
      where: and(...conditions),
      with: { project: true },
      orderBy: [asc(tasks.status), desc(tasks.createdAt)],
    }),
    db.query.projects.findMany({
      where: and(eq(projects.userId, userId), eq(projects.status, "active")),
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
