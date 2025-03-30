import { Truck, CreditCard, MapPin, Mail } from "lucide-react"

export function TrustIndicators() {
  return (
    <section className="w-full bg-primary/5 py-16">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center p-4">
            <Truck className="h-10 w-10 mb-3 text-primary" />
            <h4 className="font-medium text-lg">Free Delivery</h4>
            <p className="text-sm text-muted-foreground">On orders over NPR 5,000</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <CreditCard className="h-10 w-10 mb-3 text-primary" />
            <h4 className="font-medium text-lg">Secure Payment</h4>
            <p className="text-sm text-muted-foreground">100% secure payment</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <MapPin className="h-10 w-10 mb-3 text-primary" />
            <h4 className="font-medium text-lg">Store Pickup</h4>
            <p className="text-sm text-muted-foreground">Available at multiple locations</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <Mail className="h-10 w-10 mb-3 text-primary" />
            <h4 className="font-medium text-lg">24/7 Support</h4>
            <p className="text-sm text-muted-foreground">Dedicated customer support</p>
          </div>
        </div>
      </div>
    </section>
  )
}
