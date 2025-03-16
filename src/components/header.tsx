"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, ShoppingCart, User, Search, Sun, Moon, Home, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { totalItems } = useCart()
  const { totalItems: wishlistItems } = useWishlist()
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">MyBags</span>
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex md:w-full max-w-sm mx-4 lg:mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <Link href="/products" className="text-sm font-medium hover:text-primary">
            All Products
          </Link>
          <Link href="/products?category=backpacks" className="text-sm font-medium hover:text-primary">
            Backpacks
          </Link>
          <Link href="/products?category=handbags" className="text-sm font-medium hover:text-primary">
            Handbags
          </Link>
          <Link href="/products?category=wallets" className="text-sm font-medium hover:text-primary">
            Wallets
          </Link>
        </nav>

        {/* Right side buttons */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Toggle Theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle Theme</span>
          </Button>

          {/* Wishlist with Item Count */}
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative">
              <Heart className="h-5 w-5" />
              {wishlistItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {wishlistItems}
                </Badge>
              )}
              <span className="sr-only">Wishlist</span>
            </Button>
          </Link>

          {/* Cart with Item Count */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" aria-label="Cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          {/* Account */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                <Link 
                  href="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium"
                >
                  <Home className="h-5 w-5" /> Home
                </Link>
                <Link 
                  href="/products" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium"
                >
                  Products
                </Link>
                <Link 
                  href="/categories" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium"
                >
                  Categories
                </Link>
                <Link 
                  href="/cart" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium"
                >
                  <ShoppingCart className="h-5 w-5" /> Cart
                </Link>
                <Link 
                  href="/account" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium"
                >
                  <User className="h-5 w-5" /> Account
                </Link>
                <Link 
                  href="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium border-t pt-4 mt-2"
                >
                  Admin Dashboard
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search - Outside container for full width */}
      <form onSubmit={handleSearch} className="md:hidden px-4 pb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>
    </header>
  )
}
