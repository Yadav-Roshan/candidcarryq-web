import { Truck, CreditCard, ShieldCheck, RotateCcw } from "lucide-react"

const trustItems = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders over NPR 5,000"
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "All major payment methods accepted"
  },
  {
    icon: ShieldCheck,
    title: "Quality Guarantee",
    description: "Every product tested and inspected"
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day money back guarantee"
  }
]

export function TrustIndicators() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
