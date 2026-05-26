import { Skeleton } from "@/components/ui/skeleton";

export default function BacklogLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-32" />

      <Skeleton className="h-24 rounded-lg" />

      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>

      <Skeleton className="h-10 w-full max-w-md" />

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
