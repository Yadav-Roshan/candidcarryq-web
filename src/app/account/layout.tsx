import { Metadata } from "next";
import { AccountLayoutClient } from "@/components/account/account-layout-client";

// Metadata can be exported from server components
export const metadata: Metadata = {
  title: "My Account - CandidWear",
  description: "Manage your account settings and view your orders",
};

// The root layout starts as a server component
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // But we delegate the client-side functionality to a client component
  return <AccountLayoutClient>{children}</AccountLayoutClient>;
}
