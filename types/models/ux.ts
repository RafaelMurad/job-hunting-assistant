/**
 * UX Research Domain Model Types
 *
 * Type definitions for UX research platform functionality.
 *
 * @module types/models/ux
 */

import type { UxSeverity, UxEffort, UxStatus } from "../database";

/**
 * UX Persona
 */
export interface UxPersona {
  id: string;
  name: string;
  type: string;
  description: string;
  goals: string[];
  frustrations: string[];
  behaviors: string[];
  status: UxStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Journey Step
 */
export interface UxJourneyStep {
  id: string;
  journeyId: string;
  orderIndex: number;
  stage: string;
  action: string;
  thinking: string;
  feeling: string;
  touchpoint: string;
  opportunity?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Journey
 */
export interface UxJourney {
  id: string;
  name: string;
  description: string;
  personaId?: string | null;
  status: UxStatus;
  steps: UxJourneyStep[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pain Point
 */
export interface UxPainPoint {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: UxSeverity;
  effort: UxEffort;
  userQuote?: string | null;
  solution?: string | null;
  status: UxStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * UX Design Principle
 */
export interface UxPrinciple {
  id: string;
  name: string;
  description: string;
  rationale: string;
  examples: {
    do: string[];
    dont: string[];
  };
  priority: number;
  status: UxStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input schemas for UX entities
 */
export interface CreatePersonaInput {
  name: string;
  type: string;
  description: string;
  goals: string[];
  frustrations: string[];
  behaviors: string[];
  status?: UxStatus;
}

export interface CreateJourneyInput {
  name: string;
  description: string;
  personaId?: string;
  steps: Omit<UxJourneyStep, "id" | "journeyId" | "createdAt" | "updatedAt">[];
  status?: UxStatus;
}

export interface CreatePainPointInput {
  title: string;
  description: string;
  category: string;
  severity: UxSeverity;
  effort: UxEffort;
  userQuote?: string;
  solution?: string;
  status?: UxStatus;
}

export interface CreatePrincipleInput {
  name: string;
  description: string;
  rationale: string;
  examples: {
    do: string[];
    dont: string[];
  };
  priority?: number;
  status?: UxStatus;
}

export type { UxSeverity, UxEffort, UxStatus };
