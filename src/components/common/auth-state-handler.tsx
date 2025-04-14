"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";

/**
 * This component handles auth state changes and ensures data consistency
 * across the application when auth state changes.
 */
export function AuthStateHandler() {
  const { user, isLoading } = useAuth();
  const { clearWishlist } = useWishlist();
  const prevUserRef = useRef(user);

  // Listen for auth state changes and sync dependent contexts
  useEffect(() => {
    // Only run this effect when auth is not loading and user state actually changed
    if (!isLoading && prevUserRef.current !== user) {
      // If no user is logged in, clear wishlist (which requires auth)
      if (!user) {
        clearWishlist();
      }
      // Update the ref to current user
      prevUserRef.current = user;
    }
  }, [user, isLoading, clearWishlist]);

  // This component doesn't render anything visible
  return null;
}
