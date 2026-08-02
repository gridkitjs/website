import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Not Found · GridKit",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body className="bg-site-bg text-site-ink flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-site-accent text-sm font-medium">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-site-ink-muted max-w-md">
          The page you&apos;re looking for doesn&apos;t exist, or was moved.
        </p>
        <Link
          href="/"
          className="bg-site-accent inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          Back home
        </Link>
      </body>
    </html>
  );
}
