import { z } from "zod";
import { getTasks, mapTaskRow } from "@/usecases/tasks";

/**
 * MCP 経由で公開するツール。すべて読み取り専用。
 * userId は必ず検証済みトークン(authInfo.extra.userId)から渡し、
 * ツール引数からは受け取らない(他ユーザーのデータを覗けないようにするため)。
 */

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
    async (
      args: { status?: string; priority?: string },
      { authInfo }: { authInfo?: { extra?: { userId?: string } } },
    ) => {
      const userId = authInfo?.extra?.userId;
      if (!userId) {
        return {
          content: [{ type: "text", text: "Unauthorized: no user in token." }],
          isError: true,
        };
      }

      const rows = await getTasks(userId, {
        status: args.status,
        priority: args.priority,
      });
      const tasks = rows.map(mapTaskRow);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: tasks.length, tasks }, null, 2),
          },
        ],
      };
    },
  );
}
