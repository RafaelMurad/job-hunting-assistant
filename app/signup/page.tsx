"use client";

import { useRouter } from "next/navigation";
import { useState, type JSX, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Password Requirements Component
 */
function PasswordRequirements({ password }: { password: string }): JSX.Element {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
  ];

  if (!password) return <></>;

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req) => (
        <div key={req.label} className="flex items-center gap-2 text-xs">
          {req.met ? (
            <svg
              className="h-4 w-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          <span className={req.met ? "text-green-600" : "text-slate-500"}>{req.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Sign Up Page
 *
 * Creates a new user account with email and password.
 */
export default function SignUpPage(): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMatch = password === confirmPassword;
  const passwordValid =
    password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
  const formValid = name.length >= 2 && email.includes("@") && passwordValid && passwordsMatch;

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!passwordsMatch) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to create account");
        setLoading(false);
        return;
      }

      // Redirect to login with success message
      router.push("/login?message=Account created! Please sign in.");
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">Create an Account</CardTitle>
          <CardDescription className="text-slate-600">
            Sign up to get started with Job Hunt AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Banner */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 shrink-0 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <span className="text-sm font-medium text-red-800">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                minLength={2}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <PasswordRequirements password={password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-600">Passwords don&apos;t match</p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full h-12" disabled={loading || !formValid}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm text-slate-600">
            <p>
              Already have an account?{" "}
              <a href="/login" className="font-medium text-blue-600 hover:underline">
                Sign in
              </a>
            </p>
          </div>

          <div className="mt-4 text-center text-xs text-slate-500">
            <p>
              By creating an account, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
