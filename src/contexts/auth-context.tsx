"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

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
  id: string
  name: string
  email: string
  phoneNumber?: string
  role: 'user' | 'admin'
  avatar?: string
  address?: Address
}

// User data for registration
interface RegisterUserData {
  name: string
  email: string
  password: string
  phoneNumber?: string
  address?: Address
}

interface AuthContextType {
  user: User | null
  login: (identifier: string, password: string) => Promise<boolean>
  register: (userData: RegisterUserData) => Promise<boolean>
  updateUserProfile: (userData: Partial<User>) => Promise<boolean>
  updateUserAddress: (address: Address) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Token handling utilities
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        const token = getToken()
        
        if (token) {
          // If we have a token, fetch the user profile
          const response = await fetch('/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
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
        console.error("Auth check failed:", error)
        clearToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  // Login functionality
  const login = async (identifier: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      
      if (data.token && data.user) {
        // Store token
        setToken(data.token)
        
        // Store user data
        setUser(data.user)
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })
        
        return true
      } else {
        setError('Invalid response from server')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Register functionality
  const register = async (userData: RegisterUserData): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      if (data.token && data.user) {
        // Store token
        setToken(data.token)
        
        // Store user data
        setUser(data.user)
        
        toast({
          title: "Registration successful",
          description: "Your account has been created!",
        })
        
        return true
      } else {
        setError('Invalid response from server')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Update user profile
  const updateUserProfile = async (userData: Partial<User>): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          throw new Error('Session expired');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      
      const data = await response.json();
      
      if (data.user) {
        // Update user data in state
        setUser(prevUser => prevUser ? {...prevUser, ...data.user} : null)
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        })
        
        return true
      } else {
        setError('Failed to update profile')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred updating profile')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Update user address specifically
  const updateUserAddress = async (address: Address): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch('/api/user/address', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          clearToken();
          throw new Error('Session expired');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to update address');
      }
      
      const data = await response.json();
      
      if (data.user) {
        // Update user data in state with new address
        setUser(prevUser => 
          prevUser ? {...prevUser, address: data.user.address} : null
        )
        
        toast({
          title: "Address updated",
          description: "Your address has been updated successfully",
        })
        
        return true
      } else {
        setError('Failed to update address')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred updating address')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    // Clear token
    clearToken()
    
    // Clear user state
    setUser(null)
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        updateUserProfile,
        updateUserAddress,
        logout,
        isLoading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
