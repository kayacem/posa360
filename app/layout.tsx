import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POSA360 - Multi-Tenant E-Commerce Platform",
  description: "Shopify-benzeri çok kiracılı e-ticaret platformu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
