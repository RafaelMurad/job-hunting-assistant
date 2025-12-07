/**
 * Profile Page
 *
 * User profile management with CV upload and manual entry.
 * Uses the useUser hook for all data operations.
 */

"use client";

import type { JSX, FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CVUpload, type ExtractedCVData } from "@/components/cv-upload";
import { useUser, type User } from "@/lib/hooks";

/**
 * Toast notification state.
 */
interface Toast {
  type: "success" | "error";
  message: string;
}

export default function ProfilePage(): JSX.Element {
  const router = useRouter();

  // ============================================
  // HOOKS
  // ============================================

  const {
    user: userData,
    loading,
    saving,
    error,
    fieldErrors,
    save,
    isProfileComplete,
  } = useUser();

  // ============================================
  // LOCAL STATE
  // ============================================

  // Local form state for editing - initialized from hook data
  const [formData, setFormData] = useState<User | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [inputMode, setInputMode] = useState<"manual" | "upload">("manual");
  const [lastError, setLastError] = useState<string | null>(null);

  // Initialize form data once when userData becomes available
  // (using a ref pattern to avoid useEffect + setState)
  if (userData && !formData && !loading) {
    setFormData(userData);
  }

  // Show toast for new errors (comparing to track changes)
  if (error && error !== lastError) {
    setLastError(error);
    setToast({ type: "error", message: error });
    setTimeout(() => setToast(null), 5000);
  }

  // ============================================
  // HANDLERS
  // ============================================

  const showToast = (type: "success" | "error", message: string): void => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const updateField = (field: keyof User, value: string): void => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formData) return;

    // Build save input - only include phone if it has a value
    const saveInput = {
      name: formData.name,
      email: formData.email,
      location: formData.location,
      summary: formData.summary,
      experience: formData.experience,
      skills: formData.skills,
      ...(formData.phone ? { phone: formData.phone } : {}),
    };

    save(saveInput);

    // Show success toast (error handled by hook)
    if (!error) {
      showToast("success", "Profile saved successfully!");
    }
  };

  const handleCVExtracted = (extractedData: ExtractedCVData): void => {
    setFormData((prev) => ({
      id: prev?.id || "",
      name: extractedData.name || prev?.name || "",
      email: extractedData.email || prev?.email || "",
      phone: extractedData.phone || prev?.phone || "",
      location: extractedData.location || prev?.location || "",
      summary: extractedData.summary || prev?.summary || "",
      experience: extractedData.experience || prev?.experience || "",
      skills: extractedData.skills || prev?.skills || "",
    }));
    setInputMode("manual");
    showToast("success", "CV data extracted! Please review and save.");
  };

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nordic-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fjord-600 mx-auto mb-4"></div>
          <p className="text-nordic-neutral-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nordic-neutral-50">
        <div className="text-center">
          <p className="text-nordic-neutral-900 text-lg font-medium">Error loading user data</p>
          <p className="text-nordic-neutral-600 mt-2">Please refresh the page</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: MAIN FORM
  // ============================================

  return (
    <div className="min-h-screen bg-nordic-neutral-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
              toast.type === "success"
                ? "bg-forest-50 border border-forest-200 text-forest-900"
                : "bg-clay-50 border border-clay-200 text-clay-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" ? (
                <svg className="w-5 h-5 text-forest-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-clay-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-medium">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-nordic-neutral-500 hover:text-nordic-neutral-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-nordic-neutral-900 mb-2">Your Master CV</h1>
              <p className="text-nordic-neutral-600">
                Complete your profile to start analyzing jobs and generating cover letters
              </p>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex items-center gap-2 bg-nordic-neutral-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setInputMode("manual")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === "manual"
                    ? "bg-white text-nordic-neutral-900 shadow-sm"
                    : "text-nordic-neutral-600 hover:text-nordic-neutral-900"
                }`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setInputMode("upload")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === "upload"
                    ? "bg-white text-nordic-neutral-900 shadow-sm"
                    : "text-nordic-neutral-600 hover:text-nordic-neutral-900"
                }`}
              >
                Upload CV
              </button>
            </div>
          </div>
        </div>

        {/* Profile Completion Status */}
        {!isProfileComplete && (
          <div className="mb-6 bg-clay-50 border border-clay-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-clay-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-medium text-clay-900">Profile Incomplete</h3>
                <p className="text-sm text-clay-700 mt-1">
                  Please fill in all required fields (*) to unlock job analysis features
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CV Upload Mode */}
        {inputMode === "upload" && <CVUpload onExtracted={handleCVExtracted} />}

        {/* Manual Entry Mode */}
        {inputMode === "manual" && (
          <Card className="shadow-sm">
            <CardHeader className="bg-white border-b border-nordic-neutral-200">
              <CardTitle className="text-nordic-neutral-900">Profile Information</CardTitle>
              <CardDescription className="text-nordic-neutral-600">
                This information will be used to analyze job matches and generate personalized cover
                letters
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-white pt-6">
              <form onSubmit={handleSave} className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-nordic-neutral-900 font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="John Doe"
                      className={`mt-2 text-nordic-neutral-900 ${
                        fieldErrors?.name ? "border-clay-500 focus:ring-clay-500" : ""
                      }`}
                    />
                    {fieldErrors?.name && (
                      <p className="text-sm text-clay-600 mt-1">{fieldErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-nordic-neutral-900 font-medium">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="john@example.com"
                      className={`mt-2 text-nordic-neutral-900 ${
                        fieldErrors?.email ? "border-clay-500 focus:ring-clay-500" : ""
                      }`}
                    />
                    {fieldErrors?.email && (
                      <p className="text-sm text-clay-600 mt-1">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-nordic-neutral-900 font-medium">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+1 555 123 4567"
                      className="mt-2 text-nordic-neutral-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-nordic-neutral-900 font-medium">
                      Location *
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="San Francisco, CA"
                      className={`mt-2 text-nordic-neutral-900 ${
                        fieldErrors?.location ? "border-clay-500 focus:ring-clay-500" : ""
                      }`}
                    />
                    {fieldErrors?.location && (
                      <p className="text-sm text-clay-600 mt-1">{fieldErrors.location}</p>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                <div>
                  <Label htmlFor="summary" className="text-nordic-neutral-900 font-medium">
                    Professional Summary *
                  </Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => updateField("summary", e.target.value)}
                    placeholder="Senior Software Engineer with 5+ years of experience building scalable web applications..."
                    rows={4}
                    className={`mt-2 text-nordic-neutral-900 ${
                      fieldErrors?.summary ? "border-clay-500 focus:ring-clay-500" : ""
                    }`}
                  />
                  {fieldErrors?.summary && (
                    <p className="text-sm text-clay-600 mt-1">{fieldErrors.summary}</p>
                  )}
                  <p className="text-sm text-nordic-neutral-500 mt-2">
                    A brief overview of your professional background and expertise.
                  </p>
                </div>

                {/* Work Experience */}
                <div>
                  <Label htmlFor="experience" className="text-nordic-neutral-900 font-medium">
                    Work Experience *
                  </Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => updateField("experience", e.target.value)}
                    placeholder="Company Name | Role (Start Date - End Date)&#10;- Key achievement 1&#10;- Key achievement 2&#10;&#10;Previous Company | Previous Role..."
                    rows={10}
                    className={`mt-2 text-nordic-neutral-900 ${
                      fieldErrors?.experience ? "border-clay-500 focus:ring-clay-500" : ""
                    }`}
                  />
                  {fieldErrors?.experience && (
                    <p className="text-sm text-clay-600 mt-1">{fieldErrors.experience}</p>
                  )}
                  <p className="text-sm text-nordic-neutral-500 mt-2">
                    Include company, role, dates, and key achievements for each position.
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <Label htmlFor="skills" className="text-nordic-neutral-900 font-medium">
                    Skills *
                  </Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => updateField("skills", e.target.value)}
                    placeholder="React, TypeScript, Node.js, PostgreSQL, AWS, Docker, Git..."
                    rows={3}
                    className={`mt-2 text-nordic-neutral-900 ${
                      fieldErrors?.skills ? "border-clay-500 focus:ring-clay-500" : ""
                    }`}
                  />
                  {fieldErrors?.skills && (
                    <p className="text-sm text-clay-600 mt-1">{fieldErrors.skills}</p>
                  )}
                  <p className="text-sm text-nordic-neutral-500 mt-2">
                    Comma-separated list of your skills and technologies.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={saving} className="flex-1 sm:flex-none">
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
                    onClick={() => router.push("/dashboard")}
                    className="flex-1 sm:flex-none"
                  >
                    ← Back to Dashboard
                  </Button>
                </div>

                {/* Profile Complete Banner */}
                {isProfileComplete && (
                  <div className="flex items-center gap-2 p-4 bg-forest-50 border border-forest-200 rounded-lg">
                    <svg
                      className="w-5 h-5 text-forest-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-forest-900">
                      Profile complete! You can now analyze jobs and generate cover letters.
                    </span>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
