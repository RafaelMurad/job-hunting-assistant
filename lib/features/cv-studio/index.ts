/**
 * CV Studio - Complete CV Management Solution
 *
 * Import, edit, analyze, and export professional CVs with AI assistance.
 *
 * @module cv-studio
 *
 * @example
 * ```tsx
 * import { useFeatureFlag } from '@/lib/feature-flags';
 * import { CVStudio } from '@/lib/features/cv-studio';
 *
 * function App() {
 *   const isCVStudioEnabled = useFeatureFlag('cv_studio');
 *
 *   if (!isCVStudioEnabled) return null;
 *
 *   return <CVStudio />;
 * }
 * ```
 */

// Types
export * from "./types";

// File handling
export { handleFileUpload, validateFile, createDropZoneHandlers } from "./file-upload";

// Parsing
export { parseCV, extractCVData } from "./parsers";

// Analysis
export { analyzeCV, analyzeCV_Streaming, createAnalysisPrompt } from "./analyzer";

// Export
export {
  exportToPDF,
  exportToDOCX,
  exportToJSON,
  printCV,
  downloadBlob,
  CV_TEMPLATES,
  DEFAULT_STYLING,
} from "./exporter";

// Components
export { CVEditor } from "./components/CVEditor";
