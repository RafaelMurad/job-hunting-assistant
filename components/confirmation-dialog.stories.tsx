import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ConfirmationDialog } from "./confirmation-dialog";
import { Button } from "./ui/button";

interface DemoProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  isLoading?: boolean;
}

const meta: Meta<typeof ConfirmationDialog> = {
  title: "Components/ConfirmationDialog",
  component: ConfirmationDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A reusable confirmation dialog for destructive or important actions. Supports async confirm handlers, loading states, and customizable text.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
      description: "Visual style - destructive shows a warning icon",
    },
    title: {
      control: "text",
      description: "Dialog title",
    },
    description: {
      control: "text",
      description: "Dialog description/message",
    },
    confirmText: {
      control: "text",
      description: "Text for confirm button",
    },
    cancelText: {
      control: "text",
      description: "Text for cancel button",
    },
    isLoading: {
      control: "boolean",
      description: "Shows loading spinner on confirm button",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component for interactive stories
function ConfirmationDialogDemo({
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  variant = "default",
  confirmText,
  cancelText,
  onConfirm = () => Promise.resolve(),
  isLoading = false,
}: DemoProps) {
  const [open, setOpen] = useState(false);

  // Build optional props conditionally to avoid undefined values
  const optionalProps: {
    confirmText?: string;
    cancelText?: string;
  } = {};
  if (confirmText) optionalProps.confirmText = confirmText;
  if (cancelText) optionalProps.cancelText = cancelText;

  return (
    <>
      <Button
        variant={variant === "destructive" ? "destructive" : "default"}
        onClick={() => setOpen(true)}
      >
        {variant === "destructive" ? "Delete Item" : "Confirm Action"}
      </Button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        onConfirm={onConfirm}
        variant={variant}
        isLoading={isLoading}
        {...optionalProps}
      />
    </>
  );
}

// Default confirmation
export const Default: Story = {
  render: () => (
    <ConfirmationDialogDemo
      title="Confirm Action"
      description="Are you sure you want to proceed with this action?"
      onConfirm={() => {
        console.log("Confirmed!");
      }}
    />
  ),
};

// Destructive confirmation (delete)
export const Destructive: Story = {
  render: () => (
    <ConfirmationDialogDemo
      variant="destructive"
      title="Delete Application"
      description='This action cannot be undone. The application "Senior Frontend Engineer at Acme Corp" will be permanently deleted from your tracker.'
      confirmText="Delete"
      onConfirm={() => {
        console.log("Deleted!");
      }}
    />
  ),
};

// With async handler and loading
function AsyncConfirmDemo() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    console.log("Async action completed!");
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete with Loading
      </Button>
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        variant="destructive"
        title="Delete Account"
        description="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmText="Delete Account"
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </>
  );
}

export const WithLoading: Story = {
  render: () => <AsyncConfirmDemo />,
};

// Custom button text
export const CustomText: Story = {
  render: () => (
    <ConfirmationDialogDemo
      title="Withdraw Application"
      description="Are you sure you want to withdraw your application? The company will be notified."
      confirmText="Yes, Withdraw"
      cancelText="Keep Application"
      onConfirm={() => {
        console.log("Withdrawn!");
      }}
    />
  ),
};

// Save changes confirmation
export const SaveChanges: Story = {
  render: () => (
    <ConfirmationDialogDemo
      title="Unsaved Changes"
      description="You have unsaved changes. Do you want to save them before leaving?"
      confirmText="Save Changes"
      cancelText="Discard"
      onConfirm={() => {
        console.log("Saved!");
      }}
    />
  ),
};

// Archive vs Delete
export const ArchiveAction: Story = {
  render: () => (
    <ConfirmationDialogDemo
      title="Archive Application"
      description="This application will be moved to your archive. You can restore it later from the archive section."
      confirmText="Archive"
      cancelText="Cancel"
      onConfirm={() => {
        console.log("Archived!");
      }}
    />
  ),
};

// Multiple use cases showcase
export const UseCases: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ConfirmationDialogDemo
        title="Confirm Submission"
        description="Your application will be submitted to the company."
        confirmText="Submit"
      />
      <ConfirmationDialogDemo
        variant="destructive"
        title="Delete All Data"
        description="This will permanently delete all your applications, profile data, and saved cover letters."
        confirmText="Delete Everything"
      />
    </div>
  ),
};
