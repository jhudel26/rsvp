import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Atelier RSVP",
    template: "%s · Atelier RSVP",
  },
  description: "A professional RSVP form builder and event invitation platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f4f1ea] text-[#161513]">{children}</body>
    </html>
  );
}
