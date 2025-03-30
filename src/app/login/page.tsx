"use client";

import { Suspense } from "react";
import LoginContent from "@/components/auth/login-content";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex flex-col items-center py-16">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]">
              <span className="sr-only">Loading...</span>
            </div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
