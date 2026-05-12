import type { ReactNode } from "react";
import { ProductFrame } from "@/features/webapp/components/app-frame";

export default function ProductLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <ProductFrame>{children}</ProductFrame>;
}
