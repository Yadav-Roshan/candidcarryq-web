"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import { useToast } from "@/components/ui/use-toast";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  salePrice?: number;
  stock?: number; // Keep as optional, but handle defaults elsewhere
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  isItemInWishlist: (productId: string) => boolean;
  isLoading: boolean;
  totalItems: number; // Add this property
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Load wishlist from server if logged in
  useEffect(() => {
    const loadWishlist = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        setIsLoading(true);
        return;
      }

      try {
        setIsLoading(true);

        // If user is logged in, fetch from API
        if (user) {
          const token = localStorage.getItem("authToken");
          if (!token) {
            setWishlistItems([]);
            return;
          }

          const response = await fetch("/api/user/wishlist", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("Wishlist API response status:", response.status);

          if (response.ok) {
            const data = await response.json();
            console.log("Wishlist API response data:", data);
            setWishlistItems(data.wishlist || []);
          } else if (response.status === 404) {
            // Handle 404 - Could be missing route or no wishlist items
            console.warn("Wishlist API returned 404, route may be missing");
            toast({
              title: "Error",
              description:
                "Could not load wishlist data. Please try again later.",
              variant: "destructive",
            });
            setWishlistItems([]);
          } else {
            // Handle other errors silently
            setWishlistItems([]);
          }
        } else {
          // If not logged in, always return empty wishlist
          // Wishlist requires authentication
          setWishlistItems([]);
        }
      } catch (error) {
        console.error("Error loading wishlist:", error);
        setWishlistItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [user, authLoading, toast]);

  const addItem = async (item: WishlistItem) => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      // Ensure stock is set to a reasonable default if undefined
      const itemWithStock = {
        ...item,
        stock: item.stock !== undefined ? item.stock : 10,
      };

      // Optimistically update UI
      setWishlistItems((prev) => [...prev, itemWithStock]);

      // Then update the server
      const response = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: item.id }),
      });

      // If server update failed, revert UI change
      if (!response.ok) {
        setWishlistItems((prev) => prev.filter((i) => i.id !== item.id));

        const error = await response.json();
        throw new Error(error.message || "Failed to add item to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (productId: string) => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to manage your wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      // Optimistically update UI
      setWishlistItems((prev) => prev.filter((item) => item.id !== productId));

      // Then update the server
      const response = await fetch(
        `/api/user/wishlist?productId=${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If server update failed, revert UI change
      if (!response.ok) {
        const originalItem = wishlistItems.find(
          (item) => item.id === productId
        );
        if (originalItem) {
          setWishlistItems((prev) => [...prev, originalItem]);
        }

        const error = await response.json();
        throw new Error(error.message || "Failed to remove item from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const isItemInWishlist = (productId: string): boolean => {
    return wishlistItems.some((item) => item.id === productId);
  };

  // Calculate totalItems for the header badge
  const totalItems = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addItem,
        removeItem,
        clearWishlist,
        isItemInWishlist,
        isLoading,
        totalItems, // Provide the totalItems value
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
