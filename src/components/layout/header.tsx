"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, Search, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const mainNav = [
  { title: "Home", href: "/" },
  { title: "Products", href: "/products" },
  { title: "Categories", href: "/categories" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
]

export default function Header() {
  const { user } = useAuth()
  const { cartItems } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2" aria-label="Menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold">CandidWear</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex md:items-center md:gap-6 lg:gap-8">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Search */}
          <div className={cn("relative", isSearchOpen ? "flex w-full max-w-sm items-center" : "hidden md:flex")}>
            {isSearchOpen && (
              <>
                <input
                  type="search"
                  placeholder="Search products..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0" 
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {!isSearchOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute right-0 top-0 h-4 w-4 rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartItems.length}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          {/* Auth buttons */}
          {user ? (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile">Account</Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
