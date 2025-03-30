"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAuthButton } from "@/components/ui/google-auth-button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("from") || "/account";
  const errorParam = searchParams.get("error");
  const { user, isLoading } = useAuth();

  const [error, setError] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      // If user is already logged in, redirect to account page
      router.push("/account");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (errorParam) {
      if (errorParam === "auth_failed") {
        setError("Authentication failed. Please try again.");
      } else if (errorParam === "no_code") {
        setError("Google sign-in was canceled or failed.");
      } else {
        setError("An error occurred during sign-in. Please try again.");
      }
    }
  }, [errorParam]);

  // If authentication is in progress, show a loading state
  if (isLoading) {
    return (
      <div className="container flex flex-col items-center py-16">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]">
            <span className="sr-only">Loading...</span>
          </div>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated, we'll redirect in the useEffect
  if (user) {
    return (
      <div className="container flex flex-col items-center py-16">
        <div className="w-full max-w-md space-y-8 text-center">
          <p>You are already logged in. Redirecting...</p>
        </div>
      </div>
    );
  }

  // Normal login view
  return (
    <div className="container flex flex-col items-center py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-card border rounded-lg p-8 shadow-sm">
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              Sign in with your Google account
            </p>
          </div>

          <GoogleAuthButton />
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          Need help? Contact our{" "}
          <Link
            href="/contact"
            className="font-medium text-primary hover:text-primary/80"
          >
            support team
          </Link>
        </p>
      </div>
    </div>
  );
}
