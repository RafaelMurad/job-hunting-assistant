/**
 * DiffView Component
 *
 * Displays a line-by-line diff between two text contents.
 * Uses the `diff` library to compute changes and shows:
 * - Green background for additions
 * - Red background for deletions
 * - No background for unchanged lines
 *
 * Used in the CV editor to show what changed after AI modifications.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as Diff from "diff";
import { useMemo, type JSX } from "react";

export interface DiffViewProps {
  /** Previous content (before change) */
  before: string;
  /** Current content (after change) */
  after: string;
  /** Callback to close the diff view */
  onClose: () => void;
  /** Optional title */
  title?: string;
}

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumber: { before: number | null; after: number | null };
}

/**
 * Compute line-by-line diff with line numbers
 */
function computeDiff(before: string, after: string): DiffLine[] {
  const changes = Diff.diffLines(before, after);
  const lines: DiffLine[] = [];

  let beforeLineNum = 1;
  let afterLineNum = 1;

  for (const change of changes) {
    const content = change.value;
    // Split into individual lines, removing trailing empty line from split
    const contentLines = content.split("\n");
    if (contentLines[contentLines.length - 1] === "") {
      contentLines.pop();
    }

    for (const line of contentLines) {
      if (change.added) {
        lines.push({
          type: "added",
          content: line,
          lineNumber: { before: null, after: afterLineNum++ },
        });
      } else if (change.removed) {
        lines.push({
          type: "removed",
          content: line,
          lineNumber: { before: beforeLineNum++, after: null },
        });
      } else {
        lines.push({
          type: "unchanged",
          content: line,
          lineNumber: { before: beforeLineNum++, after: afterLineNum++ },
        });
      }
    }
  }

  return lines;
}

/**
 * Get statistics about the diff
 */
function getDiffStats(lines: DiffLine[]): { added: number; removed: number; unchanged: number } {
  return lines.reduce(
    (acc, line) => {
      if (line.type === "added") acc.added++;
      else if (line.type === "removed") acc.removed++;
      else acc.unchanged++;
      return acc;
    },
    { added: 0, removed: 0, unchanged: 0 }
  );
}

/**
 * DiffView Component
 */
export function DiffView({
  before,
  after,
  onClose,
  title = "Changes",
}: DiffViewProps): JSX.Element {
  const diffLines = useMemo(() => computeDiff(before, after), [before, after]);
  const stats = useMemo(() => getDiffStats(diffLines), [diffLines]);

  // If no changes, show a message
  const hasChanges = stats.added > 0 || stats.removed > 0;

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg">{title}</CardTitle>
            {hasChanges && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-green-700 font-medium">+{stats.added} added</span>
                <span className="text-red-700 font-medium">−{stats.removed} removed</span>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasChanges ? (
          <div className="text-center py-8 text-slate-500">No changes detected</div>
        ) : (
          <div className="font-mono text-sm border rounded-lg overflow-hidden bg-white">
            <div className="max-h-[400px] overflow-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {diffLines.map((line, index) => (
                    <tr
                      key={index}
                      className={
                        line.type === "added"
                          ? "bg-green-50"
                          : line.type === "removed"
                            ? "bg-red-50"
                            : ""
                      }
                    >
                      {/* Line numbers */}
                      <td className="w-12 px-2 py-0.5 text-right text-slate-400 select-none border-r border-slate-200 text-xs">
                        {line.lineNumber.before ?? ""}
                      </td>
                      <td className="w-12 px-2 py-0.5 text-right text-slate-400 select-none border-r border-slate-200 text-xs">
                        {line.lineNumber.after ?? ""}
                      </td>
                      {/* Change indicator */}
                      <td
                        className={`w-6 px-1 py-0.5 text-center select-none ${
                          line.type === "added"
                            ? "text-green-600 bg-green-100"
                            : line.type === "removed"
                              ? "text-red-600 bg-red-100"
                              : ""
                        }`}
                      >
                        {line.type === "added" ? "+" : line.type === "removed" ? "−" : ""}
                      </td>
                      {/* Content */}
                      <td
                        className={`px-3 py-0.5 whitespace-pre-wrap break-all ${
                          line.type === "added"
                            ? "text-green-800"
                            : line.type === "removed"
                              ? "text-red-800"
                              : "text-slate-700"
                        }`}
                      >
                        {line.content || " "}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
