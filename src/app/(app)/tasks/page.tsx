import { TaskPageHeader } from "@/components/tasks/task-page-header";
import { TaskTable } from "@/components/tasks/task-table";
import { requireUserIdOrRedirect } from "@/lib/auth";
import { getActiveProjects } from "@/usecases/projects";
import { getTasks, mapTaskRow } from "@/usecases/tasks";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; sort?: string }>;
}) {
  const userId = await requireUserIdOrRedirect();

  const params = await searchParams;

  const [taskList, projectList] = await Promise.all([
    getTasks(userId, { status: params.status, priority: params.priority }),
    getActiveProjects(userId),
  ]);

  const mappedTasks = taskList.map(mapTaskRow);

  return (
    <div className="space-y-6 p-6">
      <TaskPageHeader projects={projectList} />
      <TaskTable tasks={mappedTasks} projects={projectList} />
    </div>
  );
}
