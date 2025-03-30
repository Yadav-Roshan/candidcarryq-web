import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { CartProvider } from '@/contexts/cart-context'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CandidWear - Premium Bags & Accessories',
  description: 'Shop the latest collection of premium bags and accessories',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
