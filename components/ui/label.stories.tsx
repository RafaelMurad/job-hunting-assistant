import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A label component for form elements. Extends the native label with consistent styling and peer-based disabled state support.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "The label text content",
    },
    htmlFor: {
      control: "text",
      description: "The id of the input this label is for",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default label
export const Default: Story = {
  args: {
    children: "Label Text",
  },
};

// With Input
export const WithInput: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="name">Full Name</Label>
      <Input id="name" placeholder="John Doe" />
    </div>
  ),
};

// With Required Indicator
export const Required: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="email">
        Email Address <span className="text-red-500">*</span>
      </Label>
      <Input id="email" type="email" placeholder="you@example.com" required />
    </div>
  ),
};

// With Helper Text
export const WithHelperText: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" />
      <p className="text-sm text-gray-500">Must be at least 8 characters long</p>
    </div>
  ),
};

// With Error
export const WithError: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="email-error" className="text-red-600">
        Email Address
      </Label>
      <Input
        id="email-error"
        type="email"
        className="border-red-500"
        defaultValue="invalid-email"
      />
      <p className="text-sm text-red-500">Please enter a valid email address</p>
    </div>
  ),
};

// Form Example
export const FormExample: Story = {
  render: () => (
    <form className="w-[400px] space-y-6">
      <div className="space-y-2">
        <Label htmlFor="company">
          Company Name <span className="text-red-500">*</span>
        </Label>
        <Input id="company" placeholder="e.g., Acme Corporation" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">
          Position <span className="text-red-500">*</span>
        </Label>
        <Input id="position" placeholder="e.g., Senior Software Engineer" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="salary">Expected Salary</Label>
        <Input id="salary" type="text" placeholder="e.g., $150,000 - $200,000" />
        <p className="text-sm text-gray-500">Optional - helps track compensation data</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Any additional information..." rows={3} />
      </div>
    </form>
  ),
};

// Disabled State
export const DisabledState: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="disabled-input" className="opacity-50">
        Read Only Field
      </Label>
      <Input id="disabled-input" disabled defaultValue="Cannot edit this" />
    </div>
  ),
};

// Inline Labels
export const InlineLabels: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="flex items-center gap-4">
        <Label htmlFor="remote" className="w-24 text-right">
          Remote
        </Label>
        <Input id="remote" type="checkbox" className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-4">
        <Label htmlFor="salary-range" className="w-24 text-right">
          Salary
        </Label>
        <Input id="salary-range" placeholder="$100k - $150k" className="flex-1" />
      </div>
    </div>
  ),
};
