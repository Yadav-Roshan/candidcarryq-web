import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function NewsletterSubscription() {
  return (
    <section className="w-full bg-secondary/10 py-16">
      <div className="container">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-3">Subscribe to Our Newsletter</h3>
          <p className="text-muted-foreground mb-6">
            Get updates on new products, exclusive offers, and more!
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <Input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1" 
              required
            />
            <Button type="submit" className="px-8">Subscribe</Button>
          </form>
        </div>
      </div>
    </section>
  )
}
