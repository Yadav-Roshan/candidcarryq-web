"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Define User interface with roles
interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
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
      try {
        // Use a more reliable way to check if running in browser
        if (typeof window !== 'undefined') {
          const userJson = localStorage.getItem('user')
          if (userJson) {
            const userData = JSON.parse(userJson)
            setUser(userData)
          }
        }
      } catch (err) {
        console.error('Error checking authentication:', err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Mock login functionality (replace with actual API call)
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // For demo purposes, create mock users
      const mockUsers = [
        { id: '1', name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' as const },
        { id: '2', name: 'Regular User', email: 'user@example.com', password: 'user123', role: 'user' as const }
      ]
      
      // Find user with matching credentials
      const foundUser = mockUsers.find(u => u.email === email && u.password === password)
      
      if (foundUser) {
        // Create user object without password
        const { password: _, ...userWithoutPassword } = foundUser
        
        // Store in state and localStorage
        setUser(userWithoutPassword)
        
        // Make sure localStorage is available (client-side only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userWithoutPassword))
        }
        
        return true
      } else {
        setError('Invalid email or password')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
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
