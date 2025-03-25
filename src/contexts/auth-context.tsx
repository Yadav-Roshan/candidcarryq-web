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

const setToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
};

const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = getToken();

        if (token) {
          // If we have a token, fetch the user profile
          const response = await fetch("/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            clearToken();
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Update user profile
  const updateUserProfile = async (
    userData: Partial<User>
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          throw new Error("Session expired");
        }
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const data = await response.json();

      if (data.user) {
        // Update user data in state
        setUser((prevUser) =>
          prevUser ? { ...prevUser, ...data.user } : null
        );

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });

        return true;
      } else {
        setError("Failed to update profile");
        return false;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred updating profile");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user address specifically
  const updateUserAddress = async (address: Address): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/user/address", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          throw new Error("Session expired");
        }
        const error = await response.json();
        throw new Error(error.message || "Failed to update address");
      }

      const data = await response.json();

      if (data.user) {
        // Update user data in state with new address
        setUser((prevUser) =>
          prevUser ? { ...prevUser, address: data.user.address } : null
        );

        toast({
          title: "Address updated",
          description: "Your address has been updated successfully",
        });

        return true;
      } else {
        setError("Failed to update address");
        return false;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred updating address");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add account deletion function
  const deleteAccount = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete account");
      }

      // Clear user data after successful deletion
      clearToken();
      setUser(null);

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });

      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Google login functionality
  const googleLogin = async (credential: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Ensure we're starting with a clean state (important after logout)
      clearToken();

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credential }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Google login failed:", errorData);
        setError(errorData.message || "Authentication failed");
        setIsLoading(false);
        return false;
      }

      const data = await response.json();

      // Store token and update user state
      setToken(data.token);
      setUser(data.user);

      return true;
    } catch (error) {
      console.error("Google login error:", error);
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // First try to clear Google's authentication state
    try {
      if (window.google?.accounts?.id) {
        // Cancel any current Google auth session
        window.google.accounts.id.cancel();
        // Disable auto-select to prevent automatic re-login
        window.google.accounts.id.disableAutoSelect();
        console.log("Google auth state cleared");
      }
    } catch (e) {
      console.log("Error clearing Google auth state:", e);
    }

    // Clear token
    clearToken();

    // Clear user state
    setUser(null);

    // Force page refresh to clear all client-side state
    // This is the most reliable way to reset Google auth completely
    setTimeout(() => {
      window.location.href = "/login?refresh=true";
    }, 100);

    // Show toast notification
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        updateUserProfile,
        updateUserAddress,
        deleteAccount,
        logout,
        isLoading,
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
