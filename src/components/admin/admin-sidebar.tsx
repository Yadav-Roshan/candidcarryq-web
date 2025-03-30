"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

interface SidebarItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const sidebarItems: SidebarItem[] = [
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
    title: "Featured Products",
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

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  
  return (
    <div className="w-64 border-r bg-muted/40 min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <Link href="/admin" className="flex items-center">
          <span className="font-bold text-lg">MyBags Admin</span>
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4">
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href || pathname?.startsWith(`${item.href}/`)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Log Out
        </Button>
      </div>
    </div>
  )
}
