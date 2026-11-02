import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub · patalach112/test",
  description: "A local recreation of the GitHub repository interface for patalach112/test.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
