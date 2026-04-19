import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRISM Demo",
  description: "Upload your data. Ask anything.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}