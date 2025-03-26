"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";

// This component doesn't render anything, it just handles syncing
// cart and wishlist data when authentication state changes
export function AuthStateHandler() {
  const { user, isLoading } = useAuth();
  const { syncServerCart } = useCart();

  // Handle syncing cart data when user logs in
  useEffect(() => {
    if (!isLoading && user) {
      // User is logged in, sync the cart with the server
      syncServerCart();
    }
  }, [user, isLoading, syncServerCart]);

  return null; // This component doesn't render anything
}
