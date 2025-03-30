"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { Product } from "@/contexts/cart-context"

interface WishlistContextType {
  wishlistItems: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
  totalItems: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem("wishlist")
    if (storedWishlist) {
      try {
        setWishlistItems(JSON.parse(storedWishlist))
      } catch (err) {
        console.error("Failed to parse wishlist from localStorage", err)
      }
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlistItems))
  }, [wishlistItems])

  const addToWishlist = (product: Product) => {
    setWishlistItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id)
      
      if (!existingItem) {
        return [...prevItems, product]
      }
      
      return prevItems
    })
  }

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId))
  }

  const clearWishlist = () => {
    setWishlistItems([])
  }

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId)
  }

  const totalItems = wishlistItems.length

  return (
    <WishlistContext.Provider 
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        totalItems
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
