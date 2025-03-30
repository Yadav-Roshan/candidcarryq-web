"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Search,
  Tag,
  Check,
  X,
  FilterX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface PromoCode {
  _id: string;
  code: string;
  description: string;
  discountPercentage: number;
  maxDiscount: number | null;
  minPurchase: number | null;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  applicableCategories: string[] | null;
  usageLimit: number | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  totalOrders?: number;
  totalRevenue?: number;
  totalDiscount?: number;
}

// Form schema for creating/editing promo codes
const promoCodeFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20),
  description: z.string().min(5, "Description is required"),
  discountPercentage: z.coerce
    .number()
    .min(1, "Minimum 1%")
    .max(100, "Maximum 100%"),
  maxDiscount: z.coerce.number().nullable().optional(),
  minPurchase: z.coerce.number().nullable().optional(),
  validFrom: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid from date is invalid",
  }),
  validTo: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid to date is invalid",
  }),
  isActive: z.boolean().default(true),
  applicableCategories: z.array(z.string()).nullable().default(null),
  usageLimit: z.coerce
    .number()
    .nullable()
    .optional()
    .transform((val) => (val === 0 ? null : val)),
});

export default function PromoCodesPage() {
  const [promocodes, setPromocodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form for creating/editing promo codes
  const createForm = useForm<z.infer<typeof promoCodeFormSchema>>({
    resolver: zodResolver(promoCodeFormSchema),
    defaultValues: {
      code: "",
      description: "",
      discountPercentage: 10,
      maxDiscount: null,
      minPurchase: null,
      validFrom: new Date().toISOString().split("T")[0],
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      isActive: true,
      applicableCategories: null,
      usageLimit: null,
    },
  });

  // Initialize edit form
  const editForm = useForm<z.infer<typeof promoCodeFormSchema>>({
    resolver: zodResolver(promoCodeFormSchema),
    defaultValues: {
      code: "",
      description: "",
      discountPercentage: 10,
      maxDiscount: null,
      minPurchase: null,
      validFrom: "",
      validTo: "",
      isActive: true,
      applicableCategories: null,
      usageLimit: null,
    },
  });

  // Load promocodes on mount
  useEffect(() => {
    fetchPromoCodes();
  }, []);

  // Filter promocodes based on search
  const filteredPromoCodes = promocodes.filter(
    (promo) =>
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch all promocodes
  const fetchPromoCodes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      const [promoResponse, statsResponse] = await Promise.all([
        fetch("/api/admin/promocodes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/admin/promocodes/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!promoResponse.ok) {
        throw new Error("Failed to fetch promocodes");
      }

      if (!statsResponse.ok) {
        throw new Error("Failed to fetch promocode stats");
      }

      const promoData = await promoResponse.json();
      const statsData = await statsResponse.json();

      // Merge promocode data with stats
      const statsMap = statsData.stats.reduce((acc: any, stat: any) => {
        acc[stat.id] = stat;
        return acc;
      }, {});

      const enrichedPromocodes = promoData.promocodes.map(
        (promo: PromoCode) => {
          const stats = statsMap[promo._id] || {};
          return {
            ...promo,
            totalOrders: stats.totalOrders || 0,
            totalRevenue: stats.totalRevenue || 0,
            totalDiscount: stats.totalDiscount || 0,
          };
        }
      );

      setPromocodes(enrichedPromocodes);
    } catch (error) {
      console.error("Error fetching promocodes:", error);
      toast({
        title: "Error",
        description: "Failed to load promocodes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create new promocode
  const handleCreatePromoCode = async (
    values: z.infer<typeof promoCodeFormSchema>
  ) => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/admin/promocodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error creating promocode");
      }

      toast({
        title: "Success",
        description: "Promo code created successfully",
      });

      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchPromoCodes();
    } catch (error: any) {
      console.error("Error creating promocode:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create promo code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update an existing promocode
  const handleEditPromoCode = async (
    values: z.infer<typeof promoCodeFormSchema>
  ) => {
    if (!selectedPromoCode) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `/api/admin/promocodes/${selectedPromoCode._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...values,
            // Don't update the code itself which is used as an identifier
            code: undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error updating promocode");
      }

      toast({
        title: "Success",
        description: "Promo code updated successfully",
      });

      setIsEditDialogOpen(false);
      setSelectedPromoCode(null);
      fetchPromoCodes();
    } catch (error: any) {
      console.error("Error updating promocode:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update promo code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a promocode
  const handleDeletePromoCode = async () => {
    if (!selectedPromoCode) return;

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `/api/admin/promocodes/${selectedPromoCode._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error deleting promocode");
      }

      toast({
        title: "Success",
        description: "Promo code deleted successfully",
      });

      setDeleteDialogOpen(false);
      setSelectedPromoCode(null);
      fetchPromoCodes();
    } catch (error: any) {
      console.error("Error deleting promocode:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete promo code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set form values when editing
  const openEditDialog = (promo: PromoCode) => {
    setSelectedPromoCode(promo);
    editForm.reset({
      code: promo.code,
      description: promo.description,
      discountPercentage: promo.discountPercentage,
      maxDiscount: promo.maxDiscount,
      minPurchase: promo.minPurchase,
      validFrom: new Date(promo.validFrom).toISOString().split("T")[0],
      validTo: new Date(promo.validTo).toISOString().split("T")[0],
      isActive: promo.isActive,
      applicableCategories: promo.applicableCategories,
      usageLimit: promo.usageLimit,
    });
    setIsEditDialogOpen(true);
  };

  // Toggle promocode active status
  const toggleActiveStatus = async (promo: PromoCode) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/admin/promocodes/${promo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !promo.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error updating promocode");
      }

      toast({
        title: "Success",
        description: `Promo code ${
          !promo.isActive ? "activated" : "deactivated"
        } successfully`,
      });

      fetchPromoCodes();
    } catch (error: any) {
      console.error("Error toggling promocode status:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to change promo code active status",
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Promo Codes</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Promo Code
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search promocodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchTerm("")}
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {filteredPromoCodes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="flex justify-center mb-4">
              <Tag className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <CardTitle className="mb-2">No Promo Codes Found</CardTitle>
            <CardDescription>
              {promocodes.length === 0
                ? "Get started by creating your first promo code."
                : "No promo codes match your search criteria."}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="hidden md:table-cell">
                  Validity Period
                </TableHead>
                <TableHead className="hidden md:table-cell">Usage</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Performance
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromoCodes.map((promo) => (
                <TableRow key={promo._id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{promo.code}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                        {promo.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{promo.discountPercentage}% off</div>
                      {promo.maxDiscount && (
                        <div className="text-sm text-muted-foreground">
                          Max: {formatPrice(promo.maxDiscount)}
                        </div>
                      )}
                      {promo.minPurchase && (
                        <div className="text-sm text-muted-foreground">
                          Min purchase: {formatPrice(promo.minPurchase)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div>
                      <div>From: {formatDate(new Date(promo.validFrom))}</div>
                      <div>To: {formatDate(new Date(promo.validTo))}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {promo.usageLimit ? (
                      <div>
                        {promo.usageCount}/{promo.usageLimit} uses
                      </div>
                    ) : (
                      <div>
                        {promo.usageCount} uses
                        <div className="text-sm text-muted-foreground">
                          Unlimited
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={promo.isActive}
                        onCheckedChange={() => toggleActiveStatus(promo)}
                      />
                      <Badge
                        variant={promo.isActive ? "default" : "outline"}
                        className={promo.isActive ? "bg-green-500" : ""}
                      >
                        {promo.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="space-y-1">
                      <div>
                        <span className="font-medium">
                          {promo.totalOrders || 0}
                        </span>{" "}
                        orders
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Revenue:{" "}
                        <span className="font-medium">
                          {formatPrice(promo.totalRevenue || 0)}
                        </span>
                      </div>
                      <div className="text-sm text-green-600">
                        Saved customers:{" "}
                        <span className="font-medium">
                          {formatPrice(promo.totalDiscount || 0)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(promo)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPromoCode(promo);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Promo Code Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create Promo Code</DialogTitle>
            <DialogDescription>
              Create a new promotional code for customer discounts.
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreatePromoCode)}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SUMMER25" />
                      </FormControl>
                      <FormDescription>
                        All caps automatically applied.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          {...field}
                          placeholder="25"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="25% off for summer sale"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="maxDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Discount (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : Number(value));
                          }}
                          placeholder="1000"
                        />
                      </FormControl>
                      <FormDescription>Leave empty for no cap</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="minPurchase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Purchase (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : Number(value));
                          }}
                          placeholder="5000"
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for no minimum
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="validTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid To</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? null : Number(value));
                        }}
                        placeholder="100"
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of times this code can be used. Leave empty
                      for unlimited uses.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Make this promo code available immediately
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Promo Code
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Promo Code Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
            <DialogDescription>
              Update the details of this promotional code.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditPromoCode)}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>Code cannot be changed</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="maxDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Discount (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormDescription>Leave empty for no cap</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="minPurchase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Purchase (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for no minimum
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="validTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid To</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? null : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of times this code can be used. Leave empty
                      for unlimited uses.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        This promo code is available for use
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Promo Code
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the promo code "
              {selectedPromoCode?.code}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeletePromoCode();
              }}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
