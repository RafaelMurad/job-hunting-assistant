"use client";

import { useCallback, useState } from "react";
import { rankJobs } from "../utils/similarity";

interface Job {
  id: string;
  title: string;
  company: string;
  skills: string[];
  description: string;
  location: string;
}

interface UserProfile {
  skills: string[];
  experience: string;
}

// Mock jobs for demonstration
const MOCK_JOBS: Job[] = [
  {
    id: "1",
    title: "Senior React Developer",
    company: "TechCorp",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    description: "Build modern web applications using React and TypeScript",
    location: "Remote",
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    skills: ["Python", "Django", "PostgreSQL", "React"],
    description: "Develop end-to-end features for our SaaS platform",
    location: "San Francisco",
  },
  {
    id: "3",
    title: "Frontend Engineer",
    company: "DesignCo",
    skills: ["JavaScript", "CSS", "Figma", "Vue.js"],
    description: "Create beautiful user interfaces with attention to detail",
    location: "New York",
  },
  {
    id: "4",
    title: "Backend Developer",
    company: "DataInc",
    skills: ["Go", "Kubernetes", "PostgreSQL", "Redis"],
    description: "Scale our data processing infrastructure",
    location: "Remote",
  },
  {
    id: "5",
    title: "Software Engineer",
    company: "BigTech",
    skills: ["Java", "Spring", "AWS", "Microservices"],
    description: "Build distributed systems at scale",
    location: "Seattle",
  },
];

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<
    Array<Job & { similarity: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const getRecommendations = useCallback(
    async (profile: UserProfile, limit: number = 5) => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((r) => setTimeout(r, 500));

      // Rank jobs by similarity
      const ranked = rankJobs(MOCK_JOBS, profile.skills, profile.experience);

      setRecommendations(ranked.slice(0, limit));
      setIsLoading(false);
    },
    []
  );

  return {
    recommendations,
    isLoading,
    getRecommendations,
  };
}
