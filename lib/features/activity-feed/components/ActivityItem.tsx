"use client";

import type { ActivityEvent, EventType } from "../utils/eventStore";

interface ActivityItemProps {
  event: ActivityEvent;
}

const EVENT_CONFIG: Record<EventType, { icon: string; color: string; label: string }> = {
  APPLICATION_CREATED: { icon: "📝", color: "bg-fjord-100", label: "Applied" },
  APPLICATION_UPDATED: { icon: "✏️", color: "bg-nordic-neutral-100", label: "Updated" },
  APPLICATION_STATUS_CHANGED: { icon: "📊", color: "bg-fjord-100", label: "Status Changed" },
  INTERVIEW_SCHEDULED: { icon: "📅", color: "bg-forest-100", label: "Interview Scheduled" },
  INTERVIEW_COMPLETED: { icon: "✅", color: "bg-forest-100", label: "Interview Done" },
  OFFER_RECEIVED: { icon: "🎉", color: "bg-amber-100", label: "Offer Received" },
  OFFER_ACCEPTED: { icon: "🎊", color: "bg-forest-100", label: "Offer Accepted" },
  OFFER_DECLINED: { icon: "❌", color: "bg-clay-100", label: "Offer Declined" },
  NOTE_ADDED: { icon: "📌", color: "bg-nordic-neutral-100", label: "Note Added" },
  DOCUMENT_UPLOADED: { icon: "📎", color: "bg-nordic-neutral-100", label: "Document Uploaded" },
  PROFILE_UPDATED: { icon: "👤", color: "bg-fjord-100", label: "Profile Updated" },
  SKILL_ADDED: { icon: "🎯", color: "bg-forest-100", label: "Skill Added" },
  ACHIEVEMENT_UNLOCKED: { icon: "🏆", color: "bg-amber-100", label: "Achievement!" },
};

export function ActivityItem({ event }: ActivityItemProps) {
  const config = EVENT_CONFIG[event.type] || {
    icon: "📌",
    color: "bg-nordic-neutral-100",
    label: event.type,
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative flex gap-4 pl-8">
      {/* Icon */}
      <div
        className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ${config.color} text-lg`}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 rounded-lg border border-nordic-neutral-200 bg-white p-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-medium text-nordic-neutral-900">
              {config.label}
            </span>
            {event.payload.company && (
              <span className="text-nordic-neutral-600">
                {" "}at {String(event.payload.company)}
              </span>
            )}
          </div>
          <time className="text-xs text-nordic-neutral-400">
            {formatTimestamp(event.timestamp)}
          </time>
        </div>

        {/* Event-specific details */}
        {event.payload.position && (
          <p className="mt-1 text-sm text-nordic-neutral-600">
            {String(event.payload.position)}
          </p>
        )}
        {event.payload.from && event.payload.to && (
          <p className="mt-1 text-sm text-nordic-neutral-500">
            {String(event.payload.from)} → {String(event.payload.to)}
          </p>
        )}
      </div>
    </div>
  );
}
