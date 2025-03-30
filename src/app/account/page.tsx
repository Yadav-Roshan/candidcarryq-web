"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/components/account/user-profile";
import { OrderHistory } from "@/components/account/order-history";
import { AccountSettings } from "@/components/account/account-settings";
import { AccountAddress } from "@/components/account/account-address";

// Remove metadata export from client component
// Metadata should be defined in a separate layout.tsx file

export default function AccountPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");

  // Parse the tab from URL query params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["profile", "address", "orders", "settings"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="border-b">
          <TabsList className="flex h-10 items-center justify-start p-0 w-full bg-transparent space-x-6 mb-0">
            <TabsTrigger
              value="profile"
              className="h-10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-0 bg-transparent data-[state=active]:shadow-none"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="address"
              className="h-10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-0 bg-transparent data-[state=active]:shadow-none"
            >
              Address
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="h-10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-0 bg-transparent data-[state=active]:shadow-none"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="h-10 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-0 bg-transparent data-[state=active]:shadow-none"
            >
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>

        <TabsContent value="address">
          <AccountAddress />
        </TabsContent>

        <TabsContent value="orders">
          <OrderHistory />
        </TabsContent>

        <TabsContent value="settings">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
