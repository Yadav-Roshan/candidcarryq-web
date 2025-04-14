"use client";

import { ReactNode } from "react";
import { AccountAuthCheck } from "@/components/account/account-auth-check";

export function AccountLayoutClient({ children }: { children: ReactNode }) {
  return <AccountAuthCheck>{children}</AccountAuthCheck>;
}
