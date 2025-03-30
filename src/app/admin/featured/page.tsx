"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, GripVertical, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
// Import from client service instead of direct API
import {
  fetchProducts,
  updateFeaturedProducts,
  Product,
} from "@/lib/client/product-service";

export default function FeaturedProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Load products on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        // Get all products
        const products = await fetchProducts();
        setAllProducts(products);

        // Set initially featured products
        setFeaturedProducts(products.filter((product) => product.featured)); // Changed from isFeatured to featured
      } catch (error) {
        console.error("Error loading products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [toast]);

  // Add product to featured list
  const addToFeatured = (product: Product) => {
    setFeaturedProducts((prev) => {
      // Don't add if already featured
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  // Remove product from featured list
  const removeFromFeatured = (productId: string) => {
    setFeaturedProducts((prev) =>
      prev.filter((product) => product.id !== productId)
    );
  };

  // Save featured products
  const saveFeaturedProducts = async () => {
    setIsSaving(true);
    try {
      // Get IDs of featured products
      const featuredIds = featuredProducts.map((p) => p.id);

      // Call API to update
      await updateFeaturedProducts(featuredIds);

      toast({
        title: "Featured products updated",
        description: `Featured products have been updated successfully`,
      });
    } catch (error) {
      console.error("Error saving featured products:", error);
      toast({
        title: "Error",
        description: "There was a problem saving featured products",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Randomly select features
  const selectRandomFeatured = () => {
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    setFeaturedProducts(shuffled.slice(0, 4));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Featured Products</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={selectRandomFeatured}>
            Randomize Selection
          </Button>
          <Button onClick={saveFeaturedProducts} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Current Featured Products
        </h2>
        {featuredProducts.length === 0 ? (
          <p className="text-muted-foreground">
            No featured products selected.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="relative">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-md overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Star className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {product.category &&
                        product.category.charAt(0).toUpperCase() +
                          product.category.slice(1)}
                    </p>
                    <p className="mt-1">
                      {product.salePrice ? (
                        <span className="text-sm">
                          {formatPrice(product.salePrice)}{" "}
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.price)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => removeFromFeatured(product.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">All Products</h2>
        <div className="border rounded-md divide-y">
          {allProducts.map((product) => (
            <div
              key={product.id}
              className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                checked={featuredProducts.some((p) => p.id === product.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    addToFeatured(product);
                  } else {
                    removeFromFeatured(product.id);
                  }
                }}
                aria-label={`Feature ${product.name}`}
              />
              <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Star className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{product.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {product.category &&
                    product.category.charAt(0).toUpperCase() +
                      product.category.slice(1)}
                </p>
              </div>
              <div className="flex-shrink-0">
                {product.salePrice ? (
                  <div>
                    <span className="font-medium">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through ml-2">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="font-medium">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
