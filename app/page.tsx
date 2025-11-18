"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
}

export default function Home(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user on mount
  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading user:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (res.ok) {
        const savedUser = await res.json();
        setUser(savedUser);
        alert("Profile saved successfully!");
      } else {
        alert("Failed to save profile");
      }
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof User, value: string): void => {
    if (!user) return;
    setUser({ ...user, [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-900 text-lg font-medium">Error loading user data</p>
          <p className="text-slate-600 mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }

  const isProfileComplete =
    user.name && user.email && user.location && user.summary && user.experience && user.skills;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Master CV</h1>
          <p className="text-slate-600">
            Complete your profile to start analyzing jobs and generating cover letters
          </p>
        </div>

        {/* Profile Completion Status */}
        {!isProfileComplete && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-medium text-amber-900">Profile Incomplete</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Please fill in all required fields (*) to unlock job analysis features
                </p>
              </div>
            </div>
          </div>
        )}

        <Card className="shadow-sm">
          <CardHeader className="bg-white border-b border-slate-200">
            <CardTitle className="text-slate-900">Profile Information</CardTitle>
            <CardDescription className="text-slate-600">
              This information will be used to analyze job matches and generate personalized cover
              letters
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-slate-900 font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={user.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Rafael Murad"
                    required
                    className="mt-2 text-slate-900"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-900 font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="mt-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-slate-900 font-medium">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={user.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+44 7714 002131"
                    className="mt-2 text-slate-900"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-slate-900 font-medium">
                    Location *
                  </Label>
                  <Input
                    id="location"
                    value={user.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="Brazil"
                    required
                    className="mt-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Professional Summary */}
              <div>
                <Label htmlFor="summary" className="text-slate-900 font-medium">
                  Professional Summary *
                </Label>
                <Textarea
                  id="summary"
                  value={user.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                  placeholder="Frontend Software Engineer with 4+ years of experience..."
                  rows={4}
                  required
                  className="mt-2 text-slate-900"
                />
                <p className="text-sm text-slate-500 mt-2">
                  A brief overview of your professional background and expertise.
                </p>
              </div>

              {/* Work Experience */}
              <div>
                <Label htmlFor="experience" className="text-slate-900 font-medium">
                  Work Experience *
                </Label>
                <Textarea
                  id="experience"
                  value={user.experience}
                  onChange={(e) => updateField("experience", e.target.value)}
                  placeholder="Just Eat Takeaway | Frontend Software Engineer (March 2023 - Present)&#10;- Owned Jet+ cancellation flow..."
                  rows={10}
                  required
                  className="mt-2 text-slate-900"
                />
                <p className="text-sm text-slate-500 mt-2">
                  Include company, role, dates, and key achievements for each position.
                </p>
              </div>

              {/* Skills */}
              <div>
                <Label htmlFor="skills" className="text-slate-900 font-medium">
                  Skills *
                </Label>
                <Textarea
                  id="skills"
                  value={user.skills}
                  onChange={(e) => updateField("skills", e.target.value)}
                  placeholder="React, TypeScript, Next.js, Redux, Jest, React Testing Library..."
                  rows={3}
                  required
                  className="mt-2 text-slate-900"
                />
                <p className="text-sm text-slate-500 mt-2">
                  Comma-separated list of your skills and technologies.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/analyze")}
                  disabled={!isProfileComplete}
                  className="flex-1 border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                >
                  Analyze a Job →
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/tracker")}
                  className="flex-1 border-slate-300 hover:bg-slate-50"
                >
                  View Tracker
                </Button>
              </div>

              {isProfileComplete && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-green-900">
                    Profile complete! You can now analyze jobs and generate cover letters.
                  </span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
