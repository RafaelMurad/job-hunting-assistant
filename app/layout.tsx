import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Job Hunt AI - AI-Powered Job Application Assistant",
  description: "Analyze jobs, generate cover letters, and track applications with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50`}>
        {/* Navigation */}
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-xl font-bold text-slate-900">
                  Job Hunt AI
                </Link>
                <div className="hidden md:flex gap-6">
                  <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                    Profile
                  </Link>
                  <Link href="/analyze" className="text-slate-600 hover:text-slate-900 transition-colors">
                    Analyze Job
                  </Link>
                  <Link href="/tracker" className="text-slate-600 hover:text-slate-900 transition-colors">
                    Tracker
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>{children}</main>
      </body>
    </html>
  );
}
