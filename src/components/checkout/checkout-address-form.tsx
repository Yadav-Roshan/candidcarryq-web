"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PhoneInput } from "@/components/ui/phone-input";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

// Nepal provinces for the dropdown
const nepalProvinces = [
  { value: "bagmati", label: "Bagmati Province" },
  { value: "province1", label: "Province 1" },
  { value: "madhesh", label: "Madhesh Province" },
  { value: "gandaki", label: "Gandaki Province" },
  { value: "lumbini", label: "Lumbini Province" },
  { value: "karnali", label: "Karnali Province" },
  { value: "sudurpaschim", label: "Sudurpaschim Province" },
];

// Define the form schema with zod
const shippingAddressSchema = z.object({
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  buildingName: z.string().optional(),
  locality: z.string().min(1, "Locality is required"),
  wardNo: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().min(1, "Country is required"),
  landmark: z.string().optional(),
});

type FormData = z.infer<typeof shippingAddressSchema>;

interface CheckoutAddressFormProps {
  onSubmit: (data: FormData) => void;
  initialAddress?: FormData;
  isSubmitting?: boolean;
}

export default function CheckoutAddressForm({
  onSubmit,
  initialAddress,
  isSubmitting = false,
}: CheckoutAddressFormProps) {
  const { user, isLoading } = useAuth();
  const [formInitialized, setFormInitialized] = useState(false);

  // Set up form with react-hook-form and zod validation
  const form = useForm<FormData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      phoneNumber: "",
      buildingName: "",
      locality: "",
      wardNo: "",
      postalCode: "",
      district: "",
      province: "",
      country: "Nepal",
      landmark: "",
    },
  });

  // Extract user shipping address if available
  useEffect(() => {
    if (isLoading || formInitialized) {
      return; // Don't run if still loading or form already initialized
    }

    // First set priority to initialAddress if provided
    if (initialAddress) {
      form.reset({
        phoneNumber: initialAddress.phoneNumber || "",
        buildingName: initialAddress.buildingName || "",
        locality: initialAddress.locality || "",
        wardNo: initialAddress.wardNo || "",
        postalCode: initialAddress.postalCode || "",
        district: initialAddress.district || "",
        province: initialAddress.province || "",
        country: initialAddress.country || "Nepal",
        landmark: initialAddress.landmark || "",
      });
      setFormInitialized(true);
      return;
    }

    // If no initialAddress, try to populate with user data
    if (user) {
      // Create user address object from user data
      const userPhone = user.phoneNumber || "";
      const userAddress = user.address;

      const formData: FormData = {
        phoneNumber: userPhone,
        buildingName: userAddress?.buildingName || "",
        locality: userAddress?.locality || "",
        wardNo: userAddress?.wardNo || "",
        postalCode: userAddress?.postalCode || "",
        district: userAddress?.district || "",
        province: userAddress?.province || "",
        country: userAddress?.country || "Nepal",
        landmark: userAddress?.landmark || "",
      };

      console.log("Setting form data from user:", formData);
      form.reset(formData);
      setFormInitialized(true);
    }
  }, [user, initialAddress, form, isLoading, formInitialized]);

  // Handle form submission
  function handleSubmit(data: FormData) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <PhoneInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Building Name */}
          <FormField
            control={form.control}
            name="buildingName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Building/House Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Building or house name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Locality/Area */}
          <FormField
            control={form.control}
            name="locality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Locality/Area</FormLabel>
                <FormControl>
                  <Input placeholder="Locality or area name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ward No */}
          <FormField
            control={form.control}
            name="wardNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ward No (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ward number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* District */}
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>District</FormLabel>
                <FormControl>
                  <Input placeholder="District" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Province */}
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {nepalProvinces.map((province) => (
                        <SelectItem key={province.value} value={province.value}>
                          {province.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Country */}
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Nepal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Landmark */}
          <FormField
            control={form.control}
            name="landmark"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Landmark (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any nearby landmark to help with delivery"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Postal Code */}
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="Postal code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue to Payment"
          )}
        </Button>
      </form>
    </Form>
  );
}
