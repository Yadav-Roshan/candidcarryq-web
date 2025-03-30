import { Metadata } from "next"
import CartContent from "@/components/cart/cart-content"

export const metadata: Metadata = {
  title: "Shopping Cart - MyBags",
  description: "View and manage your shopping cart items",
}

export default function CartPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <CartContent />
    </div>
  )
}
