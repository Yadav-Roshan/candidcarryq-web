"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { PhoneInput } from "@/components/ui/phone-input";

// Nepal provinces for dropdown
const nepalProvinces = [
  { value: "province1", label: "Province 1" },
  { value: "madhesh", label: "Madhesh Province" },
  { value: "bagmati", label: "Bagmati Province" },
  { value: "gandaki", label: "Gandaki Province" },
  { value: "lumbini", label: "Lumbini Province" },
  { value: "karnali", label: "Karnali Province" },
  { value: "sudurpaschim", label: "Sudurpaschim Province" },
];

// Form schema validation
const shippingFormSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required"),
  buildingName: z.string().optional(),
  locality: z.string().min(1, "Locality/Area is required"),
  wardNo: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().min(1, "Country is required"),
  landmark: z.string().optional(),
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

interface ShippingAddressFormProps {
  onSubmit: (data: ShippingFormValues) => void;
  defaultValues?: any;
}

export default function ShippingAddressForm({
  onSubmit,
  defaultValues,
}: ShippingAddressFormProps) {
  const { user, updateUserAddress, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Initialize form with default values
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      phoneNumber: user?.phoneNumber || "",
      buildingName: defaultValues?.buildingName || "",
      locality: defaultValues?.locality || "",
      wardNo: defaultValues?.wardNo || "",
      postalCode: defaultValues?.postalCode || "",
      district: defaultValues?.district || "",
      province: defaultValues?.province || "bagmati",
      country: defaultValues?.country || "Nepal",
      landmark: defaultValues?.landmark || "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.setValue("phoneNumber", user.phoneNumber || "");

      if (user.address) {
        form.setValue("buildingName", user.address.buildingName || "");
        form.setValue("locality", user.address.locality || "");
        form.setValue("wardNo", user.address.wardNo || "");
        form.setValue("postalCode", user.address.postalCode || "");
        form.setValue("district", user.address.district || "");
        form.setValue("province", user.address.province || "bagmati");
        form.setValue("country", user.address.country || "Nepal");
        form.setValue("landmark", user.address.landmark || "");
      }
    }
  }, [user, form]);

  const handleFormSubmit = async (data: ShippingFormValues) => {
    setIsUpdatingProfile(true);

    try {
      // Update user's phone number if it has changed
      if (user && data.phoneNumber !== user.phoneNumber) {
        const profileUpdateResult = await updateUserProfile({
          phoneNumber: data.phoneNumber,
        });

        if (!profileUpdateResult) {
          throw new Error("Failed to update phone number");
        }
      }

      // Update user's address if it has changed
      const addressData = {
        buildingName: data.buildingName,
        locality: data.locality,
        wardNo: data.wardNo,
        postalCode: data.postalCode,
        district: data.district,
        province: data.province,
        country: data.country,
        landmark: data.landmark,
      };

      // Only update if something has changed
      if (JSON.stringify(addressData) !== JSON.stringify(user?.address || {})) {
        await updateUserAddress(addressData);
      }

      // Call the onSubmit passed from parent
      onSubmit({
        ...data,
        phoneNumber: data.phoneNumber, // Ensure phone number is included in the data passed to parent
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description:
          "Failed to update your profile information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handler for PhoneInput component
  const handlePhoneChange = (value: string) => {
    form.setValue("phoneNumber", value);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Phone Number - required field - Updated to use PhoneInput */}
      <div className="space-y-2">
        <label
          htmlFor="phoneNumber"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Phone Number <span className="text-destructive">*</span>
        </label>
        <PhoneInput
          value={form.watch("phoneNumber")}
          onChange={handlePhoneChange}
          placeholder="Your phone number"
          required
          className="w-full"
        />
        {form.formState.errors.phoneNumber && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.phoneNumber.message}
          </p>
        )}
      </div>

      {/* Building name */}
      <div className="space-y-2">
        <label
          htmlFor="buildingName"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Building Name/Number
        </label>
        <Input
          id="buildingName"
          placeholder="Apartment 3B, XYZ Building"
          {...form.register("buildingName")}
        />
        {form.formState.errors.buildingName && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.buildingName.message}
          </p>
        )}
      </div>

      {/* Locality */}
      <div className="space-y-2">
        <label
          htmlFor="locality"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Locality/Area <span className="text-destructive">*</span>
        </label>
        <Input
          id="locality"
          placeholder="Thamel, New Road"
          {...form.register("locality")}
          required
        />
        {form.formState.errors.locality && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.locality.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Ward No */}
        <div className="space-y-2">
          <label
            htmlFor="wardNo"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Ward No.
          </label>
          <Input id="wardNo" placeholder="14" {...form.register("wardNo")} />
          {form.formState.errors.wardNo && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.wardNo.message}
            </p>
          )}
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <label
            htmlFor="postalCode"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Postal Code <span className="text-destructive">*</span>
          </label>
          <Input
            id="postalCode"
            placeholder="44600"
            {...form.register("postalCode")}
            required
          />
          {form.formState.errors.postalCode && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.postalCode.message}
            </p>
          )}
        </div>
      </div>

      {/* District */}
      <div className="space-y-2">
        <label
          htmlFor="district"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          District <span className="text-destructive">*</span>
        </label>
        <Input
          id="district"
          placeholder="Kathmandu"
          {...form.register("district")}
          required
        />
        {form.formState.errors.district && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.district.message}
          </p>
        )}
      </div>

      {/* Province */}
      <div className="space-y-2">
        <label
          htmlFor="province"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Province
        </label>
        <Select
          value={form.watch("province")}
          onValueChange={(value) => form.setValue("province", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a province" />
          </SelectTrigger>
          <SelectContent>
            {nepalProvinces.map((province) => (
              <SelectItem key={province.value} value={province.value}>
                {province.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.province && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.province.message}
          </p>
        )}
      </div>

      {/* Country */}
      <div className="space-y-2">
        <label
          htmlFor="country"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Country
        </label>
        <Input
          id="country"
          placeholder="Nepal"
          {...form.register("country")}
          defaultValue="Nepal"
        />
        {form.formState.errors.country && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.country.message}
          </p>
        )}
      </div>

      {/* Landmark */}
      <div className="space-y-2">
        <label
          htmlFor="landmark"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Landmark (Optional)
        </label>
        <Input
          id="landmark"
          placeholder="Near XYZ Mall"
          {...form.register("landmark")}
        />
        {form.formState.errors.landmark && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.landmark.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isUpdatingProfile}>
        {isUpdatingProfile ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Continue to Payment"
        )}
      </Button>
    </form>
  );
}
