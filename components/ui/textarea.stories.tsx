import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Label } from "./label";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A styled textarea component for multi-line text input. Includes focus states, disabled styling, and auto-resize support.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    disabled: {
      control: "boolean",
      description: "Whether the textarea is disabled",
    },
    rows: {
      control: "number",
      description: "Number of visible rows",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default textarea
export const Default: Story = {
  args: {
    placeholder: "Type your message here...",
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

// With Label
export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" placeholder="Tell us about yourself..." />
    </div>
  ),
};

// Different Sizes
export const Sizes: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="space-y-2">
        <Label>Small (2 rows)</Label>
        <Textarea rows={2} placeholder="Short input..." />
      </div>
      <div className="space-y-2">
        <Label>Default (4 rows)</Label>
        <Textarea rows={4} placeholder="Medium input..." />
      </div>
      <div className="space-y-2">
        <Label>Large (8 rows)</Label>
        <Textarea rows={8} placeholder="Long input..." />
      </div>
    </div>
  ),
};

// States
export const States: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="space-y-2">
        <Label>Default</Label>
        <Textarea placeholder="Default textarea" />
      </div>
      <div className="space-y-2">
        <Label>Disabled</Label>
        <Textarea disabled placeholder="This is disabled" />
      </div>
      <div className="space-y-2">
        <Label>With Error</Label>
        <Textarea
          className="border-red-500 focus-visible:ring-red-500"
          placeholder="Something went wrong"
        />
        <p className="text-sm text-red-500">This field is required</p>
      </div>
    </div>
  ),
};

// Job Description Input (Real-world example)
export const JobDescriptionInput: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="job-desc">Paste Job Description</Label>
        <Textarea
          id="job-desc"
          rows={10}
          placeholder="Paste the job description here to analyze it against your profile..."
          defaultValue={`Senior Frontend Engineer

We're looking for an experienced frontend engineer to join our team.

Requirements:
- 5+ years of experience with React
- Strong TypeScript skills
- Experience with Next.js
- Familiarity with testing frameworks
- Excellent communication skills

Nice to have:
- Experience with design systems
- Knowledge of accessibility standards
- Background in performance optimization`}
        />
        <p className="text-sm text-gray-500">
          Our AI will analyze the job requirements and match them with your profile.
        </p>
      </div>
    </div>
  ),
};

// Cover Letter (Real-world example)
export const CoverLetterInput: Story = {
  render: () => (
    <div className="w-[500px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cover-letter">Cover Letter</Label>
        <Textarea
          id="cover-letter"
          rows={12}
          placeholder="Write or paste your cover letter..."
          defaultValue={`Dear Hiring Manager,

I am writing to express my strong interest in the Senior Frontend Engineer position at your company.

With over 5 years of experience in frontend development, I have developed expertise in React, TypeScript, and Next.js. I am particularly excited about this opportunity because it aligns perfectly with my career goals and technical background.

In my current role, I have led the development of a design system that improved team productivity by 40% and reduced UI inconsistencies across our product suite.

I would welcome the opportunity to discuss how my experience and skills can contribute to your team's success.

Best regards,
John Doe`}
        />
      </div>
    </div>
  ),
};

// Character Count
export const WithCharacterCount: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="limited">Summary (max 500 characters)</Label>
      <Textarea
        id="limited"
        rows={4}
        maxLength={500}
        placeholder="Write a brief summary..."
        defaultValue="Experienced software engineer with a passion for building user-friendly applications."
      />
      <p className="text-right text-sm text-gray-500">83/500 characters</p>
    </div>
  ),
};
