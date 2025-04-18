"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  ShoppingCart,
  User,
  Search,
  Sun,
  Moon,
  Home,
  Heart,
  Package,
  Grid,
  LogIn,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { UserAvatarMenu } from "@/components/user-avatar-menu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth(); // Add logout to the destructuring

  // Add mounting state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const { totalItems: cartItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null on server or during first render on client
  if (!mounted) {
    // You can render a placeholder with the same structure to avoid layout shift
    return (
      <header className="w-full bg-background border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="CandidCarryq Logo" className="h-12" />
          </div>

          {/* Placeholder for buttons */}
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9"></div>
            <div className="h-9 w-9"></div>
            <div className="h-9 w-9"></div>
          </div>
        </div>
      </header>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      router.push(`/products`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-black text-white">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="CandidCarryq Logo" className="h-10" />
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex md:w-full max-w-sm mx-4 lg:mx-8"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9 w-full text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Desktop navigation - Complete horizontal menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Package className="h-4 w-4" />
            <span>Products</span>
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Grid className="h-4 w-4" />
            <span>Categories</span>
          </Link>

          {/* Admin link - Move before UserAvatarMenu and add icon */}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          )}

          {/* Show either avatar menu or login link based on auth status */}
          {user ? (
            <UserAvatarMenu />
          ) : (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-black dark:text-white"
            >
              <Link href="/login" className="flex items-center gap-1">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}
        </nav>

        {/* Right-side buttons */}
        <div className="flex items-center gap-2">
          {/* Wishlist */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative text-gray-300 hover:text-white"
          >
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
              {wishlistItems > 0 && (
                <Badge className="absolute -right-1 -top-1 px-1 min-w-4 h-4 flex items-center justify-center text-xs">
                  {wishlistItems}
                </Badge>
              )}
              <span className="sr-only">Wishlist</span>
            </Link>
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative text-gray-300 hover:text-white"
          >
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItems > 0 && (
                <Badge className="absolute -right-1 -top-1 px-1 min-w-4 h-4 flex items-center justify-center text-xs">
                  {cartItems}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle Theme"
            className="text-gray-300 hover:text-white"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Mobile menu button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
                className="md:hidden text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                >
                  <Home className="h-5 w-5" /> Home
                </Link>
                <Link
                  href="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                >
                  <Package className="h-5 w-5" /> Products
                </Link>
                <Link
                  href="/categories"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                >
                  <Grid className="h-5 w-5" /> Categories
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" /> Cart
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                >
                  <Heart className="h-5 w-5" /> Wishlist
                </Link>
                {user ? (
                  <Link
                    href="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <User className="h-5 w-5" /> Account
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors text-black dark:text-white"
                  >
                    <LogIn className="h-5 w-5" /> Sign In
                  </Link>
                )}

                {/* Admin Link - Only show if user has admin role */}
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium border-t pt-4 mt-2"
                  >
                    <LayoutDashboard className="h-5 w-5" /> Admin Dashboard
                  </Link>
                )}

                {/* Add Logout Button - Only show if user is logged in */}
                {user && (
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors text-red-500 mt-4"
                  >
                    <LogOut className="h-5 w-5" /> Log out
                  </button>
                )}
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
            className="pl-9 w-full text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>
    </header>
  );
}
