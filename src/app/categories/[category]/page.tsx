// Add the import
import { normalizeCategory, VALID_CATEGORIES } from "@/lib/category-utils";

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductsHeader } from "@/components/products/products-header";
import { ProductsFilters } from "@/components/products/products-filters";
import { getAllProducts } from "@/lib/server-api";

// Define valid category paths - use our VALID_CATEGORIES const
const validCategories = VALID_CATEGORIES;

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
  
  // Normalize the category from the URL
  const normalizedCategory = normalizeCategory(category);
  
  // If the normalized category is different from the URL parameter,
  // redirect to the normalized version
  if (normalizedCategory !== category) {
    redirect(`/categories/${normalizedCategory}`);
  }

  // Validate category
  if (!validCategories.includes(normalizedCategory)) {
    notFound();
  }

  // Add category to search params
  const queryParams = { ...searchParams, category: normalizedCategory };

  // Server-side fetch products
  const products = await getAllProducts(queryParams);

  const categoryTitle = normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1);

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
