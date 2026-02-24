import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
