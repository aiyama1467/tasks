import * as Sentry from "@sentry/nextjs";
import { refreshAllUsersFeeds } from "@/usecases/feeds";

// 逐次でフィードを取得するため、既定の実行時間では足りない可能性がある。
// Hobby プランの上限に合わせて 60 秒まで許可する。
export const maxDuration = 60;

export async function GET(request: Request) {
  // Vercel Cron は実行時に `Authorization: Bearer $CRON_SECRET` を自動付与する。
  // これを検証して外部からの直叩きを弾く。
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // TODO: refreshAllUsersFeeds が例外を投げると全体が 500 になり、その回の取得が丸ごと失われる。
    // 個々のソースのエラーは feedSources.fetchError に記録されるが、実行全体の成否・件数を
    // ログ/メトリクスとして残す仕組み（Sentry breadcrumb や DB への実行履歴）があると運用しやすい。
    const summary = await refreshAllUsersFeeds();
    const users = summary.length;
    const sources = summary.reduce((acc, s) => acc + s.results.length, 0);
    return Response.json({ ok: true, users, sources });
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ ok: false, error: "フィードの取得に失敗しました" }, { status: 500 });
  }
}
