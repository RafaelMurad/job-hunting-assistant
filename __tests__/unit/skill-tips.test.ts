/**
 * Skill Tips Unit Tests
 *
 * Tests for the getSkillTip function that provides actionable
 * advice for skill gaps identified during job analysis.
 */

import { describe, it, expect } from "vitest";

// Extract the skill tip logic for testing
// In a real app, this would be in a shared module
function getSkillTip(skill: string): string {
  const skillLower = skill.toLowerCase();

  // Programming languages
  if (skillLower.includes("python")) {
    return "Complete a Python crash course on YouTube (4-6 hours), then build a small project like a CLI tool or web scraper.";
  }
  if (skillLower.includes("typescript") || skillLower.includes("javascript")) {
    return "Work through TypeScript basics on typescript-exercises.github.io, then add types to an existing JS project.";
  }
  if (skillLower.includes("react")) {
    return "Build a small React app with state management. The official React docs have excellent interactive tutorials.";
  }
  if (skillLower.includes("node")) {
    return "Create a simple REST API with Express.js. Focus on understanding async patterns and middleware.";
  }

  // Cloud & DevOps
  if (skillLower.includes("aws") || skillLower.includes("cloud")) {
    return "Start with AWS Free Tier - deploy a static site to S3 and set up CloudFront. AWS provides excellent free training.";
  }
  if (skillLower.includes("docker") || skillLower.includes("container")) {
    return "Containerize an existing project. Docker's official 'Get Started' guide walks you through in under 2 hours.";
  }
  if (skillLower.includes("kubernetes") || skillLower.includes("k8s")) {
    return "Try minikube locally, then deploy a simple app. Focus on understanding pods, services, and deployments.";
  }
  if (skillLower.includes("ci/cd") || skillLower.includes("pipeline")) {
    return "Set up GitHub Actions for an existing repo - start with a simple test + lint workflow.";
  }

  // Databases
  if (skillLower.includes("mongodb") || skillLower.includes("nosql")) {
    return "Build a small CRUD app with MongoDB Atlas (free tier). MongoDB University has excellent free courses.";
  }
  if (skillLower.includes("sql") || skillLower.includes("database")) {
    return "Practice on SQLZoo or LeetCode's database problems. Focus on JOINs, aggregations, and indexing.";
  }

  // Soft skills & methodologies
  if (skillLower.includes("agile") || skillLower.includes("scrum")) {
    return "Read the Agile Manifesto, then consider a Scrum certification. Contribute to open source to practice collaborative workflows.";
  }
  if (skillLower.includes("communication") || skillLower.includes("leadership")) {
    return "Start a technical blog or contribute to documentation. Lead code reviews or mentor junior developers.";
  }

  // AI/ML
  if (
    skillLower.includes("machine learning") ||
    skillLower.includes("ml") ||
    skillLower.includes("ai")
  ) {
    return "Start with fast.ai's practical deep learning course - it's free and project-focused.";
  }

  // Default tip
  return `Search for '${skill} crash course' on YouTube, or find a beginner project tutorial. Hands-on practice is the fastest path to competency.`;
}

describe("Skill Tips", () => {
  describe("Programming Languages", () => {
    it("should provide Python-specific tips", () => {
      const tip = getSkillTip("Python");
      expect(tip).toContain("Python crash course");
      expect(tip).toContain("CLI tool");
    });

    it("should provide TypeScript tips (case insensitive)", () => {
      const tip = getSkillTip("TYPESCRIPT");
      expect(tip).toContain("TypeScript basics");
    });

    it("should provide JavaScript tips", () => {
      const tip = getSkillTip("JavaScript ES6");
      expect(tip).toContain("TypeScript"); // Same tip for JS/TS
    });

    it("should provide React tips", () => {
      const tip = getSkillTip("React.js");
      expect(tip).toContain("React app");
      expect(tip).toContain("state management");
    });

    it("should provide Node.js tips", () => {
      const tip = getSkillTip("Node.js");
      expect(tip).toContain("REST API");
      expect(tip).toContain("Express");
    });
  });

  describe("Cloud & DevOps", () => {
    it("should provide AWS tips", () => {
      const tip = getSkillTip("AWS");
      expect(tip).toContain("Free Tier");
      expect(tip).toContain("S3");
    });

    it("should provide cloud tips for generic cloud mentions", () => {
      const tip = getSkillTip("Cloud Computing");
      expect(tip).toContain("AWS");
    });

    it("should provide Docker tips", () => {
      const tip = getSkillTip("Docker");
      expect(tip).toContain("Containerize");
    });

    it("should provide Kubernetes tips", () => {
      const tip = getSkillTip("Kubernetes");
      expect(tip).toContain("minikube");
      expect(tip).toContain("pods");
    });

    it("should provide K8s tips (abbreviation)", () => {
      const tip = getSkillTip("K8s orchestration");
      expect(tip).toContain("minikube");
    });

    it("should provide CI/CD tips", () => {
      const tip = getSkillTip("CI/CD");
      expect(tip).toContain("GitHub Actions");
    });
  });

  describe("Databases", () => {
    it("should provide SQL tips", () => {
      const tip = getSkillTip("SQL");
      expect(tip).toContain("SQLZoo");
      expect(tip).toContain("JOINs");
    });

    it("should provide database tips", () => {
      const tip = getSkillTip("Database design");
      expect(tip).toContain("SQL");
    });

    it("should provide MongoDB tips", () => {
      const tip = getSkillTip("MongoDB");
      expect(tip).toContain("MongoDB Atlas");
    });

    it("should provide NoSQL tips", () => {
      const tip = getSkillTip("NoSQL databases");
      expect(tip).toContain("MongoDB Atlas");
    });
  });

  describe("Soft Skills & Methodologies", () => {
    it("should provide Agile tips", () => {
      const tip = getSkillTip("Agile methodology");
      expect(tip).toContain("Agile Manifesto");
    });

    it("should provide Scrum tips", () => {
      const tip = getSkillTip("Scrum Master experience");
      expect(tip).toContain("Scrum certification");
    });

    it("should provide communication tips", () => {
      const tip = getSkillTip("Strong communication skills");
      expect(tip).toContain("technical blog");
    });

    it("should provide leadership tips", () => {
      const tip = getSkillTip("Team leadership");
      expect(tip).toContain("mentor");
    });
  });

  describe("AI/ML", () => {
    it("should provide ML tips", () => {
      const tip = getSkillTip("Machine Learning");
      expect(tip).toContain("fast.ai");
    });

    it("should provide ML abbreviation tips", () => {
      const tip = getSkillTip("ML experience");
      expect(tip).toContain("fast.ai");
    });

    it("should provide AI tips", () => {
      const tip = getSkillTip("AI development");
      expect(tip).toContain("fast.ai");
    });
  });

  describe("Default Tips", () => {
    it("should provide a helpful default for unknown skills", () => {
      const tip = getSkillTip("Quantum Computing");
      expect(tip).toContain("Quantum Computing");
      expect(tip).toContain("crash course");
      expect(tip).toContain("Hands-on practice");
    });

    it("should include the skill name in the default tip", () => {
      const tip = getSkillTip("Rust programming");
      expect(tip).toContain("Rust programming");
    });
  });
});
