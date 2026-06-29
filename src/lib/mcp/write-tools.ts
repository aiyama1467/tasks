import { z } from "zod";
import { createBacklogItem, deleteBacklogItem, updateBacklogItem } from "@/usecases/backlog";
import { createProject, deleteProject, getProjectById, updateProject } from "@/usecases/projects";
import { createSubtask, deleteSubtask, toggleSubtask, updateSubtask } from "@/usecases/subtasks";
import { createTask, deleteTask, getTaskById, updateTask } from "@/usecases/tasks";
import { withUser } from "./util";

/**
 * MCP 経由で公開する書き込みツール(create / update / delete)。
 * 読み取りツールと同じく userId は検証済みトークンからのみ渡され、
 * 全 usecase が userId スコープで動くため他ユーザーのデータは操作できない。
 */

// 削除系ツールの共通注意書き。Claude Code 側のツール許可プロンプトに加え、
// 「対象を read 系で確認し、ユーザーに確認してから実行する」ことを明示する。
const DELETE_NOTE =
  "DESTRUCTIVE: permanently deletes the record. Before calling, verify the id with a read tool " +
  "(list_*/get_*) and confirm the deletion with the user.";

// biome-ignore lint/suspicious/noExplicitAny: mcp-handler の server 型をここで縛らない
export function registerWriteTools(server: any) {
  // ---------- Tasks ----------
  server.tool(
    "create_task",
    "Creates a task for the authenticated user. Returns the new task id.",
    {
      title: z.string().min(1).describe("Task title (required)."),
      description: z.string().optional(),
      status: z.enum(["todo", "in_progress", "done"]).optional().describe("Default: todo."),
      priority: z.enum(["low", "medium", "high"]).optional().describe("Default: medium."),
      dueDate: z.string().optional().describe("Due date as YYYY-MM-DD."),
      projectId: z.string().optional().describe("Project id (uuid) to attach the task to."),
    },
    withUser(
      async (
        userId,
        args: {
          title: string;
          description?: string;
          status?: string;
          priority?: string;
          dueDate?: string;
          projectId?: string;
        },
      ) => {
        const created = await createTask(userId, args);
        return { created: true, id: created?.id };
      },
    ),
  );

  server.tool(
    "update_task",
    "Updates fields of an existing task. Only the provided fields are changed.",
    {
      id: z.string().describe("Task id (uuid) to update."),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      status: z.enum(["todo", "in_progress", "done"]).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      dueDate: z.string().nullable().optional().describe("YYYY-MM-DD, or null to clear."),
      projectId: z.string().nullable().optional().describe("Project id, or null to detach."),
    },
    withUser(
      async (
        userId,
        args: {
          id: string;
          title?: string;
          description?: string;
          status?: string;
          priority?: string;
          dueDate?: string | null;
          projectId?: string | null;
        },
      ) => {
        const { id, ...data } = args;
        await updateTask(userId, id, data);
        return { updated: true, id };
      },
    ),
  );

  server.tool(
    "delete_task",
    `Deletes a task (and its subtasks via cascade). ${DELETE_NOTE}`,
    {
      id: z.string().describe("Task id (uuid) to delete."),
    },
    withUser(async (userId, args: { id: string }) => {
      const existing = await getTaskById(userId, args.id);
      if (!existing) return { deleted: false, reason: "not_found" };
      await deleteTask(userId, args.id);
      return { deleted: true, id: args.id, title: existing.title };
    }),
  );

  // ---------- Subtasks ----------
  server.tool(
    "create_subtask",
    "Adds a subtask to a task. Returns the created subtask.",
    {
      taskId: z.string().describe("Parent task id (uuid)."),
      title: z.string().min(1).describe("Subtask title (required)."),
    },
    withUser(async (userId, args: { taskId: string; title: string }) => {
      const created = await createSubtask(userId, args);
      return { created: true, subtask: created };
    }),
  );

  server.tool(
    "toggle_subtask",
    "Marks a subtask completed or not completed.",
    {
      id: z.string().describe("Subtask id (uuid)."),
      completed: z.boolean().describe("true = completed, false = not completed."),
    },
    withUser(async (userId, args: { id: string; completed: boolean }) => {
      await toggleSubtask(userId, args.id, args.completed);
      return { updated: true, id: args.id, completed: args.completed };
    }),
  );

  server.tool(
    "update_subtask",
    "Renames a subtask.",
    {
      id: z.string().describe("Subtask id (uuid)."),
      title: z.string().min(1).describe("New subtask title."),
    },
    withUser(async (userId, args: { id: string; title: string }) => {
      await updateSubtask(userId, args.id, args.title);
      return { updated: true, id: args.id };
    }),
  );

  server.tool(
    "delete_subtask",
    `Deletes a subtask. ${DELETE_NOTE}`,
    {
      id: z.string().describe("Subtask id (uuid) to delete."),
    },
    withUser(async (userId, args: { id: string }) => {
      await deleteSubtask(userId, args.id);
      return { deleted: true, id: args.id };
    }),
  );

  // ---------- Projects ----------
  server.tool(
    "create_project",
    "Creates a project for the authenticated user. Returns the new project id.",
    {
      name: z.string().min(1).describe("Project name (required)."),
      description: z.string().optional(),
      status: z.enum(["active", "archived"]).optional().describe("Default: active."),
      color: z.string().optional().describe("Color label (e.g. blue, red, orange)."),
    },
    withUser(
      async (
        userId,
        args: { name: string; description?: string; status?: string; color?: string },
      ) => {
        const created = await createProject(userId, args);
        return { created: true, id: created?.id };
      },
    ),
  );

  server.tool(
    "update_project",
    "Updates fields of an existing project. Only the provided fields are changed.",
    {
      id: z.string().describe("Project id (uuid) to update."),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      status: z.enum(["active", "archived"]).optional(),
      color: z.string().optional(),
    },
    withUser(
      async (
        userId,
        args: { id: string; name?: string; description?: string; status?: string; color?: string },
      ) => {
        const { id, ...data } = args;
        await updateProject(userId, id, data);
        return { updated: true, id };
      },
    ),
  );

  server.tool(
    "delete_project",
    `Deletes a project. Its tasks are NOT deleted; their projectId is set to null. ${DELETE_NOTE}`,
    {
      id: z.string().describe("Project id (uuid) to delete."),
    },
    withUser(async (userId, args: { id: string }) => {
      const existing = await getProjectById(userId, args.id);
      if (!existing) return { deleted: false, reason: "not_found" };
      await deleteProject(userId, args.id);
      return { deleted: true, id: args.id, name: existing.name };
    }),
  );

  // ---------- Backlog ----------
  server.tool(
    "create_backlog",
    "Creates a backlog item (something to read/watch/play etc). Returns the new id.",
    {
      title: z.string().min(1).describe("Title (required)."),
      categoryId: z
        .string()
        .describe("Category id (uuid, required). Use list_backlog to discover."),
      description: z.string().optional(),
      status: z.enum(["not_started", "in_progress", "completed"]).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      url: z.string().optional(),
    },
    withUser(
      async (
        userId,
        args: {
          title: string;
          categoryId: string;
          description?: string;
          status?: string;
          priority?: string;
          url?: string;
        },
      ) => {
        const created = await createBacklogItem(userId, args);
        return { created: true, id: created?.id };
      },
    ),
  );

  server.tool(
    "update_backlog",
    "Updates fields of an existing backlog item. Only the provided fields are changed.",
    {
      id: z.string().describe("Backlog item id (uuid) to update."),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      categoryId: z.string().optional(),
      status: z.enum(["not_started", "in_progress", "completed"]).optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      rating: z.number().int().min(1).max(5).nullable().optional().describe("1-5, or null."),
      url: z.string().nullable().optional(),
    },
    withUser(
      async (
        userId,
        args: {
          id: string;
          title?: string;
          description?: string;
          categoryId?: string;
          status?: string;
          priority?: string;
          rating?: number | null;
          url?: string | null;
        },
      ) => {
        const { id, ...data } = args;
        await updateBacklogItem(userId, id, data);
        return { updated: true, id };
      },
    ),
  );

  server.tool(
    "delete_backlog",
    `Deletes a backlog item. ${DELETE_NOTE}`,
    {
      id: z.string().describe("Backlog item id (uuid) to delete."),
    },
    withUser(async (userId, args: { id: string }) => {
      await deleteBacklogItem(userId, args.id);
      return { deleted: true, id: args.id };
    }),
  );
}
