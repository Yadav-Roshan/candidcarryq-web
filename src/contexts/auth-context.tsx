"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface Address {
  buildingName?: string;
  locality?: string;
  wardNo?: string;
  postalCode?: string;
  district?: string;
  province?: string;
  country?: string;
  landmark?: string;
}

// Define User interface with roles
interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: "user" | "admin";
  avatar?: string;
  address?: Address;
}

interface AuthContextType {
  user: User | null;
  updateUserProfile: (userData: Partial<User>) => Promise<boolean>;
  updateUserAddress: (address: Address) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  googleLogin: (credential: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token handling utilities
const getToken = () => {
  if (typeof window !== "undefined") {
    // Try localStorage first
    const token = localStorage.getItem("authToken");
    if (token) return token;

    // If no token in localStorage, check for cookie
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith("auth_token=")) {
        const token = cookie.substring("auth_token=".length, cookie.length);
        // Store in localStorage for future use
        localStorage.setItem("authToken", token);
        return token;
      }
    }
  }
  return null;
};

const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    // Also clear the cookie if present
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};

const saveUserToLocalStorage = (user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

const getUserFromLocalStorage = (): User | null => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

const clearUserFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First check localStorage for existing user data
        let cachedUser = getUserFromLocalStorage();

        // Get token
        const token = getToken();
        if (!token) {
          // No token, not authenticated
          setUser(null);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        // If we have cached user data, use it initially to avoid flashing UI
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Verify the token with the backend
        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Token is valid
          const data = await response.json();
          setUser(data.user);
          saveUserToLocalStorage(data.user);
        } else {
          // Token is invalid
          clearToken();
          clearUserFromLocalStorage();
          setUser(null);

          // Only show toast if there was a cached user (token expired)
          if (cachedUser) {
            toast({
              title: "Session expired",
              description: "Please log in again.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setError("Failed to check authentication status");
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, [toast]);

  // Handle Google login
  const googleLogin = async (token: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Google login failed");
        setIsLoading(false);
        return false;
      }

      const data = await response.json();

      // Store the token in localStorage
      localStorage.setItem("authToken", data.token);

      // Update user state immediately without setTimeout
      setUser(data.user);
      saveUserToLocalStorage(data.user);
      setIsLoading(false);

      return true;
    } catch (error: any) {
      console.error("Google login error:", error);
      setError(error.message || "An error occurred during login");
      setIsLoading(false);
      return false;
    }
  };

  // Update user profile
  const updateUserProfile = async (
    userData: Partial<User>
  ): Promise<boolean> => {
    try {
      setError(null);

      const token = getToken();
      if (!token) {
        setError("Authentication required");
        return false;
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const data = await response.json();

      // Update local user state
      setUser(data.user);
      saveUserToLocalStorage(data.user);

      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
      return false;
    }
  };

  // Update user address
  const updateUserAddress = async (address: Address): Promise<boolean> => {
    // Implement address update logic
    return await updateUserProfile({ address });
  };

  // Delete user account
  const deleteAccount = async (): Promise<boolean> => {
    try {
      setError(null);

      const token = getToken();
      if (!token) {
        setError("Authentication required");
        return false;
      }

      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete account");
      }

      // Clear auth data
      clearToken();
      clearUserFromLocalStorage();
      setUser(null);

      // Also clear cart from localStorage when logging out
      localStorage.removeItem("cart");

      return true;
    } catch (error) {
      console.error("Account deletion error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete account"
      );
      return false;
    }
  };

  // Logout
  const logout = () => {
    clearToken();
    clearUserFromLocalStorage();
    setUser(null);

    // Also clear user-specific data from localStorage when logging out
    // But keep the cart data for guest users
    const cartData = localStorage.getItem("cart");

    // Reload the page to clear all state
    router.push("/login?refresh=true");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        updateUserProfile,
        updateUserAddress,
        deleteAccount,
        logout,
        isLoading: isLoading || !isInitialized,
        error,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
