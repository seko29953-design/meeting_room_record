
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meeting Room Management",
  description: "Admin IT Meeting Room Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km">
      <body>{children}</body>
    </html>
  );
}
