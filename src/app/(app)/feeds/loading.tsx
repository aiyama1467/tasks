import { Skeleton } from "@/components/ui/skeleton";

export default function FeedsLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-32" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-2 lg:w-56">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex-1 space-y-3">
          <Skeleton className="h-10 w-64" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
