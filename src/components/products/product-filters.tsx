"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { formatNPR } from "@/lib/utils";
import { useProducts } from "@/contexts/products-context";

export default function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { filterOptions } = useProducts();

  // State for local filters before applying
  const [localCategory, setLocalCategory] = useState(
    searchParams.get("category") || "all"
  );

  const [localPriceRange, setLocalPriceRange] = useState<number[]>([
    Number(searchParams.get("minPrice")) || filterOptions.minPrice,
    Number(searchParams.get("maxPrice")) || filterOptions.maxPrice,
  ]);

  const [localColors, setLocalColors] = useState<string[]>(
    searchParams.get("colors")?.split(",").filter(Boolean) || []
  );

  const [localMaterials, setLocalMaterials] = useState<string[]>(
    searchParams.get("materials")?.split(",").filter(Boolean) || []
  );

  // Update price range when filter options change
  useEffect(() => {
    if (!searchParams.has("minPrice")) {
      setLocalPriceRange((prev) => [filterOptions.minPrice, prev[1]]);
    }
    if (!searchParams.has("maxPrice")) {
      setLocalPriceRange((prev) => [prev[0], filterOptions.maxPrice]);
    }
  }, [filterOptions.minPrice, filterOptions.maxPrice, searchParams]);

  // State to manage sheet open state
  const [isOpen, setIsOpen] = useState(false);

  // Apply filters to the URL
  const applyFilters = () => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString());

    // Update category parameter
    if (localCategory && localCategory !== "all") {
      params.set("category", localCategory);
    } else {
      params.delete("category");
    }

    // Update price range parameters
    if (localPriceRange[0] > filterOptions.minPrice) {
      params.set("minPrice", localPriceRange[0].toString());
    } else {
      params.delete("minPrice");
    }

    if (localPriceRange[1] < filterOptions.maxPrice) {
      params.set("maxPrice", localPriceRange[1].toString());
    } else {
      params.delete("maxPrice");
    }

    // Update colors parameter
    if (localColors.length > 0) {
      params.set("colors", localColors.join(","));
    } else {
      params.delete("colors");
    }

    // Update materials parameter
    if (localMaterials.length > 0) {
      params.set("materials", localMaterials.join(","));
    } else {
      params.delete("materials");
    }

    // Navigate to the new URL with updated filters
    router.push(`${pathname}?${params.toString()}`);

    // Close the filter sheet after applying
    setIsOpen(false);
  };

  // Reset all filters
  const resetFilters = () => {
    // Reset local filter states
    setLocalCategory("all");
    setLocalPriceRange([filterOptions.minPrice, filterOptions.maxPrice]);
    setLocalColors([]);
    setLocalMaterials([]);

    // Reset the URL - either clear all params or just keep non-filter params
    // For simplicity, we'll just navigate to the base path
    router.push(pathname);

    // Close the filter sheet after resetting
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Products
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Products</SheetTitle>
        </SheetHeader>
        <div className="py-6">
          <div className="space-y-6">
            {/* Category Filters */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="category-all"
                    checked={localCategory === "all"}
                    onCheckedChange={() => setLocalCategory("all")}
                  />
                  <label
                    htmlFor="category-all"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    All Categories
                  </label>
                </div>

                {filterOptions.categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={localCategory === category}
                      onCheckedChange={() => setLocalCategory(category)}
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-sm leading-none capitalize peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Price Range</h3>
              <Slider
                defaultValue={localPriceRange}
                value={localPriceRange}
                onValueChange={setLocalPriceRange}
                min={filterOptions.minPrice}
                max={filterOptions.maxPrice}
                step={100}
                className="py-4"
              />
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  {formatNPR(localPriceRange[0])}
                </p>
                <p className="text-muted-foreground">
                  {formatNPR(localPriceRange[1])}
                </p>
              </div>
            </div>

            {/* Colors Filter - Only show if we have colors */}
            {filterOptions.colors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Colors</h3>
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.colors.map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox
                        id={`color-${color}`}
                        checked={localColors.includes(color)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setLocalColors([...localColors, color]);
                          } else {
                            setLocalColors(
                              localColors.filter((c) => c !== color)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`color-${color}`}
                        className="text-sm leading-none capitalize"
                      >
                        {color}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materials Filter - Only show if we have materials */}
            {filterOptions.materials.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Materials</h3>
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.materials.map((material) => (
                    <div key={material} className="flex items-center space-x-2">
                      <Checkbox
                        id={`material-${material}`}
                        checked={localMaterials.includes(material)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setLocalMaterials([...localMaterials, material]);
                          } else {
                            setLocalMaterials(
                              localMaterials.filter((m) => m !== material)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`material-${material}`}
                        className="text-sm leading-none capitalize"
                      >
                        {material}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pt-4">
              <Button onClick={applyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button
                onClick={resetFilters}
                variant="outline"
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
