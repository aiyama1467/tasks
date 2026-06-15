import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Server Action 用。認証済みユーザーの userId を返す。
 * 未認証の場合は例外を投げる。
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");
  return userId;
}

/**
 * Page 用。認証済みユーザーの userId を返す。
 * 未認証の場合はサインインページへリダイレクトする。
 */
export async function requireUserIdOrRedirect(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}
