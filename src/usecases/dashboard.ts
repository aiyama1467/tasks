import { and, count, desc, eq, gte, inArray, lt, ne, sql } from "drizzle-orm";
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
  ] = await db.batch([
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

  // Aggregate per-project task/done counts in a single grouped query instead of
  // issuing two count queries per project. Projects with no tasks are absent from
  // the result set, so callers must fall back to 0.
  const projectIds = activeProjectList.map((project) => project.id);

  const projectStatRows =
    projectIds.length > 0
      ? await db
          .select({
            projectId: tasks.projectId,
            taskCount: count(),
            doneCount: count(sql`case when ${tasks.status} = 'done' then 1 end`),
          })
          .from(tasks)
          .where(and(eq(tasks.userId, userId), inArray(tasks.projectId, projectIds)))
          .groupBy(tasks.projectId)
      : [];

  const projectStatsById = new Map(projectStatRows.map((row) => [row.projectId, row]));

  const activeProjects = activeProjectList.map((project) => ({
    id: project.id,
    name: project.name,
    color: project.color,
    taskCount: projectStatsById.get(project.id)?.taskCount ?? 0,
    doneCount: projectStatsById.get(project.id)?.doneCount ?? 0,
  }));

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
