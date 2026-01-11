"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/lib/hooks";
import {
  Briefcase,
  Edit2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import type { JSX } from "react";

interface CV {
  id: string;
  name: string;
  isActive: boolean;
  updatedAt: string | Date;
}

interface ProfileSummaryProps {
  /** User profile data */
  user: User;
  /** List of uploaded CVs */
  cvs: CV[];
  /** Called when user wants to edit */
  onEdit: () => void;
}

/**
 * Profile Summary Component
 *
 * Read-only view of the user's profile information.
 * Shows all extracted CV data in a clean, organized layout.
 */
export function ProfileSummary({ user, cvs, onEdit }: ProfileSummaryProps): JSX.Element {
  const skills = user.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Your Profile Summary
        </h2>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Contact Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-cyan-500" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">{user.email || "—"}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">{user.phone}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">{user.location}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary Card */}
      {user.summary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              Professional Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {user.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Experience Card */}
      {user.experience && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-500" />
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {user.experience}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Skills Card */}
      {skills.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge
                  key={`${skill}-${index}`}
                  variant="secondary"
                  className="bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CVs Card */}
      {cvs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-500" />
              Your CVs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cvs.map((cv) => (
                <div
                  key={cv.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    cv.isActive
                      ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/20"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        cv.isActive
                          ? "bg-emerald-100 dark:bg-emerald-900/50"
                          : "bg-slate-100 dark:bg-slate-700"
                      }`}
                    >
                      <FileText
                        className={`w-4 h-4 ${
                          cv.isActive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                          {cv.name}
                        </span>
                        {cv.isActive && (
                          <Badge className="bg-emerald-600 text-white text-xs px-1.5 py-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Updated {new Date(cv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
