"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/products/product-card";
import { mockProducts } from "@/lib/api-mock-data";

interface ProductRecommendationsProps {
  productId: string;
  category?: string;
}

export function ProductRecommendations({
  productId,
  category,
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from server with real API
        const response = await fetch(
          `/api/products/recommendations?id=${productId}&category=${
            category || ""
          }`
        );

        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
        } else {
          // If server fails, use mock data
          // Filter out the current product and get products in the same category
          const filtered = mockProducts
            .filter((p) => p.id !== productId)
            .filter((p) => !category || p.category === category)
            .slice(0, 4);

          setRecommendations(filtered);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        // Fallback to mock data
        const filtered = mockProducts
          .filter((p) => p.id !== productId)
          .filter((p) => !category || p.category === category)
          .slice(0, 4);

        setRecommendations(filtered);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId, category]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg aspect-square mb-3"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return <p>No related products found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {recommendations.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
