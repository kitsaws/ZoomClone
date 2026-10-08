import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "host"
    | "coHost"
    | "participant"
    | "guest"
    | "waiting"
    | "active"
    | "ended"
    | "danger"
    | "default";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-surface-hover text-text-primary border-app-border",
    host: "bg-zoom-blue/15 text-zoom-blue border-zoom-blue/30 font-semibold",
    coHost: "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30",
    participant: "bg-surface-subtle text-text-secondary border-app-border",
    guest: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-medium",
    waiting: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 animate-pulse",
    active: "bg-zoom-success/15 text-emerald-700 dark:text-emerald-400 border-zoom-success/30",
    ended: "bg-surface-subtle text-text-muted border-app-border",
    danger: "bg-zoom-danger/15 text-rose-700 dark:text-rose-400 border-zoom-danger/30",
  };

  const dotColors = {
    default: "bg-text-muted",
    host: "bg-zoom-blue",
    coHost: "bg-purple-500",
    participant: "bg-text-secondary",
    guest: "bg-amber-500",
    waiting: "bg-yellow-500",
    active: "bg-emerald-500",
    ended: "bg-text-muted",
    danger: "bg-rose-500",
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 rounded-md gap-1",
    md: "text-xs px-2.5 py-1 rounded-lg gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-medium border uppercase tracking-wider select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};
