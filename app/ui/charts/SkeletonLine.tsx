import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonDemo() {
  return (
    <div className="flex items-center space-x-4">
      <div className="space-y-2" style={{ margin: "1rem" }}>
        <Skeleton className="h-4 w-[250px]" />
      </div>
    </div>
  );
}

export function SkeletonPieCard() {
  return (
    <div className="flex items-center space-x-4">
      <div className="space-y-2" style={{ margin: "1rem" }}>
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
