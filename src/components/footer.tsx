import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-black text-white mt-auto">
      <div className="container py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">MyBags</h3>
            <p className="text-sm text-gray-300 mb-4">
              Premium quality bags and accessories for all your needs. Handcrafted with care in Nepal.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>+977 01-1234567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>info@mybags.com.np</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>Thamel, Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=backpacks" className="text-gray-300 hover:text-white transition-colors">
                  Backpacks
                </Link>
              </li>
              <li>
                <Link href="/products?category=handbags" className="text-gray-300 hover:text-white transition-colors">
                  Handbags
                </Link>
              </li>
              <li>
                <Link href="/products?category=travel" className="text-gray-300 hover:text-white transition-colors">
                  Travel Bags
                </Link>
              </li>
              <li>
                <Link href="/products?category=wallets" className="text-gray-300 hover:text-white transition-colors">
                  Wallets
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="text-gray-300 hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/products?category=new" className="text-gray-300 hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?category=sale" className="text-gray-300 hover:text-white transition-colors">
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
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-300 hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-300 hover:text-white transition-colors">
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
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-gray-300 hover:text-white transition-colors">
                  Warranty Information
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-300 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Link href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:space-x-6">
              <p className="text-xs text-gray-400 mb-2 md:mb-0">
                &copy; {new Date().getFullYear()} MyBags. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="e-sewa" className="h-6" />
                <img src="https://web.khalti.com/static/img/logo1.png" alt="khalti" className="h-6" />
                <img src="https://freepngimg.com/save/15147-online-banking-free-download-png/347x207" alt="e-banking" className="h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}