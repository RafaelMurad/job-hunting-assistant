import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile button component with multiple variants and sizes. Built with class-variance-authority for type-safe styling.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "The visual style variant of the button",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "The size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    children: {
      control: "text",
      description: "The button content",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default button
export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
};

// All Variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

// All Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔍</Button>
    </div>
  ),
};

// Disabled State
export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button>
        <span className="mr-2">📧</span>
        Send Email
      </Button>
      <Button variant="outline">
        Download
        <span className="ml-2">⬇️</span>
      </Button>
    </div>
  ),
};

// Loading State Pattern
export const Loading: Story = {
  render: () => (
    <Button disabled>
      <span className="mr-2 animate-spin">⏳</span>
      Loading...
    </Button>
  ),
};

// Real-world Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Form Actions</p>
        <div className="flex gap-2">
          <Button>Save Profile</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Danger Zone</p>
        <div className="flex gap-2">
          <Button variant="destructive">Delete Account</Button>
          <Button variant="ghost">Learn More</Button>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Call to Action</p>
        <div className="flex gap-2">
          <Button size="lg">Get Started Free</Button>
          <Button variant="link">View Demo →</Button>
        </div>
      </div>
    </div>
  ),
};
