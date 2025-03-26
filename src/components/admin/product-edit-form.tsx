"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductDetail } from "@/lib/client/product-detail-service";
import { getUploadSignature } from "@/lib/client/image-upload-service";
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
import { useToast } from "@/components/ui/use-toast";
import { CldUploadWidget } from "next-cloudinary";
import { Badge } from "@/components/ui/badge";

// Validation schema
const productSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  salePrice: z.coerce.number().positive().nullable().optional(),
  category: z.string().min(1, { message: "Please select a category" }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  fullDescription: z.string().optional(),
  isFeatured: z.boolean().default(false),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  capacity: z.string().optional(),
  stock: z.coerce.number().int().nonnegative().default(0),
  // Make image validation conditional or remove URL validation since it will be set programmatically
  image: z.string().optional(), // Remove URL validation here
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
});

// Available categories
const categories = [
  { value: "backpacks", label: "Backpacks" },
  { value: "handbags", label: "Handbags" },
  { value: "wallets", label: "Wallets" },
  { value: "travel", label: "Travel" },
  { value: "accessories", label: "Accessories" },
];

interface ProductEditFormProps {
  product?: ProductDetail;
  onSubmit: (data: Partial<ProductDetail>) => Promise<void>;
  isSubmitting: boolean;
  isNew?: boolean;
}

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  thumbnail_url: string;
  original_filename: string;
}

