"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type JSX } from "react";

interface MobileMenuProps {
  className?: string;
}

export function MobileMenu({ className }: MobileMenuProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navigationLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/cv", label: "CV Editor" },
    { href: "/analyze", label: "Analyze Job" },
    { href: "/tracker", label: "Tracker" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <>
      {/* Hamburger Button - Visible only on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "md:hidden inline-flex items-center justify-center h-9 w-9",
          "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
          "transition-all duration-200 rounded-lg",
          className
        )}
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-800 z-50",
          "transform transition-transform duration-300 ease-in-out md:hidden",
          "shadow-xl border-r border-slate-200 dark:border-slate-700",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700">
          <div onClick={() => setIsOpen(false)}>
            <Logo />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className={cn(
              "inline-flex items-center justify-center h-10 w-10 rounded-lg",
              "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
              "transition-colors duration-200"
            )}
            aria-label="Close menu"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col py-6 px-4 gap-2 overflow-y-auto">
          {navigationLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800",
                  isActive
                    ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-l-4 border-cyan-500"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Menu Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            CareerPal &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}
