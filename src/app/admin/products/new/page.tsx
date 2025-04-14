"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ProductEditForm } from "@/components/admin/product-edit-form";
import { ProductDetail } from "@/lib/client/product-detail-service";

export default function NewProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (data: Partial<ProductDetail>) => {
    try {
      setIsSubmitting(true);

      // Get authentication token from localStorage
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authorization Error",
          description:
            "You need to be logged in to create products. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add auth token to request
        },
        body: JSON.stringify(data),
      });

      // Enhanced error handling to see what's happening
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // If not valid JSON, use the text directly
          console.error("Invalid JSON response:", errorText);
          throw new Error(
            `Server error: ${response.status} - ${errorText.substring(0, 100)}`
          );
        }

        console.error("API error response:", errorData);
        throw new Error(
          errorData.message ||
            `Failed to create product (Status: ${response.status})`
        );
      }

      const result = await response.json();

      toast({
        title: "Product created",
        description: "The product has been successfully created",
      });

      // Redirect to the products list
      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create the product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Product</h1>
        <ProductEditForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isNew={true}
        />
      </div>
    </div>
  );
}
