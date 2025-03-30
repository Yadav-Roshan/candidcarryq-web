import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductsHeader } from "@/components/products/products-header";
import { ProductsFilters } from "@/components/products/products-filters";
import { getAllProducts } from "@/lib/server-api";

// Define valid category paths
const validCategories = [
  "backpacks",
  "handbags",
  "wallets",
  "travel",
  "accessories",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const title = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${title} | CandidWear`,
    description: `Browse our collection of premium ${category}.`,
  };
}

export async function generateStaticParams() {
  return validCategories.map((category) => ({
    category,
  }));
}

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    colors?: string;
    materials?: string;
  }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { category } = await params;

  // Validate category
  if (!validCategories.includes(category)) {
    notFound();
  }

  // Add category to search params
  const queryParams = { ...searchParams, category };

  // Server-side fetch products
  const products = await getAllProducts(queryParams);

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center">
        <ProductsHeader title={categoryTitle} />
        <ProductsFilters />
      </div>

      <div className="mt-6">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
