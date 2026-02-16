import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
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
  title: "dvvy - Group Expense Calculator",
  description: "Split expenses with friends easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProvider>
          <div className="min-h-screen bg-background">
            <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto flex h-14 max-w-4xl items-center px-4">
                <a href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-base">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="h-7 w-7"
                  >
                    <defs>
                      <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#6366f1" }} />
                        <stop offset="100%" style={{ stopColor: "#8b5cf6" }} />
                      </linearGradient>
                    </defs>
                    <rect width="512" height="512" rx="96" fill="url(#logo-bg)" />
                    <g fill="none" stroke="#fff" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="256" y1="112" x2="256" y2="400" />
                      <line x1="144" y1="192" x2="368" y2="192" />
                      <line x1="144" y1="320" x2="368" y2="320" />
                    </g>
                  </svg>
                  dvvy
                </a>
              </div>
            </header>
            <main className="container mx-auto max-w-4xl px-4 py-4 sm:py-8">
              {children}
            </main>
            <footer className="border-t border-border/40 py-4">
              <p className="text-center text-xs text-muted-foreground">
                Created with love by{" "}
                <a
                  href="https://github.com/Rajdip019"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  Rajdeep
                </a>
              </p>
            </footer>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
