"use client";

import { useState, useEffect } from "react";
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
          cancel: () => void; // Add the missing 'cancel' method
        };
      };
    };
  }
}

export function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { googleLogin } = useAuth();

  useEffect(() => {
    // Load the Google Sign-In script only once
    if (!isGoogleScriptLoaded && !window.google?.accounts) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleScriptLoaded(true);
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isGoogleScriptLoaded]);

  useEffect(() => {
    if (isGoogleScriptLoaded && window.google?.accounts) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
      });

      // Render the button manually to a div target
      const buttonContainer = document.getElementById("google-signin-button");
      if (buttonContainer) {
        window.google.accounts.id.renderButton(buttonContainer, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          width: "100%",
        });
      }
    }
  }, [isGoogleScriptLoaded]);

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
      window.google.accounts.id.prompt();
    }
  };

  return (
    <>
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
          {/* Hidden div where Google will render its own button */}
          <div id="google-signin-button" className="w-full"></div>

          {/* Fallback button in case the Google script fails to load */}
          {!isGoogleScriptLoaded && (
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
              Continue with Google
            </Button>
          )}
        </>
      )}
    </>
  );
}
