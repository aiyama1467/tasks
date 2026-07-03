import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  // MCP は session ではなく OAuth トークンで認証する。auth.protect() による
  // サインインへのリダイレクトを避け、ハンドラ側(withMcpAuth)に 401/PRM を任せる。
  "/api/mcp(.*)",
  // Vercel Cron はセッションを持たない。Clerk のリダイレクトを避け、
  // ハンドラ側で CRON_SECRET を検証する。
  "/api/cron(.*)",
  "/.well-known(.*)",
]);

export const proxy = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$).*)",
  ],
};
