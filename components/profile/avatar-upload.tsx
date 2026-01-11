"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type ChangeEvent, type JSX } from "react";

interface AvatarUploadProps {
  /** Current image URL (from Neon Auth or uploaded) */
  imageUrl?: string | null;
  /** User's name for generating initials fallback */
  name?: string;
  /** Called when a new image is selected */
  onImageChange?: (file: File) => void;
  /** Size of the avatar in pixels */
  size?: number;
  /** Additional class names */
  className?: string;
  /** Whether the avatar is editable */
  editable?: boolean;
}

/**
 * Get initials from a name (up to 2 characters)
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "U"; // Default for empty names
  }
  const firstPart = parts[0];
  if (parts.length === 1 || !firstPart) {
    return (firstPart ?? "U").substring(0, 2).toUpperCase();
  }
  const lastPart = parts[parts.length - 1];
  const firstChar = firstPart[0] ?? "U";
  const lastChar = lastPart?.[0] ?? "";
  return (firstChar + lastChar).toUpperCase();
}

/**
 * Generate a consistent color based on the name
 */
function getAvatarColor(name: string): string {
  const colors = [
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-sky-500",
    "bg-teal-500",
    "bg-indigo-500",
  ] as const;
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length] ?? "bg-cyan-500";
}

/**
 * Avatar Upload Component
 *
 * Displays user avatar with:
 * - Image from URL (Neon Auth or uploaded)
 * - Initials fallback with colored background
 * - Upload overlay on hover (when editable)
 */
export function AvatarUpload({
  imageUrl,
  name = "User",
  onImageChange,
  size = 96,
  className,
  editable = true,
}: AvatarUploadProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const displayUrl = previewUrl || imageUrl;
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Notify parent
    onImageChange?.(file);
  };

  const handleClick = (): void => {
    if (editable) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Avatar circle */}
      <button
        type="button"
        onClick={handleClick}
        disabled={!editable}
        className={cn(
          "w-full h-full rounded-full overflow-hidden transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
          editable && "cursor-pointer hover:opacity-90",
          !editable && "cursor-default"
        )}
      >
        {displayUrl ? (
          // Image avatar
          <Image
            src={displayUrl}
            alt={`${name}'s avatar`}
            width={size}
            height={size}
            className="w-full h-full object-cover"
          />
        ) : (
          // Initials fallback
          <div
            className={cn(
              "w-full h-full flex items-center justify-center text-white font-semibold",
              bgColor
            )}
            style={{ fontSize: size * 0.35 }}
          >
            {initials}
          </div>
        )}

        {/* Upload overlay - shown on hover when editable */}
        {editable && isHovering && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
        )}
      </button>

      {/* Edit button (alternative to hover) */}
      {editable && (
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white dark:bg-slate-800 shadow-md"
          onClick={handleClick}
        >
          <Camera className="h-4 w-4" />
          <span className="sr-only">Change avatar</span>
        </Button>
      )}
    </div>
  );
}
