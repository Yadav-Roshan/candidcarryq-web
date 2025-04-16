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
import { useDebugValue } from "react";
import { normalizeCategory } from "@/lib/category-utils";
import { CategoryFormField } from "./product-form-fields";

// Validation schema
const productSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  salePrice: z.coerce.number().positive().nullable().optional(),
  category: z.string().min(1, { message: "Please select a category" }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  fullDescription: z.string().optional(),
  featured: z.boolean().default(false), // Changed from isFeatured to featured
  material: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  capacity: z.string().optional(),
  stock: z.coerce.number().int().nonnegative().default(0),
  image: z.string().optional(),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  warranty: z.string().optional(),
  returnPolicy: z.string().optional(),
});

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
  const MAX_IMAGES = 3; // Keep at 3 to match business requirements

  const [productImages, setProductImages] = useState<
    Array<{ url: string; publicId: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOptions, setUploadOptions] = useState<any>(null);
  const [disableUploadWidget, setDisableUploadWidget] = useState(false);

  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");

  const [deletingImages, setDeletingImages] = useState<Record<number, boolean>>({});

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price || 0,
      salePrice: product?.salePrice || null,
      category: product?.category || "",
      description: product?.description || "",
      fullDescription: product?.fullDescription || "",
      featured: product?.featured || false,
      material: product?.material || "",
      dimensions: product?.dimensions || "",
      weight: product?.weight || "",
      capacity: product?.capacity || "",
      stock: product?.stock || 0,
      image: "",
      colors: product?.colors || [],
      sizes: Array.isArray((product as any)?.sizes)
        ? (product as any).sizes
        : [],
      warranty: product?.warranty || "",
      returnPolicy: product?.returnPolicy || "",
    },
  });

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      const imageObjects = product.images.map((url, index) => ({
        url,
        publicId: product.imagePublicIds?.[index] || "",
      }));
      setProductImages(imageObjects);

      if (imageObjects[0]) {
        setTimeout(() => {
          form.setValue("image", imageObjects[0].url);
        }, 0);
      }
    }
  }, [product, form]);

  const initializeUploadOptions = useCallback(async () => {
    try {
      const { signature, timestamp, cloudName, apiKey, folder, uploadPreset } =
        await getUploadSignature(product?.id, "product_upload");

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

  useEffect(() => {
    initializeUploadOptions();
  }, [initializeUploadOptions]);

  useEffect(() => {
    return () => {};
  }, []);

  const handleImageUpload = (result: CloudinaryUploadResult) => {
    const currentLength = productImages.length;

    if (currentLength >= MAX_IMAGES - 1) {
      setDisableUploadWidget(true);
    }

    if (currentLength >= MAX_IMAGES) {
      toast({
        title: "Maximum images reached",
        description: `You can only add ${MAX_IMAGES} images per product`,
        variant: "destructive",
      });
      return;
    }

    const newImage = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    setProductImages((prev) => [...prev, newImage]);

    if (productImages.length === 0) {
      setTimeout(() => {
        form.setValue("image", result.secure_url);
      }, 0);
    }

    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
  };

  const removeImage = async (index: number) => {
    const imageToDelete = productImages[index];
    
    if (!isNew && product?.id) {
      try {
        setDeletingImages(prev => ({ ...prev, [index]: true }));
        
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        const response = await fetch("/api/admin/products/images", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            imageUrl: imageToDelete.url,
            publicId: imageToDelete.publicId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete image");
        }

        toast({
          title: "Image deleted",
          description: "Image has been removed from the product",
        });
      } catch (error) {
        console.error("Error deleting image:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete image",
          variant: "destructive",
        });
        
        setDeletingImages(prev => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });
        return;
      }
    }

    setDisableUploadWidget(false);
    const wasFirstImage = index === 0;
    const updatedImages = productImages.filter((_, i) => i !== index);
    setProductImages(updatedImages);

    setDeletingImages(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });

    setTimeout(() => {
      if (wasFirstImage && updatedImages.length > 0) {
        form.setValue("image", updatedImages[0].url);
      } else if (updatedImages.length === 0) {
        form.setValue("image", "");
      }
    }, 0);

    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
  };

  const addColor = () => {
    if (!colorInput.trim()) return;
    const currentColors = form.getValues("colors") || [];
    if (!currentColors.includes(colorInput.trim())) {
      form.setValue("colors", [...currentColors, colorInput.trim()]);
    }
    setColorInput("");
  };

  const removeColor = (color: string) => {
    const currentColors = form.getValues("colors") || [];
    form.setValue(
      "colors",
      currentColors.filter((c) => c !== color)
    );
  };

  const addSize = () => {
    if (!sizeInput.trim()) return;
    const currentSizes = form.getValues("sizes") || [];
    if (!currentSizes.includes(sizeInput.trim())) {
      form.setValue("sizes", [...currentSizes, sizeInput.trim()]);
    }
    setSizeInput("");
  };

  const removeSize = (size: string) => {
    const currentSizes = form.getValues("sizes") || [];
    form.setValue(
      "sizes",
      currentSizes.filter((s) => s !== size)
    );
  };

  const handleSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      if (productImages.length === 0) {
        toast({
          title: "Image Required",
          description: "Please upload at least one product image",
          variant: "destructive",
        });
        return;
      }

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

      const normalizedValues = {
        ...values,
        category: normalizeCategory(values.category.trim()),
      };

      await onSubmit({
        ...normalizedValues,
        images: validImages.map((img) => img.url),
        imagePublicIds: validImages.map((img) => img.publicId),
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

  useEffect(() => {
    if (product) {
      form.setValue("warranty", product.warranty || "");
      form.setValue("returnPolicy", product.returnPolicy || "");
      form.setValue("fullDescription", product.fullDescription || "");
    }
  }, [product, form]);

  useEffect(() => {
    if (product) {
      form.reset(
        {
          name: product.name || "",
          price: product.price || 0,
          salePrice: product.salePrice || null,
          category: product.category || "",
          description: product.description || "",
          fullDescription: product.fullDescription || "",
          featured: product.featured || false,
          material: product.material || "",
          dimensions: product.dimensions || "",
          weight: product.weight || "",
          capacity: product.capacity || "",
          stock: product.stock || 0,
          colors: product.colors || [],
          sizes: Array.isArray((product as any).sizes)
            ? (product as any).sizes
            : [],
          warranty: product.warranty || "",
          returnPolicy: product.returnPolicy || "",
          image: form.getValues("image"),
        },
        {
          keepDefaultValues: false,
        }
      );

      setTimeout(() => {
        const currentWarranty = form.getValues("warranty");
        const currentReturnPolicy = form.getValues("returnPolicy");
      }, 0);
    }
  }, [product, form]);

  useEffect(() => {
    if (product) {
      if (!form.getValues("warranty")) {
        form.register("warranty");
      }
      if (!form.getValues("returnPolicy")) {
        form.register("returnPolicy");
      }

      setTimeout(() => {
        form.setValue("warranty", product.warranty || "", {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });

        form.setValue("returnPolicy", product.returnPolicy || "", {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }, 100);
    }
  }, [product, form]);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;

    const checkAndRestoreScroll = () => {
      if (document.body.style.overflow === "hidden") {
        document.body.style.overflow = "auto";
      }
    };

    const scrollCheckInterval = setInterval(checkAndRestoreScroll, 300);

    return () => {
      clearInterval(scrollCheckInterval);
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    if (product && form) {
      const warranty =
        typeof product.warranty === "string" ? product.warranty : "";
      const returnPolicy =
        typeof product.returnPolicy === "string" ? product.returnPolicy : "";

      setTimeout(() => {
        document
          .querySelector('input[name="warranty"]')
          ?.setAttribute("value", warranty);
        document
          .querySelector('input[name="returnPolicy"]')
          ?.setAttribute("value", returnPolicy);

        form.setValue("warranty", warranty);
        form.setValue("returnPolicy", returnPolicy);
      }, 200);
    }
  }, [product, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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

            {/* Replace the text input with the CategoryFormField dropdown component */}
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
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
                    <div
                      className="w-full overflow-visible"
                      style={{
                        minHeight: "250px",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {productImages.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square bg-muted rounded-md overflow-hidden border"
                          >
                            <img
                              src={image.url}
                              alt={`Product image ${index + 1}`}
                              className={`object-cover w-full h-full ${deletingImages[index] ? 'opacity-50' : ''}`}
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
                              disabled={deletingImages[index]}
                            >
                              {deletingImages[index] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}

                        <div
                          className={`aspect-square ${
                            productImages.length >= MAX_IMAGES ? "opacity-50" : ""
                          }`}
                          aria-hidden={productImages.length >= MAX_IMAGES}
                        >
                          {uploadOptions && (
                            <CldUploadWidget
                              options={uploadOptions}
                              onUpload={() => setIsUploading(true)}
                              onClose={() => setIsUploading(false)}
                              onSuccess={(result) => {
                                setIsUploading(false);
                                if (result?.info) {
                                  handleImageUpload(
                                    result.info as CloudinaryUploadResult
                                  );
                                }
                              }}
                              signatureEndpoint="/api/admin/upload"
                            >
                              {({ open }) => (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full h-full aspect-square border-dashed flex flex-col gap-2"
                                  onClick={() => open()}
                                  disabled={
                                    disableUploadWidget ||
                                    productImages.length >= MAX_IMAGES
                                  }
                                >
                                  <Upload className="h-6 w-6" />
                                  <span>Upload Image</span>
                                </Button>
                              )}
                            </CldUploadWidget>
                          )}
                        </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="warranty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="2 years standard warranty"
                        {...field}
                        value={field.value || product?.warranty || ""}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify warranty details (e.g., "2 years standard
                      warranty")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="returnPolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Policy</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="30-day return policy"
                        {...field}
                        value={field.value || product?.returnPolicy || ""}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify return policy details (e.g., "30-day return
                      policy")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
