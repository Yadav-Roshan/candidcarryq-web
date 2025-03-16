"use client"

import { ReactNode } from "react"
import { AccountAuthCheck } from "@/components/account/account-auth-check"

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <AccountAuthCheck>{children}</AccountAuthCheck>
}
