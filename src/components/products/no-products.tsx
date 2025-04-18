import React from "react";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NoProductsProps {
  searchQuery?: string;
  message?: string;
  showHomeButton?: boolean;
}

export function NoProducts({ 
  searchQuery,
  message,
  showHomeButton = true
}: NoProductsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
      {searchQuery ? (
        <>
          <h2 className="text-2xl font-medium mb-2">No products found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            We couldn't find any products matching "{searchQuery}". Try different keywords or browse our categories.
          </p>
        </>
      ) : message ? (
        <>
          <h2 className="text-2xl font-medium mb-2">No products found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {message}
          </p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-medium mb-2">No products found</h2>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters or browse our categories.
          </p>
        </>
      )}
      {showHomeButton && (
        <Button asChild>
          <Link href="/products">View All Products</Link>
        </Button>
      )}
    </div>
  );
}
