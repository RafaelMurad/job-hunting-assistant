import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A select component built on Radix UI Select. Includes custom trigger, searchable content, and grouped options.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Select
export const Default: Story = {
  render: () => (
    <div className="w-[200px]">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

// With Label
export const WithLabel: Story = {
  render: () => (
    <div className="w-[250px] space-y-2">
      <Label htmlFor="status">Application Status</Label>
      <Select>
        <SelectTrigger id="status">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="applied">Applied</SelectItem>
          <SelectItem value="in-review">In Review</SelectItem>
          <SelectItem value="interview">Interview</SelectItem>
          <SelectItem value="offer">Offer</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

// Application Status (Real-world)
export const ApplicationStatus: Story = {
  render: () => (
    <div className="w-[250px] space-y-2">
      <Label>Update Status</Label>
      <Select defaultValue="interview">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="applied">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gray-400" />
              Applied
            </span>
          </SelectItem>
          <SelectItem value="in-review">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              In Review
            </span>
          </SelectItem>
          <SelectItem value="phone-screen">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              Phone Screen
            </span>
          </SelectItem>
          <SelectItem value="interview">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              Interview
            </span>
          </SelectItem>
          <SelectItem value="offer">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Offer
            </span>
          </SelectItem>
          <SelectItem value="rejected">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Rejected
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

// Grouped Options
export const GroupedOptions: Story = {
  render: () => (
    <div className="w-[280px] space-y-2">
      <Label>Select Job Type</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select job type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Full-time</SelectLabel>
            <SelectItem value="ft-remote">Remote</SelectItem>
            <SelectItem value="ft-hybrid">Hybrid</SelectItem>
            <SelectItem value="ft-onsite">On-site</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Part-time</SelectLabel>
            <SelectItem value="pt-remote">Remote</SelectItem>
            <SelectItem value="pt-onsite">On-site</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Contract</SelectLabel>
            <SelectItem value="contract-short">Short-term (&lt;6 months)</SelectItem>
            <SelectItem value="contract-long">Long-term (6+ months)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

// AI Provider Select (From app settings)
export const AIProviderSelect: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label>AI Provider</Label>
      <Select defaultValue="gemini">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gemini">
            <span className="flex items-center gap-2">
              <span>🤖</span>
              Gemini (Free)
            </span>
          </SelectItem>
          <SelectItem value="openai">
            <span className="flex items-center gap-2">
              <span>🧠</span>
              OpenAI GPT-4
            </span>
          </SelectItem>
          <SelectItem value="claude">
            <span className="flex items-center gap-2">
              <span>🎭</span>
              Claude (Anthropic)
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-500">
        Gemini offers 1,500 free requests/day. Other providers require API keys.
      </p>
    </div>
  ),
};

// Experience Level
export const ExperienceLevel: Story = {
  render: () => (
    <div className="w-[250px] space-y-2">
      <Label>Experience Level</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
          <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
          <SelectItem value="senior">Senior (5-8 years)</SelectItem>
          <SelectItem value="staff">Staff (8-12 years)</SelectItem>
          <SelectItem value="principal">Principal (12+ years)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

// Disabled State
export const Disabled: Story = {
  render: () => (
    <div className="w-[250px] space-y-4">
      <div className="space-y-2">
        <Label>Disabled (empty)</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Disabled (with value)</Label>
        <Select disabled defaultValue="locked">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="locked">Locked Value</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

// Form Row
export const FormRow: Story = {
  render: () => (
    <div className="flex w-[500px] gap-4">
      <div className="flex-1 space-y-2">
        <Label>Status</Label>
        <Select defaultValue="interview">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 space-y-2">
        <Label>Priority</Label>
        <Select defaultValue="high">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};
