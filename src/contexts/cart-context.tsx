"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
  salePrice?: number | null;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  colors?: string[];
  sizes?: string[];
  material?: string;
  dimensions?: string;
  weight?: string;
  capacity?: string;
  fullDescription?: string;
}

interface CartItem extends Product {
  quantity: number;
  color?: string;
  size?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    color?: string,
    size?: string
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
  syncServerCart: () => Promise<void>;
  createOrder: (
    orderData: any
  ) => Promise<{ success: boolean; order?: any; error?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage first, then from server if user is logged in
  useEffect(() => {
    const loadCart = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        setIsLoading(true);
        return;
      }

      try {
        setIsLoading(true);

        // First load from localStorage
        const storedCart = localStorage.getItem("cart");
        let localCart: CartItem[] = [];

        if (storedCart) {
          try {
            localCart = JSON.parse(storedCart);
          } catch (err) {
            console.error("Failed to parse cart from localStorage", err);
            localStorage.removeItem("cart"); // Clear invalid cart data
          }
        }

        // If user is logged in, fetch server cart and merge with local cart
        if (user) {
          try {
            const token = localStorage.getItem("authToken");
            if (!token) {
              setCartItems(localCart);
              setIsInitialized(true);
              return;
            }

            // Get cart from server
            const response = await fetch("/api/user/cart", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) throw new Error("Failed to fetch cart");

            const data = await response.json();
            const serverCart = data.cart || [];

            // Merge server cart with local cart if not yet initialized
            if (!isInitialized && localCart.length > 0) {
              // Prepare to sync merged cart to server
              const mergedCart = mergeCartItems(serverCart, localCart);
              setCartItems(mergedCart);

              // Save merged cart to server
              await syncCartToServer(mergedCart);

              // Clear localStorage cart since it's now on the server
              localStorage.removeItem("cart");
            } else {
              // Just use server cart
              setCartItems(serverCart);
            }
          } catch (error) {
            console.error("Error fetching server cart:", error);
            // If server fetch fails, fall back to local cart
            setCartItems(localCart);
          }
        } else {
          // If not logged in, just use localStorage cart
          setCartItems(localCart);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing cart:", error);
        // Fallback to empty cart
        setCartItems([]);
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [user, authLoading, isInitialized]);

  // Helper function to merge two cart arrays, picking higher quantities when there's a conflict
  const mergeCartItems = (
    serverCart: CartItem[],
    localCart: CartItem[]
  ): CartItem[] => {
    const mergedCart = [...serverCart];
    const serverProductIds = new Set(serverCart.map((item) => item.id));

    // Add items from local cart that don't exist in server cart
    // or update quantities if they do exist
    localCart.forEach((localItem) => {
      const serverItemIndex = mergedCart.findIndex(
        (item) => item.id === localItem.id
      );

      if (serverItemIndex === -1) {
        // Item doesn't exist in server cart, add it
        mergedCart.push(localItem);
      } else {
        // Item exists, use the higher quantity
        mergedCart[serverItemIndex].quantity = Math.max(
          mergedCart[serverItemIndex].quantity,
          localItem.quantity
        );
      }
    });

    return mergedCart;
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      // Only save to localStorage when not logged in
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user, isInitialized]);

  // Helper function to sync cart to server
  const syncCartToServer = async (items: CartItem[]) => {
    if (!user) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      // Format cart items for API
      const cartItemsForApi = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      }));

      // Send to server
      await fetch("/api/user/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cartItemsForApi),
      });
    } catch (error) {
      console.error("Error syncing cart to server:", error);
    }
  };

  // Expose function to manually sync cart to server
  const syncServerCart = async () => {
    if (user && isInitialized) {
      await syncCartToServer(cartItems);
    }
  };

  const addToCart = async (
    product: Product,
    quantity = 1,
    color?: string,
    size?: string
  ) => {
    try {
      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add items to your cart",
          variant: "destructive",
        });
        return false;
      }

      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);

        if (existingItem) {
          // Update existing item
          const updatedItems = prevItems.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  // Update color and size only if provided
                  ...(color && { color }),
                  ...(size && { size }),
                }
              : item
          );

          // Sync to server if logged in - but don't do this inside the state update
          // Will be handled outside the state update function
          return updatedItems;
        } else {
          // Add new item
          const newItem = {
            ...product,
            quantity,
            color,
            size,
          };

          // Sync to server if logged in - but don't do this inside the state update
          // Will be handled outside the state update function
          return [...prevItems, newItem];
        }
      });

      // After state update, sync with server if user is logged in
      // This avoids the duplicate server calls that were happening before
      if (user && isInitialized) {
        // Find the updated/new item in the cart after state update
        const updatedCart = [...cartItems];
        const itemToSync = updatedCart.find((item) => item.id === product.id);

        if (itemToSync) {
          // If item exists, update it on server
          await updateCartItemOnServer(itemToSync);
        } else {
          // If it's a new item (not found in previous state), add it on server
          await addCartItemToServer({
            ...product,
            quantity,
            color,
            size,
          });
        }
      }

      return true; // Return success indicator
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFromCart = async (productId: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== productId);

      // Sync to server if logged in
      if (user && isInitialized) {
        removeCartItemFromServer(productId);
      }

      return updatedItems;
    });
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );

      // Sync to server if logged in
      if (user && isInitialized) {
        const updatedItem = updatedItems.find((item) => item.id === productId);
        if (updatedItem) {
          updateCartItemOnServer(updatedItem);
        }
      }

      return updatedItems;
    });
  };

  const clearCart = async () => {
    setCartItems([]);

    // Sync to server if logged in
    if (user && isInitialized) {
      clearCartOnServer();
    }
  };

  // Server sync helper functions
  const addCartItemToServer = async (item: CartItem) => {
    if (!user) return false;

    const token = localStorage.getItem("authToken");
    if (!token) return false;

    try {
      const response = await fetch("/api/user/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to add item to server cart"
        );
      }

      return true;
    } catch (error) {
      console.error("Error adding item to server cart:", error);
      toast({
        title: "Sync Error",
        description:
          "Your cart couldn't be saved to the server. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCartItemOnServer = async (item: CartItem) => {
    if (!user) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      await fetch("/api/user/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        }),
      });
    } catch (error) {
      console.error("Error updating server cart item:", error);
    }
  };

  const removeCartItemFromServer = async (productId: string) => {
    if (!user) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      await fetch(`/api/user/cart?productId=${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error removing item from server cart:", error);
    }
  };

  const clearCartOnServer = async () => {
    if (!user) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      await fetch(`/api/user/cart?clearAll=true`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error clearing server cart:", error);
    }
  };

  const createOrder = async (orderData: any) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return { success: false, error: "Authentication required" };
      }

      // Prepare the order data with cart items and totals
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item.id,
          name: item.name,
          price: item.salePrice || item.price,
          quantity: item.quantity,
          image: item.image,
          color: item.color,
          size: item.size,
        })),
        totalAmount:
          subtotal + (subtotal >= 5000 ? 0 : 250) + Math.round(subtotal * 0.13), // Add shipping and tax
        shippingCost: subtotal >= 5000 ? 0 : 250,
        taxAmount: Math.round(subtotal * 0.13),
        ...orderData, // Include shipping address, payment info, etc.
      };

      // Send the order to the API
      const response = await fetch("/api/user/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            result.message ||
            `Server responded with status: ${response.status}`,
        };
      }

      return { success: true, order: result.order };
    } catch (error) {
      console.error("Order creation error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create order",
      };
    }
  };

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.salePrice || item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isLoading,
        syncServerCart,
        createOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
