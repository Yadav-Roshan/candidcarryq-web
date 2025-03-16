import { Metadata } from "next"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from "@/components/account/user-profile"
import { OrderHistory } from "@/components/account/order-history"
import { AccountSettings } from "@/components/account/account-settings"

export const metadata: Metadata = {
  title: "My Account - CandidWear",
  description: "Manage your account settings and view your orders",
}

export default function AccountPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>
        
        <TabsContent value="orders">
          <OrderHistory />
        </TabsContent>
        
        <TabsContent value="settings">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
