"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function AccountAuthCheck({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?from=${encodeURIComponent('/account')}`)
    }
  }, [user, router, isLoading])
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4">Loading your account information...</p>
          </div>
        </div>
      </div>
    )
  }
  
  // If not loading and we still have a user, render the children
  // Otherwise the redirect will happen via the useEffect
  if (user) {
    return <>{children}</>
  }
  
  // This intermediate state prevents flickering during auth checking
  return (
    <div className="container py-10">
      <div className="flex min-h-[400px] items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    </div>
  )
}
