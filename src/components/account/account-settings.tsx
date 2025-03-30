"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
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

export function AccountSettings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    orderUpdates: true,
    promotions: true,
    newArrivals: false,
    blogPosts: false,
  });

  const handleToggleNotification = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    toast({
      title: "Preferences updated",
      description: "Your notification preferences have been saved",
    });
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);

      // Get the auth token from localStorage
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Call the delete account API
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete account");
      }

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });

      // Log the user out and redirect to home page
      setTimeout(() => {
        logout();
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete your account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Google Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Google Account</CardTitle>
          <CardDescription>Your account is linked with Google</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {user?.avatar && (
              <img
                src={user.avatar}
                alt={user?.name || "User"}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div className="space-y-1">
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how and when we contact you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <Label>Order Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about your orders
                </p>
              </div>
              <Switch
                checked={notificationPrefs.orderUpdates}
                onCheckedChange={() => handleToggleNotification("orderUpdates")}
              />
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <Label>Promotions and Discounts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about sales and special offers
                </p>
              </div>
              <Switch
                checked={notificationPrefs.promotions}
                onCheckedChange={() => handleToggleNotification("promotions")}
              />
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <Label>New Arrivals</Label>
                <p className="text-sm text-muted-foreground">
                  Be the first to know about new products
                </p>
              </div>
              <Switch
                checked={notificationPrefs.newArrivals}
                onCheckedChange={() => handleToggleNotification("newArrivals")}
              />
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <Label>Blog Posts and News</Label>
                <p className="text-sm text-muted-foreground">
                  Stay updated with our latest articles and news
                </p>
              </div>
              <Switch
                checked={notificationPrefs.blogPosts}
                onCheckedChange={() => handleToggleNotification("blogPosts")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/20">
        <CardHeader className="text-destructive">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, all your data will be permanently
            removed. This action cannot be undone.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete your account and all
                  associated data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
