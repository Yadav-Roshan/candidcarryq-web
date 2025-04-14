"use client";

import { Suspense } from "react";
import OrderSuccessContent from "@/components/checkout/order-success-content";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container flex flex-col items-center justify-center min-h-[60vh]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-4">Loading order details...</p>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
