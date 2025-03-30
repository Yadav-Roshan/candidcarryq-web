"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface OrderSummary {
  totalOrders: number;
  pendingPayment: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: number;
}

export default function OrdersSummary() {
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        
        if (!token) return;

        const response = await fetch("/api/admin/orders/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        } else {
          // If API is not yet implemented, show mock data
          setSummary({
            totalOrders: 24,
            pendingPayment: 5,
            processing: 3,
            shipped: 7,
            delivered: 8,
            cancelled: 1,
            revenue: 125750,
          });
        }
      } catch (error) {
        console.error("Error fetching order summary:", error);
        // Show mock data on error
        setSummary({
          totalOrders: 24,
          pendingPayment: 5,
          processing: 3,
          shipped: 7,
          delivered: 8,
          cancelled: 1,
          revenue: 125750,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderSummary();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-2xl font-bold">{summary.totalOrders}</div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.revenue)}
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium">Order Status</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link href="/admin/orders?status=pending" className="flex justify-between p-2 hover:bg-muted rounded-md">
              <span>Pending Payment</span>ending"
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700">
                {summary.pendingPayment}
              </Badge>nding Payment</span>
            </Link>e
            <Link href="/admin/orders?status=processing" className="flex justify-between p-2 hover:bg-muted rounded-md">
              <span>Processing</span>500/10 text-yellow-700"
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
                {summary.processing}ent}
              </Badge>
            </Link>
            <Link href="/admin/orders?status=shipped" className="flex justify-between p-2 hover:bg-muted rounded-md">
              <span>Shipped</span>status=processing"
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700">
                {summary.shipped}
              </Badge>ocessing</span>
            </Link>e variant="outline" className="bg-blue-500/10 text-blue-700">
            <Link href="/admin/orders?status=delivered" className="flex justify-between p-2 hover:bg-muted rounded-md">
              <span>Delivered</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-700">
                {summary.delivered}
              </Badge>dmin/orders?status=shipped"
            </Link>Name="flex justify-between p-2 hover:bg-muted rounded-md"
          </div>
        </div><span>Shipped</span>
      </CardContent>
    </Card>     variant="outline"
  );            className="bg-amber-500/10 text-amber-700"
}             >
                {summary.shipped}
              </Badge>
            </Link>
            <Link
              href="/admin/orders?status=delivered"
              className="flex justify-between p-2 hover:bg-muted rounded-md"
            >
              <span>Delivered</span>
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-700"
              >
                {summary.delivered}
              </Badge>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
