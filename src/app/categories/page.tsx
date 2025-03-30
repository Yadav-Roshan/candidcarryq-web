import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getAllProducts } from "@/lib/server-api";
import { NoProducts } from "@/components/products/no-products";

export const metadata: Metadata = {
  title: "Product Categories - CandidWear",
  description: "Browse products by category",
};

// Define valid categories
const validCategories = [
  "backpacks",
  "handbags",
  "wallets",
  "travel",
  "accessories",
];

export default async function CategoriesPage() {
  // Get all products from database
  const allProducts = await getAllProducts();

  // Group products by category
  const groupedProducts = validCategories.reduce((acc, category) => {
    acc[category] = allProducts.filter(
      (product) => product.category === category
    );
    return acc;
  }, {} as Record<string, any[]>);

  // Get categories that have products
  const categoriesWithProducts = validCategories.filter(
    (category) => groupedProducts[category].length > 0
  );

  // If no products found at all
  if (categoriesWithProducts.length === 0) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Shop by Category</h1>
        <NoProducts message="No products found in any category. Please check back later." />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Shop by Category</h1>

      <div className="space-y-12">
        {categoriesWithProducts.map((category) => (
          <div key={category} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold capitalize">{category}</h2>
              <Button variant="outline" asChild>
                <Link
                  href={`/categories/${category}`}
                  className="flex items-center gap-2"
                >
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <Suspense fallback={<ProductSkeletons count={4} />}>
                {groupedProducts[category].slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </Suspense>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton loading component for products
function ProductSkeletons({ count = 4 }) {
  return (
    <>
      {Array(count)
        .fill(null)
        .map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-52 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
    </>
  );
}
