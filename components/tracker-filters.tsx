/**
 * Tracker Filters Component
 *
 * Filtering and search UI for the application tracker.
 * Allows users to quickly find applications by status, company, or job title.
 */

"use client";

import { useState, type JSX } from "react";
import { cn } from "@/lib/utils";

export type ApplicationStatus = "applied" | "interview" | "offer" | "rejected";

export interface TrackerFiltersProps {
  /** Current status filter */
  status: ApplicationStatus | "all";
  /** Current search query */
  search: string;
  /** Current sort option */
  sortBy: "date" | "company" | "score";
  /** Callback when filters change */
  onFilterChange: (filters: {
    status: ApplicationStatus | "all";
    search: string;
    sortBy: "date" | "company" | "score";
  }) => void;
  /** Application counts by status */
  counts?: {
    all: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  };
}

export function TrackerFilters({
  status,
  search,
  sortBy,
  onFilterChange,
  counts,
}: TrackerFiltersProps): JSX.Element {
  const [searchValue, setSearchValue] = useState(search);

  const handleStatusChange = (newStatus: ApplicationStatus | "all") => {
    onFilterChange({ status: newStatus, search: searchValue, sortBy });
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onFilterChange({ status, search: value, sortBy });
  };

  const handleSortChange = (newSort: "date" | "company" | "score") => {
    onFilterChange({ status, search: searchValue, sortBy: newSort });
  };

  const statusOptions: Array<{
    value: ApplicationStatus | "all";
    label: string;
    color: string;
  }> = [
    { value: "all", label: "All", color: "fjord" },
    { value: "applied", label: "Applied", color: "nordic-neutral" },
    { value: "interview", label: "Interview", color: "fjord" },
    { value: "offer", label: "Offer", color: "forest" },
    { value: "rejected", label: "Rejected", color: "clay" },
  ];

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusOptions.map((option) => {
          const isActive = status === option.value;
          const count = counts?.[option.value];

          return (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fjord-500 focus-visible:ring-offset-2",
                isActive
                  ? `bg-${option.color}-600 text-white shadow-md`
                  : "bg-nordic-neutral-100 text-nordic-neutral-700 hover:bg-nordic-neutral-200"
              )}
            >
              <span>{option.label}</span>
              {count !== undefined && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                    isActive ? "bg-white/20" : "bg-nordic-neutral-200"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nordic-neutral-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by company or job title..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-lg border border-nordic-neutral-300",
              "bg-white text-nordic-neutral-900 placeholder:text-nordic-neutral-400",
              "focus:outline-none focus:ring-2 focus:ring-fjord-500 focus:border-transparent",
              "transition-all"
            )}
          />
          {searchValue && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-nordic-neutral-400 hover:text-nordic-neutral-600"
              aria-label="Clear search"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as "date" | "company" | "score")}
            className={cn(
              "appearance-none pl-4 pr-10 py-2 rounded-lg border border-nordic-neutral-300",
              "bg-white text-nordic-neutral-900",
              "focus:outline-none focus:ring-2 focus:ring-fjord-500 focus:border-transparent",
              "transition-all cursor-pointer min-w-[150px]"
            )}
          >
            <option value="date">Most Recent</option>
            <option value="company">Company A-Z</option>
            <option value="score">Match Score</option>
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nordic-neutral-400 pointer-events-none"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(status !== "all" || searchValue) && (
        <div className="flex items-center gap-2 text-sm text-nordic-neutral-600">
          <span>Active filters:</span>
          {status !== "all" && (
            <span className="px-2 py-1 bg-fjord-100 text-fjord-700 rounded-md font-medium">
              Status: {status}
            </span>
          )}
          {searchValue && (
            <span className="px-2 py-1 bg-fjord-100 text-fjord-700 rounded-md font-medium">
              Search: &quot;{searchValue}&quot;
            </span>
          )}
          <button
            onClick={() => onFilterChange({ status: "all", search: "", sortBy })}
            className="ml-2 text-fjord-600 hover:text-fjord-700 font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
