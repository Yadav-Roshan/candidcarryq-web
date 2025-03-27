"use client";

import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  rating,
  size = "md",
  className,
}: StarRatingProps) {
  // Calculate the number of full stars, half stars, and empty stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Define size classes
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const starSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center", className)}>
      {/* Render full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`star-${i}`}
          className={cn(starSize, "fill-yellow-400 text-yellow-400")}
        />
      ))}

      {/* Render half star if needed */}
      {hasHalfStar && (
        <StarHalf className={cn(starSize, "fill-yellow-400 text-yellow-400")} />
      )}

      {/* Render empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-star-${i}`}
          className={cn(starSize, "text-gray-300")}
        />
      ))}
    </div>
  );
}
