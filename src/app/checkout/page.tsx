"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ArrowRight, Truck } from "lucide-react"
import CheckoutSummary from "@/components/checkout/checkout-summary"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const shippingFormSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(5, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
})

const paymentFormSchema = z.object({
  cardNumber: z.string().min(16, "Card number is required"),
  cardName: z.string().min(2, "Cardholder name is required"),
  expMonth: z.string().min(1, "Month is required"),
  expYear: z.string().min(4, "Year is required"),
  cvv: z.string().min(3, "CVV is required"),
  paymentMethod: z.enum(["credit", "paypal", "applepay"]),
})

const shippingMethods = [
  { id: "standard", name: "Standard", price: 10, days: "3-5" },
  { id: "express", name: "Express", price: 25, days: "1-2" },
  { id: "overnight", name: "Overnight", price: 50, days: "Next day" },
]

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const [shippingMethod, setShippingMethod] = useState(shippingMethods[0])
  const [activeTab, setActiveTab] = useState("shipping")
  const { toast } = useToast()
  const router = useRouter()

  const shippingForm = useForm<z.infer<typeof shippingFormSchema>>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      firstName: user?.name?.split(" ")[0] || "",
      lastName: user?.name?.split(" ")[1] || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
    },
  })

  const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      cardName: "",
      expMonth: "",
      expYear: "",
      cvv: "",
      paymentMethod: "credit",
    },
  })

  const onShippingSubmit = (data: z.infer<typeof shippingFormSchema>) => {
    console.log("Shipping data:", data)
    setActiveTab("payment")
  }

  const onPaymentSubmit = async (data: z.infer<typeof paymentFormSchema>) => {
    try {
      console.log("Payment data:", data)
      // In a real app, you would process the payment here
      
      // Show success message
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. You will receive an email confirmation shortly.",
      })
      
      // Clear the cart
      clearCart()
      
      // Redirect to order confirmation
      router.push("/checkout/confirmation")
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const tax = subtotal * 0.07
  const total = subtotal + tax + shippingMethod.price

  if (cartItems.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="payment" disabled={activeTab !== "payment"}>
                Payment
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="shipping">
              <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-lg font-bold">Shipping Information</h2>
                
                <Form {...shippingForm}>
                  <form onSubmit={shippingForm.handleSubmit(onShippingSubmit)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={shippingForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={shippingForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={shippingForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={shippingForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={shippingForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={shippingForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={shippingForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={shippingForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={shippingForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="UK">United Kingdom</SelectItem>
                                <SelectItem value="AU">Australia</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Shipping Method</h3>
                      <RadioGroup 
                        defaultValue={shippingMethod.id} 
                        onValueChange={(value) => {
                          const method = shippingMethods.find(m => m.id === value)
                          if (method) setShippingMethod(method)
                        }}
                        className="space-y-2"
                      >
                        {shippingMethods.map((method) => (
                          <div 
                            key={method.id}
                            className="flex items-center justify-between rounded-lg border p-4"
                          >
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value={method.id} id={method.id} />
                              <div>
                                <label htmlFor={method.id} className="font-medium">
                                  {method.name} (${method.price.toFixed(2)})
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  Delivery in {method.days} business days
                                </p>
                              </div>
                            </div>
                            <Truck className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <Button variant="outline" type="button" asChild>
                        <Link href="/cart">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to cart
                        </Link>
                      </Button>
                      <Button type="submit">Continue to Payment</Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>
            
            <TabsContent value="payment">
              <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-lg font-bold">Payment Information</h2>
                
                <Form {...paymentForm}>
                  <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
                    <FormField
                      control={paymentForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Payment Method</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-wrap gap-4"
                            >
                              <div className="flex items-center space-x-2 rounded-lg border p-4">
                                <RadioGroupItem value="credit" id="credit" />
                                <label htmlFor="credit" className="font-medium">Credit Card</label>
                              </div>
                              <div className="flex items-center space-x-2 rounded-lg border p-4">
                                <RadioGroupItem value="paypal" id="paypal" />
                                <label htmlFor="paypal" className="font-medium">PayPal</label>
                              </div>
                              <div className="flex items-center space-x-2 rounded-lg border p-4">
                                <RadioGroupItem value="applepay" id="applepay" />
                                <label htmlFor="applepay" className="font-medium">Apple Pay</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {paymentForm.watch("paymentMethod") === "credit" && (
                      <>
                        <FormField
                          control={paymentForm.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input {...field} placeholder="0000 0000 0000 0000" />
                                  <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={paymentForm.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cardholder Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Name on card" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={paymentForm.control}
                            name="expMonth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Month</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="MM" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => {
                                      const month = i + 1
                                      return (
                                        <SelectItem 
                                          key={month} 
                                          value={month.toString().padStart(2, '0')}
                                        >
                                          {month.toString().padStart(2, '0')}
                                        </SelectItem>
                                      )
                                    })}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={paymentForm.control}
                            name="expYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Year</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="YYYY" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Array.from({ length: 10 }, (_, i) => {
                                      const year = new Date().getFullYear() + i
                                      return (
                                        <SelectItem key={year} value={year.toString()}>
                                          {year}
                                        </SelectItem>
                                      )
                                    })}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={paymentForm.control}
                            name="cvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="123" maxLength={4} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}
                    
                    <Separator className="my-6" />
                    
                    <div className="mt-6 flex justify-between">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setActiveTab("shipping")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to shipping
                      </Button>
                      <Button type="submit">Place Order</Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <CheckoutSummary 
            cartItems={cartItems} 
            subtotal={subtotal} 
            tax={tax} 
            shipping={shippingMethod.price} 
            total={total} 
          />
        </div>
      </div>
    </div>
  )
}
