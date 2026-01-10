/**
 * Proxy Tests (Next.js 16+ Route Protection)
 *
 * Tests route protection using Neon Auth session cookies
 */

import proxy from "@/proxy";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Helper to create a request with optional session cookie
 */
function createRequest(url: string, hasSession = false): NextRequest {
  const req = new NextRequest(new URL(url));
  if (hasSession) {
    // Simulate Neon Auth session cookie
    req.cookies.set("better-auth.session_token", "mock-session-token");
  }
  return req;
}

describe("Middleware - Route Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Public Routes", () => {
    it("allows access to landing page without auth", async () => {
      const req = createRequest("http://localhost:3000/");
      const response = await proxy(req);

      expect(response.status).toBe(200);
    });

    it("allows access to auth sign-in page without auth", async () => {
      const req = createRequest("http://localhost:3000/auth/sign-in");
      const response = await proxy(req);

      expect(response.status).toBe(200);
    });

    it("allows access to auth sign-up page without auth", async () => {
      const req = createRequest("http://localhost:3000/auth/sign-up");
      const response = await proxy(req);

      expect(response.status).toBe(200);
    });

    it("redirects authenticated users from sign-in to dashboard", async () => {
      const req = createRequest("http://localhost:3000/auth/sign-in", true);
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/dashboard");
    });
  });

  describe("Protected Routes", () => {
    it("redirects unauthenticated users to sign-in", async () => {
      const req = createRequest("http://localhost:3000/dashboard");
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/auth/sign-in");
      expect(response.headers.get("location")).toContain("callbackUrl");
    });

    it("allows authenticated users to access dashboard", async () => {
      const req = createRequest("http://localhost:3000/dashboard", true);
      const response = await proxy(req);

      expect(response.status).toBe(200);
    });

    it("protects tracker page", async () => {
      const req = createRequest("http://localhost:3000/tracker");
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/auth/sign-in");
    });

    it("protects profile page", async () => {
      const req = createRequest("http://localhost:3000/profile");
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/auth/sign-in");
    });

    it("protects CV editor page", async () => {
      const req = createRequest("http://localhost:3000/cv");
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/auth/sign-in");
    });

    it("protects account settings page", async () => {
      const req = createRequest("http://localhost:3000/account/settings");
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/auth/sign-in");
    });
  });

  describe("Admin Routes", () => {
    it("redirects unauthenticated users from admin pages", async () => {
      const req = createRequest("http://localhost:3000/admin/flags");
      const response = await proxy(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/auth/sign-in");
    });

    it("allows authenticated users to access admin pages", async () => {
      // Note: With Neon Auth only, role checks happen in Server Components
      // Proxy just checks for authentication
      const req = createRequest("http://localhost:3000/admin/flags", true);
      const response = await proxy(req);

      expect(response.status).toBe(200);
    });
  });

  describe("Callback URL Preservation", () => {
    it("preserves intended destination in callbackUrl", async () => {
      const req = createRequest("http://localhost:3000/tracker");
      const response = await proxy(req);

      expect(response.headers.get("location")).toContain("callbackUrl=%2Ftracker");
    });

    it("preserves nested paths in callbackUrl", async () => {
      const req = createRequest("http://localhost:3000/admin/flags");
      const response = await proxy(req);

      expect(response.headers.get("location")).toContain("callbackUrl=%2Fadmin%2Fflags");
    });
  });

  describe("Security Guardrails", () => {
    it("blocks Server Action requests to non-API routes", async () => {
      const req = createRequest("http://localhost:3000/dashboard", true);
      req.headers.set("next-action", "some-action-id");

      const response = await proxy(req);

      expect(response.status).toBe(403);
    });

    it("blocks non-GET methods to non-API routes", async () => {
      const req = new NextRequest(new URL("http://localhost:3000/dashboard"), {
        method: "POST",
      });
      req.cookies.set("better-auth.session_token", "mock-session-token");

      const response = await proxy(req);

      expect(response.status).toBe(405);
    });

    it("allows GET requests to API routes", async () => {
      const req = createRequest("http://localhost:3000/api/neon-auth/session");
      const response = await proxy(req);

      expect(response.status).toBe(200);
    });
  });
});
