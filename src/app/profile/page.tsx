"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, User, CreditCard, LogOut } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Order {
  id: string
  date: string
  total: number
  status: "processing" | "shipped" | "delivered"
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  
  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/login")
      return
    }
    
    // Mock orders data
    setOrders([
      { 
        id: "ORD-1234567", 
        date: "2023-08-15", 
        total: 129.99,
        status: "delivered"
      },
      { 
        id: "ORD-7654321", 
        date: "2023-09-02", 
        total: 89.95,
        status: "shipped"
      },
      { 
        id: "ORD-9876543", 
        date: "2023-09-23", 
        total: 219.90,
        status: "processing"
      }
    ])
  }, [user, router])
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated."
    })
  }
  
  const handleLogout = () => {
    logout()
    router.push("/")
  }
  
  if (!user) {
    return null // Loading state handled by useEffect redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start" asChild>
                <a href="#personal-info">
                  <User className="mr-2 h-4 w-4" />
                  Personal Information
                </a>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <a href="#orders">
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </a>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <a href="#payment-methods">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Methods
                </a>
              </Button>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </CardFooter>
          </Card>
        </aside>
        
        <main className="flex-1">
          <Tabs defaultValue="personal-info">
            <TabsList className="mb-6">
              <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal-info">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={user.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user.email} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" defaultValue="123 Main St" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" defaultValue="New York" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" defaultValue="NY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" defaultValue="10001" />
                      </div>
                    </div>
                    <Button type="submit">Update Profile</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View all your previous orders.</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="rounded-lg border p-4">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-medium">Order #{order.id}</h4>
                            <span className="text-sm">{order.date}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-muted-foreground">Total</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <div className="flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                order.status === "delivered" 
                                  ? "bg-green-500" 
                                  : order.status === "shipped" 
                                    ? "bg-blue-500" 
                                    : "bg-amber-500"
                              }`} />
                              <span className="capitalize">{order.status}</span>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                      <Button asChild>
                        <a href="/products">Start Shopping</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment-methods">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Credit Card</h4>
                      <span>•••• •••• •••• 1234</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expires</span>
                      <span>09/25</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Remove</Button>
                    </div>
                  </div>
                  <Button className="w-full">Add New Payment Method</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
