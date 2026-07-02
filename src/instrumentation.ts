import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Captures errors thrown while rendering Server Components, Route Handlers,
// Server Actions, etc. (Next.js `onRequestError` file convention).
export const onRequestError = Sentry.captureRequestError;
