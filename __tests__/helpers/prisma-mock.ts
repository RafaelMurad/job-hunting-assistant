/**
 * Prisma Mock Helper
 *
 * Provides a mocked Prisma client for integration testing tRPC routers
 * and API routes without requiring a real database connection.
 *
 * Usage:
 *   import { prismaMock, resetPrismaMock } from "@/__tests__/helpers/prisma-mock";
 *
 *   beforeEach(() => resetPrismaMock());
 *
 *   it("fetches user", async () => {
 *     prismaMock.user.findFirst.mockResolvedValue({ id: "1", name: "Test" });
 *     // ... test code
 *   });
 */

import { type PrismaClient } from "@prisma/client";
import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Type for the mocked Prisma client
export type MockPrismaClient = DeepMockProxy<PrismaClient>;

/**
 * Reset all Prisma mocks between tests.
 * Call this in beforeEach() to ensure test isolation.
 */
export function resetPrismaMock(): void {
  mockReset(prismaMock);
}

/**
 * Setup Prisma mock for the test suite.
 * This mocks the lib/db module to return our mocked client.
 */
export function setupPrismaMock(): void {
  vi.mock("@/lib/db", () => ({
    prisma: prismaMock,
  }));
}

/**
 * Create a mock tRPC context with the mocked Prisma client.
 * Use this when calling tRPC procedures directly in tests.
 */
export function createMockContext(): { prisma: MockPrismaClient } {
  return {
    prisma: prismaMock,
  };
}

/**
 * Auto-setup: Reset mocks before each test.
 * Import this file to enable automatic cleanup.
 */
beforeEach(() => {
  resetPrismaMock();
});
