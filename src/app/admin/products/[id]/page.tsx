"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductEditForm } from "@/components/admin/product-edit-form";
import {
  fetchProductById,
  ProductDetail,
  updateProduct,
  deleteProduct,
} from "@/lib/client/product-detail-service";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Load product data
  useEffect(() => {
    async function loadProduct() {
      if (!id) return;

      try {
        setIsLoading(true);
        const productData = await fetchProductById(id.toString());
        console.log("PRODUCT DATA: ", productData);

        // Add diagnostic logging
        console.log("ProductPage - Raw product data:", productData);
        console.log("ProductPage - Warranty and Return Policy:", {
          warranty: productData?.warranty,
          returnPolicy: productData?.returnPolicy,
          hasWarranty: productData && "warranty" in productData,
          hasReturnPolicy: productData && "returnPolicy" in productData,
        });

        // Make sure warranty and returnPolicy are explicitly set
        if (productData) {
          if (typeof productData.warranty === "undefined") {
            productData.warranty = "";
          }
          if (typeof productData.returnPolicy === "undefined") {
            productData.returnPolicy = "";
          }
        }

        setProduct(productData);
      } catch (error) {
        console.error("Error loading product:", error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [id, toast]);

  // Handle form submission
  const handleSubmit = async (data: Partial<ProductDetail>) => {
    if (!id) return;

    try {
      setIsSubmitting(true);

      // Check for auth token before even trying to update
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description:
            "You need to be logged in to update products. Please log in again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const result = await updateProduct(id.toString(), data);

      toast({
        title: "Product updated",
        description: "Product details have been successfully updated",
      });

      // Redirect back to products list after successful update
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update product details",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle product deletion
  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteProduct(id.toString());
      toast({
        title: "Product deleted",
        description: "Product has been successfully deleted",
      });
      router.push("/admin/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-center py-12">
          <p className="text-xl font-medium">Product not found</p>
          <p className="text-muted-foreground mt-2">
            The product you are looking for does not exist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete Product
        </Button>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        <ProductEditForm
          product={product}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              product and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
