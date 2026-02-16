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
  title: "SplitEase - Group Expense Calculator",
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
                <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <line x1="12" x2="12" y1="2" y2="22" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  SplitEase
                </a>
              </div>
            </header>
            <main className="container mx-auto max-w-4xl px-4 py-4 sm:py-8">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
