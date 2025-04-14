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

// Fixed localStorage utility functions with consistent keys
const saveUserToLocalStorage = (user: User) => {
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error saving user to localStorage:", error);
  }
};

const getUserFromLocalStorage = (): User | null => {
  try {
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error("Error getting user from localStorage:", error);
    return null;
  }
};

const clearUserFromLocalStorage = () => {
  try {
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Error clearing user from localStorage:", error);
  }
};

const getToken = (): string | null => {
  try {
    return localStorage.getItem("authToken");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

const setToken = (token: string): void => {
  try {
    localStorage.setItem("authToken", token);
  } catch (error) {
    console.error("Error setting token:", error);
  }
};

const clearToken = (): void => {
  try {
    localStorage.removeItem("authToken");
  } catch (error) {
    console.error("Error clearing token:", error);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First try to get user from localStorage
        const cachedUser = getUserFromLocalStorage();
        const token = getToken();

        // If no token, user is not authenticated
        if (!token) {
          clearUserFromLocalStorage();
          setUser(null);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        // If we have cached user data, use it initially to avoid flashing UI
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Always verify token with the server
        try {
          const response = await fetch("/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log("Profile data from API:", data);
            setUser(data.user);
            saveUserToLocalStorage(data.user);
          } else {
            // If token is invalid, clear everything
            console.log("Invalid token response:", response.status);
            clearToken();
            clearUserFromLocalStorage();
            setUser(null);
          }
        } catch (fetchError) {
          console.error("Error verifying authentication:", fetchError);
          // On network error, keep using cached user data if available
          if (!cachedUser) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        clearToken();
        clearUserFromLocalStorage();
        setUser(null);
        setError("Authentication error");
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, []);

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
      console.log("Google login successful, user data:", data.user);

      // Store the token in localStorage
      setToken(data.token);

      // Update user state and save to localStorage
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
