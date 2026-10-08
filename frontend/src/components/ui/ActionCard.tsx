import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface ActionCardProps {
  title: string;
  icon: React.ReactNode;
  variant: "orange" | "blue";
  onClick?: () => void;
  hasDropdown?: boolean;
  onDropdownClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  icon,
  variant,
  onClick,
  hasDropdown = false,
  onDropdownClick,
  className,
}) => {
  const isOrange = variant === "orange";

  return (
    <div className={cn("flex flex-col items-center group", className)}>
      <div className="relative">
        <button
          onClick={onClick}
          className={cn(
            "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-white transition-all duration-200 cursor-pointer shadow-lg active:scale-95",
            isOrange
              ? "bg-zoom-orange hover:bg-zoom-orange-hover shadow-[0_8px_20px_rgba(242,109,33,0.35)] hover:shadow-[0_12px_28px_rgba(242,109,33,0.45)]"
              : "bg-zoom-blue hover:bg-zoom-blue-hover shadow-[0_8px_20px_rgba(45,140,255,0.3)] hover:shadow-[0_12px_28px_rgba(45,140,255,0.4)]"
          )}
          aria-label={title}
        >
          <div className="transform group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
        </button>

        {hasDropdown && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDropdownClick?.(e);
            }}
            className="absolute -bottom-1.5 right-1/2 translate-x-1/2 bg-surface hover:bg-surface-hover text-text-primary border border-app-border rounded-full p-0.5 transition-colors shadow-md"
            aria-label={`${title} options`}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <span className="mt-3 text-xs sm:text-sm font-medium text-text-primary group-hover:text-zoom-blue transition-colors text-center">
        {title}
      </span>
    </div>
  );
};
