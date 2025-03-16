import { Product } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface CheckoutSummaryProps {
  cartItems: {
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }[]
  subtotal: number
  tax: number
  shipping: number
  total: number
}

export default function CheckoutSummary({
  cartItems,
  subtotal,
  tax,
  shipping,
  total,
}: CheckoutSummaryProps) {
  return (
    <div className="rounded-lg border p-6 sticky top-6">
      <h3 className="text-lg font-semibold">Order Summary</h3>
      
      <div className="mt-4 space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between gap-2 text-sm">
            <div className="flex gap-2">
              <span>{item.quantity} ×</span>
              <span className="truncate max-w-[180px]">{item.name}</span>
            </div>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between font-medium">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      
      <div className="mt-6 text-center text-xs text-muted-foreground">
        <p>All transactions are secure and encrypted</p>
      </div>
    </div>
  )
}
