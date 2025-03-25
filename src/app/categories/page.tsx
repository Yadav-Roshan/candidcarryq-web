import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { mockProducts } from "@/lib/api-mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Product Categories - CandidWear",
  description: "Browse products by category",
};

// Utility function to group products by category
function groupProductsByCategory(products) {
  return products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});
}

export default function CategoriesPage() {
  // Group the mock products by category
  const groupedProducts = groupProductsByCategory(mockProducts);

  // Get unique categories sorted alphabetically
  const categories = Object.keys(groupedProducts).sort();

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Shop by Category</h1>

      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold capitalize">{category}</h2>
              <Button variant="outline" asChild>
                <Link
                  href={`/products?category=${category}`}
                  className="flex items-center gap-2"
                >
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <Suspense fallback={<ProductSkeletons count={4} />}>
                {groupedProducts[category].map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    category={product.category}
                    salePrice={product.salePrice}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    stock={product.stock}
                    description={product.description}
                  />
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
