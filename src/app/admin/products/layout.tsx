import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products - CandidCarryq Admin",
  description: "Manage your product inventory",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
