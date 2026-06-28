import { ActiveProjects } from "@/components/dashboard/active-projects";
import { InProgressBacklog } from "@/components/dashboard/in-progress-backlog";
import { RecentFeeds } from "@/components/dashboard/recent-feeds";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { requireUserIdOrRedirect } from "@/lib/auth";
import { getDashboardData } from "@/usecases/dashboard";

export default async function DashboardPage() {
  const userId = await requireUserIdOrRedirect();

  const {
    todayTasks,
    overdueTasks,
    openTaskCount,
    completedThisWeek,
    activeProjects,
    inProgressBacklogItems,
    overdueTaskCount,
    recentUnreadFeedItems,
  } = await getDashboardData(userId);

  const mapTask = (t: (typeof todayTasks)[number]) => ({
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
        openTasks={openTaskCount}
        completedTasksThisWeek={completedThisWeek}
        activeProjects={activeProjects.length}
        inProgressBacklog={inProgressBacklogItems.length}
        overdueTasks={overdueTaskCount}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TodayTasks todayTasks={todayTasks.map(mapTask)} overdueTasks={overdueTasks.map(mapTask)} />
        <ActiveProjects projects={activeProjects} />
      </div>

      <InProgressBacklog
        items={inProgressBacklogItems.map((item) => ({
          id: item.id,
          title: item.title,
          categoryName: item.category.name,
          url: item.url,
        }))}
      />

      <RecentFeeds
        items={recentUnreadFeedItems.map((item) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          publishedAt: item.publishedAt?.toISOString() ?? null,
          sourceName: item.source.name,
          sourceType: item.source.sourceType,
        }))}
      />
    </div>
  );
}
