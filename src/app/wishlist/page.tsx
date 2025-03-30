import { Metadata } from "next"
import WishlistContent from "@/components/wishlist/wishlist-content"

export const metadata: Metadata = {
  title: "Wishlist - MyBags",
  description: "View and manage your saved products",
}

export default function WishlistPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <WishlistContent />
    </div>
  )
}
