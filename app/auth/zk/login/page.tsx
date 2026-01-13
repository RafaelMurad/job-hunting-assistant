"use client";

/**
 * Zero-Knowledge Login Page
 *
 * Production-ready login page for ZK mode.
 * Password never leaves the browser - only derived authKeyHash is sent.
 */

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deriveKeys, hashAuthKey } from "@/lib/crypto/keys";

type FormStatus = "idle" | "deriving" | "authenticating" | "success" | "error";

export default function ZkLoginPage(): ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    try {
      // Step 1: Derive keys from password
      setStatus("deriving");
      const keys = await deriveKeys(password, email);
      const authKeyHash = hashAuthKey(keys.authKey);

      // Step 2: Authenticate with server
      setStatus("authenticating");
      const response = await fetch("/api/zk/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, authKeyHash }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Step 3: Store session info
      // Token is set via httpOnly cookie by server
      // Store masterKey in sessionStorage for encryption operations
      sessionStorage.setItem("zk_master_key", keys.exportedMasterKey);
      localStorage.setItem("zk_email", email);

      setStatus("success");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const isLoading = status === "deriving" || status === "authenticating";

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Sign in with zero-knowledge encryption
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Sign In</CardTitle>
              <CardDescription>Your password never leaves your device</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/zk/forgot-password"
                    className="text-xs text-sky-600 dark:text-cyan-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>

              {/* Status Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>
                    {status === "deriving" ? "Deriving encryption keys..." : "Authenticating..."}
                  </span>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/zk/register"
                  className="text-sky-600 dark:text-cyan-400 hover:underline font-medium"
                >
                  Create one
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            🔐 Zero-knowledge encryption: Your data is encrypted before it leaves your device. We
            can&apos;t read your information.
          </p>
        </div>
      </div>
    </main>
  );
}
