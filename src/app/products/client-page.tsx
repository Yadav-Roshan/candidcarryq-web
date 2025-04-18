"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/products/product-card";
import ProductFilters from "@/components/products/product-filters";
import { useProducts } from "@/contexts/products-context";

// Use the root ProductsProvider that's already set up in providers.tsx
export function ProductsPageClient() {
  const { products, isLoading } = useProducts();
  const searchParams = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");

  // Apply filters whenever products change or search params change
  useEffect(() => {
    if (isLoading) return;

    let result = [...products];

    // Search query filter - add this before other filters
    const searchTerm = searchParams?.get("search");
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term))
      );
    }

    // Category filter
    const category = searchParams?.get("category");
    if (category && category !== "all") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Price range filter
    const minPrice = searchParams?.get("minPrice");
    if (minPrice) {
      result = result.filter((p) => p.price >= Number(minPrice));
    }

    const maxPrice = searchParams?.get("maxPrice");
    if (maxPrice) {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }

    // Colors filter
    const colors = searchParams?.get("colors")?.split(",");
    if (colors && colors.length > 0) {
      result = result.filter((p) => {
        if (!p.colors || p.colors.length === 0) return false;
        return colors.some((color) =>
          p.colors?.some((c) => c.toLowerCase().includes(color.toLowerCase()))
        );
      });
    }

    // Materials filter
    const materials = searchParams?.get("materials")?.split(",");
    if (materials && materials.length > 0) {
      result = result.filter((p) => {
        if (!p.material) return false;
        return materials.some((material) =>
          (p.material?.toLowerCase() || "").includes(material.toLowerCase())
        );
      });
    }

    // Sort filter
    const sort = searchParams?.get("sort");
    if (sort) {
      switch (sort) {
        case "price-low":
          result.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          result.sort((a, b) => b.price - a.price);
          break;
        case "name-asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        // Add other sort options as needed
      }
    }

    setFilteredProducts(result);
  }, [products, searchParams, isLoading]);

  if (isLoading) {
    return <p>Loading products...</p>;
  }

  return (
    <>
      {searchParams?.get("search") && (
        <div className="mb-6">
          <h2 className="text-xl font-medium">
            Search results for "{searchParams.get("search")}"
            {filteredProducts.length > 0 ? (
              <span className="text-muted-foreground ml-2">
                ({filteredProducts.length} items found)
              </span>
            ) : (
              <span className="text-muted-foreground ml-2">(No items found)</span>
            )}
          </h2>
        </div>
      )}

      <div className="mb-4">
        <ProductFilters />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
            category={product.category}
            salePrice={product.salePrice ?? undefined}
            rating={product.rating}
            reviewCount={product.reviewCount}
            stock={product.stock}
            description={product.description}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-xl">No products found</p>
          <p className="text-muted-foreground mt-2">
            Try changing your filters or search term
          </p>
        </div>
      )}
    </>
  );
}
