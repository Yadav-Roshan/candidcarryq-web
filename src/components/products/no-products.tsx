import React from "react";
import { ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NoProductsProps {
  message?: string;
  showHomeButton?: boolean;
}

export function NoProducts({
  message = "No products available at the moment",
  showHomeButton = true,
}: NoProductsProps) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {message}
        </p>
        {showHomeButton && (
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
