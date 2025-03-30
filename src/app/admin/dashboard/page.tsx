"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import OrdersSummary from "./orders-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Users, Truck, ShoppingBag, Settings } from "lucide-react";

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not admin
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="container py-10">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <OrdersSummary />

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center justify-center gap-2 py-6"
              onClick={() => router.push("/admin/orders")}
            >
              <Package className="h-8 w-8" />
              <span>Manage Orders</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-center justify-center gap-2 py-6"
              onClick={() => router.push("/admin/products")}
            >
              <ShoppingBag className="h-8 w-8" />
              <span>Products</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-center justify-center gap-2 py-6"
              onClick={() => router.push("/admin/users")}
            >
              <Users className="h-8 w-8" />
              <span>Users</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-center justify-center gap-2 py-6"
              onClick={() => router.push("/admin/settings")}
            >
              <Settings className="h-8 w-8" />
              <span>Settings</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-center justify-center gap-2 py-6"
              onClick={() => router.push("/admin/shipping")}
            >
              <Truck className="h-8 w-8" />
              <span>Shipping</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Order list integration will go here
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Low stock products list will go here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
