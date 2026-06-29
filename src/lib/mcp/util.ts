/**
 * MCP ツール共通ヘルパ。
 * userId は必ず検証済みトークン(authInfo.extra.userId)から渡し、
 * ツール引数からは受け取らない(他ユーザーのデータを操作できないようにするため)。
 */

export type AuthCtx = { authInfo?: { extra?: { userId?: string } } };

export function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// userId をトークンから取り出して注入する薄いラッパ。
// 各ツールは userId を引数から受け取らず、ここで渡されたものだけを使う。
export function withUser<A>(fn: (userId: string, args: A) => Promise<unknown>) {
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
