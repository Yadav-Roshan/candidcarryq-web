"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
}

interface WishlistContextType {
  items: WishlistItem[]
  totalItems: number
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  clearWishlist: () => void
  isItemInWishlist: (id: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [mounted, setMounted] = useState(false)
  
  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem('wishlist')
    if (storedWishlist) {
      try {
        setItems(JSON.parse(storedWishlist))
      } catch (error) {
        console.error('Error parsing wishlist data:', error)
        setItems([])
      }
    }
    setMounted(true)
  }, [])
  
  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('wishlist', JSON.stringify(items))
    }
  }, [items, mounted])
  
  // Get total items
  const totalItems = items.length
  
  // Add item to wishlist
  const addItem = (item: WishlistItem) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.id === item.id)
      
      if (existingItem) {
        // Item already exists, do nothing
        return prev
      } else {
        // Item doesn't exist, add it
        return [...prev, item]
      }
    })
  }
  
  // Remove item from wishlist
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }
  
  // Clear wishlist
  const clearWishlist = () => {
    setItems([])
  }
  
  // Check if item is in wishlist
  const isItemInWishlist = (id: string) => {
    return items.some(item => item.id === id)
  }
  
  return (
    <WishlistContext.Provider
      value={{
        items,
        totalItems,
        addItem,
        removeItem,
        clearWishlist,
        isItemInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
