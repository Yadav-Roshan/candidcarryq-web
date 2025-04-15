import { Separator } from "@/components/ui/separator";
import { formatNPR } from "@/lib/utils";
import Image from "next/image";

interface CartItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  quantity: number;
  image?: string;
}

interface CheckoutSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  total: number;
}

export default function CheckoutSummary({
  cartItems,
  subtotal,
  tax,
  shipping,
  discount = 0,
  total,
}: CheckoutSummaryProps) {
  // Calculate total quantity for shipping info display
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="h-16 w-16 rounded bg-muted relative overflow-hidden flex-shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {formatNPR((item.salePrice || item.price) * item.quantity)}
                </p>
                {item.salePrice && (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatNPR(item.price * item.quantity)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="p-6">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatNPR(subtotal)}</span>
          </div>

          {/* Show discount if it exists */}
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatNPR(discount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                formatNPR(shipping)
              )}
              {shipping === 0 && totalQuantity >= 10 && (
                <span className="text-xs text-green-600 ml-1">(10+ items)</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (13%)</span>
            <span>{formatNPR(tax)}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between font-medium text-lg">
          <span>Total</span>
          <span>{formatNPR(total)}</span>
        </div>
      </div>
    </div>
  );
}
