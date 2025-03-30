import { Suspense } from "react";
import { ProductsPageClientWithProvider } from "./client-page-with-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products - CandidWear",
  description: "Browse our collection of high-quality bags and accessories",
};

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(8)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-52 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductsPageClientWithProvider />
      </Suspense>
    </div>
  );
}
