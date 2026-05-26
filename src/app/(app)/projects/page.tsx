import { auth } from "@clerk/nextjs/server";
import { and, count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ProjectList } from "@/components/projects/project-list";
import { ProjectPageHeader } from "@/components/projects/project-page-header";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";

export default async function ProjectsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const projectList = await db.query.projects.findMany({
    where: eq(projects.userId, userId),
    orderBy: (projects, { desc }) => [desc(projects.createdAt)],
  });

  const projectsWithStats = await Promise.all(
    projectList.map(async (project) => {
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
        description: project.description,
        status: project.status,
        color: project.color,
        taskCount: taskCountResult.value,
        doneCount: doneCountResult.value,
      };
    }),
  );

  return (
    <div className="space-y-6 p-6">
      <ProjectPageHeader />
      <ProjectList projects={projectsWithStats} />
    </div>
  );
}
