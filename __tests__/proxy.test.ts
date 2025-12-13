/**
 * Proxy Tests (Next.js 16+ Route Protection)
 *
 * Tests route protection and authorization logic
 */

import proxy from "@/proxy";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

const mockGetToken = vi.mocked(getToken);

describe("Middleware - Route Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_SECRET = "test-auth-secret";
  });

  describe("Public Routes", () => {
    it("allows access to landing page without auth", async () => {
      mockGetToken.mockResolvedValue(null);

      const req = new NextRequest(new URL("http://localhost:3000/"));
      const response = await proxy(req);

      expect(response.status).toBe(200);
    });

    it("allows access to login page without auth", async () => {
      mockGetToken.mockResolvedValue(null);

      const req = new NextRequest(new URL("http://localhost:3000/login"));
      const response = await proxy(req);

      expect(response.status).toBe(200);
    });

    it("redirects authenticated users from login to dashboard", async () => {
      mockGetToken.mockResolvedValue({
        id: "user-123",
        email: "user@example.com",
        role: "USER",
        isTrusted: false,
      } as never);

      const req = new NextRequest(new URL("http://localhost:3000/login"));
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/dashboard");
    });
  });

  describe("Protected Routes", () => {
    it("redirects unauthenticated users to login", async () => {
      mockGetToken.mockResolvedValue(null);

      const req = new NextRequest(new URL("http://localhost:3000/dashboard"));
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login");
      expect(response.headers.get("location")).toContain("callbackUrl");
    });

    it("allows authenticated users to access dashboard", async () => {
      mockGetToken.mockResolvedValue({
        id: "user-123",
        email: "user@example.com",
        role: "USER",
        isTrusted: false,
      } as never);

      const req = new NextRequest(new URL("http://localhost:3000/dashboard"));
      const response = await proxy(req);

      expect(response.status).toBe(200);
    });

    it("protects tracker page", async () => {
      mockGetToken.mockResolvedValue(null);

      const req = new NextRequest(new URL("http://localhost:3000/tracker"));
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login");
    });

    it("protects profile page", async () => {
      mockGetToken.mockResolvedValue(null);

      const req = new NextRequest(new URL("http://localhost:3000/profile"));
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login");
    });

    it("protects CV editor page", async () => {
      mockGetToken.mockResolvedValue(null);

      const req = new NextRequest(new URL("http://localhost:3000/cv"));
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login");
    });
  });

  describe("Admin Routes", () => {
    it("blocks regular users from admin pages", async () => {
      mockGetToken.mockResolvedValue({
        id: "user-123",
        email: "user@example.com",
        role: "USER",
        isTrusted: false,
      } as never);

      const req = new NextRequest(new URL("http://localhost:3000/admin/flags"));
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/dashboard");
      expect(response.headers.get("location")).toContain("error=unauthorized");
    });

    it("allows ADMIN role to access admin pages", async () => {
      mockGetToken.mockResolvedValue({
        id: "admin-123",
        email: "admin@example.com",
        role: "ADMIN",
        isTrusted: true,
      } as never);

      const req = new NextRequest(new URL("http://localhost:3000/admin/flags"));
      const response = await proxy(req);

      expect(response.status).toBe(200);
    });

    it("allows OWNER role to access admin pages", async () => {
      mockGetToken.mockResolvedValue({
        id: "owner-123",
        email: "owner@example.com",
        role: "OWNER",
        isTrusted: true,
      } as never);

      const req = new NextRequest(new URL("http://localhost:3000/admin/ux-planner"));
      const response = await proxy(req);

      expect(response.status).toBe(200);
    });

    it("allows trusted users to access admin pages", async () => {
      mockGetToken.mockResolvedValue({
        id: "trusted-123",
        email: "trusted@example.com",
        role: "USER",
        isTrusted: true,
      } as never);

      const req = new NextRequest(new URL("http://localhost:3000/admin/ux-planner"));
      const response = await proxy(req);

      expect(response.status).toBe(200);
    });

    it("blocks unauthenticated users from admin pages", async () => {
      mockGetToken.mockResolvedValue(null);

      const req = new NextRequest(new URL("http://localhost:3000/admin/flags"));
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/login");
    });
  });

  describe("Callback URL Preservation", () => {
    it("preserves intended destination in callbackUrl", async () => {
      mockGetToken.mockResolvedValue(null);

      const req = new NextRequest(new URL("http://localhost:3000/tracker"));
      const response = await proxy(req);

      expect(response.headers.get("location")).toContain("callbackUrl=%2Ftracker");
    });

    it("preserves nested paths in callbackUrl", async () => {
      mockGetToken.mockResolvedValue(null);

      const req = new NextRequest(new URL("http://localhost:3000/admin/flags"));
      const response = await proxy(req);

      expect(response.headers.get("location")).toContain("callbackUrl=%2Fadmin%2Fflags");
    });
  });
});
