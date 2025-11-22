"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface JobAnalysisResult {
  company: string;
  role: string;
  matchScore: number;
  topRequirements: string[];
  skillsMatch: string[];
  gaps: string[];
  redFlags: string[];
  keyPoints: string[];
}

export default function AnalyzePage(): React.JSX.Element {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysisResult | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get user ID on mount
  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => setUserId(data.id))
      .catch(console.error);
  }, []);

  const handleAnalyze = async (): Promise<void> => {
    if (!jobDescription.trim()) {
      alert("Please enter a job description");
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);
    setCoverLetter("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, userId }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to analyze job. Make sure you've filled in your profile first.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = async (): Promise<void> => {
    if (!analysis) return;

    setGeneratingCoverLetter(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, userId, analysis }),
      });

      if (!res.ok) throw new Error("Cover letter generation failed");

      const data = await res.json();
      setCoverLetter(data.coverLetter);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate cover letter");
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const handleSaveApplication = async (): Promise<void> => {
    if (!analysis) return;

    setSaving(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          company: analysis.company,
          role: analysis.role,
          jobDescription,
          matchScore: analysis.matchScore,
          analysis: JSON.stringify(analysis),
          coverLetter: coverLetter || "",
          status: "saved",
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      alert("Application saved to tracker!");
      router.push("/tracker");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save application");
    } finally {
      setSaving(false);
    }
  };

  const getMatchColor = (score: number): string => {
    if (score >= 80) return "bg-forest-100 text-forest-800 border border-forest-200";
    if (score >= 60) return "bg-fjord-100 text-fjord-800 border border-fjord-200";
    if (score >= 40) return "bg-clay-50 text-clay-700 border border-clay-200";
    return "bg-clay-100 text-clay-800 border border-clay-300";
  };

  return (
    <div className="min-h-screen bg-nordic-neutral-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-nordic-neutral-900 mb-2">Analyze Job</h1>
            <p className="text-nordic-neutral-600">Paste a job description to get AI-powered analysis</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            ← Back Home
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <Card className="border-nordic-neutral-200 shadow-sm">
              <CardHeader className="bg-white border-b border-nordic-neutral-200">
                <CardTitle className="text-nordic-neutral-900">Job Description</CardTitle>
                <CardDescription className="text-nordic-neutral-600">Paste the full job posting here</CardDescription>
              </CardHeader>
              <CardContent className="bg-white pt-6">
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description here..."
                  rows={20}
                  className="mb-4 text-nordic-neutral-900"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || !jobDescription.trim()}
                  className="w-full"
                >
                  {analyzing ? "Analyzing..." : "Analyze with AI"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div>
            {analysis && (
              <div className="space-y-4">
                <Card className="border-nordic-neutral-200 shadow-sm">
                  <CardHeader className="bg-white border-b border-nordic-neutral-200">
                    <CardTitle className="flex justify-between items-center text-nordic-neutral-900">
                      <span>{analysis.company}</span>
                      <Badge className={getMatchColor(analysis.matchScore)}>
                        {analysis.matchScore}% Match
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-nordic-neutral-600">{analysis.role}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 bg-white pt-6">
                    {/* Top Requirements */}
                    <div>
                      <Label className="text-base mb-2 block text-nordic-neutral-900">Top Requirements</Label>
                      <ul className="space-y-1">
                        {analysis.topRequirements.map((req, i) => (
                          <li key={i} className="text-sm text-nordic-neutral-700">
                            • {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Skills Match */}
                    <div>
                      <Label className="text-base mb-2 block text-nordic-neutral-900">Your Matching Skills</Label>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skillsMatch.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="bg-forest-100 text-forest-800 border border-forest-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Gaps */}
                    {analysis.gaps.length > 0 && (
                      <div>
                        <Label className="text-base mb-2 block text-nordic-neutral-900">Skills to Address</Label>
                        <div className="flex flex-wrap gap-2">
                          {analysis.gaps.map((gap, i) => (
                            <Badge key={i} variant="outline" className="bg-clay-50 text-clay-700 border border-clay-200">
                              {gap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Red Flags */}
                    {analysis.redFlags.length > 0 && (
                      <div>
                        <Label className="text-base mb-2 block text-clay-600">Concerns</Label>
                        <ul className="space-y-1">
                          {analysis.redFlags.map((flag, i) => (
                            <li key={i} className="text-sm text-clay-600">
                              ⚠️ {flag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 space-y-2">
                      <Button
                        onClick={handleGenerateCoverLetter}
                        disabled={generatingCoverLetter}
                        className="w-full"
                      >
                        {generatingCoverLetter ? "Generating..." : "Generate Cover Letter"}
                      </Button>
                      <Button
                        onClick={handleSaveApplication}
                        disabled={saving}
                        variant="outline"
                        className="w-full"
                      >
                        {saving ? "Saving..." : "Save to Tracker"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Cover Letter */}
                {coverLetter && (
                  <Card className="border-nordic-neutral-200 shadow-sm">
                    <CardHeader className="bg-white border-b border-nordic-neutral-200">
                      <CardTitle className="text-nordic-neutral-900">Generated Cover Letter</CardTitle>
                      <CardDescription className="text-nordic-neutral-600">Edit as needed before applying</CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white pt-6">
                      <Textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={12}
                        className="mb-4 text-nordic-neutral-900"
                      />
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(coverLetter);
                          alert("Cover letter copied to clipboard!");
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Copy to Clipboard
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {!analysis && (
              <Card className="border-nordic-neutral-200">
                <CardContent className="py-12 text-center text-nordic-neutral-500">
                  <p>Paste a job description and click &quot;Analyze&quot; to get started</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
