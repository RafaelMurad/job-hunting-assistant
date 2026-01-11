/**
 * Local Storage Adapter Tests
 *
 * Tests for the Dexie/IndexedDB storage implementation.
 * Uses fake-indexeddb to simulate IndexedDB in Node.js.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "fake-indexeddb/auto";
import { localStorageAdapter, localDB } from "@/lib/storage/local";
import type {
  CreateProfileInput,
  CreateCVInput,
  CreateApplicationInput,
} from "@/lib/storage/interface";

// Reset the database before each test
beforeEach(async () => {
  await localDB.profiles.clear();
  await localDB.cvs.clear();
  await localDB.applications.clear();
  await localDB.files.clear();
});

// Close database after all tests
afterEach(async () => {
  // Clear any remaining data
  await localDB.profiles.clear();
  await localDB.cvs.clear();
  await localDB.applications.clear();
  await localDB.files.clear();
});

describe("Local Storage Adapter", () => {
  describe("Profile Operations", () => {
    const testProfile: CreateProfileInput = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      location: "New York, USA",
      summary: "Experienced developer",
      experience: "5 years at TechCorp",
      skills: ["TypeScript", "React", "Node.js"],
      image: "https://example.com/avatar.jpg",
    };

    it("should return null when no profile exists", async () => {
      const profile = await localStorageAdapter.getProfile();
      expect(profile).toBeNull();
    });

    it("should create a new profile", async () => {
      const profile = await localStorageAdapter.saveProfile(testProfile);

      expect(profile.id).toBe("local");
      expect(profile.name).toBe(testProfile.name);
      expect(profile.email).toBe(testProfile.email);
      expect(profile.phone).toBe(testProfile.phone);
      expect(profile.location).toBe(testProfile.location);
      expect(profile.summary).toBe(testProfile.summary);
      expect(profile.skills).toEqual(testProfile.skills);
      expect(profile.createdAt).toBeDefined();
      expect(profile.updatedAt).toBeDefined();
    });

    it("should retrieve the created profile", async () => {
      await localStorageAdapter.saveProfile(testProfile);
      const profile = await localStorageAdapter.getProfile();

      expect(profile).not.toBeNull();
      expect(profile?.name).toBe(testProfile.name);
    });

    it("should update an existing profile", async () => {
      await localStorageAdapter.saveProfile(testProfile);

      const updatedProfile = await localStorageAdapter.saveProfile({
        name: "Jane Doe",
        location: "San Francisco, USA",
      });

      expect(updatedProfile.name).toBe("Jane Doe");
      expect(updatedProfile.location).toBe("San Francisco, USA");
      // Other fields should remain unchanged
      expect(updatedProfile.email).toBe(testProfile.email);
      expect(updatedProfile.skills).toEqual(testProfile.skills);
    });
  });

  describe("CV Operations", () => {
    const testCV: CreateCVInput = {
      name: "Software Engineer CV",
      latexContent: "\\documentclass{article}\\begin{document}Hello\\end{document}",
      isActive: true,
    };

    it("should return empty array when no CVs exist", async () => {
      const cvs = await localStorageAdapter.getCVs();
      expect(cvs).toEqual([]);
    });

    it("should create a new CV", async () => {
      const cv = await localStorageAdapter.createCV(testCV);

      expect(cv.id).toBeDefined();
      expect(cv.name).toBe(testCV.name);
      expect(cv.latexContent).toBe(testCV.latexContent);
      expect(cv.isActive).toBe(true);
    });

    it("should list all CVs", async () => {
      await localStorageAdapter.createCV({ name: "CV 1", isActive: true });
      await localStorageAdapter.createCV({ name: "CV 2", isActive: false });

      const cvs = await localStorageAdapter.getCVs();
      expect(cvs).toHaveLength(2);
    });

    it("should get CV by ID", async () => {
      const created = await localStorageAdapter.createCV(testCV);
      const retrieved = await localStorageAdapter.getCV(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe(testCV.name);
    });

    it("should return null for non-existent CV", async () => {
      const cv = await localStorageAdapter.getCV("non-existent-id");
      expect(cv).toBeNull();
    });

    it("should get active CV", async () => {
      await localStorageAdapter.createCV({ name: "Inactive", isActive: false });
      const activeCv = await localStorageAdapter.createCV({ name: "Active", isActive: true });

      const result = await localStorageAdapter.getActiveCV();
      expect(result?.id).toBe(activeCv.id);
    });

    it("should update a CV", async () => {
      const created = await localStorageAdapter.createCV(testCV);

      const updated = await localStorageAdapter.updateCV(created.id, {
        name: "Updated CV Name",
        latexContent: "New content",
      });

      expect(updated.name).toBe("Updated CV Name");
      expect(updated.latexContent).toBe("New content");
    });

    it("should delete a CV", async () => {
      const created = await localStorageAdapter.createCV(testCV);
      await localStorageAdapter.deleteCV(created.id);

      const cvs = await localStorageAdapter.getCVs();
      expect(cvs).toHaveLength(0);
    });

    it("should set active CV and deactivate others", async () => {
      const cv1 = await localStorageAdapter.createCV({ name: "CV 1", isActive: true });
      const cv2 = await localStorageAdapter.createCV({ name: "CV 2", isActive: false });

      await localStorageAdapter.setActiveCV(cv2.id);

      const cv1After = await localStorageAdapter.getCV(cv1.id);
      const cv2After = await localStorageAdapter.getCV(cv2.id);

      expect(cv1After?.isActive).toBe(false);
      expect(cv2After?.isActive).toBe(true);
    });
  });

  describe("Application Operations", () => {
    const testApplication: CreateApplicationInput = {
      company: "TechCorp",
      role: "Senior Developer",
      jobDescription: "Build amazing software",
      jobUrl: "https://example.com/job",
      matchScore: 85,
      analysis: "Great match for your skills",
      coverLetter: "Dear Hiring Manager...",
      status: "saved",
    };

    it("should return empty array when no applications exist", async () => {
      const apps = await localStorageAdapter.getApplications();
      expect(apps).toEqual([]);
    });

    it("should create a new application", async () => {
      const app = await localStorageAdapter.createApplication(testApplication);

      expect(app.id).toBeDefined();
      expect(app.company).toBe(testApplication.company);
      expect(app.role).toBe(testApplication.role);
      expect(app.matchScore).toBe(testApplication.matchScore);
      expect(app.status).toBe("saved");
    });

    it("should list all applications", async () => {
      await localStorageAdapter.createApplication(testApplication);
      await localStorageAdapter.createApplication({
        ...testApplication,
        company: "OtherCorp",
      });

      const apps = await localStorageAdapter.getApplications();
      expect(apps).toHaveLength(2);
    });

    it("should get application by ID", async () => {
      const created = await localStorageAdapter.createApplication(testApplication);
      const retrieved = await localStorageAdapter.getApplication(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.company).toBe(testApplication.company);
    });

    it("should update an application", async () => {
      const created = await localStorageAdapter.createApplication(testApplication);

      const updated = await localStorageAdapter.updateApplication(created.id, {
        status: "applied",
        notes: "Applied on Monday",
      });

      expect(updated.status).toBe("applied");
      expect(updated.notes).toBe("Applied on Monday");
    });

    it("should delete an application", async () => {
      const created = await localStorageAdapter.createApplication(testApplication);
      await localStorageAdapter.deleteApplication(created.id);

      const apps = await localStorageAdapter.getApplications();
      expect(apps).toHaveLength(0);
    });
  });

  describe("File Operations", () => {
    it("should save a file and return a local URL", async () => {
      const testBlob = new Blob(["Hello, World!"], { type: "text/plain" });
      const url = await localStorageAdapter.saveFile(testBlob, "test.txt");

      expect(url).toMatch(/^local:\/\//);
      expect(url).toContain("local_");
    });

    it("should store file metadata in database", async () => {
      const testBlob = new Blob(["Hello, World!"], { type: "text/plain" });
      const url = await localStorageAdapter.saveFile(testBlob, "test.txt");

      // Verify file is in database
      const id = url.replace("local://", "");
      const file = await localDB.files.get(id);

      expect(file).toBeDefined();
      expect(file?.name).toBe("test.txt");
      expect(file?.mimeType).toBe("text/plain");
      expect(file?.size).toBe(13); // "Hello, World!" is 13 bytes
    });

    it("should return null for non-existent file", async () => {
      const file = await localStorageAdapter.getFile("local://non-existent");
      expect(file).toBeNull();
    });

    it("should delete a file from database", async () => {
      const testBlob = new Blob(["Test"], { type: "text/plain" });
      const url = await localStorageAdapter.saveFile(testBlob, "test.txt");

      await localStorageAdapter.deleteFile(url);

      // Verify file is removed from database
      const id = url.replace("local://", "");
      const file = await localDB.files.get(id);
      expect(file).toBeUndefined();
    });
  });

  describe("Data Management", () => {
    it("should export all data", async () => {
      // Create some test data
      await localStorageAdapter.saveProfile({
        name: "Test User",
        email: "test@example.com",
        location: "NYC",
        summary: "Developer",
        experience: "5 years",
        skills: ["JS"],
      });
      await localStorageAdapter.createCV({ name: "Test CV" });
      await localStorageAdapter.createApplication({
        company: "Test Co",
        role: "Dev",
        jobDescription: "Build stuff",
        matchScore: 90,
        analysis: "Good",
        coverLetter: "Hi",
      });

      const exported = await localStorageAdapter.exportAll();

      expect(exported.version).toBe("1.0");
      expect(exported.exportedAt).toBeDefined();
      expect(exported.profile).not.toBeNull();
      expect(exported.cvs).toHaveLength(1);
      expect(exported.applications).toHaveLength(1);
    });

    it("should clear all data", async () => {
      // Create some test data
      await localStorageAdapter.saveProfile({
        name: "Test User",
        email: "test@example.com",
        location: "NYC",
        summary: "Developer",
        experience: "5 years",
        skills: ["JS"],
      });
      await localStorageAdapter.createCV({ name: "Test CV" });

      await localStorageAdapter.clearAll();

      const profile = await localStorageAdapter.getProfile();
      const cvs = await localStorageAdapter.getCVs();

      expect(profile).toBeNull();
      expect(cvs).toHaveLength(0);
    });

    it("should get storage stats", async () => {
      await localStorageAdapter.createCV({ name: "CV 1" });
      await localStorageAdapter.createCV({ name: "CV 2" });
      await localStorageAdapter.createApplication({
        company: "Test",
        role: "Dev",
        jobDescription: "Build",
        matchScore: 80,
        analysis: "Good",
        coverLetter: "Hi",
      });

      const stats = await localStorageAdapter.getStorageStats();

      expect(stats.cvCount).toBe(2);
      expect(stats.applicationCount).toBe(1);
      expect(stats.used).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Import/Export Roundtrip", () => {
    it("should import exported data correctly", async () => {
      // Create initial data
      await localStorageAdapter.saveProfile({
        name: "Export Test",
        email: "export@test.com",
        location: "NYC",
        summary: "Developer",
        experience: "5 years",
        skills: ["TypeScript", "React"],
      });
      await localStorageAdapter.createCV({
        name: "Export CV",
        latexContent: "\\documentclass{article}",
        isActive: true,
      });

      // Export
      const exported = await localStorageAdapter.exportAll();

      // Clear everything
      await localStorageAdapter.clearAll();

      // Verify cleared
      expect(await localStorageAdapter.getProfile()).toBeNull();
      expect(await localStorageAdapter.getCVs()).toHaveLength(0);

      // Import
      await localStorageAdapter.importAll(exported);

      // Verify restored
      const profile = await localStorageAdapter.getProfile();
      expect(profile?.name).toBe("Export Test");

      const cvs = await localStorageAdapter.getCVs();
      expect(cvs).toHaveLength(1);
      expect(cvs[0]?.name).toBe("Export CV");
    });
  });
});
