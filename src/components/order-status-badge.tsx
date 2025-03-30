import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment";
}

export function OrderStatusBadge({ status, type = "order" }: StatusBadgeProps) {
  // Define styles based on status and type
  const getConfig = () => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          className: "bg-yellow-500/10 text-yellow-700 border-yellow-300",
        };
      case "processing":
        return {
          label: "Processing",
          className: "bg-blue-500/10 text-blue-700 border-blue-300",
        };
      case "shipped":
        return {
          label: "Shipped",
          className: "bg-amber-500/10 text-amber-700 border-amber-300",
        };
      case "delivered":
        return {
          label: "Delivered",
          className: "bg-green-500/10 text-green-700 border-green-300",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          className: "bg-red-500/10 text-red-700 border-red-300",
        };
      case "verified":
        return {
          label: "Verified",
          className: "bg-green-500/10 text-green-700 border-green-300",
        };
      case "rejected":
        return {
          label: "Rejected",
          className: "bg-red-500/10 text-red-700 border-red-300",
        };
      case "completed":
        return {
          label: "Completed",
          className: "bg-green-500/10 text-green-700 border-green-300",
        };
      case "failed":
        return {
          label: "Failed",
          className: "bg-red-500/10 text-red-700 border-red-300",
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          className: "bg-gray-500/10 text-gray-700 border-gray-300",
        };
    }
  };

  const config = getConfig();

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
