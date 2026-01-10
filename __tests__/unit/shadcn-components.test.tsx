/**
 * @fileoverview Tests for Shadcn UI components
 * @description Validates that all installed Shadcn components render correctly
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// Import all new Shadcn components
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

describe("Shadcn UI Components", () => {
  describe("DropdownMenu", () => {
    it("should render dropdown menu trigger", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
    });

    it("should export all dropdown menu sub-components", () => {
      expect(DropdownMenu).toBeDefined();
      expect(DropdownMenuTrigger).toBeDefined();
      expect(DropdownMenuContent).toBeDefined();
      expect(DropdownMenuItem).toBeDefined();
    });
  });

  describe("Tabs", () => {
    it("should render tabs with triggers and content", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole("tab", { name: /tab 1/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /tab 2/i })).toBeInTheDocument();
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });

    it("should export all tabs sub-components", () => {
      expect(Tabs).toBeDefined();
      expect(TabsList).toBeDefined();
      expect(TabsTrigger).toBeDefined();
      expect(TabsContent).toBeDefined();
    });
  });

  describe("Avatar", () => {
    it("should render avatar with fallback", () => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Fallback should be visible when image is not loaded
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should export all avatar sub-components", () => {
      expect(Avatar).toBeDefined();
      expect(AvatarImage).toBeDefined();
      expect(AvatarFallback).toBeDefined();
    });
  });

  describe("Skeleton", () => {
    it("should render skeleton with custom className", () => {
      render(<Skeleton className="h-4 w-32" data-testid="skeleton" />);

      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass("h-4", "w-32");
    });

    it("should apply default skeleton styles", () => {
      render(<Skeleton data-testid="skeleton" />);

      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toHaveClass("animate-pulse");
    });
  });

  describe("Tooltip", () => {
    it("should render tooltip trigger", () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button>Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tooltip content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByRole("button", { name: /hover me/i })).toBeInTheDocument();
    });

    it("should export all tooltip sub-components", () => {
      expect(Tooltip).toBeDefined();
      expect(TooltipTrigger).toBeDefined();
      expect(TooltipContent).toBeDefined();
      expect(TooltipProvider).toBeDefined();
    });
  });

  describe("Progress", () => {
    it("should render progress bar with value", () => {
      render(<Progress value={50} data-testid="progress" />);

      const progress = screen.getByTestId("progress");
      expect(progress).toBeInTheDocument();
      // Progress component renders with role="progressbar"
      expect(progress).toHaveAttribute("role", "progressbar");
    });

    it("should render progress bar with 0 value", () => {
      render(<Progress value={0} data-testid="progress" />);

      const progress = screen.getByTestId("progress");
      expect(progress).toBeInTheDocument();
    });

    it("should render progress bar with 100 value", () => {
      render(<Progress value={100} data-testid="progress" />);

      const progress = screen.getByTestId("progress");
      expect(progress).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<Progress value={50} className="h-4" data-testid="progress" />);

      const progress = screen.getByTestId("progress");
      expect(progress).toHaveClass("h-4");
    });
  });

  describe("Command (Command Palette)", () => {
    it("should render command input", () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem>Action 1</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("should render command group with items", () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandGroup heading="Navigation">
              <CommandItem>Dashboard</CommandItem>
              <CommandItem>Profile</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByText("Navigation")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Profile")).toBeInTheDocument();
    });

    it("should export all command sub-components", () => {
      expect(Command).toBeDefined();
      expect(CommandInput).toBeDefined();
      expect(CommandList).toBeDefined();
      expect(CommandEmpty).toBeDefined();
      expect(CommandGroup).toBeDefined();
      expect(CommandItem).toBeDefined();
    });
  });

  describe("Component Accessibility", () => {
    it("should have accessible tab navigation", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );

      const tabList = screen.getByRole("tablist");
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
    });

    it("should have accessible progress indicator", () => {
      render(<Progress value={75} data-testid="progress" />);

      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
      expect(progress).toHaveAttribute("aria-valuemin", "0");
      expect(progress).toHaveAttribute("aria-valuemax", "100");
    });
  });
});
