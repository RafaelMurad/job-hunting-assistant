import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible card component for grouping related content. Includes header, title, description, content, and footer sub-components.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Card
export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with any elements you need.</p>
      </CardContent>
    </Card>
  ),
};

// Card with Footer
export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Update your account preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Make changes to your profile information and notification settings.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  ),
};

// Dashboard Stats Card
export const DashboardStats: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Applications</CardDescription>
          <CardTitle className="text-3xl">24</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-green-600">+12% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Interviews</CardDescription>
          <CardTitle className="text-3xl">8</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-green-600">+3 this week</p>
        </CardContent>
      </Card>
    </div>
  ),
};

// Job Application Card
export const JobApplicationCard: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Senior Frontend Engineer</CardTitle>
            <CardDescription>Acme Corporation • Remote</CardDescription>
          </div>
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            Interview
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Applied</span>
            <span>Jan 5, 2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Salary Range</span>
            <span>$150k - $200k</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm" variant="outline" className="flex-1">
          View Details
        </Button>
        <Button size="sm" className="flex-1">
          Prepare Interview
        </Button>
      </CardFooter>
    </Card>
  ),
};

// Empty State Card
export const EmptyState: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardContent className="flex flex-col items-center justify-center py-10">
        <div className="text-4xl">📝</div>
        <CardTitle className="mt-4">No Applications Yet</CardTitle>
        <CardDescription className="mt-2 text-center">
          Start tracking your job applications to see your progress here.
        </CardDescription>
        <Button className="mt-6">Add First Application</Button>
      </CardContent>
    </Card>
  ),
};
