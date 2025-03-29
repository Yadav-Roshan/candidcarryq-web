"use client";

import { useState, useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import {
  getUploadSignature,
  getUploadWidgetOptions,
} from "@/lib/client/image-upload-service";
import { useToast } from "@/components/ui/use-toast";
import { CldUploadWidget } from "next-cloudinary";

// Form validation schema
const paymentFormSchema = z.object({
  paymentMethod: z.enum(["esewa", "khalti", "mobile_banking"]),
  transactionId: z
    .string()
    .min(4, "Transaction ID must be at least 4 characters"),
  paymentProofUrl: z
    .string()
    .url("A valid payment proof image URL is required"),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
}

interface CheckoutPaymentFormProps {
  onSubmit: (data: PaymentFormValues) => Promise<void>;
  isSubmitting: boolean;
  orderId?: string; // Add optional orderId prop
}

export default function CheckoutPaymentForm({
  onSubmit,
  isSubmitting,
  orderId, // Accept orderId prop
}: CheckoutPaymentFormProps) {
  const [selectedTab, setSelectedTab] = useState("esewa");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOptions, setUploadOptions] = useState<any>(null);
  const [isCloudinaryLoading, setIsCloudinaryLoading] = useState(false);
  const [cloudinaryOptions, setCloudinaryOptions] = useState<any>(null);

  const { toast } = useToast();

  // Initialize form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: "esewa",
      transactionId: "",
      paymentProofUrl: "",
    },
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    form.setValue(
      "paymentMethod",
      value as "esewa" | "khalti" | "mobile_banking"
    );
  };

  // Initialize upload options for Cloudinary
  const initializeUploadOptions = useCallback(async () => {
    try {
      // Fix: Use the correctly named state setter
      setIsCloudinaryLoading(true);

      // Get auth token for the upload endpoint
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue with your payment.",
          variant: "destructive",
        });
        throw new Error("No auth token found");
      }

      // Pass the orderId if available for better folder structure
      const options = await getUploadWidgetOptions(
        undefined,
        "payment_proof",
        orderId
      );

      // Set the signature endpoint with the token as a query parameter
      options.signatureEndpoint = `/api/payment/upload?token=${encodeURIComponent(
        token
      )}`;

      // Fix: Use the correctly named state setter
      setUploadOptions(options);
    } catch (error) {
      console.error("Failed to initialize upload widget", error);
      toast({
        title: "Upload Error",
        description:
          "Failed to initialize the image uploader. Please try again later.",
        variant: "destructive",
      });
    } finally {
      // Fix: Use the correctly named state setter
      setIsCloudinaryLoading(false);
    }
  }, [toast, orderId]); // Add orderId to dependencies

  // Initialize upload options on component mount
  // Fix: Change useState to useEffect
  useEffect(() => {
    initializeUploadOptions();
  }, [initializeUploadOptions]);

  // Handle image upload completion
  const handleImageUpload = (result: CloudinaryUploadResult) => {
    if (!result.secure_url || !result.secure_url.startsWith("http")) {
      toast({
        title: "Invalid Image URL",
        description:
          "The image upload didn't return a valid URL. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = result.secure_url;

    // Update form with image URL
    form.setValue("paymentProofUrl", imageUrl);

    // Show preview
    setPreviewImage(imageUrl);

    toast({
      title: "Upload Complete",
      description: "Payment proof image uploaded successfully",
    });
  };

  // Handle form submission
  const handleSubmit = async (values: PaymentFormValues) => {
    await onSubmit(values);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Payment Method</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Hidden field for payment proof URL */}
          <input type="hidden" {...form.register("paymentProofUrl")} />

          {/* Payment method tabs */}
          <Tabs
            value={selectedTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="esewa">eSewa</TabsTrigger>
              <TabsTrigger value="khalti">Khalti</TabsTrigger>
              <TabsTrigger value="mobile_banking">Mobile Banking</TabsTrigger>
            </TabsList>

            {/* eSewa Payment Tab */}
            <TabsContent value="esewa" className="pt-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative h-64 w-64 border rounded-md overflow-hidden bg-muted">
                  <Image
                    src="/images/payments/esewa-qr.png"
                    alt="eSewa QR Code"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mb-1">Pay using eSewa</p>
                  <p className="font-medium">eSewa ID: 9801234567</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Scan the QR code with your eSewa app or manually transfer
                    the amount
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Khalti Payment Tab */}
            <TabsContent value="khalti" className="pt-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative h-64 w-64 border rounded-md overflow-hidden bg-muted">
                  <Image
                    src="/images/payments/khalti-qr.png"
                    alt="Khalti QR Code"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mb-1">Pay using Khalti</p>
                  <p className="font-medium">Khalti ID: 9807654321</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Scan the QR code with your Khalti app or manually transfer
                    the amount
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Mobile Banking Tab */}
            <TabsContent value="mobile_banking" className="pt-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative h-64 w-64 border rounded-md overflow-hidden bg-muted">
                  <Image
                    src="/images/payments/bank-qr.png"
                    alt="Mobile Banking QR Code"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mb-1">
                    Pay using Mobile Banking
                  </p>
                  <p className="font-medium">
                    Account Number: 01234567890123456
                  </p>
                  <p className="font-medium">
                    Account Holder: CandidWear Pvt. Ltd.
                  </p>
                  <p className="font-medium">
                    Bank: Nepal Investment Bank Ltd.
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Transfer the exact amount using your mobile banking app
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Transaction ID */}
          <FormField
            control={form.control}
            name="transactionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Reference Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter the unique transaction ID or reference number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is the reference number you received after making the
                  payment
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Screenshot Upload */}
          <div className="space-y-2">
            <Label htmlFor="paymentProof">Upload Payment Screenshot</Label>

            <div className="flex items-center gap-4">
              {uploadOptions && (
                <CldUploadWidget
                  options={uploadOptions}
                  onUpload={() => setIsUploading(true)}
                  onComplete={() => setIsUploading(false)}
                  onSuccess={(result) => {
                    if (result?.info) {
                      handleImageUpload(result.info as CloudinaryUploadResult);
                    }
                  }}
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
                          {previewImage ? "Change Image" : "Upload Screenshot"}
                        </>
                      )}
                    </Button>
                  )}
                </CldUploadWidget>
              )}
            </div>

            {/* Display validation errors */}
            {form.formState.errors.paymentProofUrl && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.paymentProofUrl.message}
              </p>
            )}

            {/* Preview Image */}
            {previewImage && (
              <div className="mt-4 relative">
                <div className="relative h-48 w-full border rounded-md overflow-hidden">
                  <Image
                    src={previewImage}
                    alt="Payment Screenshot"
                    fill
                    className="object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPreviewImage(null);
                    form.setValue("paymentProofUrl", "");
                  }}
                >
                  Remove
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              Upload a screenshot of your payment confirmation (Max size: 5MB)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isUploading || !form.formState.isValid}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Processing Payment..." : "Complete Order"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
