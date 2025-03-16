import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/providers/theme-provider'
import { CartProvider } from '@/contexts/cart-context'
import { WishlistProvider } from '@/contexts/wishlist-context'
import { AuthProvider } from '@/contexts/auth-context'
import { AnnouncementProvider } from '@/contexts/announcement-context'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { AnnouncementBanner } from '@/components/announcement-banner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MyBags - Premium Bag Store',
  description: 'Shop premium quality bags, backpacks, and accessories',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <WishlistProvider>
              <AuthProvider>
                <AnnouncementProvider>
                  <div className="flex min-h-screen flex-col">
                    <AnnouncementBanner />
                    <Header />
                    <main className="flex-1">
                      {children}
                    </main>
                    <Footer />
                    <Toaster />
                  </div>
                </AnnouncementProvider>
              </AuthProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
