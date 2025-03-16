"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  
  // Simple authentication check
  // In production, you'd want more robust role-based authentication
  useEffect(() => {
    if (!user) {
      router.push("/login?from=/admin")
    }
  }, [user, router])
  
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
}
