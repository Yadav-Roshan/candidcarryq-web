import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:underline">All Products</Link>
              </li>
              <li>
                <Link href="/categories/backpacks" className="hover:underline">Backpacks</Link>
              </li>
              <li>
                <Link href="/categories/handbags" className="hover:underline">Handbags</Link>
              </li>
              <li>
                <Link href="/categories/travel" className="hover:underline">Travel Bags</Link>
              </li>
              <li>
                <Link href="/categories/accessories" className="hover:underline">Accessories</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:underline">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">Contact Us</Link>
              </li>
              <li>
                <Link href="/careers" className="hover:underline">Careers</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:underline">Blog</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:underline">Help Center</Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:underline">Shipping</Link>
              </li>
              <li>
                <Link href="/returns" className="hover:underline">Returns</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline">FAQ</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Connect with Us</h3>
            <div className="mb-4 flex space-x-4">
              <Link href="https://facebook.com" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://instagram.com" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
            <h3 className="mb-2 text-lg font-semibold">Newsletter</h3>
            <p className="mb-2 text-sm text-muted-foreground">
              Subscribe for exclusive offers and updates
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-l-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
              <button
                type="submit"
                className="rounded-r-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CandidWear. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
