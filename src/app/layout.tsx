import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Manav Khosla",
    template: "%s · Manav Khosla",
  },
  description:
    "Software engineer at the University of Michigan. Step on court and rally with a ball machine to unlock my experience, projects, and more — or read it straight.",
  openGraph: {
    title: "Manav Khosla",
    description:
      "A playable tennis-court portfolio. Return balls at the targets to open my resume.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Manav Khosla",
    description: "A playable tennis-court portfolio.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
