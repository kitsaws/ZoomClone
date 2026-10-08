import React from "react";
import { cn, getInitials, getAvatarColor } from "@/lib/utils";
import { MicOff } from "lucide-react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "muted" | "offline" | "in-meeting" | "none";
  colorClass?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = "md",
  status = "none",
  colorClass,
  className,
  ...props
}) => {
  const initials = getInitials(name);
  const bgClass = colorClass || getAvatarColor(name);

  const sizeStyles = {
    sm: "h-8 w-8 text-xs font-semibold",
    md: "h-10 w-10 text-sm font-semibold",
    lg: "h-14 w-14 text-base font-bold",
    xl: "h-20 w-20 text-2xl font-bold",
  };

  const statusSize = {
    sm: "h-2.5 w-2.5 right-0 bottom-0 ring-1",
    md: "h-3 w-3 right-0 bottom-0 ring-2",
    lg: "h-4 w-4 right-0.5 bottom-0.5 ring-2",
    xl: "h-5 w-5 right-1 bottom-1 ring-2",
  };

  return (
    <div className="relative inline-flex shrink-0" {...props}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center select-none overflow-hidden ring-1 ring-white/10 shadow-inner",
          sizeStyles[size],
          bgClass,
          className
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status !== "none" && (
        <div
          className={cn(
            "absolute rounded-full ring-zoom-dark-canvas flex items-center justify-center",
            statusSize[size],
            status === "online" && "bg-zoom-success",
            status === "in-meeting" && "bg-zoom-blue",
            status === "muted" && "bg-zoom-danger",
            status === "offline" && "bg-zoom-muted-text"
          )}
        >
          {status === "muted" && size !== "sm" && (
            <MicOff className="h-2 w-2 text-white" />
          )}
        </div>
      )}
    </div>
  );
};
