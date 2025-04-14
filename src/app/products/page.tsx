import { Metadata } from "next";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductsHeader } from "@/components/products/products-header";
import { ProductsFilters } from "@/components/products/products-filters";
import { getAllProducts } from "@/lib/server-api";

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Products | CandidWear",
  description: "Browse our collection of premium bags and accessories.",
};

// Don't use explicit parameter typing - let Next.js infer the types
export default async function ProductsPage(props: any) {
  // Handle the searchParams regardless of whether it's a Promise or object
  const searchParams =
    props.searchParams instanceof Promise
      ? await props.searchParams
      : props.searchParams || {};

  // Server-side fetch products with the properly handled search parameters
  const products = await getAllProducts(searchParams);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center">
        <ProductsHeader title="All Products" />
        <ProductsFilters />
      </div>

      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
