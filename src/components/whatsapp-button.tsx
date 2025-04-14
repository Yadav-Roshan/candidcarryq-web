"use client";

import { WhatsappLogo } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function WhatsAppButton({
  phoneNumber,
  message = "Hi! I have a question about CandidCarryq products.",
  size = "md",
  className,
}: WhatsAppButtonProps) {
  // Client-side only rendering to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Format phone number (remove any non-numeric characters)
  const formattedPhone = phoneNumber.replace(/[^0-9]/g, "");

  // Create WhatsApp URL with phone and encoded message
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
    message
  )}`;

  // Increased sizes for all options, especially for desktop
  const sizeClasses = {
    sm: "h-12 w-12 md:h-14 md:w-14",
    md: "h-14 w-14 md:h-16 md:w-16",
    lg: "h-16 w-16 md:h-20 md:w-20",
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-10 right-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all z-50",
        sizeClasses[size],
        className
      )}
      aria-label="Contact us on WhatsApp"
    >
      <WhatsappLogo weight="fill" className="h-7 w-7 md:h-8 md:w-8" />
    </a>
  );
}
