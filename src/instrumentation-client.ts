import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Only send events from production. On Vercel, NEXT_PUBLIC_VERCEL_ENV is
  // exposed to the browser and is one of "production" | "preview" | "development".
  enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === "production",
  // Performance monitoring: sample 10% of transactions.
  tracesSampleRate: 0.1,
});

// Adds navigation breadcrumbs / router transition spans (Next.js App Router).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
