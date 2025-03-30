"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Tag, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface PromoStats {
  totalActiveCodes: number;
  totalUses: number;
  totalDiscount: number;
  mostUsedCode: string | null;
  mostUsedCount: number;
  bestPerformingCode: string | null;
  bestPerformingRevenue: number;
}

export function PromocodeStatsWidget() {
  const [stats, setStats] = useState<PromoStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Authentication error. Please log in again.");
          return;
        }

        const response = await fetch("/api/admin/promocodes/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load promocode statistics");
        }

        const data = await response.json();

        // Process the stats data
        const activeCodes = data.stats.filter(
          (code: any) => code.isActive
        ).length;
        const totalUses = data.stats.reduce(
          (sum: number, code: any) => sum + code.usageCount,
          0
        );
        const totalDiscount = data.stats.reduce(
          (sum: number, code: any) => sum + (code.totalDiscount || 0),
          0
        );

        // Find most used code
        let mostUsedCode = null;
        let mostUsedCount = 0;

        // Find best performing code (highest revenue generated)
        let bestPerformingCode = null;
        let bestPerformingRevenue = 0;

        data.stats.forEach((code: any) => {
          if (code.usageCount > mostUsedCount) {
            mostUsedCount = code.usageCount;
            mostUsedCode = code.code;
          }

          if ((code.totalRevenue || 0) > bestPerformingRevenue) {
            bestPerformingRevenue = code.totalRevenue || 0;
            bestPerformingCode = code.code;
          }
        });

        setStats({
          totalActiveCodes: activeCodes,
          totalUses,
          totalDiscount,
          mostUsedCode,
          mostUsedCount,
          bestPerformingCode,
          bestPerformingRevenue,
        });
      } catch (error) {
        console.error("Error fetching promocode stats:", error);
        setError("Failed to load promocode statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Tag className="h-4 w-4" /> Promo Code Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Tag className="h-4 w-4" /> Promo Code Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Tag className="h-4 w-4" /> Promo Code Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Active Codes</p>
            <p className="text-xl font-bold">{stats.totalActiveCodes}</p>
          </div>
          <div className="bg-muted/30 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">Total Uses</p>
            <p className="text-xl font-bold">{stats.totalUses}</p>
          </div>
        </div>

        <div className="bg-green-100/50 p-3 rounded-md">
          <p className="text-xs text-muted-foreground">Total Discounts Given</p>
          <p className="text-xl font-bold text-green-700">
            {formatPrice(stats.totalDiscount)}
          </p>
        </div>

        {stats.mostUsedCode && (
          <div className="border rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1">Most Used Code</p>
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 border-blue-200"
              >
                {stats.mostUsedCode}
              </Badge>
              <span className="text-sm font-medium">
                {stats.mostUsedCount} uses
              </span>
            </div>
          </div>
        )}

        {stats.bestPerformingCode && (
          <div className="border rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1">
              Best Performing Code
            </p>
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200"
              >
                {stats.bestPerformingCode}
              </Badge>
              <span className="text-sm font-medium">
                {formatPrice(stats.bestPerformingRevenue)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
