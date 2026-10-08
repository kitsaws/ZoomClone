import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple Tailwind / CSS class names with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a raw 9-11 digit string into spaced Zoom meeting ID format
 * e.g., "84920183921" -> "849 2018 3921"
 * e.g., "1234567890" -> "123 456 7890"
 */
export function formatMeetingId(id: string | number | undefined | null): string {
  if (!id) return "";
  const cleaned = String(id).replace(/\D/g, "");
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return cleaned;
}

/**
 * Strips all non-digit characters from a meeting ID string
 */
export function cleanMeetingId(id: string): string {
  return id.replace(/\D/g, "");
}

/**
 * Extracts uppercase initials (max 2 characters) from a full name
 */
export function getInitials(name: string | undefined | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Returns a consistent Zoom-inspired accent background color for avatars based on user name
 */
export function getAvatarColor(name: string | undefined | null): string {
  if (!name) return "bg-zoom-card-surface text-zoom-white";
  const colors = [
    "bg-blue-600 text-white",
    "bg-purple-600 text-white",
    "bg-emerald-600 text-white",
    "bg-amber-600 text-white",
    "bg-rose-600 text-white",
    "bg-indigo-600 text-white",
    "bg-teal-600 text-white",
    "bg-orange-600 text-white",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Formats ISO timestamp to human friendly meeting schedule
 */
export function formatMeetingTime(isoString: string | undefined | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return isoString;
  }
}

/**
 * Formats ISO timestamp to friendly date string
 */
export function formatMeetingDate(isoString: string | undefined | null): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}
