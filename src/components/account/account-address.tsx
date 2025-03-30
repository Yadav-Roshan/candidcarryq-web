"use client";

import { useState, useEffect } from "react";
import { MapPin, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function AccountAddress() {
  const { user, updateUserAddress } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    buildingName: "",
    locality: "",
    wardNo: "",
    postalCode: "",
    district: "",
    province: "bagmati",
    country: "Nepal",
    landmark: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user address data when user data becomes available
  useEffect(() => {
    if (user) {
      // Update form data with existing user address if available
      if (user.address) {
        setFormData({
          buildingName: user.address.buildingName || "",
          locality: user.address.locality || "",
          wardNo: user.address.wardNo || "",
          postalCode: user.address.postalCode || "",
          district: user.address.district || "",
          province: user.address.province || "bagmati",
          country: user.address.country || "Nepal",
          landmark: user.address.landmark || "",
        });
      }
      setIsLoading(false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, province: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.locality || !formData.district || !formData.postalCode) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const success = await updateUserAddress(formData);

      if (success) {
        toast({
          title: "Address updated",
          description: "Your address has been updated successfully",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update your address. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format the full address for display as a single joined field
  const getFormattedAddress = () => {
    if (!user?.address || (!user.address.locality && !user.address.district)) {
      return null;
    }

    const parts = [
      user.address.buildingName,
      user.address.locality,
      user.address.wardNo ? `Ward ${user.address.wardNo}` : null,
      user.address.district,
      getProvinceLabel(user.address.province),
      user.address.postalCode,
      user.address.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  // Get province label from value
  const getProvinceLabel = (value: string | undefined) => {
    if (!value) return "";
    const province = nepalProvinces.find((p) => p.value === value);
    return province ? province.label : value;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Information</CardTitle>
        <CardDescription>
          Manage your delivery and billing address
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buildingName">Building Name/Number</Label>
              <Input
                id="buildingName"
                name="buildingName"
                placeholder="Apartment 3B, XYZ Building"
                value={formData.buildingName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locality">
                Locality/Area <span className="text-destructive">*</span>
              </Label>
              <Input
                id="locality"
                name="locality"
                placeholder="Thamel, New Road"
                value={formData.locality}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wardNo">Ward No.</Label>
                <Input
                  id="wardNo"
                  name="wardNo"
                  placeholder="14"
                  value={formData.wardNo}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">
                  Postal Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  placeholder="44600"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">
                District <span className="text-destructive">*</span>
              </Label>
              <Input
                id="district"
                name="district"
                placeholder="Kathmandu"
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Select
                onValueChange={handleProvinceChange}
                defaultValue={formData.province}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                name="landmark"
                placeholder="Near Central Mall"
                value={formData.landmark}
                onChange={handleChange}
              />
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {getFormattedAddress() ? (
              <div className="flex items-center gap-2 bg-muted/50 p-4 rounded-md border">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">
                    {getFormattedAddress()}
                  </p>
                  {user?.address?.landmark && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">Landmark:</span>{" "}
                      {user.address.landmark}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex-shrink-0"
                >
                  Update
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <Home className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No address information</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  You haven't added an address yet. Add one to make checkout
                  easier.
                </p>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Add Address
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Address"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
