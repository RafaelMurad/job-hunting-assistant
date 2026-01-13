"use client";

/**
 * Zero-Knowledge Registration Page
 *
 * Production-ready registration page for ZK mode.
 * Includes password strength indicator and confirmation.
 * Password never leaves the browser.
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
import { checkPasswordStrength } from "@/lib/zk/password-change";

type FormStatus = "idle" | "deriving" | "registering" | "success" | "error";

export default function ZkRegisterPage(): ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const passwordStrength = checkPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;
  const canSubmit = email && password.length >= 8 && passwordsMatch && passwordStrength.score >= 2;

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!passwordsMatch) {
      setError("Passwords don't match");
      return;
    }

    if (passwordStrength.score < 2) {
      setError("Please choose a stronger password");
      return;
    }

    try {
      // Step 1: Derive keys from password
      setStatus("deriving");
      const keys = await deriveKeys(password, email);
      const authKeyHash = hashAuthKey(keys.authKey);

      // Step 2: Register with server
      setStatus("registering");
      const response = await fetch("/api/zk/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, authKeyHash }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setStatus("success");

      // Redirect to login
      router.push("/auth/zk/login?registered=true");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const isLoading = status === "deriving" || status === "registering";

  // Password strength colors
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-600 mb-4">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Your Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Your data stays private with zero-knowledge encryption
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Sign Up</CardTitle>
              <CardDescription>We never see your password or your data</CardDescription>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={isLoading}
                />

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.score
                              ? strengthColors[passwordStrength.score]
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {passwordStrength.feedback}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-red-500">Passwords don&apos;t match</p>
                )}
                {confirmPassword.length > 0 && passwordsMatch && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Passwords match
                  </p>
                )}
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
                    {status === "deriving"
                      ? "Generating encryption keys..."
                      : "Creating your account..."}
                  </span>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading || !canSubmit}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/auth/zk/login"
                  className="text-sky-600 dark:text-cyan-400 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Security Features */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg mb-1">🔐</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">End-to-end encrypted</p>
          </div>
          <div>
            <div className="text-lg mb-1">🙈</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Zero-knowledge</p>
          </div>
          <div>
            <div className="text-lg mb-1">🔑</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">You control your data</p>
          </div>
        </div>
      </div>
    </main>
  );
}
