"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Product } from "@/contexts/cart-context";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryFormField } from "./product-form-fields";
import { CldUploadWidget } from "next-cloudinary";
import { getUploadSignature } from "@/lib/client/image-upload-service";

const productSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  price: z.coerce
    .number()
    .positive({ message: "Price must be a positive number" }),
  salePrice: z.coerce.number().positive().optional().nullable(),
  category: z.string().min(1, { message: "Please select a category" }),
  description: z.string().optional(),
  fullDescription: z.string().optional(),
  featured: z.boolean().default(false),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  capacity: z.string().optional(),
});

const categories = [
  { value: "backpacks", label: "Backpacks" },
  { value: "handbags", label: "Handbags" },
  { value: "wallets", label: "Wallets" },
  { value: "travel", label: "Travel" },
  { value: "accessories", label: "Accessories" },
];

interface ProductImage {
  url: string;
  publicId: string;
}

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
}

// Extended product interface to support imagePublicIds
interface ExtendedProduct extends Partial<Product> {
  imagePublicIds?: string[];
}

type ProductFormProps = {
  product?: ExtendedProduct;
  isEditing?: boolean;
};

export function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const [productImages, setProductImages] = useState<ProductImage[]>(
    product?.images
      ? product.images.map((url, i) => ({
          url,
          // Safely access imagePublicIds if it exists
          publicId: (product.imagePublicIds && product.imagePublicIds[i]) || "",
        }))
      : []
  );
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImages, setDeletingImages] = useState<Record<number, boolean>>(
    {}
  );
  const [uploadOptions, setUploadOptions] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price || 0,
      salePrice: product?.salePrice || null,
      category: product?.category || "",
      description: product?.description || "",
      fullDescription: product?.fullDescription || "",
      featured: Boolean(product?.featured) || false,
      material: product?.material || "",
      dimensions: product?.dimensions || "",
      weight: product?.weight || "",
      capacity: product?.capacity || "",
    },
  });

  const initializeUploadOptions = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        return;
      }

      const { signature, timestamp, cloudName, apiKey, folder, uploadPreset } =
        await getUploadSignature(undefined, "product_upload");

      setUploadOptions({
        cloudName,
        apiKey,
        uploadPreset,
        uploadSignature: signature,
        uploadSignatureTimestamp: timestamp,
        folder,
        sources: ["local", "url", "camera"],
        multiple: false,
        maxFiles: 1,
      });
    } catch (error) {
      console.error("Error initializing upload options:", error);
      toast({
        title: "Error",
        description: "Failed to initialize image upload",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    initializeUploadOptions();
  }, []);

  const handleImageUpload = (result: CloudinaryUploadResult) => {
    if (!result.secure_url || !result.secure_url.startsWith("http")) {
      toast({
        title: "Invalid Image URL",
        description: "The image upload didn't return a valid URL. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const newImage = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    setProductImages((prev) => [...prev, newImage]);
    toast({
      title: "Upload Complete",
      description: "Product image uploaded successfully",
    });
  };

  const addImage = () => {
    if (imageUrl && !productImages.some((img) => img.url === imageUrl)) {
      setProductImages([...productImages, { url: imageUrl, publicId: "" }]);
      setImageUrl("");
    }
  };

  const removeImage = async (index: number) => {
    const imageToDelete = productImages[index];

    setDeletingImages((prev) => ({ ...prev, [index]: true }));

    // Only attempt to delete from Cloudinary if we have a publicId
    if (imageToDelete.publicId && imageToDelete.publicId.trim() !== "") {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in again.",
            variant: "destructive",
          });
          setDeletingImages((prev) => {
            const updated = { ...prev };
            delete updated[index];
            return updated;
          });
          return;
        }

        const response = await fetch("/api/admin/products/images", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product?.id || "temp",
            imageUrl: imageToDelete.url,
            publicId: imageToDelete.publicId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete image");
        }

        // If we have a product ID, fetch fresh product data to clear cache
        if (product?.id) {
          try {
            const refreshResponse = await fetch(`/api/products/${product.id}?t=${Date.now()}`, {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            
            if (refreshResponse.ok) {
              // This request just ensures cache invalidation
              console.log("Product data refreshed after image deletion");
            }
          } catch (refreshError) {
            console.error("Error refreshing product data:", refreshError);
            // Continue even if refresh fails
          }
        }

        toast({
          title: "Image deleted",
          description: "Image has been removed",
        });
      } catch (error) {
        console.error("Error deleting image:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to delete image",
          variant: "destructive",
        });

        setDeletingImages((prev) => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });
        return;
      }
    }

    // Always update the local state regardless of whether Cloudinary deletion succeeded
    setProductImages(productImages.filter((_, i) => i !== index));
    
    setDeletingImages((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  useEffect(() => {
    // Clear any cached product image data
    if (product?.id) {
      localStorage.removeItem(`product_images_${product.id}`);
    }
    
    // Add a timestamp parameter to force revalidation
    const timestamp = Date.now();
    setUploadOptions((prev: any) => prev ? {...prev, timestamp} : null);
    
    return () => {
      // Clear cache when component unmounts
      if (product?.id) {
        localStorage.removeItem(`product_images_${product.id}`);
      }
    };
  }, [product?.id]);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    setIsSubmitting(true);

    try {
      if (productImages.length === 0) {
        toast({
          title: "Image Required",
          description: "Please add at least one image for your product",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const productData = {
        ...values,
        images: productImages.map((img) => img.url),
        // Only include non-empty publicIds
        imagePublicIds: productImages
          .map((img) => img.publicId)
          .filter(id => id && id.trim() !== ""),
        id: product?.id || Date.now().toString(),
        image: productImages[0]?.url || "",
      };

      console.log("Saving product:", productData);

      toast({
        title: isEditing ? "Product updated" : "Product created",
        description: isEditing
          ? `${values.name} has been updated successfully`
          : `${values.name} has been created successfully`,
      });

      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Urban Commuter Backpack" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (NPR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="3500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2800"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty for no sale price
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CategoryFormField />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Short summary shown in product listings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed product description"
                      className="resize-none min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description shown on product page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Product</FormLabel>
                    <FormDescription>
                      Display this product on the homepage featured section
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Product Images</h3>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={addImage}
                  className="flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {uploadOptions && (
                <div className="mb-2">
                  <CldUploadWidget
                    options={uploadOptions}
                    onUpload={() => setIsUploading(true)}
                    onClose={() => setIsUploading(false)}
                    onSuccess={(result) => {
                      setIsUploading(false);
                      if (result?.info) {
                        handleImageUpload(result.info as CloudinaryUploadResult);
                      }
                    }}
                    signatureEndpoint="/api/admin/upload"
                  >
                    {({ open }) => (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => open()}
                        className="w-full"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </>
                        )}
                      </Button>
                    )}
                  </CldUploadWidget>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {productImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Product image ${index + 1}`}
                      className={`h-24 w-full object-cover rounded-md border ${
                        deletingImages[index] ? "opacity-50" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => removeImage(index)}
                      disabled={deletingImages[index]}
                    >
                      {deletingImages[index] ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {productImages.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Add at least one image for your product
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <FormControl>
                      <Input placeholder="Premium leather" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensions</FormLabel>
                    <FormControl>
                      <Input placeholder='16" x 12" x 6"' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <Input placeholder="1.8 kg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input placeholder="22L" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting || isUploading || Object.keys(deletingImages).length > 0
            }
          >
            {(isSubmitting || isUploading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
