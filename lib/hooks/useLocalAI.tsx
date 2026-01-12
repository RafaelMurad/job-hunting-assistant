/**
 * useLocalAI Hook
 *
 * React hook for managing local AI capabilities using Transformers.js.
 * Provides model loading, embedding generation, and match scoring.
 *
 * @module lib/hooks/useLocalAI
 */

"use client";

import {
  calculateInstantMatchScore,
  EmbeddingService,
  hybridSearch,
  LOCAL_AI_MODELS,
  type ModelLoadProgress,
  type SemanticSearchResult,
} from "@/lib/ai/local";
import type { StoredApplication } from "@/lib/storage/interface";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from "react";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Return type for the useLocalAI hook.
 */
export interface UseLocalAIReturn {
  // Status
  /** Whether the AI service is ready to use */
  isReady: boolean;
  /** Whether models are currently loading */
  isLoading: boolean;
  /** Loading progress (0-100) */
  loadProgress: number;
  /** Current status message */
  statusMessage: string;
  /** Error message if initialization failed */
  error: string | null;

  // Actions
  /** Initialize the AI service (downloads models on first use) */
  initialize: () => Promise<void>;

  // Core features
  /** Calculate match score between CV and job description */
  calculateMatchScore: (cvText: string, jobDescription: string) => Promise<number | null>;
  /** Search applications semantically */
  searchApplications: (
    query: string,
    applications: StoredApplication[]
  ) => Promise<SemanticSearchResult<StoredApplication>[]>;

  // Utility
  /** Approximate model size */
  modelSize: string;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * Hook for local AI features powered by Transformers.js.
 *
 * @param autoInitialize - Whether to automatically initialize on mount (default: false)
 *
 * @example
 * ```tsx
 * const { isReady, initialize, calculateMatchScore } = useLocalAI();
 *
 * useEffect(() => {
 *   initialize();
 * }, [initialize]);
 *
 * const handleCalculate = async () => {
 *   if (isReady) {
 *     const score = await calculateMatchScore(cvText, jobDescription);
 *     console.log(`Match: ${score}%`);
 *   }
 * };
 * ```
 */
export function useLocalAI(autoInitialize = false): UseLocalAIReturn {
  // Service reference
  const serviceRef = useRef<EmbeddingService | null>(null);

  // State
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Not initialized");
  const [error, setError] = useState<string | null>(null);

  // Initialization flag to prevent double initialization
  const initializingRef = useRef(false);

  /**
   * Progress callback for model loading.
   */
  const handleProgress = useCallback((progress: ModelLoadProgress) => {
    setLoadProgress(progress.progress);
    setStatusMessage(progress.status);
    if (progress.loaded) {
      setIsReady(true);
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize the AI service.
   */
  const initialize = useCallback(async () => {
    // Prevent double initialization
    if (initializingRef.current || isReady) {
      return;
    }

    // Skip on server
    if (typeof window === "undefined") {
      return;
    }

    initializingRef.current = true;
    setIsLoading(true);
    setError(null);
    setStatusMessage("Initializing...");

    try {
      const service = EmbeddingService.getInstance();
      serviceRef.current = service;

      await service.initialize(handleProgress);

      setIsReady(true);
      setIsLoading(false);
      setStatusMessage("Ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initialize local AI";
      setError(message);
      setIsLoading(false);
      setStatusMessage("Failed to initialize");
      console.error("[useLocalAI] Initialization error:", err);
    } finally {
      initializingRef.current = false;
    }
  }, [isReady, handleProgress]);

  /**
   * Calculate match score between CV and job description.
   */
  const calculateMatchScore = useCallback(
    async (cvText: string, jobDescription: string): Promise<number | null> => {
      if (!serviceRef.current || !isReady) {
        return null;
      }

      try {
        return await calculateInstantMatchScore(cvText, jobDescription, serviceRef.current);
      } catch (err) {
        console.error("[useLocalAI] Match score error:", err);
        return null;
      }
    },
    [isReady]
  );

  /**
   * Search applications semantically.
   */
  const searchApplications = useCallback(
    async (
      query: string,
      applications: StoredApplication[]
    ): Promise<SemanticSearchResult<StoredApplication>[]> => {
      if (!serviceRef.current) {
        // Fallback to hybrid search with null service (text-only)
        return hybridSearch(query, applications, null);
      }

      try {
        return await hybridSearch(query, applications, serviceRef.current);
      } catch (err) {
        console.error("[useLocalAI] Search error:", err);
        // Fallback to text search
        return hybridSearch(query, applications, null);
      }
    },
    []
  );

  // Auto-initialize if requested
  useEffect(() => {
    if (autoInitialize && !isReady && !isLoading && !error) {
      void initialize();
    }
  }, [autoInitialize, isReady, isLoading, error, initialize]);

  return {
    isReady,
    isLoading,
    loadProgress,
    statusMessage,
    error,
    initialize,
    calculateMatchScore,
    searchApplications,
    modelSize: `${LOCAL_AI_MODELS.embeddings.sizeMB}MB`,
  };
}

// =============================================================================
// CONTEXT FOR GLOBAL STATE (Optional)
// =============================================================================

/**
 * Context for sharing local AI state across components.
 */
const LocalAIContext = createContext<UseLocalAIReturn | null>(null);

/**
 * Provider for local AI context.
 */
export function LocalAIProvider({
  children,
  autoInitialize = false,
}: {
  children: ReactNode;
  autoInitialize?: boolean;
}): JSX.Element {
  const localAI = useLocalAI(autoInitialize);

  return <LocalAIContext.Provider value={localAI}>{children}</LocalAIContext.Provider>;
}

/**
 * Hook to access shared local AI context.
 * Falls back to creating a new instance if no provider is found.
 */
export function useLocalAIContext(): UseLocalAIReturn {
  const context = useContext(LocalAIContext);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return context ?? useLocalAI();
}
