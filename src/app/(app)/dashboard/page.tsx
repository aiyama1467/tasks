import { auth } from "@clerk/nextjs/server";
import { and, count, eq, gte, lt, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ActiveProjects } from "@/components/dashboard/active-projects";
import { InProgressBacklog } from "@/components/dashboard/in-progress-backlog";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { db } from "@/db";
import { backlogItems, projects, tasks } from "@/db/schema";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const today = new Date().toISOString().split("T")[0];

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const weekStart = startOfWeek.toISOString().split("T")[0];

  const [
    todayTaskList,
    overdueTaskList,
    openTaskCount,
    completedThisWeek,
    activeProjectList,
    inProgressBacklogList,
    overdueTCount,
  ] = await Promise.all([
    db.query.tasks.findMany({
      where: and(eq(tasks.userId, userId), eq(tasks.dueDate, today), ne(tasks.status, "done")),
      with: { project: true },
      orderBy: (tasks, { desc }) => [desc(tasks.priority)],
    }),

    db.query.tasks.findMany({
      where: and(eq(tasks.userId, userId), lt(tasks.dueDate, today), ne(tasks.status, "done")),
      with: { project: true },
      orderBy: (tasks, { desc }) => [desc(tasks.priority)],
    }),

    db
      .select({ value: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), ne(tasks.status, "done"))),

    db
      .select({ value: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.status, "done"),
          gte(tasks.updatedAt, new Date(weekStart)),
        ),
      ),

    db.query.projects.findMany({
      where: and(eq(projects.userId, userId), eq(projects.status, "active")),
      orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
      limit: 5,
    }),

    db.query.backlogItems.findMany({
      where: and(eq(backlogItems.userId, userId), eq(backlogItems.status, "in_progress")),
      with: { category: true },
      orderBy: (backlogItems, { desc }) => [desc(backlogItems.updatedAt)],
    }),

    db
      .select({ value: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), lt(tasks.dueDate, today), ne(tasks.status, "done"))),
  ]);

  const projectsWithStats = await Promise.all(
    activeProjectList.map(async (project) => {
      const [taskCountResult] = await db
        .select({ value: count() })
        .from(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.projectId, project.id)));

      const [doneCountResult] = await db
        .select({ value: count() })
        .from(tasks)
        .where(
          and(eq(tasks.userId, userId), eq(tasks.projectId, project.id), eq(tasks.status, "done")),
        );

      return {
        id: project.id,
        name: project.name,
        color: project.color,
        taskCount: taskCountResult.value,
        doneCount: doneCountResult.value,
      };
    }),
  );

  const mapTask = (t: (typeof todayTaskList)[number]) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    projectName: t.project?.name ?? null,
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      <StatsOverview
        openTasks={openTaskCount[0].value}
        completedTasksThisWeek={completedThisWeek[0].value}
        activeProjects={activeProjectList.length}
        inProgressBacklog={inProgressBacklogList.length}
        overdueTasks={overdueTCount[0].value}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TodayTasks
          todayTasks={todayTaskList.map(mapTask)}
          overdueTasks={overdueTaskList.map(mapTask)}
        />
        <ActiveProjects projects={projectsWithStats} />
      </div>

      <InProgressBacklog
        items={inProgressBacklogList.map((item) => ({
          id: item.id,
          title: item.title,
          categoryName: item.category.name,
          url: item.url,
        }))}
      />
    </div>
  );
}
