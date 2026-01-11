"use client";

/**
 * Mode Gate Component
 *
 * Conditional rendering wrapper that shows content based on
 * the current app mode (local vs demo).
 *
 * @module components/mode-gate
 */

import { useIsLocalMode } from "@/lib/storage/provider";
import type { ReactNode, JSX } from "react";

// ============================================
// Types
// ============================================

interface ModeGateProps {
  /**
   * Which mode to render children in
   */
  mode: "local" | "demo";
  /**
   * Content to render when mode matches
   */
  children: ReactNode;
  /**
   * Optional content to render when mode doesn't match
   * If not provided, renders nothing when mode doesn't match
   */
  fallback?: ReactNode;
}

// ============================================
// Component
// ============================================

/**
 * Mode Gate
 *
 * Conditionally renders children based on the current app mode.
 *
 * @example
 * ```tsx
 * // Only show in local mode
 * <ModeGate mode="local">
 *   <ApiKeySettings />
 * </ModeGate>
 *
 * // Only show in demo mode
 * <ModeGate mode="demo">
 *   <SignUpPrompt />
 * </ModeGate>
 *
 * // Show different content per mode
 * <ModeGate mode="local" fallback={<SignInButton />}>
 *   <LocalUserGreeting />
 * </ModeGate>
 * ```
 */
export function ModeGate({ mode, children, fallback = null }: ModeGateProps): JSX.Element | null {
  const isLocalMode = useIsLocalMode();

  // Check if current mode matches requested mode
  const modeMatches = mode === "local" ? isLocalMode : !isLocalMode;

  if (modeMatches) {
    return <>{children}</>;
  }

  // Render fallback if provided, otherwise null
  return <>{fallback}</>;
}
