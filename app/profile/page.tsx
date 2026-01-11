/**
 * Profile Page
 *
 * Two modes:
 * - View Mode: Shows profile summary (when CV uploaded/profile complete)
 * - Edit Mode: Shows tabbed form (when editing or no data)
 *
 * CV Upload stays on page and extracts data directly.
 */

"use client";

import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { type ExtractedCVData } from "@/components/cv-upload";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { CVDropzone } from "@/components/profile/cv-dropzone";
import { ProfileSummary } from "@/components/profile/profile-summary";
import { SkillTags } from "@/components/profile/skill-tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useStorageUser, useStorageCV, type UserData } from "@/lib/hooks";
import { FileText, Trash2, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type JSX } from "react";

interface Toast {
  type: "success" | "error";
  message: string;
}

export default function ProfilePage(): JSX.Element {
  const router = useRouter();

  // ============================================
  // HOOKS
  // ============================================

  const { user: userData, loading, saving, error, fieldErrors, save } = useStorageUser();

  const {
    cvs,
    loading: cvsLoading,
    deleting: cvDeleting,
    uploading: cvUploading,
    remove: removeCV,
    setActive: setActiveCV,
    upload: uploadCV,
    canAddMore,
    maxCVs,
  } = useStorageCV();

  // ============================================
  // LOCAL STATE
  // ============================================

  const [formData, setFormData] = useState<UserData | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [cvToDelete, setCvToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form data once when userData becomes available
  if (userData && !formData && !loading) {
    setFormData(userData);
  }

  // Show toast for new errors
  if (error && error !== lastError) {
    setLastError(error);
    setToast({ type: "error", message: error });
    setTimeout(() => setToast(null), 5000);
  }

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const hasProfileData = Boolean(
    formData?.name?.trim() ||
      formData?.summary?.trim() ||
      formData?.experience?.trim() ||
      formData?.skills?.trim()
  );

  // Show edit mode if: explicitly editing OR no profile data yet
  const showEditMode = isEditing || !hasProfileData;

  const profileFields = {
    name: Boolean(formData?.name?.trim()),
    email: Boolean(formData?.email?.trim()),
    location: Boolean(formData?.location?.trim()),
    summary: Boolean(formData?.summary?.trim()),
    experience: Boolean(formData?.experience?.trim()),
    skills: Boolean(formData?.skills?.trim()),
  };

  // ============================================
  // HANDLERS
  // ============================================

  const showToast = (type: "success" | "error", message: string): void => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const updateField = (field: keyof UserData, value: string): void => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

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

    const saveInput = {
      name: formData.name,
      email: formData.email,
      location: formData.location,
      summary: formData.summary,
      experience: formData.experience,
      skills: formData.skills,
      ...(formData.phone ? { phone: formData.phone } : {}),
    };

    try {
      await save(saveInput);
      showToast("success", "Profile saved!");
      setIsEditing(false);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleFileSelect = async (file: File): Promise<void> => {
    try {
      // Step 1: Upload CV using the storage-aware hook
      const result = await uploadCV(file, { template: "tech-minimalist" });

      if (!result) {
        throw new Error("Failed to upload CV");
      }

      // Step 2: Also extract profile data from the CV
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await fetch("/api/cv/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (uploadResponse.ok) {
        const apiResult = (await uploadResponse.json()) as {
          data?: ExtractedCVData;
          error?: string;
        };

        if (apiResult.data) {
          // Update form data with extracted info
          const extractedData = apiResult.data;
          const updatedData: UserData = {
            id: formData?.id || "",
            name: extractedData.name || formData?.name || "",
            email: extractedData.email || formData?.email || "",
            phone: extractedData.phone || formData?.phone || "",
            location: extractedData.location || formData?.location || "",
            summary: extractedData.summary || formData?.summary || "",
            experience: extractedData.experience || formData?.experience || "",
            skills: extractedData.skills || formData?.skills || "",
          };

          setFormData(updatedData);

          // Auto-save the extracted data to profile
          void save({
            name: updatedData.name,
            email: updatedData.email,
            location: updatedData.location,
            summary: updatedData.summary,
            experience: updatedData.experience,
            skills: updatedData.skills,
            ...(updatedData.phone ? { phone: updatedData.phone } : {}),
          });
        }
      }

      showToast("success", "CV uploaded and profile updated!");
      setIsEditing(false);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to process CV");
    }
  };

  // ============================================
  // RENDER: LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-slate-900 dark:text-slate-100 text-lg font-medium">
            Error loading user data
          </p>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Please refresh the page</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: MAIN PAGE
  // ============================================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <span className="font-medium">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <AvatarUpload
                name={formData.name || "User"}
                imageUrl={null}
                size={64}
                editable={false}
              />

              {/* Name, Info, and Completion Badge */}
              <div className="flex-1 min-w-0">
                {(() => {
                  const fieldLabels: Record<string, string> = {
                    name: "Name",
                    email: "Email",
                    location: "Location",
                    summary: "Summary",
                    experience: "Experience",
                    skills: "Skills",
                  };
                  const missingFields = Object.entries(profileFields)
                    .filter(([, completed]) => !completed)
                    .map(([key]) => fieldLabels[key] ?? key);
                  const completedCount = Object.values(profileFields).filter(Boolean).length;
                  const totalCount = Object.values(profileFields).length;
                  const isComplete = completedCount === totalCount;

                  return (
                    <>
                      {/* Name with badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                          {formData.name || "Welcome!"}
                        </h1>
                        {isComplete ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                            ✓ Complete
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          >
                            {completedCount}/{totalCount}
                          </Badge>
                        )}
                      </div>

                      {/* Email and location */}
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                        {formData.email}
                        {formData.location && (
                          <span className="ml-2">• 📍 {formData.location}</span>
                        )}
                      </p>

                      {/* Missing fields hint - only when incomplete */}
                      {missingFields.length > 0 && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            Complete your profile:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {missingFields.map((field) => (
                              <span
                                key={field}
                                className="text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Upload Zone - Always visible when in edit mode or no data */}
        {showEditMode && (
          <CVDropzone
            onFileSelect={(file) => void handleFileSelect(file)}
            isUploading={cvUploading}
            disabled={!canAddMore}
            className="mb-6"
          />
        )}

        {/* VIEW MODE: Profile Summary */}
        {!showEditMode && formData && (
          <ProfileSummary user={formData} cvs={cvs} onEdit={() => setIsEditing(true)} />
        )}

        {/* EDIT MODE: Tabbed Form */}
        {showEditMode && (
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 hidden sm:inline" />
                <span>Basic</span>
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center gap-2">
                <FileText className="h-4 w-4 hidden sm:inline" />
                <span>Work</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <span>Skills</span>
              </TabsTrigger>
              <TabsTrigger value="cvs" className="flex items-center gap-2">
                <span>CVs</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Info */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Your contact details and location</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          placeholder="John Doe"
                          className={`mt-1 ${fieldErrors?.name ? "border-red-500" : ""}`}
                        />
                        {fieldErrors?.name && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {fieldErrors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="john@example.com"
                          className={`mt-1 ${fieldErrors?.email ? "border-red-500" : ""}`}
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
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone || ""}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="+1 555 123 4567"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => updateField("location", e.target.value)}
                          placeholder="San Francisco, CA"
                          className={`mt-1 ${fieldErrors?.location ? "border-red-500" : ""}`}
                        />
                        {fieldErrors?.location && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {fieldErrors.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                      {hasProfileData && (
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Professional */}
            <TabsContent value="professional">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Background</CardTitle>
                  <CardDescription>Your summary and work experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <Label htmlFor="summary">Professional Summary *</Label>
                      <Textarea
                        id="summary"
                        value={formData.summary}
                        onChange={(e) => updateField("summary", e.target.value)}
                        placeholder="Senior Software Engineer with 5+ years of experience..."
                        rows={4}
                        className={`mt-1 ${fieldErrors?.summary ? "border-red-500" : ""}`}
                      />
                      {fieldErrors?.summary && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {fieldErrors.summary}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="experience">Work Experience *</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => updateField("experience", e.target.value)}
                        placeholder="Company Name | Role (Start - End)&#10;- Key achievement 1"
                        rows={10}
                        className={`mt-1 ${fieldErrors?.experience ? "border-red-500" : ""}`}
                      />
                      {fieldErrors?.experience && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {fieldErrors.experience}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 flex gap-3">
                      <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                      {hasProfileData && (
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Skills */}
            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Technologies</CardTitle>
                  <CardDescription>Add your technical and soft skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-6">
                    <SkillTags
                      value={formData.skills}
                      onChange={(value) => updateField("skills", value)}
                      placeholder="Type a skill and press Enter..."
                    />
                    {fieldErrors?.skills && (
                      <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.skills}</p>
                    )}

                    <div className="pt-4 flex gap-3">
                      <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Skills"}
                      </Button>
                      {hasProfileData && (
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: CVs */}
            <TabsContent value="cvs">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your CV Documents</CardTitle>
                      <CardDescription>Manage your uploaded CVs</CardDescription>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {cvs.length} / {maxCVs}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {cvsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                    </div>
                  ) : cvs.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">
                        No CVs uploaded yet. Use the dropzone above to add your CV.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cvs.map((cv) => (
                        <div
                          key={cv.id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            cv.isActive
                              ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/20"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                cv.isActive
                                  ? "bg-emerald-100 dark:bg-emerald-900/50"
                                  : "bg-slate-100 dark:bg-slate-800"
                              }`}
                            >
                              <FileText
                                className={`w-5 h-5 ${
                                  cv.isActive
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-slate-500 dark:text-slate-400"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                  {cv.name}
                                </span>
                                {cv.isActive && (
                                  <Badge className="bg-emerald-600 text-white">Active</Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Updated {new Date(cv.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!cv.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void handleSetActive(cv.id)}
                              >
                                Set Active
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => router.push("/cv")}>
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setCvToDelete(cv.id)}
                              disabled={cvDeleting}
                              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>

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
