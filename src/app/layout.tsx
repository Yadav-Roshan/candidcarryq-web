import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import Header from "@/components/header"; // Keep using the header from components directory
import Footer from "@/components/footer"; // Keep using the footer from components directory
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { AnnouncementProvider } from "@/contexts/announcement-context";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { AuthStateHandler } from "@/components/common/auth-state-handler";
import { WhatsAppButton } from "@/components/whatsapp-button"; // Import the WhatsApp button

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CandidCarryq - Premium Bags & Accessories",
  description: "Discover premium quality bags and accessories at CandidCarryq.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <AnnouncementProvider>
                  <AuthStateHandler />
                  <div className="flex min-h-screen flex-col">
                    <AnnouncementBanner />
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                    {/* Add WhatsApp button with your business phone number */}
                    <WhatsAppButton
                      phoneNumber="+9779826868800" // Change to your preferred phone number
                      message="Hello from CandidCarryq! I'm interested in your products." // Change to your preferred default message
                      size="md" // Use larger size option
                    />
                  </div>
                  <Toaster />
                </AnnouncementProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
