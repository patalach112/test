import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "patalach112/test · Forge",
  description:
    "An independent dark GitHub-style workspace with live repository browsing.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
