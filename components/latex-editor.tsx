/**
 * LaTeX Editor Component
 *
 * CodeMirror-based editor with LaTeX syntax highlighting.
 * Supports light/dark themes matching the app design system.
 */

"use client";

import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { latex } from "codemirror-lang-latex";
import { useTheme } from "next-themes";
import { useCallback, useMemo, type JSX } from "react";

interface LaTeXEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

/**
 * Light theme matching Nordic design system
 */
const nordicLightTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#ffffff",
      color: "#1e293b",
    },
    ".cm-content": {
      caretColor: "#3b82f6",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    ".cm-cursor": {
      borderLeftColor: "#3b82f6",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "#bfdbfe",
    },
    ".cm-activeLine": {
      backgroundColor: "#f1f5f9",
    },
    ".cm-gutters": {
      backgroundColor: "#f8fafc",
      color: "#94a3b8",
      border: "none",
      borderRight: "1px solid #e2e8f0",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#f1f5f9",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 8px 0 16px",
    },
  },
  { dark: false }
);

/**
 * Syntax highlighting colors for light theme
 */
const nordicLightHighlight = EditorView.theme(
  {
    // LaTeX commands (\command)
    ".tok-keyword": { color: "#7c3aed" }, // Purple for commands
    ".tok-name": { color: "#0891b2" }, // Cyan for identifiers
    // Math mode ($...$)
    ".tok-number": { color: "#059669" }, // Green for numbers
    ".tok-string": { color: "#dc2626" }, // Red for strings
    // Comments (%)
    ".tok-comment": { color: "#64748b", fontStyle: "italic" },
    // Braces and brackets
    ".tok-bracket": { color: "#ea580c" }, // Orange for brackets
    ".tok-operator": { color: "#0284c7" }, // Blue for operators
    // Environment names
    ".tok-typeName": { color: "#be185d" }, // Pink for type names
    ".tok-variableName": { color: "#1e293b" }, // Default for variables
  },
  { dark: false }
);

export function LaTeXEditor({
  value,
  onChange,
  placeholder = "Enter LaTeX source...",
  className = "",
  readOnly = false,
}: LaTeXEditorProps): JSX.Element {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleChange = useCallback(
    (val: string) => {
      onChange(val);
    },
    [onChange]
  );

  const extensions = useMemo(
    () =>
      [
        latex(),
        EditorView.lineWrapping,
        isDark ? [] : [nordicLightTheme, nordicLightHighlight],
      ].flat(),
    [isDark]
  );

  const theme = isDark ? oneDark : "light";

  return (
    <CodeMirror
      value={value}
      onChange={handleChange}
      extensions={extensions}
      theme={theme}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`h-full overflow-auto rounded-md border border-input ${className}`}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: true,
        highlightActiveLine: true,
        foldGutter: true,
        dropCursor: true,
        allowMultipleSelections: true,
        indentOnInput: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: false, // Disable for now, LaTeX autocomplete would need custom config
        rectangularSelection: true,
        crosshairCursor: false,
        highlightSelectionMatches: true,
        closeBracketsKeymap: true,
        searchKeymap: true,
        foldKeymap: true,
        completionKeymap: false,
        lintKeymap: false,
      }}
    />
  );
}
