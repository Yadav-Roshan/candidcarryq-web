"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  Star,
  Megaphone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

interface AdminNavItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const adminNavItems: AdminNavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Products",
    icon: Package,
    href: "/admin/products",
  },
  {
    title: "Featured",
    icon: Star,
    href: "/admin/featured",
  },
  {
    title: "Orders",
    icon: ShoppingBag,
    href: "/admin/orders",
  },
  {
    title: "Customers",
    icon: Users,
    href: "/admin/customers",
  },
  {
    title: "Announcements",
    icon: Megaphone,
    href: "/admin/announcements",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
]

export function AdminHeader() {
  const pathname = usePathname()
  const { logout } = useAuth()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-2xl font-bold">CandidWear Admin</Link>
        <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
      
      <nav className="flex flex-wrap gap-2 border-b pb-4">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              pathname === item.href || pathname?.startsWith(`${item.href}/`)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 hover:bg-secondary"
            )}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}
