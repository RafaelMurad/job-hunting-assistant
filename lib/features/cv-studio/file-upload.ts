/**
 * CV File Upload Handler
 *
 * Handles file selection, validation, and preparation for parsing.
 * Supports drag-and-drop and click-to-upload interfaces.
 *
 * @learning File API, Drag and Drop API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
 */

import {
  FileUploadResult,
  SupportedFormat,
  detectFormat,
  getSupportedExtensions,
} from "./types";

// ===================
// CONSTANTS
// ===================

/** Maximum file size in bytes (10MB) */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** MIME types for supported formats */
const MIME_TYPES: Record<SupportedFormat, string[]> = {
  pdf: ["application/pdf"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  doc: ["application/msword"],
  txt: ["text/plain"],
  json: ["application/json"],
  rtf: ["application/rtf", "text/rtf"],
};

// ===================
// VALIDATION
// ===================

/**
 * Validate uploaded file
 *
 * @learning File validation is crucial for security and UX
 *
 * TODO: Implement file type validation
 * - Check MIME type matches extension
 * - Validate file magic bytes for PDFs (starts with %PDF)
 * - Check file isn't empty
 *
 * @example
 * ```typescript
 * const result = validateFile(file);
 * if (!result.valid) {
 *   showError(result.error);
 * }
 * ```
 */
export function validateFile(file: File): {
  valid: boolean;
  error?: string;
  format?: SupportedFormat;
} {
  // TODO: Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // TODO: Check file size isn't 0
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  // TODO: Detect and validate format
  const format = detectFormat(file);
  if (!format) {
    return {
      valid: false,
      error: `Unsupported file format. Supported: ${getSupportedExtensions().join(", ")}`,
    };
  }

  // TODO: Validate MIME type matches format
  // This helps prevent renamed malicious files
  const validMimeTypes = MIME_TYPES[format];
  if (!validMimeTypes.includes(file.type) && file.type !== "") {
    // Some browsers don't set MIME type, so we allow empty
    console.warn(
      `MIME type mismatch: expected ${validMimeTypes.join(" or ")}, got ${file.type}`
    );
  }

  return { valid: true, format };
}

// ===================
// FILE READING
// ===================

/**
 * Read file as text
 *
 * @learning FileReader API for reading file contents
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *
 * TODO: Implement text file reading
 * - Use FileReader.readAsText() for text files
 * - Handle encoding (UTF-8 default)
 * - Return Promise for async handling
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      resolve(text);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    // TODO: Read as text with UTF-8 encoding
    reader.readAsText(file, "UTF-8");
  });
}

/**
 * Read file as ArrayBuffer (for binary formats like PDF)
 *
 * @learning ArrayBuffer for binary file processing
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
 *
 * TODO: Implement binary file reading
 * - Use FileReader.readAsArrayBuffer()
 * - ArrayBuffer needed for PDF.js and mammoth.js
 */
export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      resolve(buffer);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    // TODO: Read as ArrayBuffer for binary processing
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read file as Data URL (for preview)
 *
 * @learning Data URLs for inline file display
 */
export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      resolve(dataUrl);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

// ===================
// DRAG AND DROP
// ===================

/**
 * Handle drag events for drop zone
 *
 * @learning Drag and Drop API event handling
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
 *
 * TODO: Implement drag handlers
 * - preventDefault() on dragover to allow drop
 * - Extract files from dataTransfer on drop
 * - Visual feedback during drag
 */
export function createDropZoneHandlers(
  onFileDrop: (file: File) => void,
  onDragStateChange?: (isDragging: boolean) => void
) {
  return {
    /**
     * Handle dragenter - file enters drop zone
     */
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDragStateChange?.(true);
    },

    /**
     * Handle dragleave - file leaves drop zone
     */
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only trigger if leaving the actual drop zone, not a child
      if (e.currentTarget === e.target) {
        onDragStateChange?.(false);
      }
    },

    /**
     * Handle dragover - file is over drop zone
     * MUST call preventDefault() to allow drop
     */
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },

    /**
     * Handle drop - file is dropped
     */
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDragStateChange?.(false);

      // TODO: Extract files from dataTransfer
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        // Only handle first file
        onFileDrop(files[0]);
      }
    },
  };
}

// ===================
// UPLOAD HANDLER
// ===================

/**
 * Main upload handler
 *
 * Validates and prepares file for parsing.
 *
 * @example
 * ```typescript
 * const result = await handleFileUpload(file);
 * if (result.success) {
 *   // Proceed to parse
 *   const parsed = await parseCV(result.file, result.format);
 * }
 * ```
 */
export async function handleFileUpload(file: File): Promise<FileUploadResult> {
  // Validate file
  const validation = validateFile(file);

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  return {
    success: true,
    file,
    format: validation.format,
  };
}

// ===================
// EXERCISES
// ===================

/**
 * Exercise 1: Add Magic Byte Validation
 *
 * Magic bytes are the first few bytes of a file that identify its type.
 * This is more secure than relying on file extension.
 *
 * PDF magic bytes: [0x25, 0x50, 0x44, 0x46] = "%PDF"
 * DOCX magic bytes: [0x50, 0x4B, 0x03, 0x04] = "PK.." (ZIP format)
 *
 * TODO: Implement validateMagicBytes(file: File): Promise<boolean>
 * - Read first 4 bytes using ArrayBuffer slice
 * - Compare against known magic bytes
 * - Return true if valid
 *
 * @see https://en.wikipedia.org/wiki/List_of_file_signatures
 */

/**
 * Exercise 2: Add Progress Tracking
 *
 * For large files, show upload progress.
 *
 * TODO: Implement readFileWithProgress
 * - Use FileReader progress event
 * - Calculate percentage: (loaded / total) * 100
 * - Call progress callback
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileReader/progress_event
 */

/**
 * Exercise 3: Add Multiple File Handling
 *
 * Allow users to upload multiple CVs for comparison.
 *
 * TODO: Implement handleMultipleFiles
 * - Accept FileList or File[]
 * - Validate each file
 * - Return array of results
 * - Consider parallel vs sequential processing
 */
