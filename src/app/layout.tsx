import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN || "https://firmwarewatch.com"),
  icons: { icon: "/firmwarewatch.svg" },
  title: "FirmwareWatch",
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
