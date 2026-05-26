import { Progress } from "@/components/ui/progress";

interface CategoryStats {
  name: string;
  total: number;
  completed: number;
}

export function BacklogStats({ stats }: { stats: CategoryStats[] }) {
  const totalItems = stats.reduce((sum, s) => sum + s.total, 0);
  const totalCompleted = stats.reduce((sum, s) => sum + s.completed, 0);
  const overallProgress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">全体の進捗</span>
        <span className="text-sm text-muted-foreground">
          {totalCompleted} / {totalItems} 完了 ({overallProgress}%)
        </span>
      </div>
      <Progress value={overallProgress} className="h-2" />

      <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-3">
        {stats
          .filter((s) => s.total > 0)
          .map((s) => {
            const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
            return (
              <div key={s.name} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{s.name}</span> {s.completed}/
                {s.total} ({pct}%)
              </div>
            );
          })}
      </div>
    </div>
  );
}
