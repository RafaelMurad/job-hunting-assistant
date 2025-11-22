"use client";

import { useEffect } from "react";
import { useRecommendations } from "../hooks/useRecommendations";

interface JobRecommendationsProps {
  userSkills: string[];
  userExperience: string;
}

export function JobRecommendations({
  userSkills,
  userExperience,
}: JobRecommendationsProps) {
  const { recommendations, isLoading, getRecommendations } = useRecommendations();

  useEffect(() => {
    if (userSkills.length > 0) {
      getRecommendations({ skills: userSkills, experience: userExperience });
    }
  }, [userSkills, userExperience, getRecommendations]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-nordic-neutral-200" />
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-nordic-neutral-200 bg-white p-6 text-center">
        <p className="text-nordic-neutral-500">Add skills to see recommendations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-nordic-neutral-900">
        Recommended for You
      </h2>
      {recommendations.map((job) => (
        <div
          key={job.id}
          className="rounded-lg border border-nordic-neutral-200 bg-white p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-nordic-neutral-900">{job.title}</h3>
              <p className="text-sm text-nordic-neutral-600">{job.company}</p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-full"
                style={{
                  background: `conic-gradient(#0284c7 ${job.similarity * 100}%, #e5e7eb ${job.similarity * 100}%)`,
                }}
              >
                <div className="m-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-fjord-600">
                  {Math.round(job.similarity * 100)}
                </div>
              </div>
            </div>
          </div>
          <p className="mt-2 text-sm text-nordic-neutral-500 line-clamp-2">
            {job.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className={`rounded px-2 py-0.5 text-xs ${
                  userSkills.some((s) => s.toLowerCase() === skill.toLowerCase())
                    ? "bg-forest-100 text-forest-700"
                    : "bg-nordic-neutral-100 text-nordic-neutral-600"
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm text-nordic-neutral-500">
            <span>{job.location}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
