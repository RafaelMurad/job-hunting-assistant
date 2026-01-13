"use client";

/**
 * Zero-Knowledge Auth Context
 *
 * Manages authentication state for zero-knowledge mode.
 * The masterKey is held in memory only - never persisted.
 * Session token allows re-authentication without password.
 *
 * @module lib/zk/auth-context
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { deriveKeys, hashAuthKey, importMasterKey, clearKey } from "@/lib/crypto";

// ============================================
// Types
// ============================================

export interface ZkUser {
  id: string;
  email: string;
}

export interface ZkAuthState {
  user: ZkUser | null;
  masterKey: Uint8Array | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface ZkAuthActions {
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export type ZkAuthContextValue = ZkAuthState & ZkAuthActions;

// ============================================
// Context
// ============================================

const ZkAuthContext = createContext<ZkAuthContextValue | null>(null);

// ============================================
// Session Storage Keys
// ============================================

const SESSION_TOKEN_KEY = "zk_session_token";
const SESSION_EMAIL_KEY = "zk_session_email";
const MASTER_KEY_KEY = "zk_master_key"; // Only stored in sessionStorage (cleared on tab close)

// ============================================
// Provider
// ============================================

interface ZkAuthProviderProps {
  children: ReactNode;
}

export function ZkAuthProvider({ children }: ZkAuthProviderProps): ReactNode {
  const [user, setUser] = useState<ZkUser | null>(null);
  const [masterKey, setMasterKey] = useState<Uint8Array | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null && masterKey !== null;

  // ----------------------------------------
  // Session Restoration
  // ----------------------------------------

  useEffect(() => {
    // Local clear function to avoid dependency issues
    const clearStoredSession = (): void => {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(SESSION_EMAIL_KEY);
      sessionStorage.removeItem(MASTER_KEY_KEY);
    };

    const restoreSession = async (): Promise<void> => {
      try {
        // Check for existing session
        const token = localStorage.getItem(SESSION_TOKEN_KEY);
        const email = localStorage.getItem(SESSION_EMAIL_KEY);
        const storedMasterKey = sessionStorage.getItem(MASTER_KEY_KEY);

        if (!token || !email) {
          setIsLoading(false);
          return;
        }

        // If we have the masterKey in sessionStorage, restore full session
        if (storedMasterKey) {
          // Verify token is still valid
          const response = await fetch("/api/zk/vault", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            // Extract userId from token
            const decoded = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
            const [userId] = decoded.split(".");

            if (userId) {
              setUser({ id: userId, email });
              setMasterKey(importMasterKey(storedMasterKey));
            }
          } else {
            // Token expired, clear session
            clearStoredSession();
          }
        }
        // If no masterKey in sessionStorage, user needs to re-enter password
        // (tab was closed, sessionStorage was cleared)
      } catch (error) {
        console.error("Session restoration error:", error);
        clearStoredSession();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ----------------------------------------
  // Clear Session Helper
  // ----------------------------------------

  const clearSession = useCallback((): void => {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_EMAIL_KEY);
    sessionStorage.removeItem(MASTER_KEY_KEY);
    setUser(null);
    if (masterKey) {
      clearKey(masterKey);
    }
    setMasterKey(null);
  }, [masterKey]);

  // ----------------------------------------
  // Register
  // ----------------------------------------

  const register = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      // Derive keys client-side
      const keys = await deriveKeys(password, email);
      const authKeyHash = hashAuthKey(keys.authKey);

      // Register with server
      const response = await fetch("/api/zk/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, authKeyHash }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }

      // Clear authKey from memory (no longer needed)
      clearKey(keys.authKey);

      // Auto-login after registration
      await loginWithKeys(email, keys.masterKey, keys.exportedMasterKey, authKeyHash);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ----------------------------------------
  // Login
  // ----------------------------------------

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      // Derive keys client-side
      const keys = await deriveKeys(password, email);
      const authKeyHash = hashAuthKey(keys.authKey);

      // Clear authKey from memory (no longer needed after hashing)
      clearKey(keys.authKey);

      await loginWithKeys(email, keys.masterKey, keys.exportedMasterKey, authKeyHash);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ----------------------------------------
  // Login with Keys (internal)
  // ----------------------------------------

  const loginWithKeys = async (
    email: string,
    derivedMasterKey: Uint8Array,
    exportedMasterKey: string,
    authKeyHash: string
  ): Promise<void> => {
    // Authenticate with server
    const response = await fetch("/api/zk/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, authKeyHash }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();

    // Store session
    localStorage.setItem(SESSION_TOKEN_KEY, data.token);
    localStorage.setItem(SESSION_EMAIL_KEY, email);
    sessionStorage.setItem(MASTER_KEY_KEY, exportedMasterKey);

    setUser({ id: data.userId, email });
    setMasterKey(derivedMasterKey);
  };

  // ----------------------------------------
  // Logout
  // ----------------------------------------

  const logout = useCallback(async (): Promise<void> => {
    // Clear masterKey from memory securely
    if (masterKey) {
      clearKey(masterKey);
    }

    clearSession();
  }, [masterKey, clearSession]);

  // ----------------------------------------
  // Context Value
  // ----------------------------------------

  const value = useMemo<ZkAuthContextValue>(
    () => ({
      user,
      masterKey,
      isLoading,
      isAuthenticated,
      register,
      login,
      logout,
    }),
    [user, masterKey, isLoading, isAuthenticated, register, login, logout]
  );

  return <ZkAuthContext.Provider value={value}>{children}</ZkAuthContext.Provider>;
}

// ============================================
// Hook
// ============================================

export function useZkAuth(): ZkAuthContextValue {
  const context = useContext(ZkAuthContext);

  if (!context) {
    throw new Error("useZkAuth must be used within a ZkAuthProvider");
  }

  return context;
}

// ============================================
// Session Token Hook (for API calls)
// ============================================

export function useZkSessionToken(): string | null {
  // Use lazy initialization to avoid calling localStorage during SSR
  const [token] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(SESSION_TOKEN_KEY);
  });

  return token;
}
