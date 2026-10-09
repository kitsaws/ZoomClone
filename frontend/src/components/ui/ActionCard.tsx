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
    <div className={cn("flex flex-col items-center select-none group", className)}>
      {/* Action Button Tile */}
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-12 h-12 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white transition-all duration-150 cursor-pointer shadow-sm active:scale-95",
          isOrange
            ? "bg-[#F26D21] hover:bg-[#E05D12] shadow-[0_4px_12px_rgba(242,109,33,0.3)]"
            : "bg-[#0E71EB] hover:bg-[#005FE6] shadow-[0_4px_12px_rgba(14,113,235,0.25)]"
        )}
        aria-label={title}
      >
        {icon}
      </button>

      {/* Label (with optional dropdown chevron for New Meeting) */}
      <div
        onClick={hasDropdown ? onDropdownClick || onClick : onClick}
        className="mt-2 flex items-center gap-1 cursor-pointer"
      >
        <span className="text-[11px] sm:text-xs font-medium text-[#232333] dark:text-zinc-200 group-hover:text-[#0E71EB] transition-colors text-center">
          {title}
        </span>
        {hasDropdown && (
          <ChevronDown className="h-3 w-3 text-[#232333] dark:text-zinc-200 group-hover:text-[#0E71EB] transition-colors -ml-0.5" />
        )}
      </div>
    </div>
  );
};
