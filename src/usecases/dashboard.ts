import { and, count, desc, eq, gte, lt, ne } from "drizzle-orm";
import { db } from "@/db";
import { backlogItems, feedItems, projects, tasks } from "@/db/schema";

export async function getDashboardData(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const weekStart = startOfWeek.toISOString().split("T")[0];

  const [
    todayTasks,
    overdueTasks,
    openTaskCount,
    completedThisWeek,
    activeProjectList,
    inProgressBacklogItems,
    overdueTaskCount,
    recentUnreadFeedItems,
    unreadFeedCount,
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
    db.query.feedItems.findMany({
      where: and(eq(feedItems.userId, userId), eq(feedItems.isRead, false)),
      with: { source: { columns: { name: true, sourceType: true } } },
      orderBy: [desc(feedItems.publishedAt), desc(feedItems.createdAt)],
      limit: 5,
    }),
    db
      .select({ value: count() })
      .from(feedItems)
      .where(and(eq(feedItems.userId, userId), eq(feedItems.isRead, false))),
  ]);

  const activeProjects = await Promise.all(
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

  return {
    todayTasks,
    overdueTasks,
    openTaskCount: openTaskCount[0].value,
    completedThisWeek: completedThisWeek[0].value,
    activeProjects,
    inProgressBacklogItems,
    overdueTaskCount: overdueTaskCount[0].value,
    recentUnreadFeedItems,
    unreadFeedCount: unreadFeedCount[0].value,
  };
}
