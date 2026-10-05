import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Curious Lab | Science Game Kids",
  description: "Discover science through stories, creativity, and hands-on experiments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
