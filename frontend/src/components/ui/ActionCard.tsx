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
            "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white transition-all duration-200 cursor-pointer shadow-md active:scale-95",
            isOrange
              ? "bg-zoom-orange hover:bg-zoom-orange-hover shadow-[0_6px_16px_rgba(242,109,33,0.3)] hover:shadow-[0_8px_20px_rgba(242,109,33,0.4)]"
              : "bg-zoom-blue hover:bg-zoom-blue-hover shadow-[0_6px_16px_rgba(45,140,255,0.25)] hover:shadow-[0_8px_20px_rgba(45,140,255,0.35)]"
          )}
          aria-label={title}
        >
          {icon}
        </button>

        {hasDropdown && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDropdownClick?.(e);
            }}
            className="absolute -bottom-1 right-1/2 translate-x-1/2 bg-surface hover:bg-surface-hover text-text-primary border border-app-border rounded-full p-0.5 transition-colors shadow-sm"
            aria-label={`${title} options`}
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        )}
      </div>

      <span className="mt-2 text-xs font-medium text-text-primary group-hover:text-zoom-blue transition-colors text-center select-none">
        {title}
      </span>
    </div>
  );

};
