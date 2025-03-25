"use client";

import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { User, Settings, LogOut, Heart, ShoppingBag } from "lucide-react";

export function UserAvatarMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Get first name only for display
  const firstName = user.name.split(" ")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
        <Avatar className="h-8 w-8 cursor-pointer border">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden sm:block">{firstName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/account?tab=profile"
            className="flex items-center cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/account?tab=orders"
            className="flex items-center cursor-pointer"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Orders</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/wishlist" className="flex items-center cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            <span>Wishlist</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/account?tab=settings"
            className="flex items-center cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center cursor-pointer">
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
