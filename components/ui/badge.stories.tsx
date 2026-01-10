import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A badge component for displaying status, labels, or counts. Built with class-variance-authority for multiple variants.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
      description: "The visual style variant of the badge",
    },
    children: {
      control: "text",
      description: "The badge content",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default badge
export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
};

// All Variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

// Application Status Badges
export const ApplicationStatus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Applied</Badge>
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Review</Badge>
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Phone Screen</Badge>
      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Interview</Badge>
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Offer</Badge>
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>
    </div>
  ),
};

// Skill Tags
export const SkillTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">React</Badge>
      <Badge variant="outline">TypeScript</Badge>
      <Badge variant="outline">Next.js</Badge>
      <Badge variant="outline">TailwindCSS</Badge>
      <Badge variant="outline">Node.js</Badge>
      <Badge variant="outline">PostgreSQL</Badge>
    </div>
  ),
};

// Match Score Badges
export const MatchScores: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">95% Match</Badge>
        <span className="text-sm text-gray-600">Excellent fit for your profile</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">72% Match</Badge>
        <span className="text-sm text-gray-600">Good fit with some gaps</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">45% Match</Badge>
        <span className="text-sm text-gray-600">Significant skill gaps</span>
      </div>
    </div>
  ),
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default">
        <span className="mr-1">✓</span> Verified
      </Badge>
      <Badge variant="secondary">
        <span className="mr-1">⏰</span> Pending
      </Badge>
      <Badge variant="destructive">
        <span className="mr-1">✕</span> Failed
      </Badge>
      <Badge variant="outline">
        <span className="mr-1">📍</span> Remote
      </Badge>
    </div>
  ),
};

// In Context (Job Card Header)
export const InContext: Story = {
  render: () => (
    <div className="rounded-lg border p-4 shadow-sm" style={{ width: "400px" }}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">Senior Frontend Engineer</h3>
          <p className="text-sm text-gray-500">Acme Corporation</p>
        </div>
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Interview</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        <Badge variant="outline" className="text-xs">
          React
        </Badge>
        <Badge variant="outline" className="text-xs">
          TypeScript
        </Badge>
        <Badge variant="outline" className="text-xs">
          Next.js
        </Badge>
      </div>
    </div>
  ),
};
