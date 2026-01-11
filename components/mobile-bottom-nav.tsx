"use client";

import { cn } from "@/lib/utils";
import { Briefcase, FileText, Home, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/cv", label: "CV", icon: FileText },
  { href: "/analyze", label: "Analyze", icon: Search },
  { href: "/tracker", label: "Tracker", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileBottomNav(): JSX.Element {
  const pathname = usePathname();

  // Don't show on landing page or auth pages
  if (pathname === "/" || pathname.startsWith("/auth")) {
    return <></>;
  }

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-white dark:bg-slate-800",
        "border-t border-slate-200 dark:border-slate-700",
        "safe-area-inset-bottom"
      )}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1",
                "text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-inset",
                isActive
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-slate-500 dark:text-slate-400 active:text-slate-700 dark:active:text-slate-200"
              )}
            >
              <Icon
                className={cn("h-5 w-5 transition-transform", isActive && "scale-110")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(isActive && "font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
