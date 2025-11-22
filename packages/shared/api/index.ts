/**
 * Shared API Client
 *
 * API functions used by both web and mobile apps.
 */

import type { User, Application } from "../types";

// Base URL - configure per platform
let baseUrl = "";

export function setApiBaseUrl(url: string) {
  baseUrl = url;
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * User API
 */
export const userApi = {
  get: () => apiFetch<User>("/api/user"),

  update: (data: Partial<User>) =>
    apiFetch<User>("/api/user", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/**
 * Applications API
 */
export const applicationsApi = {
  list: (userId: string) =>
    apiFetch<Application[]>(`/api/applications?userId=${userId}`),

  get: (id: string) => apiFetch<Application>(`/api/applications/${id}`),

  create: (data: Omit<Application, "id" | "createdAt" | "updatedAt">) =>
    apiFetch<Application>("/api/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Application>) =>
    apiFetch<Application>(`/api/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/applications/${id}`, {
      method: "DELETE",
    }),
};

/**
 * Analysis API
 */
export const analysisApi = {
  analyze: (jobDescription: string, userCV: string) =>
    apiFetch<{ analysis: string }>("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ jobDescription, userCV }),
    }),
};
