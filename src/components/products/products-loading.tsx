import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array(8).fill(null).map((_, i) => (
        <div key={i} className="group rounded-lg border bg-background p-3">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="pt-3">
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/4 mb-2" />
            <div className="flex justify-between items-center mt-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
