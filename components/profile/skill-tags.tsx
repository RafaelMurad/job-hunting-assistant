"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { useState, type KeyboardEvent, type JSX } from "react";

interface SkillTagsProps {
  /** Comma-separated skills string */
  value: string;
  /** Called when skills change */
  onChange: (value: string) => void;
  /** Placeholder for the input */
  placeholder?: string;
  /** Additional class names */
  className?: string;
  /** Maximum number of skills allowed */
  maxSkills?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
}

// Common skills for auto-suggest
const SUGGESTED_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "SQL",
  "AWS",
  "Docker",
  "Git",
  "Agile",
  "REST APIs",
  "GraphQL",
  "CSS",
  "HTML",
  "PostgreSQL",
  "MongoDB",
  "Kubernetes",
  "CI/CD",
  "Testing",
  "Leadership",
];

/**
 * Parse skills string into array
 */
function parseSkills(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Convert skills array back to comma-separated string
 */
function stringifySkills(skills: string[]): string {
  return skills.join(", ");
}

/**
 * Skill Tags Component
 *
 * Interactive tag-based skill input with:
 * - Visual tag display for each skill
 * - Add/remove skills with click
 * - Keyboard support (Enter to add, Backspace to remove)
 * - Auto-suggestions for common skills
 */
export function SkillTags({
  value,
  onChange,
  placeholder = "Add a skill...",
  className,
  maxSkills = 50,
  disabled = false,
}: SkillTagsProps): JSX.Element {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const skills = parseSkills(value);
  const canAddMore = skills.length < maxSkills;

  // Filter suggestions based on input and existing skills
  const filteredSuggestions = SUGGESTED_SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(inputValue.toLowerCase()) &&
      !skills.some((s) => s.toLowerCase() === skill.toLowerCase())
  ).slice(0, 5);

  const addSkill = (skill: string): void => {
    const trimmed = skill.trim();
    if (!trimmed || !canAddMore) return;

    // Don't add duplicates (case-insensitive)
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }

    const newSkills = [...skills, trimmed];
    onChange(stringifySkills(newSkills));
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeSkill = (index: number): void => {
    const newSkills = skills.filter((_, i) => i !== index);
    onChange(stringifySkills(newSkills));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && skills.length > 0) {
      // Remove last skill when backspace on empty input
      removeSkill(skills.length - 1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Tags display */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge
              key={`${skill}-${index}`}
              variant="secondary"
              className="pl-3 pr-1 py-1 text-sm flex items-center gap-1 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
            >
              {skill}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="ml-1 p-0.5 rounded-full hover:bg-cyan-200 dark:hover:bg-cyan-800 transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Input with suggestions */}
      {!disabled && canAddMore && (
        <div className="relative">
          <div className="flex gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              onBlur={() => {
                // Delay to allow clicking suggestions
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addSkill(inputValue)}
              disabled={!inputValue.trim()}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add skill</span>
            </Button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addSkill(suggestion)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors first:rounded-t-md last:rounded-b-md"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {skills.length} / {maxSkills} skills
        {skills.length === 0 && " • Press Enter to add each skill"}
      </p>
    </div>
  );
}
