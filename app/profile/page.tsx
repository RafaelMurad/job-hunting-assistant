/**
 * Profile Page
 *
 * User profile management with CV upload and manual entry.
 * Uses the useUser hook for all data operations.
 * Uses the useCV hook for CV management.
 */

"use client";

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { CVUpload, type ExtractedCVData } from "@/components/cv-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser, type User } from "@/lib/hooks";
import { useCV } from "@/lib/hooks/useCV";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type JSX } from "react";

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

  const {
    cvs,
    loading: cvsLoading,
    deleting: cvDeleting,
    remove: removeCV,
    setActive: setActiveCV,
    canAddMore,
    maxCVs,
  } = useCV();

  // ============================================
  // LOCAL STATE
  // ============================================

  // Local form state for editing - initialized from hook data
  const [formData, setFormData] = useState<User | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [inputMode, setInputMode] = useState<"manual" | "upload">("manual");
  const [lastError, setLastError] = useState<string | null>(null);

  // CV management state
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);

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

  // CV Management Handlers
  const handleSetActive = async (cvId: string): Promise<void> => {
    const success = await setActiveCV(cvId);
    if (success) {
      showToast("success", "CV set as active");
    } else {
      showToast("error", "Failed to set CV as active");
    }
  };

  const handleDeleteCV = async (): Promise<void> => {
    if (!cvToDelete) return;
    const success = await removeCV(cvToDelete);
    setCvToDelete(null);
    if (success) {
      showToast("success", "CV deleted");
    } else {
      showToast("error", "Failed to delete CV");
    }
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-slate-900 dark:text-gray-100 text-lg font-medium">
            Error loading user data
          </p>
          <p className="text-slate-600 dark:text-gray-400 mt-2">Please refresh the page</p>
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
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
              toast.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100"
                : "bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-900 dark:text-red-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" ? (
                <svg
                  className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
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
                className="ml-2 text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100 mb-2">
                Your Master CV
              </h1>
              <p className="text-slate-600 dark:text-gray-400">
                Complete your profile to start analyzing jobs and generating cover letters
              </p>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setInputMode("manual")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === "manual"
                    ? "bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
                }`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setInputMode("upload")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === "upload"
                    ? "bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 shadow-sm"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200"
                }`}
              >
                Upload CV
              </button>
            </div>
          </div>
        </div>

        {/* Profile Completion Status */}
        {!isProfileComplete && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5"
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
                <h3 className="font-medium text-red-900 dark:text-red-100">Profile Incomplete</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
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
            <CardHeader className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
              <CardTitle className="text-slate-900 dark:text-gray-100">
                Profile Information
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-gray-400">
                This information will be used to analyze job matches and generate personalized cover
                letters
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-white dark:bg-gray-800 pt-6">
              <form onSubmit={handleSave} className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-slate-900 dark:text-gray-100 font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="John Doe"
                      className={`mt-2 text-slate-900 dark:text-gray-100 ${
                        fieldErrors?.name ? "border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                    {fieldErrors?.name && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-slate-900 dark:text-gray-100 font-medium"
                    >
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="john@example.com"
                      className={`mt-2 text-slate-900 dark:text-gray-100 ${
                        fieldErrors?.email ? "border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                    {fieldErrors?.email && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-slate-900 dark:text-gray-100 font-medium"
                    >
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+1 555 123 4567"
                      className="mt-2 text-slate-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="location"
                      className="text-slate-900 dark:text-gray-100 font-medium"
                    >
                      Location *
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="San Francisco, CA"
                      className={`mt-2 text-slate-900 dark:text-gray-100 ${
                        fieldErrors?.location ? "border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                    {fieldErrors?.location && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {fieldErrors.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                <div>
                  <Label
                    htmlFor="summary"
                    className="text-slate-900 dark:text-gray-100 font-medium"
                  >
                    Professional Summary *
                  </Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => updateField("summary", e.target.value)}
                    placeholder="Senior Software Engineer with 5+ years of experience building scalable web applications..."
                    rows={4}
                    className={`mt-2 text-slate-900 dark:text-gray-100 ${
                      fieldErrors?.summary ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {fieldErrors?.summary && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {fieldErrors.summary}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">
                    A brief overview of your professional background and expertise.
                  </p>
                </div>

                {/* Work Experience */}
                <div>
                  <Label
                    htmlFor="experience"
                    className="text-slate-900 dark:text-gray-100 font-medium"
                  >
                    Work Experience *
                  </Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => updateField("experience", e.target.value)}
                    placeholder="Company Name | Role (Start Date - End Date)&#10;- Key achievement 1&#10;- Key achievement 2&#10;&#10;Previous Company | Previous Role..."
                    rows={10}
                    className={`mt-2 text-slate-900 dark:text-gray-100 ${
                      fieldErrors?.experience ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {fieldErrors?.experience && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {fieldErrors.experience}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">
                    Include company, role, dates, and key achievements for each position.
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <Label htmlFor="skills" className="text-slate-900 dark:text-gray-100 font-medium">
                    Skills *
                  </Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => updateField("skills", e.target.value)}
                    placeholder="React, TypeScript, Node.js, PostgreSQL, AWS, Docker, Git..."
                    rows={3}
                    className={`mt-2 text-slate-900 dark:text-gray-100 ${
                      fieldErrors?.skills ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />
                  {fieldErrors?.skills && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {fieldErrors.skills}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">
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
                  <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                    <svg
                      className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      Profile complete! You can now analyze jobs and generate cover letters.
                    </span>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* CV Management Section */}
        <Card className="shadow-sm mt-8">
          <CardHeader className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 dark:text-gray-100">
                  Your CV Documents
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-gray-400">
                  Manage your CV files. The active CV will be used for job analysis.
                </CardDescription>
              </div>
              <div className="text-sm text-slate-500 dark:text-gray-400">
                {cvs.length} / {maxCVs} CVs
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-white dark:bg-gray-800 pt-6">
            {cvsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
              </div>
            ) : cvs.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-slate-600 dark:text-gray-400 mb-4">
                  No CVs uploaded yet. Add your first CV to get started.
                </p>
                <Button onClick={() => router.push("/cv")} disabled={!canAddMore}>
                  Upload CV
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* CV List */}
                <div className="divide-y divide-slate-200 dark:divide-gray-700">
                  {cvs.map((cv) => (
                    <div
                      key={cv.id}
                      className={`flex items-center justify-between py-4 first:pt-0 last:pb-0 ${
                        cv.isActive
                          ? "bg-emerald-50/50 dark:bg-emerald-900/30 -mx-4 px-4 rounded-lg"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Document icon */}
                        <div
                          className={`p-2 rounded-lg ${cv.isActive ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-slate-100 dark:bg-gray-700"}`}
                        >
                          <svg
                            className={`w-5 h-5 ${cv.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-gray-400"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        {/* CV Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-gray-100 truncate">
                              {cv.name}
                            </span>
                            {cv.isActive && (
                              <Badge variant="default" className="bg-emerald-600 text-white">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-gray-400">
                            Updated {new Date(cv.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {!cv.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleSetActive(cv.id)}
                            className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/50"
                          >
                            Set Active
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Set as active and navigate to CV editor
                            void handleSetActive(cv.id).then(() => {
                              router.push("/cv");
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCvToDelete(cv.id)}
                          className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/50"
                          disabled={cvDeleting}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add CV Button */}
                {canAddMore && (
                  <div className="pt-4 border-t border-slate-200 dark:border-gray-700">
                    <Button variant="outline" onClick={() => router.push("/cv")} className="w-full">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Another CV
                    </Button>
                  </div>
                )}

                {/* Limit reached notice */}
                {!canAddMore && (
                  <div className="pt-4 border-t border-slate-200 dark:border-gray-700">
                    <p className="text-sm text-slate-500 dark:text-gray-400 text-center">
                      Maximum of {maxCVs} CVs reached. Delete one to add another.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete CV Confirmation Dialog */}
        <ConfirmationDialog
          open={!!cvToDelete}
          onOpenChange={(open) => !open && setCvToDelete(null)}
          title="Delete CV"
          description="Are you sure you want to delete this CV? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={handleDeleteCV}
          isLoading={cvDeleting}
        />
      </div>
    </div>
  );
}
