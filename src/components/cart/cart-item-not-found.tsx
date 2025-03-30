import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CartItemNotFound() {
  return (
    <div className="flex flex-col items-center p-4 border rounded-md bg-muted/20">
      <ShoppingBag className="h-8 w-8 text-muted-foreground mb-2" />
      <h3 className="font-medium mb-1">Item no longer available</h3>
      <p className="text-sm text-muted-foreground text-center mb-2">
        This product has been removed or is temporarily unavailable.
      </p>
      <Button variant="outline" size="sm">Remove from cart</Button>
    </div>
  )
}
