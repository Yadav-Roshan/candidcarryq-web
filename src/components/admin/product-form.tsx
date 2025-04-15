"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Loader2 } from "lucide-react";
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

// Validation schema
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

// Available categories
const categories = [
  { value: "backpacks", label: "Backpacks" },
  { value: "handbags", label: "Handbags" },
  { value: "wallets", label: "Wallets" },
  { value: "travel", label: "Travel" },
  { value: "accessories", label: "Accessories" },
];

type ProductFormProps = {
  product?: Product;
  isEditing?: boolean;
};

export function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Set up form with default values
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

  // Add an image URL to the images array
  const addImage = () => {
    if (imageUrl && !images.includes(imageUrl)) {
      setImages([...images, imageUrl]);
      setImageUrl("");
    }
  };

  // Remove an image from the images array
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    setIsSubmitting(true);

    try {
      const productData = {
        ...values,
        images,
        id: product?.id || Date.now().toString(), // Generate an ID for new products
        image: images[0] || "", // Set the main image as the first image
      };

      // Here you would make an API call to save the product
      console.log("Saving product:", productData);

      // Show success message
      toast({
        title: isEditing ? "Product updated" : "Product created",
        description: isEditing
          ? `${values.name} has been updated successfully`
          : `${values.name} has been created successfully`,
      });

      // Redirect back to products page
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
          {/* Basic Information */}
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

            {/* Replace the custom categories dropdown with the CategoryFormField */}
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

          {/* Product Details */}
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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="h-24 w-full object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {images.length === 0 && (
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
