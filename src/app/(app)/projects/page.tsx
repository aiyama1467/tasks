import { ProjectList } from "@/components/projects/project-list";
import { ProjectPageHeader } from "@/components/projects/project-page-header";
import { requireUserIdOrRedirect } from "@/lib/auth";
import { getProjects, getProjectTaskStats } from "@/usecases/projects";

export default async function ProjectsPage() {
  const userId = await requireUserIdOrRedirect();

  const projectList = await getProjects(userId);

  const projectsWithStats = await Promise.all(
    projectList.map(async (project) => {
      const { taskCount, doneCount } = await getProjectTaskStats(userId, project.id);
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        color: project.color,
        taskCount,
        doneCount,
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
