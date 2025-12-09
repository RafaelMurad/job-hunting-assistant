/**
 * Test utilities for consistent test setup across the application
 * Industry standard: Custom render function with providers
 */

import { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";

/**
 * Custom render function that wraps components with necessary providers
 * Use this instead of @testing-library/react's render in tests
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions
): ReturnType<typeof render> {
  // Add providers here as needed (e.g., theme, router, state management)
  // For now, just a simple wrapper - will extend as app grows
  return render(ui, { ...options });
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// Override render method with custom implementation
export { renderWithProviders as render };
