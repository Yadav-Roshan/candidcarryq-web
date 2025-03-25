"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page since we're only using Google OAuth
    router.push("/login");
  }, [router]);

  return (
    <div className="container flex items-center justify-center min-h-[60vh]">
      <p>Redirecting to login page...</p>
    </div>
  );
}
