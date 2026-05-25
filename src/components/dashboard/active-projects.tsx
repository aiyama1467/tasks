import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface ProjectSummary {
  id: string;
  name: string;
  color: string | null;
  taskCount: number;
  doneCount: number;
}

const COLOR_DOT: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  pink: "bg-pink-500",
};

export function ActiveProjects({
  projects,
}: {
  projects: ProjectSummary[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">進行中プロジェクト</CardTitle>
        <Link
          href="/projects"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          すべて表示
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            進行中のプロジェクトはありません
          </p>
        ) : (
          projects.map((project) => {
            const progress =
              project.taskCount > 0
                ? Math.round((project.doneCount / project.taskCount) * 100)
                : 0;
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block space-y-1.5 rounded-md p-2 hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${COLOR_DOT[project.color ?? "blue"] ?? COLOR_DOT.blue}`}
                    />
                    <span className="text-sm font-medium">{project.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {project.doneCount}/{project.taskCount}
                  </span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
