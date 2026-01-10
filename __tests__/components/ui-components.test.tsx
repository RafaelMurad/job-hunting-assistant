/**
 * Component Tests: UI Components
 *
 * Tests for shared UI components (Input, Card, Badge).
 */

import { render, screen } from "@/__tests__/setup/test-utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("Input Component", () => {
  describe("Rendering", () => {
    it("renders an input element", () => {
      render(<Input />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("renders with placeholder text", () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("renders with different types", () => {
      const { rerender } = render(<Input type="email" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

      rerender(<Input type="password" />);
      // password inputs don't have textbox role
      expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<Input className="custom-class" />);
      expect(screen.getByRole("textbox")).toHaveClass("custom-class");
    });
  });

  describe("Interactions", () => {
    it("accepts user input", async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole("textbox");
      await user.type(input, "Hello World");

      expect(input).toHaveValue("Hello World");
    });

    it("triggers onChange handler", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      await user.type(screen.getByRole("textbox"), "a");

      expect(handleChange).toHaveBeenCalled();
    });

    it("can be disabled", () => {
      render(<Input disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("can have a default value", () => {
      render(<Input defaultValue="default text" />);
      expect(screen.getByRole("textbox")).toHaveValue("default text");
    });
  });

  describe("Ref Forwarding", () => {
    it("forwards ref correctly", () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
});

describe("Card Components", () => {
  describe("Card", () => {
    it("renders card container", () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(
        <Card className="custom-card" data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId("card")).toHaveClass("custom-card");
    });

    it("renders children", () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });
  });

  describe("CardHeader", () => {
    it("renders header container", () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      expect(screen.getByTestId("header")).toBeInTheDocument();
    });
  });

  describe("CardTitle", () => {
    it("renders as h3 element", () => {
      render(<CardTitle>Title</CardTitle>);
      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Title");
    });
  });

  describe("CardDescription", () => {
    it("renders description text", () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });
  });

  describe("CardContent", () => {
    it("renders content container", () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });

  describe("CardFooter", () => {
    it("renders footer container", () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });
  });

  describe("Full Card Composition", () => {
    it("renders complete card structure", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>Main content</CardContent>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );

      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Card Title");
      expect(screen.getByText("Card description")).toBeInTheDocument();
      expect(screen.getByText("Main content")).toBeInTheDocument();
      expect(screen.getByText("Footer content")).toBeInTheDocument();
    });
  });
});

describe("Badge Component", () => {
  describe("Rendering", () => {
    it("renders badge text", () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<Badge className="custom-badge">Badge</Badge>);
      expect(screen.getByText("Badge")).toHaveClass("custom-badge");
    });
  });

  describe("Variants", () => {
    it("renders default variant", () => {
      render(<Badge variant="default">Default</Badge>);
      const badge = screen.getByText("Default");
      expect(badge).toHaveClass("bg-primary");
    });

    it("renders secondary variant", () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText("Secondary");
      expect(badge).toHaveClass("bg-secondary");
    });

    it("renders destructive variant", () => {
      render(<Badge variant="destructive">Destructive</Badge>);
      const badge = screen.getByText("Destructive");
      expect(badge).toHaveClass("bg-destructive");
    });

    it("renders outline variant", () => {
      render(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText("Outline");
      expect(badge).toHaveClass("text-foreground");
    });
  });

  describe("Accessibility", () => {
    it("can have additional attributes", () => {
      render(
        <Badge aria-label="Status badge" data-testid="status-badge">
          Active
        </Badge>
      );
      expect(screen.getByTestId("status-badge")).toHaveAttribute("aria-label", "Status badge");
    });
  });
});
