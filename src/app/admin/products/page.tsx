"use client";

import { useState, useEffect } from "react";
import { Loader2, PlusCircle, Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

// Important: Use this interface instead of importing from server-side code
interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  salePrice?: number;
  stock?: number;
  featured?: boolean;
  publishedDate?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Client-side fetch of products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products || []);
        setFilteredProducts(data.products || []);
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

    fetchProducts();
  }, [toast]);

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredProducts(
        products.filter(
          (product) =>
            product.name.toLowerCase().includes(term) ||
            (product.category && product.category.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, products]);

  // Search change handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              onChange={handleSearchChange}
              value={searchTerm}
              className="pl-10 w-full md:w-[250px]"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={clearSearch}
              >
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="bg-card rounded-md border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-40">
                    {products.length === 0
                      ? "No products found. Add your first product!"
                      : "No products match your search."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[250px]">
                        {product.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.category ? (
                        <span className="capitalize">{product.category}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          Uncategorized
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.salePrice ? (
                        <div className="flex flex-col">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {formatPrice(product.salePrice)}
                          </span>
                          <span className="text-muted-foreground text-xs line-through">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span>{formatPrice(product.price)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {typeof product.stock === "number" ? (
                        product.stock > 0 ? (
                          product.stock < 5 ? (
                            <Badge
                              variant="outline"
                              className="text-amber-500 border-amber-500"
                            >
                              Low: {product.stock}
                            </Badge>
                          ) : (
                            <span>{product.stock}</span>
                          )
                        ) : (
                          <Badge variant="destructive">Out of stock</Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.isFeatured ? (
                        <Badge className="bg-primary">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          No (value: {String(product.isFeatured)})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/products/${product.id}`}>
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
