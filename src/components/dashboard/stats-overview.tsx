import { AlertTriangle, CheckSquare, FolderKanban, Library } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsOverviewProps {
  openTasks: number;
  completedTasksThisWeek: number;
  activeProjects: number;
  inProgressBacklog: number;
  overdueTasks: number;
}

export function StatsOverview({
  openTasks,
  completedTasksThisWeek,
  activeProjects,
  inProgressBacklog,
  overdueTasks,
}: StatsOverviewProps) {
  const stats = [
    {
      title: "未完了タスク",
      value: openTasks,
      icon: CheckSquare,
      description: `今週 ${completedTasksThisWeek} 件完了`,
    },
    {
      title: "進行中プロジェクト",
      value: activeProjects,
      icon: FolderKanban,
    },
    {
      title: "進行中バックログ",
      value: inProgressBacklog,
      icon: Library,
    },
    {
      title: "期限切れ",
      value: overdueTasks,
      icon: AlertTriangle,
      className: overdueTasks > 0 ? "text-red-600" : "",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.className ?? ""}`}>{stat.value}</div>
            {stat.description && (
              <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
