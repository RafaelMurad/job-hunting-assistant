import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { FileUpload, type UploadProgress } from "./file-upload";

const meta: Meta<typeof FileUpload> = {
  title: "UI/FileUpload",
  component: FileUpload,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A drag-and-drop file upload component with progress indication, validation, and error handling. Used for CV uploads in the profile section.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    accept: {
      control: "text",
      description: "Accepted file types (e.g., .pdf,.doc,.docx)",
    },
    maxSize: {
      control: "number",
      description: "Maximum file size in bytes",
    },
    disabled: {
      control: "boolean",
      description: "Whether upload is disabled",
    },
    title: {
      control: "text",
      description: "Title text displayed in the upload zone",
    },
    description: {
      control: "text",
      description: "Description/helper text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state
export const Default: Story = {
  args: {
    title: "Upload your CV",
    description: "Drag and drop or click to browse (PDF, DOC, DOCX)",
    accept: ".pdf,.doc,.docx",
    onFileSelect: (file) => console.log("File selected:", file.name),
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

// Upload Progress States
function UploadProgressDemo() {
  const [progress, setProgress] = useState<UploadProgress>({ status: "idle", progress: 0 });

  const simulateUpload = (file: File) => {
    console.log("Uploading:", file.name);

    // Simulate upload progress
    setProgress({ status: "uploading", progress: 0, step: "Starting upload..." });

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setProgress({
              status: "processing",
              progress: 100,
              step: "Processing document...",
            });
            setTimeout(() => {
              setProgress({
                status: "complete",
                progress: 100,
                step: "Upload complete!",
                message: file.name,
              });
            }, 1500);
          }, 500);
          return prev;
        }
        return {
          ...prev,
          progress: prev.progress + 10,
          step: `Uploading... ${prev.progress + 10}%`,
        };
      });
    }, 200);
  };

  return (
    <div className="w-[400px]">
      <FileUpload
        title="Upload your CV"
        description="We'll extract your skills and experience automatically"
        accept=".pdf,.doc,.docx"
        onFileSelect={simulateUpload}
        progress={progress}
      />
      <div className="mt-4 flex gap-2">
        <button
          className="rounded bg-gray-200 px-3 py-1 text-sm"
          onClick={() => setProgress({ status: "idle", progress: 0 })}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export const WithProgress: Story = {
  render: () => <UploadProgressDemo />,
};

// Static progress states for documentation
export const ProgressStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="w-[400px]">
        <p className="mb-2 text-sm font-medium text-gray-500">Idle</p>
        <FileUpload
          title="Upload CV"
          description="Drag and drop"
          onFileSelect={() => {}}
          progress={{ status: "idle", progress: 0 }}
        />
      </div>
      <div className="w-[400px]">
        <p className="mb-2 text-sm font-medium text-gray-500">Uploading (50%)</p>
        <FileUpload
          title="Upload CV"
          description="Drag and drop"
          onFileSelect={() => {}}
          progress={{ status: "uploading", progress: 50, step: "Uploading... 50%" }}
        />
      </div>
      <div className="w-[400px]">
        <p className="mb-2 text-sm font-medium text-gray-500">Processing</p>
        <FileUpload
          title="Upload CV"
          description="Drag and drop"
          onFileSelect={() => {}}
          progress={{ status: "processing", progress: 100, step: "Extracting text..." }}
        />
      </div>
      <div className="w-[400px]">
        <p className="mb-2 text-sm font-medium text-gray-500">Complete</p>
        <FileUpload
          title="Upload CV"
          description="Drag and drop"
          onFileSelect={() => {}}
          progress={{
            status: "complete",
            progress: 100,
            step: "Upload complete!",
            message: "resume-2026.pdf",
          }}
        />
      </div>
      <div className="w-[400px]">
        <p className="mb-2 text-sm font-medium text-gray-500">Error</p>
        <FileUpload
          title="Upload CV"
          description="Drag and drop"
          onFileSelect={() => {}}
          progress={{
            status: "error",
            progress: 0,
            step: "Upload failed",
            message: "Network error. Please try again.",
          }}
        />
      </div>
    </div>
  ),
};

// Disabled state
export const Disabled: Story = {
  render: () => (
    <div className="w-[400px]">
      <FileUpload
        title="Upload CV"
        description="Upload disabled while processing"
        onFileSelect={() => {}}
        disabled
      />
    </div>
  ),
};

// Custom file types
export const ImageUpload: Story = {
  render: () => (
    <div className="w-[400px]">
      <FileUpload
        title="Upload Profile Photo"
        description="JPG, PNG, or GIF (max 5MB)"
        accept=".jpg,.jpeg,.png,.gif"
        maxSize={5 * 1024 * 1024}
        onFileSelect={(file) => console.log("Image selected:", file.name)}
      />
    </div>
  ),
};

// Small file size limit
export const SmallFileLimit: Story = {
  render: () => (
    <div className="w-[400px]">
      <FileUpload
        title="Upload Document"
        description="Max file size: 1MB"
        accept=".pdf,.txt"
        maxSize={1 * 1024 * 1024}
        onFileSelect={(file) => console.log("File:", file.name)}
      />
      <p className="mt-2 text-sm text-gray-500">
        Try uploading a file larger than 1MB to see validation
      </p>
    </div>
  ),
};

// In context - Profile page layout
export const InProfileContext: Story = {
  render: () => (
    <div className="w-[500px] rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Your CV</h2>
      <p className="mb-4 text-sm text-gray-600">
        Upload your CV to enable AI-powered job matching and cover letter generation.
      </p>
      <FileUpload
        title="Upload your CV"
        description="PDF, DOC, or DOCX (max 10MB)"
        accept=".pdf,.doc,.docx"
        onFileSelect={(file) => console.log("CV uploaded:", file.name)}
      />
      <div className="mt-4 rounded-md bg-blue-50 p-3">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> A well-formatted PDF works best for text extraction.
        </p>
      </div>
    </div>
  ),
};