export function ProductEditForm({
  product,
  onSubmit,
  isSubmitting,
  isNew = false,
}: ProductEditFormProps) {
  const { toast } = useToast();
  const MAX_IMAGES = 3;

  // Images state - store all images in a single array
  const [productImages, setProductImages] = useState<
    Array<{ url: string; publicId: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOptions, setUploadOptions] = useState<any>(null);

  // For managing colors and sizes
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");

  // Initialize form
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price || 0,
      salePrice: product?.salePrice || null,
      category: product?.category || "",
      description: product?.description || "",
      fullDescription: product?.fullDescription || "",
      isFeatured: product?.isFeatured || false,
      material: product?.material || "",
      dimensions: product?.dimensions || "",
      weight: product?.weight || "",
      capacity: product?.capacity || "",
      stock: product?.stock || 0,
      // Set the first image as main image for the form - now handled in useEffect
      image: "",
      colors: product?.colors || [],
      sizes: product?.sizes || [],
    },
  });

  // Initialize images from product
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      const imageObjects = product.images.map((url, index) => ({
        url,
        publicId: product.imagePublicIds?.[index] || "",
      }));
      setProductImages(imageObjects);

      // Make sure the image field is set to the first image
      if (imageObjects[0]) {
        // This was causing the error - setting form value during render
        setTimeout(() => {
          form.setValue("image", imageObjects[0].url);
        }, 0);
      }
    }
  }, [product, form]);

  // Load Cloudinary upload options
  const initializeUploadOptions = useCallback(async () => {
    try {
      const { signature, timestamp, cloudName, apiKey, folder, uploadPreset } =
        await getUploadSignature(product?.id);

      setUploadOptions({
        cloudName,
        apiKey,
        uploadPreset, // Include the upload preset from the server
        uploadSignature: signature,
        uploadSignatureTimestamp: timestamp,
        folder,
        sources: ["local", "url", "camera"],
        multiple: false,
        maxFiles: 1,
      });
    } catch (error) {
      console.error("Error initializing upload options:", error);

      // Check specifically for unauthorized errors
      if (error instanceof Error && error.message.includes("401")) {
        toast({
          title: "Authentication Error",
          description:
            "You need to be logged in as an admin to upload images. Please log in again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to initialize image upload",
          variant: "destructive",
        });
      }
    }
  }, [product?.id, toast]);

  // Initialize upload options on component mount
  useEffect(() => {
    initializeUploadOptions();
  }, [initializeUploadOptions]);

  // Handler for image upload completion
  const handleImageUpload = (result: CloudinaryUploadResult) => {
    if (productImages.length >= MAX_IMAGES) {
      toast({
        title: "Maximum images reached",
        description: `You can only add ${MAX_IMAGES} images per product`,
        variant: "destructive",
      });
      return;
    }

    // Validate the URL from Cloudinary
    if (!result.secure_url || !result.secure_url.startsWith("http")) {
      toast({
        title: "Invalid Image URL",
        description:
          "The image upload didn't return a valid URL. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const newImage = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    // Add to product images
    setProductImages((prev) => [...prev, newImage]);

    // If it's the first image, set it as the main image in the form
    // Use setTimeout to defer the state update outside of render
    setTimeout(() => {
      if (productImages.length === 0) {
        form.setValue("image", result.secure_url);
      }
    }, 0);
  };

  // Remove an image
  const removeImage = (index: number) => {
    setProductImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      // If we removed the first image and there's still at least one image,
      // update the main image field - use setTimeout to avoid rendering issues
      setTimeout(() => {
        if (index === 0 && updated.length > 0) {
          form.setValue("image", updated[0].url);
        } else if (updated.length === 0) {
          // If no images left, clear the image field
          form.setValue("image", "");
        }
      }, 0);

      return updated;
    });
  };

  // Add color to the array
  const addColor = () => {
    if (!colorInput.trim()) return;
    const currentColors = form.getValues("colors") || [];
    if (!currentColors.includes(colorInput.trim())) {
      form.setValue("colors", [...currentColors, colorInput.trim()]);
    }
    setColorInput("");
  };

  // Remove color from the array
  const removeColor = (color: string) => {
    const currentColors = form.getValues("colors") || [];
    form.setValue(
      "colors",
      currentColors.filter((c) => c !== color)
    );
  };

  // Add size to the array
  const addSize = () => {
    if (!sizeInput.trim()) return;
    const currentSizes = form.getValues("sizes") || [];
    if (!currentSizes.includes(sizeInput.trim())) {
      form.setValue("sizes", [...currentSizes, sizeInput.trim()]);
    }
    setSizeInput("");
  };

  // Remove size from the array
  const removeSize = (size: string) => {
    const currentSizes = form.getValues("sizes") || [];
    form.setValue(
      "sizes",
      currentSizes.filter((s) => s !== size)
    );
  };

  // Form submission handler
  const handleSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      // Check if we have at least one image
      if (productImages.length === 0) {
        toast({
          title: "Image Required",
          description: "Please upload at least one product image",
          variant: "destructive",
        });
        return;
      }

      // Ensure all image URLs are valid
      const validImages = productImages.filter((img) =>
        img.url.startsWith("http")
      );
      if (validImages.length !== productImages.length) {
        toast({
          title: "Invalid Images",
          description: "Some images have invalid URLs. Please re-upload them.",
          variant: "destructive",
        });
        return;
      }

      // Submit the form with all data
      await onSubmit({
        ...values,
        images: validImages.map((img) => img.url),
        imagePublicIds: validImages.map((img) => img.publicId),
        // Make sure to include the main image
        image: validImages[0]?.url || "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit the form",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* Colors input */}
            <FormField
              control={form.control}
              name="colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Colors</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Red"
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addColor();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addColor}
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value?.map((color, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1"
                          >
                            {color}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeColor(color)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter available colors one at a time
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Images */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <FormDescription>
                    Upload 1-3 product images. The first image will be the main
                    display image.
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-4">
                      {/* Image Gallery */}
                      <div className="grid grid-cols-3 gap-4">
                        {productImages.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square bg-muted rounded-md overflow-hidden border"
                          >
                            <img
                              src={image.url}
                              alt={`Product image ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                            {index === 0 && (
                              <div className="absolute top-0 left-0 bg-primary text-white text-xs px-2 py-1">
                                Main
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        {/* Upload Button - show only if less than MAX_IMAGES */}
                        {productImages.length < MAX_IMAGES && uploadOptions && (
                          <CldUploadWidget
                            options={uploadOptions}
                            onSuccess={(result) => {
                              if (result?.info) {
                                handleImageUpload(
                                  result.info as CloudinaryUploadResult
                                );
                              }
                            }}
                            onUpload={() => setIsUploading(true)}
                            onComplete={() => setIsUploading(false)}
                            signatureEndpoint="/api/admin/upload"
                          >
                            {({ open }) => (
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full aspect-square border-dashed flex flex-col gap-2"
                                onClick={() => open()}
                              >
                                <Upload className="h-6 w-6" />
                                <span>Upload Image</span>
                              </Button>
                            )}
                          </CldUploadWidget>
                        )}
                      </div>

                      <input type="hidden" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Number of items available for purchase
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

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

            {/* Sizes input */}
            <FormField
              control={form.control}
              name="sizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Sizes</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Large"
                          value={sizeInput}
                          onChange={(e) => setSizeInput(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSize();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addSize}
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value?.map((size, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1"
                          >
                            {size}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeSize(size)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter available sizes one at a time
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
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
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || isUploading || productImages.length === 0}
          >
            {(isSubmitting || isUploading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isNew ? "Create Product" : "Update Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
