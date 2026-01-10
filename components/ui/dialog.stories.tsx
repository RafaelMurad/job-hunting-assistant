import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A modal dialog component built on Radix UI Dialog. Includes overlay, animations, and accessible keyboard navigation.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Dialog
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a description of the dialog content. It provides context for the user.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Dialog content goes here. You can put any content inside.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Confirmation Dialog
export const ConfirmationDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Application</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the application &quot;Senior
            Frontend Engineer at Acme Corp&quot; from your tracker.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Form Dialog
export const FormDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Application</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Application</DialogTitle>
          <DialogDescription>
            Track a new job application. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" placeholder="e.g., Acme Corporation" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input id="position" placeholder="e.g., Senior Frontend Engineer" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Job URL</Label>
            <Input id="url" type="url" placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Any additional notes..." rows={3} />
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Add Application</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Controlled Dialog
function ControlledDialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Controlled Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Controlled Dialog</DialogTitle>
          <DialogDescription>
            This dialog is controlled programmatically. Useful for complex flows.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-gray-600">Open state: {open ? "true" : "false"}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close Programmatically
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDialogDemo />,
};

// Large Content Dialog
export const LargeContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Cover Letter</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generated Cover Letter</DialogTitle>
          <DialogDescription>
            AI-generated based on your profile and the job description
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm leading-relaxed text-gray-700">
          <p>Dear Hiring Manager,</p>
          <p>
            I am writing to express my strong interest in the Senior Frontend Engineer position at
            Acme Corporation. With over 5 years of experience in frontend development and a proven
            track record of building scalable web applications, I am confident in my ability to
            contribute to your team.
          </p>
          <p>
            In my current role at TechCorp, I have led the development of a design system that
            improved team productivity by 40% and reduced UI inconsistencies across our product
            suite. I have extensive experience with React, TypeScript, and Next.js, which aligns
            perfectly with your tech stack.
          </p>
          <p>
            I am particularly excited about this opportunity because of Acme&apos;s commitment to
            innovation and user-centered design. I believe my background in performance optimization
            and accessibility would be valuable as you continue to scale your platform.
          </p>
          <p>
            I would welcome the opportunity to discuss how my experience and skills can contribute
            to your team&apos;s success.
          </p>
          <p>
            Best regards,
            <br />
            John Doe
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline">Copy to Clipboard</Button>
          <Button>Use This Letter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Alert Dialog Style
export const AlertStyle: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">Show Warning</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-600">
            <span>⚠️</span> Unsaved Changes
          </DialogTitle>
          <DialogDescription>
            You have unsaved changes that will be lost if you leave this page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Discard Changes</Button>
          </DialogClose>
          <Button>Save & Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
