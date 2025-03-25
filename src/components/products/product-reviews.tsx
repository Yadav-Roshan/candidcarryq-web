"use client";

import { useState } from "react";
import { ReviewForm } from "@/components/products/review-form";
import { ReviewsList } from "@/components/products/reviews-list";

interface ProductReviewsProps {
  productId: string;
  reviewCount: number;
}

export function ProductReviews({
  productId,
  reviewCount,
}: ProductReviewsProps) {
  // This state is used to trigger a refresh of the reviews list
  // when a new review is submitted
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReviewSubmitted = () => {
    // Increment the trigger to cause a re-fetch in the ReviewsList
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Customer Reviews</h2>

      {reviewCount > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">
            {reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
          </h3>
          <ReviewsList productId={productId} refreshTrigger={refreshTrigger} />
        </div>
      )}

      <ReviewForm
        productId={productId}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
