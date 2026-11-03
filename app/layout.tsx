import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stay Finder",
  description: "Find a place to stay",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <NavBar />
          {children}
          <footer className="glass-nav border-t">
            <div className="mx-auto w-full max-w-3xl px-4 py-6 text-sm text-muted sm:px-6">
              © {new Date().getFullYear()} Stay Finder
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
