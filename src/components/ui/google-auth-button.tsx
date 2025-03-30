"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

export function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { googleLogin, error: authError } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Reset any Google sign-in state when the component mounts
  useEffect(() => {
    // Add a small cleanup function to run on mount and unmount
    const cleanup = () => {
      if (window.google?.accounts?.id) {
        try {
          // This helps reset Google's internal state
          window.google.accounts.id.cancel();
        } catch (e) {
          console.log("No active Google session to cancel");
        }
      }
    };

    // Run cleanup on mount
    cleanup();

    // Return cleanup for unmount
    return cleanup;
  }, []);

  // Add an effect to detect refresh parameter in URL
  useEffect(() => {
    // Check if we just got redirected after logout
    const url = new URL(window.location.href);
    const refreshParam = url.searchParams.get("refresh");

    if (refreshParam === "true") {
      // Clear the parameter from URL to avoid future refreshes
      url.searchParams.delete("refresh");
      window.history.replaceState({}, document.title, url.toString());

      // Force re-initialization of Google auth
      setIsInitialized(false);

      // Give Google a moment to clean up
      setTimeout(() => {
        if (window.google?.accounts?.id) {
          try {
            window.google.accounts.id.cancel();
            console.log("Google auth state reset after refresh");
          } catch (e) {
            console.log("Error in post-refresh cleanup", e);
          }
        }
      }, 300);
    }
  }, []);

  // Function to initialize Google auth when needed
  const initializeGoogleAuth = () => {
    if (!window.google?.accounts?.id || !buttonRef.current) return;

    try {
      // Make sure we've cleaned up properly before re-initializing
      window.google.accounts.id.cancel();

      // Small delay to let Google's internal state update
      setTimeout(() => {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the button manually to the ref
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            width: "100%",
            logo_alignment: "center",
          });
        }

        setIsInitialized(true);
      }, 100);
    } catch (err) {
      console.error("Google Sign-In initialization error:", err);
      setScriptError(true);
    }
  };

  // Clear any console errors
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("GSI_LOGGER") || args[0].includes("FedCM"))
      ) {
        // Suppress Google Sign-In specific errors
        return;
      }
      originalConsoleError(...args);
    };

    // Load the Google Sign-In script only once
    if (!isGoogleScriptLoaded && !window.google?.accounts) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleScriptLoaded(true);
      };
      script.onerror = () => {
        setScriptError(true);
      };
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          document.body.removeChild(script);
        }
        console.error = originalConsoleError;
      };
    }

    return () => {
      console.error = originalConsoleError;
    };
  }, [isGoogleScriptLoaded]);

  // Initialize Google auth when the script is loaded and button ref is available
  useEffect(() => {
    if (
      isGoogleScriptLoaded &&
      window.google?.accounts &&
      buttonRef.current &&
      !isInitialized
    ) {
      // Add a small delay to ensure the Google API is fully initialized
      const timerId = setTimeout(() => {
        initializeGoogleAuth();
      }, 300);

      return () => clearTimeout(timerId);
    }
  }, [isGoogleScriptLoaded, buttonRef.current, isInitialized]);

  const handleGoogleResponse = async (response: any) => {
    setIsLoading(true);
    try {
      // The GoogleCredentialResponse has a credential field with the JWT token
      const credential = response.credential;

      if (!credential) {
        throw new Error(
          "Google authentication failed - no credential received"
        );
      }

      const success = await googleLogin(credential);

      if (success) {
        toast({
          title: "Google Sign-in Successful",
          description: "You have been signed in with Google!",
        });

        // Redirect to account page
        router.push("/account");
      } else {
        toast({
          title: "Authentication failed",
          description: "Could not authenticate with Google",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Authentication failed",
        description: "Could not authenticate with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualClick = () => {
    if (window.google?.accounts) {
      try {
        window.google.accounts.id.prompt();
      } catch (err) {
        console.log("Error prompting Google Sign-In:", err);

        toast({
          title: "Using alternative sign-in method",
          description: "Redirecting to Google authentication",
        });

        // Use the redirected OAuth flow as fallback
        window.location.href = "/api/auth/google/redirect";
      }
    } else {
      // If Google API isn't available, use redirect method
      window.location.href = "/api/auth/google/redirect";
    }
  };

  if (scriptError) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-amber-500 mb-4 p-3 bg-amber-50 rounded-md border border-amber-200 text-sm">
          <p>There was an issue loading Google Sign-In.</p>
          <p>Please try the alternative sign-in method below.</p>
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={handleManualClick}
        >
          <svg
            className="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          Sign in with Google
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          We only support Google authentication for secure access to your
          account
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {isLoading ? (
        <Button
          variant="outline"
          type="button"
          className="w-full"
          disabled={true}
        >
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Authenticating with Google...
        </Button>
      ) : (
        <>
          {/* Container where Google will render its button */}
          <div
            ref={buttonRef}
            id="google-signin-button"
            className="w-full min-h-[40px]"
          ></div>

          {/* Fallback button in case the Google script fails to load */}
          {!isGoogleScriptLoaded && (
            <Button
              variant="outline"
              type="button"
              className="w-full mt-4"
              onClick={handleManualClick}
            >
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Sign in with Google
            </Button>
          )}
        </>
      )}
      <p className="text-sm text-muted-foreground mt-4">
        We only support Google authentication for secure access to your account
      </p>
    </div>
  );
}
