import { Metadata } from "next";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductsHeader } from "@/components/products/products-header";
import { ProductsFilters } from "@/components/products/products-filters";
import { getAllProducts } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Products | CandidWear",
  description: "Browse our collection of premium bags and accessories.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: {
    page?: string;
    limit?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    colors?: string;
    materials?: string;
  };
}) {
  // Server-side fetch products with properly awaited searchParams
  const products = await getAllProducts(searchParams || {});

  return (
    <div className="container py-8">
      <ProductsHeader title="All Products" />

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 mt-6">
        <ProductsFilters />

        <div className="space-y-6">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
