import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { prisma } from "@/lib/db";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { calculateStreak } from "@/lib/gamification";
import { Zap } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Hunt AI - Gamified Job Application Tracker",
  description: "Track your job applications with streaks, XP, and levels",
};

async function getGamificationStats() {
  const user = await prisma.user.findFirst();

  if (!user) {
    return { streak: 0, level: 1, hasUser: false };
  }

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { appliedAt: 'desc' }
  });

  const streak = calculateStreak(applications);

  return {
    streak,
    level: user.level,
    hasUser: true
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { streak, level, hasUser } = await getGamificationStats();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <Zap className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Job Hunt AI</h1>
                  <p className="text-xs text-slate-500">Level up your career</p>
                </div>
              </Link>

              {/* Gamification Stats */}
              {hasUser && (
                <div className="flex items-center gap-4">
                  <StreakCounter streak={streak} />
                  <LevelBadge level={level} size="sm" />
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex gap-2">
                <Link
                  href="/"
                  className="px-4 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href="/analyze"
                  className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all"
                >
                  Analyze Job
                </Link>
                <Link
                  href="/tracker"
                  className="px-4 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                >
                  Tracker
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-slate-600">
            <p>Built with ❤️ using Next.js, Prisma, and Claude AI</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
