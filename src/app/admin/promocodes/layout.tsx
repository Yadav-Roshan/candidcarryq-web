import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promo Codes - CandidCarryq Admin",
  description: "Manage promotional codes for your store",
};

export default function PromoCodesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
