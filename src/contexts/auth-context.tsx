"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import apiClient from "@/lib/api-client"

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem('authToken')
        
        if (token) {
          // If we have a token, fetch the user profile
          const userData = await apiClient.user.getProfile()
          setUser(userData)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem('authToken')
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
      const response = await apiClient.auth.login(identifier, password)
      
      if (response.token && response.user) {
        // Store token
        apiClient.auth.setToken(response.token)
        
        // Store user data
        setUser(response.user)
        
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

  // Register functionality with address support
  const register = async (userData: RegisterUserData): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.auth.register(userData)
      
      if (response.token && response.user) {
        // Store token
        apiClient.auth.setToken(response.token)
        
        // Store user data
        setUser(response.user)
        
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
      const response = await apiClient.user.updateProfile(userData)
      
      if (response.user) {
        // Update user data in state
        setUser(prevUser => prevUser ? {...prevUser, ...response.user} : null)
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
      const response = await apiClient.user.updateAddress(address)
      
      if (response.user) {
        // Update user data in state with new address
        setUser(prevUser => 
          prevUser ? {...prevUser, address: response.user.address} : null
        )
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
    apiClient.auth.clearToken()
    
    // Clear user state
    setUser(null)
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
