import { z } from "zod";
import { getBacklogItems, getCategories } from "@/usecases/backlog";
import { getDashboardData } from "@/usecases/dashboard";
import { getFeedItems } from "@/usecases/feeds";
import { getProjectById, getProjects, getProjectTaskStats } from "@/usecases/projects";
import { getTaskById, getTasks, getTasksByProject, mapTaskRow } from "@/usecases/tasks";

/**
 * MCP 経由で公開するツール。すべて読み取り専用。
 * userId は必ず検証済みトークン(authInfo.extra.userId)から渡し、
 * ツール引数からは受け取らない(他ユーザーのデータを覗けないようにするため)。
 */

type AuthCtx = { authInfo?: { extra?: { userId?: string } } };

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// userId をトークンから取り出して注入する薄いラッパ。
// 各ツールは userId を引数から受け取らず、ここで渡されたものだけを使う。
function withUser<A>(fn: (userId: string, args: A) => Promise<unknown>) {
  return async (args: A, { authInfo }: AuthCtx) => {
    const userId = authInfo?.extra?.userId;
    if (!userId) {
      return {
        content: [{ type: "text" as const, text: "Unauthorized: no user in token." }],
        isError: true,
      };
    }
    return ok(await fn(userId, args));
  };
}

type FeedRow = Awaited<ReturnType<typeof getFeedItems>>[number];
function mapFeedItem(item: FeedRow) {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    author: item.author,
    publishedAt: item.publishedAt,
    isRead: item.isRead,
    isSaved: item.isSaved,
    source: item.source?.name ?? null,
  };
}

// biome-ignore lint/suspicious/noExplicitAny: mcp-handler の server 型をここで縛らない
export function registerTools(server: any) {
  server.tool(
    "list_tasks",
    "Lists the authenticated user's tasks. Read-only. By default returns active (not done) tasks. " +
      "Each task includes its project name and subtask progress.",
    {
      status: z
        .enum(["active", "all", "todo", "in_progress", "done"])
        .optional()
        .describe(
          'Filter by status. "active" (default) excludes done tasks; "all" returns every task; or pass a specific status.',
        ),
      priority: z
        .enum(["all", "low", "medium", "high"])
        .optional()
        .describe('Filter by priority, or "all" for any priority.'),
    },
    withUser(async (userId, args: { status?: string; priority?: string }) => {
      const rows = await getTasks(userId, { status: args.status, priority: args.priority });
      const tasks = rows.map(mapTaskRow);
      return { count: tasks.length, tasks };
    }),
  );

  server.tool(
    "get_task",
    "Gets a single task by id, including its subtasks and project name. Read-only.",
    {
      id: z.string().describe("The task id (uuid)."),
    },
    withUser(async (userId, args: { id: string }) => {
      const row = await getTaskById(userId, args.id);
      if (!row) return { found: false };
      return { found: true, task: mapTaskRow(row) };
    }),
  );

  server.tool(
    "list_projects",
    "Lists the authenticated user's projects with task counts. Read-only.",
    {},
    withUser(async (userId) => {
      const projects = await getProjects(userId);
      const withStats = await Promise.all(
        projects.map(async (p) => {
          const stats = await getProjectTaskStats(userId, p.id);
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            status: p.status,
            color: p.color,
            taskCount: stats.taskCount,
            doneCount: stats.doneCount,
          };
        }),
      );
      return { count: withStats.length, projects: withStats };
    }),
  );

  server.tool(
    "get_project",
    "Gets a single project by id and its tasks. Read-only. By default returns active (not done) tasks.",
    {
      id: z.string().describe("The project id (uuid)."),
      status: z
        .enum(["active", "all", "todo", "in_progress", "done"])
        .optional()
        .describe('Filter the project\'s tasks by status. "active" (default) excludes done tasks.'),
      priority: z
        .enum(["all", "low", "medium", "high"])
        .optional()
        .describe('Filter the project\'s tasks by priority, or "all".'),
    },
    withUser(async (userId, args: { id: string; status?: string; priority?: string }) => {
      const project = await getProjectById(userId, args.id);
      if (!project) return { found: false };
      const rows = await getTasksByProject(userId, args.id, {
        status: args.status,
        priority: args.priority,
      });
      const tasks = rows.map(mapTaskRow);
      return { found: true, project, taskCount: tasks.length, tasks };
    }),
  );

  server.tool(
    "list_backlog",
    "Lists the authenticated user's backlog items (things to read/watch/play etc). Read-only.",
    {
      status: z
        .enum(["all", "not_started", "in_progress", "completed"])
        .optional()
        .describe('Filter by status, or "all" (default).'),
      categoryId: z.string().optional().describe("Filter by category id (uuid)."),
    },
    withUser(async (userId, args: { status?: string; categoryId?: string }) => {
      const [items, categories] = await Promise.all([getBacklogItems(userId), getCategories()]);
      const categoryName = new Map(categories.map((c) => [c.id, c.name]));
      const filtered = items.filter((item) => {
        if (args.status && args.status !== "all" && item.status !== args.status) return false;
        if (args.categoryId && item.categoryId !== args.categoryId) return false;
        return true;
      });
      const mapped = filtered.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority,
        rating: item.rating,
        url: item.url,
        startedAt: item.startedAt,
        completedAt: item.completedAt,
        category: categoryName.get(item.categoryId) ?? null,
      }));
      return { count: mapped.length, backlog: mapped };
    }),
  );

  server.tool(
    "list_feed_items",
    "Lists the authenticated user's feed items (from RSS/other sources). Read-only.",
    {
      isRead: z.boolean().optional().describe("Filter by read state."),
      isSaved: z.boolean().optional().describe("Filter by saved state."),
      sourceId: z.string().optional().describe("Filter by feed source id (uuid)."),
      limit: z.number().int().min(1).max(100).optional().describe("Max items (default 50)."),
    },
    withUser(
      async (
        userId,
        args: { isRead?: boolean; isSaved?: boolean; sourceId?: string; limit?: number },
      ) => {
        const rows = await getFeedItems(
          userId,
          { sourceId: args.sourceId, isRead: args.isRead, isSaved: args.isSaved },
          args.limit ?? 50,
        );
        const items = rows.map(mapFeedItem);
        return { count: items.length, items };
      },
    ),
  );

  server.tool(
    "dashboard_summary",
    "Gets a summary of the authenticated user's day: tasks due today, overdue tasks, open/completed counts, " +
      "active projects, in-progress backlog, and unread feed count. Read-only.",
    {},
    withUser(async (userId) => {
      const d = await getDashboardData(userId);
      const mapTask = (t: (typeof d.todayTasks)[number]) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate,
        status: t.status,
        project: t.project?.name ?? null,
      });
      return {
        openTaskCount: d.openTaskCount,
        completedThisWeek: d.completedThisWeek,
        overdueTaskCount: d.overdueTaskCount,
        unreadFeedCount: d.unreadFeedCount,
        todayTasks: d.todayTasks.map(mapTask),
        overdueTasks: d.overdueTasks.map(mapTask),
        activeProjects: d.activeProjects,
        inProgressBacklog: d.inProgressBacklogItems.map((b) => ({
          id: b.id,
          title: b.title,
          category: b.category?.name ?? null,
        })),
      };
    }),
  );
}
