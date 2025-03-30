import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getAllProducts } from "@/lib/server-api";
import { NoProducts } from "@/components/products/no-products";
// Import the Product type from the product service
import { Product as ProductType } from "@/lib/client/product-service";

// We'll use the imported Product type instead of defining our own
interface CategoryWithProducts {
  normalized: string;
  display: string;
  products: ProductType[];
}

export const metadata: Metadata = {
  title: "Product Categories - CandidCarryq",
  description: "Browse products by category",
};

export default async function CategoriesPage() {
  // Get all products from database
  const allProducts = await getAllProducts();

  // Extract unique categories and normalize them
  const categoriesMap = new Map<string, CategoryWithProducts>();

  allProducts.forEach((product) => {
    if (product.category) {
      // Normalize category to lowercase
      const normalizedCategory = product.category.toLowerCase().trim();

      // Skip empty categories
      if (!normalizedCategory) return;

      // If this normalized category isn't in our map yet, add it with the original case preserved
      if (!categoriesMap.has(normalizedCategory)) {
        categoriesMap.set(normalizedCategory, {
          normalized: normalizedCategory,
          display: product.category, // Keep original case for display
          products: [],
        });
      }

      // Make sure product.image is not undefined (as required by ProductType)
      const productWithRequiredImage = {
        ...product,
        image: product.image || "", // Ensure image is never undefined
      };

      // Add product to this category
      categoriesMap
        .get(normalizedCategory)!
        .products.push(productWithRequiredImage as ProductType);
    }
  });

  // Convert map to array for easier iteration
  const categoriesWithProducts = Array.from(categoriesMap.values())
    .filter((cat) => cat.products.length > 0)
    .sort((a, b) => a.display.localeCompare(b.display)); // Sort alphabetically

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
          <div key={category.normalized} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold capitalize">
                {category.display}
              </h2>
              <Button variant="outline" asChild>
                <Link
                  href={`/categories/${category.normalized}`}
                  className="flex items-center gap-2"
                >
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <Suspense fallback={<ProductSkeletons count={4} />}>
                {category.products.slice(0, 4).map((product) => (
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
