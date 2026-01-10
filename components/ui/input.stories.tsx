import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A styled input component that extends the native HTML input. Includes focus states, disabled styling, and placeholder support.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url"],
      description: "The type of input",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default input
export const Default: Story = {
  args: {
    type: "text",
    placeholder: "Enter text...",
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};

// With Label
export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};

// Input Types
export const InputTypes: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div className="space-y-2">
        <Label>Text</Label>
        <Input type="text" placeholder="Enter your name" />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input type="password" placeholder="••••••••" />
      </div>
      <div className="space-y-2">
        <Label>Number</Label>
        <Input type="number" placeholder="0" />
      </div>
      <div className="space-y-2">
        <Label>Search</Label>
        <Input type="search" placeholder="Search..." />
      </div>
    </div>
  ),
};

// States
export const States: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div className="space-y-2">
        <Label>Default</Label>
        <Input placeholder="Default input" />
      </div>
      <div className="space-y-2">
        <Label>With Value</Label>
        <Input defaultValue="john@example.com" />
      </div>
      <div className="space-y-2">
        <Label>Disabled</Label>
        <Input disabled placeholder="Disabled input" />
      </div>
      <div className="space-y-2">
        <Label>Disabled with Value</Label>
        <Input disabled defaultValue="Can't edit this" />
      </div>
    </div>
  ),
};

// With Error State (custom styling)
export const WithError: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="email-error">Email</Label>
      <Input
        id="email-error"
        type="email"
        placeholder="you@example.com"
        className="border-red-500 focus-visible:ring-red-500"
        defaultValue="invalid-email"
      />
      <p className="text-sm text-red-500">Please enter a valid email address</p>
    </div>
  ),
};

// Form Example
export const FormExample: Story = {
  render: () => (
    <form className="w-[350px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullname">Full Name</Label>
        <Input id="fullname" placeholder="John Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="job-title">Job Title</Label>
        <Input id="job-title" placeholder="Senior Software Engineer" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="linkedin">LinkedIn URL</Label>
        <Input id="linkedin" type="url" placeholder="https://linkedin.com/in/..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="experience">Years of Experience</Label>
        <Input id="experience" type="number" placeholder="5" min={0} max={50} />
      </div>
    </form>
  ),
};
