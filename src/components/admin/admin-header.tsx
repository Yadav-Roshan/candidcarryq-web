"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, Megaphone, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
  {
    href: "/admin/products",
    label: "Products",
    icon: <Package className="h-4 w-4" />,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    href: "/admin/announcements",
    label: "Announcements",
    icon: <Megaphone className="h-4 w-4" />,
  },
  {
    href: "/admin/promocodes",
    label: "Promo Codes",
    icon: <Tag className="h-4 w-4" />,
  },
];

export function AdminHeader() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (pathname === null) return false;

    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="pb-4">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <nav className="flex overflow-auto pb-2 hide-scrollbar">
          <ul className="flex items-center space-x-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
