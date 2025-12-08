/**
 * Vercel Blob Storage Helpers
 *
 * WHY: Store CV files (PDFs and LaTeX source) in Vercel Blob for persistence.
 * Users can upload, edit, and download their CVs without losing data.
 *
 * WHAT: Upload/download helpers for PDF and LaTeX files with proper naming.
 *
 * HOW: Uses @vercel/blob for serverless blob storage with CDN delivery.
 */

import { put, del, list } from "@vercel/blob";

/**
 * Blob storage paths for CV files
 */
const CV_PATHS = {
  pdf: (userId: string) => `cv/${userId}/cv.pdf`,
  latex: (userId: string) => `cv/${userId}/cv.tex`,
} as const;

/**
 * Upload a PDF file to Blob storage
 */
export async function uploadCVPdf(
  userId: string,
  pdfBuffer: Buffer,
  _filename?: string
): Promise<string> {
  const path = CV_PATHS.pdf(userId);

  const blob = await put(path, pdfBuffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/pdf",
  });

  return blob.url;
}

/**
 * Upload LaTeX source to Blob storage
 */
export async function uploadCVLatex(userId: string, latexContent: string): Promise<string> {
  const path = CV_PATHS.latex(userId);

  const blob = await put(path, latexContent, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "text/x-tex",
  });

  return blob.url;
}

/**
 * Delete all CV files for a user
 */
export async function deleteCVFiles(userId: string): Promise<void> {
  const prefix = `cv/${userId}/`;

  // List all files with this prefix
  const { blobs } = await list({ prefix });

  // Delete each blob
  await Promise.all(blobs.map((blob) => del(blob.url)));
}

/**
 * Download content from a Blob URL
 */
export async function downloadFromBlob(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download from blob: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Download LaTeX content as text
 */
export async function downloadLatexContent(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download LaTeX: ${response.statusText}`);
  }

  return response.text();
}
