"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  // Redirect if not an admin
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?from=/admin")
    } else if (user && user.role !== 'admin') {
      router.push("/") // Redirect non-admin users to homepage
    }
  }, [user, router, isLoading])
  
  // Show loading state while checking auth
  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Render admin dashboard content for admin users with horizontal navigation
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-6 px-4 md:px-6">
        <AdminHeader />
        <main className="mt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
