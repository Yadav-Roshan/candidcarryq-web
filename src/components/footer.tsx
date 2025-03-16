import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background mt-auto">
      <div className="container py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">MyBags</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Premium quality bags and accessories for all your needs. Handcrafted with care in Nepal.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+977 01-1234567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>info@mybags.com.np</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Thamel, Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=backpacks" className="text-muted-foreground hover:text-foreground transition-colors">
                  Backpacks
                </Link>
              </li>
              <li>
                <Link href="/products?category=handbags" className="text-muted-foreground hover:text-foreground transition-colors">
                  Handbags
                </Link>
              </li>
              <li>
                <Link href="/products?category=travel" className="text-muted-foreground hover:text-foreground transition-colors">
                  Travel Bags
                </Link>
              </li>
              <li>
                <Link href="/products?category=wallets" className="text-muted-foreground hover:text-foreground transition-colors">
                  Wallets
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/products?category=new" className="text-muted-foreground hover:text-foreground transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?category=sale" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sale Items
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-foreground transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-foreground transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-muted-foreground hover:text-foreground transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-muted-foreground hover:text-foreground transition-colors">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-muted-foreground hover:text-foreground transition-colors">
                  Warranty Information
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 border-t pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:space-x-6">
              <p className="text-xs text-muted-foreground mb-2 md:mb-0">
                &copy; {new Date().getFullYear()} MyBags. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <img src="/images/payment-visa.svg" alt="Visa" className="h-6" />
                <img src="/images/payment-mastercard.svg" alt="Mastercard" className="h-6" />
                <img src="/images/payment-paypal.svg" alt="PayPal" className="h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}