import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Only send events from the production deployment on Vercel.
  enabled: process.env.VERCEL_ENV === "production",
  // Performance monitoring: sample 10% of transactions.
  tracesSampleRate: 0.1,
});
