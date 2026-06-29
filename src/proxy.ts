import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  // MCP は session ではなく OAuth トークンで認証する。auth.protect() による
  // サインインへのリダイレクトを避け、ハンドラ側(withMcpAuth)に 401/PRM を任せる。
  "/api/mcp(.*)",
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
