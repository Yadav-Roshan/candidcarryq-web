"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function AccountAuthCheck({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated and we're sure about the authentication state
  useEffect(() => {
    if (!isLoading && !user) {
      // Add a small delay to avoid any race conditions
      const redirectTimer = setTimeout(() => {
        router.push(`/login?from=${encodeURIComponent("/account")}`);
      }, 100);

      return () => clearTimeout(redirectTimer);
    }
  }, [user, router, isLoading]);

  // Show loading state only when explicitly loading
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4">Loading your account information...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is available, render children
  if (user) {
    return <>{children}</>;
  }

  // Intermediate state - we're not loading, but user is null
  // We'll show a brief loading message while the redirect is happening
  return (
    <div className="container py-10">
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    </div>
  );
}
